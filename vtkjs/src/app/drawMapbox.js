import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from 'mapbox-gl';
import {getActor, render} from './vtk';


const ACCESS_TOKEN = 'pk.eyJ1IjoiY2hlbmNoZW5nMTIiLCJhIjoiY2poN2JjcmJuMDY1cjJ3cDl0OG0xeWxzdyJ9.Jyy5bvJDCvtjPXSPZMazTg';

export default () => {
    mapboxgl.accessToken = ACCESS_TOKEN;

    const map = new mapboxgl.Map({
        container: 'map',
        zoom: 3,
        center: [100.923828, 39.272688],
        // center: [7.5, 58],
        // style: 'mapbox://styles/mapbox/light-v9'

        bearing: 0,    // 设置地图绕Z轴的旋转角度
        pitch: 0,    // 设置地图绕X轴的旋转角度

        style: {
            "version": 8,
            // "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
            // "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
            "sources": {},
            "layers": []
        },
    });


    map.on('load', function() {
        // var helsinki = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 100.923828, lat: 39.272688 });
        // console.log('helsinki', helsinki)

        // 添加底层地图
        addOsmTileLayer(map, EnumOSMTile.GaoDe.Normal.Map);

        // 添加gl图层
        // map.addLayer(getGlLayer(), "custom_OsmTileLayer");
        map.addLayer(getGlLayer());
        // map.addLayer(getGlLayer(), "building");
    });

}


const getGlLayer = () => {
    let highlightLayer = {
        id: 'gl_layer',
        type: 'custom',

        onAdd: function (map, gl) {
            this.map = map;
            this.actor = getActor(map);
        },

        render: function (gl, matrix) {
            render(gl, matrix, this.map, this.actor);
        },
    };

    return highlightLayer;
}


/**
 * 添加osm切片
 * @param {Object} osmTile
 * @param {String} osmTile.tile osm切片服务地址格式
 * @param {Object} opts
 * @param {Object} [opts.paintOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-raster
 * @param {Object} [opts.layoutOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-raster
 * @return {string} layerID
 */
const addOsmTileLayer = (map, osmTile, opts = {}) => {
    const layerID = "custom_OsmTileLayer";
    map.addLayer({
        "id": layerID,
        "type": "raster",
        "source": {
            "type": "raster",
            'tiles': [
                osmTile.tile
            ],
            'tileSize': 256
        },

        "paint": Object.assign({}, opts.paintOpts || {}),
        "layout": Object.assign({}, opts.layoutOpts || {}),
    });

    return layerID;
}


const EnumOSMTile = {
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
