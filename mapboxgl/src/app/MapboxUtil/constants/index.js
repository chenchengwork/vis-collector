/*
 * 修饰mapUtil的枚举
 */

export const ACCESS_TOKEN = 'pk.eyJ1IjoiY2hlbmNoZW5nMTIiLCJhIjoiY2poN2JjcmJuMDY1cjJ3cDl0OG0xeWxzdyJ9.Jyy5bvJDCvtjPXSPZMazTg';

/**
 * 枚举缩放等级
 * @type {{maxZoom: number, minZoom: number}}
 */
export const ZOOM = {
    maxZoom: 18,
    minZoom: 4
};

/**
 * 枚举中心坐标点
 * @type {number[]} [lng, lat]
 */
export const CENTER = [100.923828, 39.272688];

/**
 * 枚举mapbox的样式
 * @type {{streets_v9: string, satellite_v9: string, outdoors_v10: string, light_v9: string, dark_v9: string, satellite_streets_v10: string, navigation_preview_day_v2: string, navigation_preview_night_v2: string, navigation_guidance_day_v2: string, navigation_guidance_night_v2: string}}
 */
export const EnumMapboxStyles = {
    streets_v9: 'mapbox://styles/mapbox/streets-v9',
    satellite_v9: 'mapbox://styles/mapbox/satellite-v9',
    outdoors_v10: 'mapbox://styles/mapbox/outdoors-v10',
    light_v9: 'mapbox://styles/mapbox/light-v9',
    dark_v9: 'mapbox://styles/mapbox/dark-v9',
    satellite_streets_v10: 'mapbox://styles/mapbox/satellite-streets-v10',
    navigation_preview_day_v2: 'mapbox://styles/mapbox/navigation-preview-day-v2',
    navigation_preview_night_v2: 'mapbox://styles/mapbox/navigation-preview-night-v2',
    navigation_guidance_day_v2: 'mapbox://styles/mapbox/navigation-guidance-day-v2',
    navigation_guidance_night_v2: 'mapbox://styles/mapbox/navigation-guidance-night-v2',
};


export const EnumOSMTile = {
    GaoDe: {
        Normal: {
            Map: {
                tile:'http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
            },
        },
        Satellite: {
            Map: {
                tile:'http://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
            },
            Annotion: {
                tile:'http://webst01.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
            }
        },
    },

    TianDiTu: {
        Normal: {
            Map: {
                tile:'http://t0.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}'
            },
            Annotion: {
                tile:'http://t0.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}'
            },
        },
        Satellite: {
            Map: {
                tile:'http://t0.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}'
            },
            Annotion: {
                tile:'http://t0.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}'
            },
        },
        Terrain: {
            Map: {
                tile:'http://t0.tianditu.cn/DataServer?T=ter_w&X={x}&Y={y}&L={z}'
            },
            Annotion: {
                tile:'http://t0.tianditu.cn/DataServer?T=cta_w&X={x}&Y={y}&L={z}'
            },
        },
    },

    Google: {
        Normal: {
            Map: {
                sourceID: 'Google.Normal.Map',
                tile:'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
            }
        },
        Satellite: {
            Map: {
                sourceID: 'Google.Satellite.Map',
                tile:'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
            }
        },
        Terrain: {
            Map: {
                sourceID: 'Google.Terrain.Map',
                tile:'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}&s=Galil'
            },
        },
    }
}


