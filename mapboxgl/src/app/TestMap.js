import MapboxUtil from "./MapboxUtil";

import testGeoJSON from './data/test_geo.json';
import YunYanGeo from './data/YunYanGeo.json';
import img_radar from './img/radar.gif';

/**
 * 存储mapboxUtil实例
 * @type {{}}
 */
let mapboxUtil = {};

export default class TestMap{
    constructor(mapUtil) {
        this.mapboxUtil = mapboxUtil = mapUtil;
    }

    /**
     * 设置osm切片
     */
    doSetOsmTileLayer() {
        const layerID = mapboxUtil.setOsmTileLayer(MapboxUtil.G.osmTile.GaoDe.Normal.Map);
        // const layerID = mapboxUtil.setOsmTileLayer(MapboxUtil.G.osmTile.GaoDe.Normal.Map);
        // mapboxUtil.setOsmTileLayer(MapboxUtil.G.osmTile.GaoDe.Satellite.Map);
        // mapboxUtil.addOsmTileLayer(MapboxUtil.G.osmTile.GaoDe.Satellite.Annotion);
        // mapboxUtil.setOsmTileLayer(MapboxUtil.G.osmTile.TianDiTu.Satellite.Map);

        return layerID;
    }

    /**
     * 设置普通的GeoJSON layer
     */
    doSetGeoJSONByFill() {
        const layerID = mapboxUtil.setGeoJSONByFill(YunYanGeo);

        return layerID;
    }

    /**
     * 设置立体挤压的GeoJSON layer
     */
    doSetGeoJSONByFillExtrusion(){
        const layerID = mapboxUtil.setGeoJSONByFillExtrusion(testGeoJSON, {
            paintOpts:{
                'fill-extrusion-color': ['get', 'color'],
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'base_height'],
            }
        });

