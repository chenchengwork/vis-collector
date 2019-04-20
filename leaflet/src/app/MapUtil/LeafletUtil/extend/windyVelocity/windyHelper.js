
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
