/*  Global class for simulating the movement of particle through a 1km wind grid
 credit: All the credit for this work goes to: https://github.com/cambecc for creating the repo:
 https://github.com/cambecc/earth. The majority of this code is directly take nfrom there, since its awesome.
 This class takes a canvas element and an array of data (1km GFS from http://www.emc.ncep.noaa.gov/index.php?branch=GFS)
 and then uses a mercator (forward/reverse) projection to correctly map wind vectors in "map space".
 The "start" method takes the bounds of the map at its current extent and starts the whole gridding,
 interpolation and animation process.
 */

import WindyWorker from './Windy.worker';

const Windy = function( params ){

    const MIN_VELOCITY_INTENSITY = params.minVelocity || 0;                      // velocity at which particle intensity is minimum (m/s)
    const MAX_VELOCITY_INTENSITY = params.maxVelocity || 10;                     // velocity at which particle intensity is maximum (m/s)
    const VELOCITY_SCALE = (params.velocityScale || 0.005) * (Math.pow(window.devicePixelRatio,1/3) || 1); // scale for wind velocity (completely arbitrary--this value looks nice)
    const MAX_PARTICLE_AGE = params.particleAge || 90;                         	 // max number of frames a particle is drawn before regeneration
    const PARTICLE_LINE_WIDTH = params.lineWidth || 1;                           // line width of a drawn particle
    const PARTICLE_MULTIPLIER = params.particleMultiplier || 1 / 300;            // particle count scalar (completely arbitrary--this values looks nice)
    const PARTICLE_REDUCTION = (Math.pow(window.devicePixelRatio,1/3) || 1.6);   // multiply particle count for mobiles by this amount
    const FRAME_RATE = params.frameRate || 15, FRAME_TIME = 1000 / FRAME_RATE;   // desired frames per second

    const defaultColorScale = [
        "rgb(36,104, 180)",
        "rgb(60,157, 194)",
        "rgb(128,205,193 )",
        "rgb(151,218,168 )",
        "rgb(198,231,181)",
        "rgb(238,247,217)",
        "rgb(255,238,159)",
        "rgb(252,217,125)",
        "rgb(255,182,100)",
        "rgb(252,150,75)",
        "rgb(250,112,52)",
        "rgb(245,64,32)",
        "rgb(237,45,28)",
        "rgb(220,24,32)",
        "rgb(180,0,35)"
    ];

    const colorScale = params.colorScale || defaultColorScale;

    const NULL_WIND_VECTOR = [NaN, NaN, null];  // singleton for no wind in the form: [u, v, magnitude]

    let builder;
    let grid;
    let gridData = params.data;
    let date;
    let λ0, φ0, Δλ, Δφ, ni, nj;

    const setData = function (data) {
        gridData = data;
    };

    // interpolation for vectors like wind (u,v,m)
    // 插值向量数据(u, v, m)
    const bilinearInterpolateVector = function(x, y, g00, g10, g01, g11) {
        const rx = (1 - x);
        const ry = (1 - y);
        const a = rx * ry,  b = x * ry,  c = rx * y,  d = x * y;
        const u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
        const v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
        return [u, v, Math.sqrt(u * u + v * v)];
    };


    const createWindBuilder = function(uComp, vComp) {
        const uData = uComp.data, vData = vComp.data;
        return {
            header: uComp.header,
            //recipe: recipeFor("wind-" + uComp.header.surface1Value),
            data: function(i) {
                return [uData[i], vData[i]];
            },
            interpolate: bilinearInterpolateVector
        }
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

    const buildGrid = function (data, callback) {

        builder = createBuilder(data);
        const header = builder.header;

        λ0 = header.lo1;   // 最小经度
        φ0 = header.la1;   // 最小维度 the grid's origin (e.g., 0.0E, 90.0N)

        Δλ = header.dx;
        Δφ = header.dy;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)

        ni = header.nx;    // u宽度
        nj = header.ny;    // v高度 number of grid points W-E and N-S (e.g., 144 x 73)

        // TODO 暂时注释掉时间, 没有发现时间的作用
        // date = new Date(header.refTime);
        // date.setHours(date.getHours() + header.forecastTime);

        // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
        // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
        grid = [];
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

        callback({
            date: date,
            interpolate: interpolate
        });
    };

    /**
     * Get interpolated grid value from Lon/Lat position
     * @param λ {Float} Longitude
     * @param φ {Float} Latitude
     * @returns {Object}
     */
    const interpolate = function(λ, φ) {

        if(!grid) return null;

        const i = floorMod(λ - λ0, 360) / Δλ;  // calculate longitude index in wrapped range [0, 360)
        const j = (φ0 - φ) / Δφ;                 // calculate latitude index in direction +90 to -90

        const fi = Math.floor(i), ci = fi + 1;
        const fj = Math.floor(j), cj = fj + 1;

        let row;
        if ((row = grid[fj])) {
            const g00 = row[fi];
            const g10 = row[ci];
            if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
                const g01 = row[fi];
                const g11 = row[ci];
                if (isValue(g01) && isValue(g11)) {
                    // All four points found, so interpolate the value.
                    return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
                }
            }
        }
        return null;
    };


    /**
     * @returns {Boolean} true if the specified value is not null and not undefined.
     */
    const isValue = function(x) {
        return x !== null && x !== undefined;
    };

    /**
     * @returns {Number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
     *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
     */
    const floorMod = function(a, n) {
        return a - n * Math.floor(a / n);
    };

    /**
     * @returns {Number} the value x clamped to the range [low, high].
     */
    const clamp = function(x, range) {
        return Math.max(range[0], Math.min(x, range[1]));
    };

    /**
     * @returns {Boolean} true if agent is probably a mobile device. Don't really care if this is accurate.
     */
    const isMobile = function() {
        return (/android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i).test(navigator.userAgent);
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

    const buildBounds = function( bounds, width, height ) {
        const upperLeft = bounds[0];
        const lowerRight = bounds[1];
        const x = Math.round(upperLeft[0]); //Math.max(Math.floor(upperLeft[0], 0), 0);
        const y = Math.max(Math.floor(upperLeft[1], 0), 0);
        const xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
        const yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
        return {x: x, y: y, xMax: width, yMax: yMax, width: width, height: height};
    };

    const deg2rad = function( deg ){
        return (deg / 180) * Math.PI;
    };

    const rad2deg = function( ang ){
        return ang / (Math.PI/180.0);
    };

    let invert

    if (params.crs && params.crs.code === 'EPSG:4326') {
        invert = function (x, y, windy) {
            const mapLonDelta = windy.east - windy.west;
            const mapLatDelta = windy.south - windy.north;
            const lat = rad2deg(windy.north) + y / windy.height * rad2deg(mapLatDelta);
            const lon = rad2deg(windy.west) + x / windy.width * rad2deg(mapLonDelta);
            return [lon, lat];
        };
    } else {
        invert = function (x, y, windy) {
            const mapLonDelta = windy.east - windy.west;
            const worldMapRadius = windy.width / rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
            const mapOffsetY = (worldMapRadius / 2 * Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south))));
            const equatorY = windy.height + mapOffsetY;
            const a = (equatorY - y) / worldMapRadius;
            const lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
            const lon = rad2deg(windy.west) + x / windy.width * rad2deg(mapLonDelta);
            return [lon, lat];
        };
    }

    const mercY = function( lat ) {
        return Math.log( Math.tan( lat / 2 + Math.PI / 4 ) );
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
            // console.log('columns->', columns)
            createField(columns, bounds, callback);
        })();
    };

    let animationLoop;
    const animate = function(bounds, field) {

        function windIntensityColorScale(min, max) {

            colorScale.indexFor = function (m) {  // map velocity speed to a style
                return Math.max(0, Math.min((colorScale.length - 1),
                    Math.round((m - min) / (max - min) * (colorScale.length - 1))));

            };

            return colorScale;
        }

        const colorStyles = windIntensityColorScale(MIN_VELOCITY_INTENSITY, MAX_VELOCITY_INTENSITY);
        const buckets = colorStyles.map(function() { return []; });

        let particleCount = Math.round(bounds.width * bounds.height * PARTICLE_MULTIPLIER);
        if (isMobile()) {
            particleCount *= PARTICLE_REDUCTION;
        }

        const fadeFillStyle = "rgba(0, 0, 0, 0.97)";

        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(field.randomize({age: Math.floor(Math.random() * MAX_PARTICLE_AGE) + 0}));
        }

        function evolve() {
            buckets.forEach(function(bucket) { bucket.length = 0; });
            particles.forEach(function(particle) {
                if (particle.age > MAX_PARTICLE_AGE) {
                    field.randomize(particle).age = 0;
                }
                const x = particle.x;
                const y = particle.y;
                const v = field(x, y);  // vector at current position
                const m = v[2];
                if (m === null) {
                    particle.age = MAX_PARTICLE_AGE;  // particle has escaped the grid, never to return...
                }
                else {
                    const xt = x + v[0];
                    const yt = y + v[1];
                    if (field(xt, yt)[2] !== null) {
                        // Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
                        particle.xt = xt;
                        particle.yt = yt;
                        buckets[colorStyles.indexFor(m)].push(particle);
                    }
                    else {
                        // Particle isn't visible, but it still moves through the field.
                        particle.x = xt;
                        particle.y = yt;
                    }
                }
                particle.age += 1;
            });
        }

        const g = params.canvas.getContext("2d");
        g.lineWidth = PARTICLE_LINE_WIDTH;
        g.fillStyle = fadeFillStyle;
        g.globalAlpha = 0.6;

        function draw() {
            // console.log('buckets->', buckets)
            // Fade existing particle trails.
            const prev = "lighter";
            g.globalCompositeOperation = "destination-in";
            g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            g.globalCompositeOperation = prev;
            g.globalAlpha = 0.9;
            // Draw new particle trails.
            buckets.forEach(function(bucket, i) {
                if (bucket.length > 0) {
                    g.beginPath();
                    g.strokeStyle = colorStyles[i];
                    bucket.forEach(function(particle) {
                        g.moveTo(particle.x, particle.y);
                        g.lineTo(particle.xt, particle.yt);
                        particle.x = particle.xt;
                        particle.y = particle.yt;
                    });
                    g.stroke();
                }
            });
        }

        let then = Date.now();
        (function frame() {
            // console.time("frame->")
            animationLoop = requestAnimationFrame(frame);
            const now = Date.now();
            const delta = now - then;
            if (delta > FRAME_TIME) {
                then = now - (delta % FRAME_TIME);
                evolve();
                draw();
            }
            // console.timeEnd("frame->")
        })();
    };

    let testBounds = null;
    const start = function( bounds, width, height, extent ){
        const mapBounds = {
            south: deg2rad(extent[0][1]),   // 转换成弧度
            north: deg2rad(extent[1][1]),
            east: deg2rad(extent[1][0]),
            west: deg2rad(extent[0][0]),
            width: width,
            height: height
        };

        // stop();
        // if(grid) return;
        // build grid

        // const windyWorker = new WindyWorker();
        // windyWorker.postMessage({
        //     type: "buildGrid",
        //     data: [
        //         {
        //             data: new Float32Array(gridData[0].data).buffer,
        //             header: gridData[0].header
        //         },
        //         {
        //             data: new Float32Array(gridData[1].data).buffer,
        //             header: gridData[1].header
        //         }
        //     ]
        // });
        // // windyWorker.postMessage({type: "buildGrid", data: new Float32Array([1,2]).buffer});
        // windyWorker.onmessage = (e) => {
        //    // console.log(e);
        //    const { type, data } = e.data;
        //    return;
        //    switch (type) {
        //        case "buildGrid": {
        //            console.log(data);
        //            grid = data.grid;
        //            λ0 = data.λ0;
        //            φ0 = data.φ0;  // the grid's origin (e.g., 0.0E, 90.0N)
        //
        //            Δλ = data.Δλ;
        //            Δφ = data.Δφ;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
        //
        //            ni = data.ni;
        //            nj = data.nj;    // number of grid points W-E and N-S (e.g., 144 x 73)
        //
        //            builder = {
        //                header: data.header,
        //                interpolate: bilinearInterpolateVector
        //            };
        //
        //            buildGridCallback({
        //                date: date,
        //                interpolate: interpolate
        //            })
        //            break;
        //        }
        //    }
        // };


        const buildGridCallback = function(grid){
            console.time("interpolateField->")

            // interpolateField
            interpolateField( grid, buildBounds( bounds, width, height), mapBounds, function( bounds, field ){
                // animate the canvas with random points
                stop();
                testBounds = bounds;
                console.log('testBounds', testBounds);
                windy.field = field;
                console.time("animate->");
                animate( bounds, field );
                console.timeEnd("animate->");
            });
            console.timeEnd("interpolateField->")
        };

        // if(grid){
        //     // console.log(grid);
        //     buildGridCallback({
        //         interpolate: interpolate
        //     });
        //     return;
        // }

        console.time("buildGrid->");
        buildGrid(gridData, buildGridCallback);
        console.timeEnd("buildGrid->")
    };

    const stop = function () {
        if (windy.field) windy.field.release();
        if (animationLoop) cancelAnimationFrame(animationLoop);
    };

    const windy = {
        params: params,
        start: start,
        stop: stop,
        createField: createField,
        interpolatePoint: interpolate,
        setData: setData
    };

    return windy;
};

if(!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
    };
}

export default Windy;
