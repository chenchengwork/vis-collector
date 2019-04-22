// 坐标系投影
const crsCode = "EPSG:3857";

export const invert = (x, y, windy) => {
    if(crsCode == "EPSG:4326"){
        const mapLonDelta = windy.east - windy.west;
        const mapLatDelta = windy.south - windy.north;
        const lat = rad2deg(windy.north) + y / windy.height * rad2deg(mapLatDelta);
        const lon = rad2deg(windy.west) + x / windy.width * rad2deg(mapLonDelta);
        return [lon, lat];
    }
    // EPSG:3857
    else {
        const mapLonDelta = windy.east - windy.west;    // 地图经度弧度范围
        const worldMapRadius = windy.width / rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
        const mapOffsetY = (worldMapRadius / 2 * Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south))));
        const equatorY = windy.height + mapOffsetY;
        const a = (equatorY - y) / worldMapRadius;
        const lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
        const lon = rad2deg(windy.west) + x / windy.width * rad2deg(mapLonDelta);
        return [lon, lat];
    }
};


/**
 * @returns {Boolean} true if the specified value is not null and not undefined.
 */
export const isValue = function(x) {
    return x !== null && x !== undefined;
};

/**
 * @returns {Number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
 *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
 */
export const floorMod = function(a, n) {
    return a - n * Math.floor(a / n);
};

/**
 * @returns {Boolean} true if agent is probably a mobile device. Don't really care if this is accurate.
 */
export const isMobile = function() {
    return (/android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i).test(navigator.userAgent);
};

/**
 * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
 * vector is modified in place and returned by this function.
 */
export const distort = function(projection, λ, φ, x, y, scale, wind, windy) {
    const u = wind[0] * scale;
    const v = wind[1] * scale;
    const d = distortion(projection, λ, φ, x, y, windy);

    // Scale distortion vectors by u and v, then add.
    wind[0] = d[0] * u + d[2] * v;
    wind[1] = d[1] * u + d[3] * v;
    return wind;
};

export const deg2rad = function( deg ){
    return (deg / 180) * Math.PI;
};

//------------------------------------------------------------------------------------------------------------------------


/**
 * @returns {Number} the value x clamped to the range [low, high].
 */
const clamp = function(x, range) {
    return Math.max(range[0], Math.min(x, range[1]));
};


const mercY = function( lat ) {
    return Math.log( Math.tan( lat / 2 + Math.PI / 4 ) );
};

const rad2deg = function( ang ){
    return ang / (Math.PI/180.0);
};

const distortion = function(projection, λ, φ, x, y, windy) {
    const τ = 2 * Math.PI;
    // const H = Math.pow(10, -5.2);
    const H = crsCode === 'EPSG:4326' ? 5 : Math.pow(10, -5.2);
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