        return layerID;
    }

    /**
     * 设置wms服务
     */
    doSetWMS(){
        const layerID = mapboxUtil.setWMSLayer('http://10.0.1.19:8081/rasdaman/ows', {
            bbox: "{bbox-epsg-3857}",
            format:"image/png",
            version: '1.3.0',
            layers: 'radar_demo_3857',
            styles: 'demo_3857',
            crs: 'EPSG:3857',
            transparent: true,
        });

        return layerID;
    }

    /**
     * 设置贴图
     */
    doSetImageOverlay(){
        const layerID = mapboxUtil.setImageOverlay(img_radar, [
            [100.923828, 38.272688],
            [120.923828, 38.272688],
            [120.923828, 29.272688],
            [100.923828, 29.272688]
        ]);

        return layerID;
    }

    /**
     * 设置文字和雪碧图中的Icon
     */
    doSetFontAndIconLayer(){
        const layerID = mapboxUtil.setFontAndIconLayer([
            {
                data: {
                    coordinates: [100.923828, 39.272688],
                    title: '中国-CHINA',
                    icon: 'pe-national-3',
                },
                properties: {},
            }
        ]);

        return layerID;
    }

    /**
     * 设置圆
     */
    doSetCircleLayer(){
        const circleLayerIDs = mapboxUtil.setCircleLayer([
            {
                data:{
                    center: [100.923828, 39.272688],
                    radius: 400
                },
                circleProperties: {
                    opacity: 0.2
                },
                lineProperties: {
                    lineColor: '#FF3030'
                }
            },
            {
                data:{
                    center: [100.923828, 39.272688],
                    radius: 300
                },
                circleProperties: {
                    opacity: 0
                },
                lineProperties: {
                    lineColor: '#EEEE00'
                }
            },
            {
                data:{
                    center: [100.923828, 39.272688],
                    radius: 200
                },
                circleProperties: {
                    opacity: 0
                },
                lineProperties: {
                    lineColor: '#3A5FCD'
                }

            },
        ],{
            circleFillPaintOpts:{
                'fill-opacity': ['get', 'opacity']
            },
            linePaintOpts: {
                'line-color': ['get', 'lineColor']
            }
        });

        return circleLayerIDs;
    }


    /**
     * 设置线
     */
    doSetLineLayer() {
        const layerID = mapboxUtil.setLineLayer([
            {
                data: [
                    [-122.4833858013153, 37.829607404976734],
                    [-122.4830961227417, 37.82932776098012],
                    [-122.4830746650696, 37.82932776098012],
                    [-122.48218417167662, 37.82889558180985],
                    [-122.48218417167662, 37.82890193740421],
                    [-122.48221099376678, 37.82868372835086],
                    [-122.4822163581848, 37.82868372835086],
                    [-122.48205006122589, 37.82801003030873]
                ]
            }
        ]);

        return layerID;
    }


    /**
     * 设置多边形
     */
    doSetPolygonLayer() {
        const layerID = mapboxUtil.addPolygonLayer([{
            data: [
                [-67.13734351262877, 45.137451890638886],
                [-66.96466, 44.8097],
                [-68.03252, 44.3252],
                [-69.06, 43.98],
                [-70.11617, 43.68405],
                [-70.64573401557249, 43.090083319667144],
                [-70.75102474636725, 43.08003225358635],
                [-70.79761105007827, 43.21973948828747],
                [-70.98176001655037, 43.36789581966826],
                [-70.94416541205806, 43.46633942318431],
                [-71.08482, 45.3052400000002],
                [-70.6600225491012, 45.46022288673396],
                [-70.30495378282376, 45.914794623389355],
                [-70.00014034695016, 46.69317088478567],
                [-69.23708614772835, 47.44777598732787],
                [-68.90478084987546, 47.184794623394396],
                [-68.23430497910454, 47.35462921812177],
                [-67.79035274928509, 47.066248887716995],
                [-67.79141211614706, 45.702585354182816],
                [-67.13734351262877, 45.137451890638886]
            ]
        }]);

        return layerID;
    }

    /**
     * 删除layer
     */
    doRemoveLayer(layerID){
        mapboxUtil.removeLayer(layerID);
    }

    /**
     * 设置高程切片
     */
    doSetDemLayer() {
        // https://examples.x3dom.org/BVHRefiner/Puget%20Sound%20WMTS/satellite/{x}/{y}/{z}.png
        mapboxUtil.addRasterDemLayer("mapbox://mapbox.terrain-rgb");
    }

    /**
     * 测试添加固定像素的圆
     */
    doSetPixelCircleLayer() {
        mapboxUtil.setPixelCircleLayer([
            {
                data: {
                    center: [-67.13734351262877, 45.137451890638886],
                    radius: 10
                }
            },
            {
                data: {
                    center: [-66.96466, 44.8097],
                    radius: 20
                }
            }
        ]);
    }

    /**
     * 将自定义贴图添加到地图中
     * @param imgUrl
     * @param mkImgForMapEnvParams
     */
    doSetCustomImgToMapLayer = (imgUrl, mkImgForMapEnvParams = {}) => {
        mapboxUtil.setCustomImgToMapLayer(imgUrl, mkImgForMapEnvParams);
        mapboxUtil.setGeoJSONByFill(require("./solution/chinaMap/geojson/china.json"), {}, false)
    }

    /**
     * 添加栅格线到地图中
     */
    doAddGridLine = () => {
        const bounds = mapboxUtil.map.getBounds();

        const {gridLines, crossPointLines, crossPoints} = mapboxUtil.mkGridLineData({
            bounds: {
                ne: bounds._ne, // 东北点
                sw: bounds._sw  // 西南点
            },
            gridHorizontalNum: 6,              // 网格水平线数量
            gridVerticalNum: 10,                // 网格垂直线数量
            crossPointLineLngLengthRate: 0.0045,      // 交叉点线长度经度占比
            crossPointLineLatLengthRate: 0.007,      // 交叉点线长度维度占比
        });

        mapboxUtil.setLineLayer({data: gridLines});
        mapboxUtil.addLineLayer(
            {data: crossPointLines},
            {
                paintOpts: {
                    'line-color': '#FFA500',
                    'line-opacity': 1,
                    'line-width': 2
                }
            }
        );
    }
}
