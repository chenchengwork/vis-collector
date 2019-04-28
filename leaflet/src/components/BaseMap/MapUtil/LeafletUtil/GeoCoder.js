import fetch from './lib/fetch';

const EnumApi = {
    geoUrl: "https://restapi.amap.com/v3/geocode/geo",              // 地理编码API服务地址
    regeoUrl: "https://restapi.amap.com/v3/geocode/regeo",          // 逆地理编码API服务地址
    districtUrl: "https://restapi.amap.com/v3/config/district",     // 行政区域查询API服务地址
};

export default class GeoCoder {
    constructor(key){
        this.key = key || "d56cf80a06dea65713f3b007253bc4a3";
    }

    /**
     * 获取地理编码
     * 参数说明： https://lbs.amap.com/api/webservice/guide/api/georegeo
     * @param {Object} params
     * @return {*}
     */
    getGeo = (params = {}) => {
        params = Object.assign({key: this.key}, params);
        if(!Reflect.has(params, "address")){
            throw new Error("请求参数中没有address");
        }

        return fetch(
            formatUrlParams(EnumApi.geoUrl, params),
            {
                header: {
                    'content-type': 'application/json'
                }
            }
        ).then((resp) => resp.json());
    }

    /**
     * 逆地理编码
     * 参数说明： https://lbs.amap.com/api/webservice/guide/api/georegeo
     * @param {Object} params
     * @return {*}
     */
    getRegeo = (params = {}) => {
        params = Object.assign({key: this.key}, params);
        if(!Reflect.has(params, "location")){
            throw new Error("请求参数中没有location");
        }

        return fetch(
            formatUrlParams(EnumApi.regeoUrl, params),
            {
                header: {
                    'content-type': 'application/json'
                }
            }
        ).then((resp) => resp.json());
    }

    /**
     * 获取行政区信息(边界点)
     * 参数说明： https://lbs.amap.com/api/webservice/guide/api/district
     * @param {Object} params
     * @return {*}
     */
    getDistrict = (params) => {
        params = Object.assign({
            key: this.key,
            extensions: "all", // "all"只返回当前查询district的边界值, "base"不返回行政区边界坐标点
        }, params);

        return fetch(
            formatUrlParams(EnumApi.districtUrl, params),
            {
                header: {
                    'content-type': 'application/json'
                }
            }
        ).then((resp) => resp.json())
        .then((resp) => {
            const { districts } = resp;
            if(!districts || districts.length <= 0){
                throw new Error("未找到行政区");
            }

            if(districts[0].polyline) {
                resp.geoJSON = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": districts[0].polyline.split("|").map(item1 => item1.split(";").map(item2 => item2.split(",")))
                    },
                    "properties": {}
                };

                Reflect.deleteProperty(districts[0], "polyline");
            }

            return resp;
        });
    }

}


const formatUrlParams = (url, params = {}) => {
    Object.keys(params).forEach((key, index) => {
        if (index === 0 && url.indexOf('?') === -1) {
            url += '?' + key + '=' + params[key];
        } else {
            url += '&' + key + '=' + params[key];
        }
    });

    return url;
}
