
addEventListener("message", (e) => {
    let {type, data} = e.data;
// console.log(new Float32Array(data))

    data = [
        {
            data: new Float32Array(data[0].data),
            header: data[0].header
        },
        {
            data: new Float32Array(data[1].data),
            header: data[1].header
        }
    ];
    switch (type) {
        case "buildGrid":
            postMessage({
                type,
                // data: buildGrid(data)
                data
            });
            break;
    }
});

const buildGrid = function (data) {

    const builder = createBuilder(data);
    const header = builder.header;

    const λ0 = header.lo1;
    const φ0 = header.la1;  // the grid's origin (e.g., 0.0E, 90.0N)

    const Δλ = header.dx;
    const Δφ = header.dy;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)

    const ni = header.nx;
    const nj = header.ny;    // number of grid points W-E and N-S (e.g., 144 x 73)

    // TODO 暂时注释掉时间, 没有发现时间的作用
    // date = new Date(header.refTime);
    // date.setHours(date.getHours() + header.forecastTime);

    // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    let grid = [];
    let p = 0;
    const isContinuous = Math.floor(ni * Δλ) >= 360;

    for (let j = 0; j < nj; j++) {
        const row = [];
        for (let i = 0; i < ni; i++, p++) {
            row[i] = builder.data(p);
        }
        if (isContinuous) {
            // For wrapped grids, duplicate first column as last column to simplify interpolation logic
            row.push(row[0]);
        }
        grid[j] = row;
    }

    return {grid, header, λ0, φ0, Δλ, Δφ, ni, nj};
};

const createBuilder = function(data) {
    let uComp = null, vComp = null, scalar = null;

    data.forEach(function(record) {
        switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
            case "1,2":
            case "2,2":
                uComp = record;
                break;
            case "1,3":
            case "2,3":
                vComp = record;
                break;
            default:
                scalar = record;
        }
    });

    return createWindBuilder(uComp, vComp);
};

const createWindBuilder = function(uComp, vComp) {
    const uData = uComp.data, vData = vComp.data;
    return {
        header: uComp.header,
        //recipe: recipeFor("wind-" + uComp.header.surface1Value),
        data: function(i) {
            return [uData[i], vData[i]];
        },
        // interpolate: bilinearInterpolateVector
    }
};




const interpolateField = function( grid, bounds, extent, callback ) {

    const projection = {};
    const mapArea = ((extent.south - extent.north) * (extent.west - extent.east));
    const velocityScale = VELOCITY_SCALE * Math.pow(mapArea, 0.4);

    const columns = [];
    let x = bounds.x;

    function interpolateColumn(x) {
        const column = [];
        for (let y = bounds.y; y <= bounds.yMax; y += 2) {
            const coord = invert( x, y, extent );
            if (coord) {
                const λ = coord[0], φ = coord[1];
                if (isFinite(λ)) {
                    let wind = grid.interpolate(λ, φ);
                    if (wind) {
                        wind = distort(projection, λ, φ, x, y, velocityScale, wind, extent);
                        column[y+1] = column[y] = wind;
                    }
                }
            }
        }
        columns[x+1] = columns[x] = column;
    }

    (function batchInterpolate() {
        const start = Date.now();
        while (x < bounds.width) {
            interpolateColumn(x);
            x += 2;
            if ((Date.now() - start) > 1000) { //MAX_TASK_TIME) {
                setTimeout(batchInterpolate, 25);
                return;
            }
        }
        createField(columns, bounds, callback);
    })();
};


const createField = function(columns, bounds, callback) {

    /**
     * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
     *          is undefined at that point.
     */
    function field(x, y) {
        const column = columns[Math.round(x)];
        return column && column[Math.round(y)] || NULL_WIND_VECTOR;
    }

    // Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
    // field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
    field.release = function() {
        columns = [];
    };

    field.randomize = function(o) {  // UNDONE: this method is terrible
        let x, y;
        let safetyNet = 0;
        do {
            x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
            y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y)
        } while (field(x, y)[2] === null && safetyNet++ < 30);
        o.x = x;
        o.y = y;
        return o;
    };

    callback( bounds, field );
};

/**
 * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
 * vector is modified in place and returned by this function.
 */
const distort = function(projection, λ, φ, x, y, scale, wind, windy) {
    const u = wind[0] * scale;
    const v = wind[1] * scale;
    const d = distortion(projection, λ, φ, x, y, windy);

    // Scale distortion vectors by u and v, then add.
    wind[0] = d[0] * u + d[2] * v;
    wind[1] = d[1] * u + d[3] * v;
    return wind;
};

const distortion = function(projection, λ, φ, x, y, windy) {
    const τ = 2 * Math.PI;
    // const H = Math.pow(10, -5.2);
    const H = params.crs && params.crs.code === 'EPSG:4326' ? 5 : Math.pow(10, -5.2);
    const hλ = λ < 0 ? H : -H;
    const hφ = φ < 0 ? H : -H;

    const pλ = project(φ, λ + hλ,windy);
    const pφ = project(φ + hφ, λ, windy);

    // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1º λ
    // changes depending on φ. Without this, there is a pinching effect at the poles.
    const k = Math.cos(φ / 360 * τ);
    return [
        (pλ[0] - x) / hλ / k,
        (pλ[1] - y) / hλ / k,
        (pφ[0] - x) / hφ,
        (pφ[1] - y) / hφ
    ];
};

const project = function( lat, lon, windy) { // both in radians, use deg2rad if neccessary
    const ymin = mercY(windy.south);
    const ymax = mercY(windy.north);
    const xFactor = windy.width / ( windy.east - windy.west );
    const yFactor = windy.height / ( ymax - ymin );

    let y = mercY( deg2rad(lat) );
    const x = (deg2rad(lon) - windy.west) * xFactor;
    y = (ymax - y) * yFactor; // y points south
    return [x, y];
};

const mercY = function( lat ) {
    return Math.log( Math.tan( lat / 2 + Math.PI / 4 ) );
};


const deg2rad = function( deg ){
    return (deg / 180) * Math.PI;
};

const rad2deg = function( ang ){
    return ang / (Math.PI/180.0);
};
