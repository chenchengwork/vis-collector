/**
 * 获取地图切片服务
 * @param tileType
 * @return {*}
 */
export const getTileServiceProvider = (tileType) => {
    const tileServiceProvider = {
        TianDiTu: {
            Normal: {
                Map: 'http://t0.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}',
                Annotion: 'http://t0.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}',
            },
            Satellite: {
                Map: 'http://t0.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}',
                Annotion: 'http://t0.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}',
            },
            Terrain: {
                Map: 'http://t0.tianditu.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}',
                Annotion: 'http://t0.tianditu.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}',
            },
        },

        // 高德地图: https://lbs.amap.com/api/javascript-api/reference/layer
        GaoDe: {
            Normal: {
                Map: 'http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            },
            Satellite: {
                Map: 'http://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
                Annotion: 'http://webst01.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
            },
        },

        // 谷歌: http://www.google.cn/maps/
        Google: {
            Normal: {
                Map: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
            },
            Satellite: {
                Map: 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
            },
            Terrain: {
                Map: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}&s=Galil',
            },
        },

        // 智图: http://www.geoq.cn/index.html
        Geoq: {
            Normal: {
                Map: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
                Color: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer/tile/{z}/{y}/{x}',
                PurplishBlue: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
                Gray: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}',
                Warm: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}',
                Cold: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetCold/MapServer/tile/{z}/{y}/{x}'
            },
        }
    };

    let parts = tileType.split('.');

    let providerName = parts[0];
    let mapName = parts[1];
    let mapType = parts[2];

    return tileServiceProvider[providerName][mapName][mapType];
};
