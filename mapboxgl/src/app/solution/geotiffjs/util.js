/**
 * 魔卡托转经纬度
 * @param mercator
 * @return {{lng: number, lat: number}}
 */
export const mercator2lonlat = (mercator) => {
    var lonlat={lng:0, lat:0};
    var x = mercator.x/20037508.34*180;
    var y = mercator.y/20037508.34*180;
    y= 180/Math.PI*(2*Math.atan(Math.exp(y*Math.PI/180))-Math.PI/2);
    lonlat.lng = x;
    lonlat.lat = y;

    return lonlat;
};

export const getBoundsByLngLat = (mercator) => {
    const minLngLat = {lng: mercator[0], lat: mercator[1]};
    const maxLngLat = {lng: mercator[2], lat: mercator[3]};
    return [
        [minLngLat.lng, maxLngLat.lat],
        [maxLngLat.lng, maxLngLat.lat],
        [maxLngLat.lng, minLngLat.lat],
        [minLngLat.lng, minLngLat.lat],
    ]
};

/**
 * 加载tiff文件
 * @param url
 * @return {Promise}
 */
export const loadTiff = (url) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
        // if(e) return reject(e);
        resolve(this.response);
    };

    xhr.send();
});

