/**
 * 生成uuid
 * @param {String} [prefix]
 * @return {string}
 */
export const generateUUID = (prefix = '') => {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return prefix ? prefix + '_' + uuid : uuid;
};

/**
 * 对象转化为url参数
 * @param obj
 * @return {string}
 */
export const objToUrlParams = obj => {
    let arr = [];
    for (let [key, value] of Object.entries(obj)) {
        arr.push(key + "=" + value);
    }
    return arr.join("&");
};

/**
 * 获取GeoJSON第一个coord
 * @param geoJson
 * @return {*} [[lng, lat], ...]
 */
export const getGeoJSONFirstCoord = (geoJson) => {
    let oneFeature = geoJson;
    if (geoJson.hasOwnProperty('features')) {
        let coordinates = [];
        geoJson.features.map(item => coordinates = [...coordinates, ...item.geometry.coordinates[0]]);
        return coordinates;
    }
    return oneFeature.geometry.coordinates[0];
};

/**
 * 获取bounds
 * @param [Array] coordinates [[lng, lat], ...]
 * @return {*}
 */
export const getBounds = (mapboxgl, coordinates) => {
    const bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    return bounds;
}
