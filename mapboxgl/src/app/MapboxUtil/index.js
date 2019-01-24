import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from 'mapbox-gl';

import MouseTool from './extend/MouseTool';
import Turf from './Turf';
import queryString from './query-string';

// 加载mapUtil枚举文件
import {ZOOM, CENTER, ACCESS_TOKEN, EnumMapboxStyles, EnumOSMTile} from './constants';
import {generateUUID, objToUrlParams, getBounds, getGeoJSONFirstCoord} from './helper';
import { isPlainObject } from './checkType';

/**
 * 边界layer ID
 * @type {string}
 */
const boundaryLayerID = generateUUID('boundaryLayer');

/**
 * Mapbox 地图工具类
 */
export default class MapboxUtil {
    static G = {
        mapboxgl,
        MouseTool: MouseTool,
        CENTER,
        styles: EnumMapboxStyles,
        osmTile: EnumOSMTile,
    };

    constructor(containerId, opts, loadedMapCb = () => {}, drawEventFn = {}) {
        this.mouseTool = null;
        this.containerDom = containerId instanceof HTMLElement ? containerId : document.querySelector(`#${containerId}`);

        // 初始化地图
        mapboxgl.accessToken = ACCESS_TOKEN;
        const map = this.map = new mapboxgl.Map(Object.assign({
            container: this.containerDom,
            center: CENTER,
            zoom: 4,
            minZoom: ZOOM.minZoom,
            maxZoom: ZOOM.maxZoom,
        }, opts));

        // 添加边界Layer
        const addBoundaryLayer = (map) => {
            map.addLayer({
                id: boundaryLayerID,
                type: 'background',
                paint: {
                    'background-opacity': 0,
                }
            });
        };

        map.on('load', () => {
            addBoundaryLayer(map);

            loadedMapCb(map);

            this.mouseTool = new MouseTool(this.map, {}, drawEventFn);

            //
            // this.mouseTool.drawPolygon();
            // this.mouseTool.draw.changeMode('draw_rectangle');

            // console.log("初始化map样式: ", JSON.stringify(map.getStyle()));
        })
    }

    /**
     * 将*addLayer方法转换成setLayer方法
     * @param {Function} addLayer
     * @return {*}
     */
    getSetLayerFN = (addLayer = () => {}) => (() => {
        let oldLayerID = null;
        return (...params) => {
            if (oldLayerID) this.removeLayer(oldLayerID);
            return oldLayerID = addLayer.apply(this, params);
        }
    })();

    /**
     * 依据绘制坐标，移动到地图可视化位置
     * @param {Array} coordinates [[lng, lat], ...]
     * @param {Object} opts https://www.mapbox.com/mapbox-gl-js/api#map#fitbounds
     */
    fitBounds(coordinates, opts = {}) {
        if (!Array.isArray(coordinates)) throw new Error('fitBounds参数必须传入数组');
        if (Array.isArray(coordinates[0])) {
            return this.map.fitBounds(getBounds(mapboxgl, coordinates), Object.assign({
                padding: 20,
            }, opts));
        }
    }

    /**
     * 删除layer
     * @param {String | Array | Object} layerID
     * @param {Boolean} isRemoveSource 是否删除和layerID相同的资源
     * @return {void}
     */
    removeLayer(layerID, isRemoveSource = true) {
        const map = this.map;
        let targetLayerIDs = [];
        if (typeof layerID === 'string') {
            targetLayerIDs.push(layerID)
        } else if (Array.isArray(layerID)) {
            targetLayerIDs = layerID;
        } else if (isPlainObject(layerID)) {
            targetLayerIDs = Object.values(layerID);
        }

        targetLayerIDs.forEach(layerID => {
            if (map.getLayer(layerID)) map.removeLayer(layerID);

            if (isRemoveSource && map.getSource(layerID)) map.removeSource(layerID);
        });

    }

    /**
     * 添加layer
     * @param opts
     * @param beforeLayerID
     * @return {*}
     */
    addLayer(opts = {}, beforeLayerID = null) {
        return this.map.addLayer(opts, beforeLayerID || boundaryLayerID);
    }


    /**
     * 添加图片覆盖物
     * @param {String} imgUrl 图片地址
     * @param {Array} coordinates 图片四个顶点坐标 [[lng1,lat1], [lng2, lat2],...]
     * @param {Object} opts 控制图片样式 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-raster
     * @param {Object} [opts.paintOpts] 控制图片样式 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-raster
     * @param {Object} [opts.layoutOpts] 控制图片样式 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-raster
     * @param {Object} [opts.fitOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/api/#cameraoptions
     * @param {Boolean} isFit
     * @return {string}
     */
    addImageOverlay(imgUrl, coordinates = [], opts = {}, isFit = true) {
        const layerID = generateUUID('image');

        this.addLayer({
            "id": layerID,
            "source": {
                "type": "image",
                "url": imgUrl,
                "coordinates": coordinates
            },
            "type": "raster",
            "paint": Object.assign({"raster-opacity": 0.85}, opts.paintOpts || {}),
            "layout": Object.assign({}, opts.layoutOpts || {}),
        });

        if (isFit) this.fitBounds(coordinates, opts.fitOpts || {})

        return layerID;
    }

    /**
     * 设置图片覆盖物
     */
    setImageOverlay = this.getSetLayerFN(this.addImageOverlay);


    /**
     * 添加osm切片
     * @param {Object} osmTile
     * @param {String} osmTile.tile osm切片服务地址格式
     * @param {Object} opts
     * @param {Object} [opts.paintOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-raster
     * @param {Object} [opts.layoutOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-raster
     * @return {string} layerID
     */
    addOsmTileLayer(osmTile, opts = {}) {
        const layerID = generateUUID('osm-tile');

        this.addLayer({
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

    /**
     * 设置osm切片
     */
    setOsmTileLayer = this.getSetLayerFN(this.addOsmTileLayer);


    /**
     * 添加普通 geoJSON Layer
     * @param {Object} geoJson GeoJSON格式数据
     * @param {Object} opts
     * @param {Object} [opts.paintOpts] GeoJSON样式描述 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.layoutOpts] GeoJSON样式描述 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.fitOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/api/#cameraoptions
     * @param {Boolean} isFit  是否自动移动到GeoJSON添加的位置
     * @return {string} layerID
     */
    addGeoJSONByFill(geoJson, opts = {}, isFit = true) {
        const layerID = generateUUID('geoJSON');

        this.addLayer({
            id: layerID,
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': geoJson
            },
            'paint': Object.assign({
                'fill-color': '#088',
                'fill-opacity': 0.8
            }, opts.paintOpts || {}),
            'layout': Object.assign({

            }, opts.layoutOpts || {})
        });


        if (isFit) this.fitBounds(getGeoJSONFirstCoord(geoJson), opts.fitOpts || {});

        return layerID;
    }

    /**
     * 设置普通 geoJSON Layer
     */
    setGeoJSONByFill = this.getSetLayerFN(this.addGeoJSONByFill);

    /**
     * 添加3D填充 geoJSON
     * @param {Object} geoJson GeoJSON格式数据
     * @param {Object} opts
     * @param {Object} [opts.paintOpts] GeoJSON样式描述 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill-extrusion
     * @param {Object} [opts.layoutOpts] GeoJSON样式描述 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill-extrusion
     * @param {Object} [opts.fitOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/api/#cameraoptions
     * @param {Boolean} isFit  是否自动移动到GeoJSON添加的位置
     * @return {string} layerID
     */
    addGeoJSONByFillExtrusion(geoJson, opts = {}, isFit = true) {
        const layerID = generateUUID('geoJSON');

        this.addLayer({
            id: layerID,
            'type': 'fill-extrusion',
            'source': {
                'type': 'geojson',
                'data': geoJson
            },
            'paint': Object.assign({
                'fill-extrusion-color': '#088',
                'fill-extrusion-opacity': 0.8,

                // --- 获取GeoJSON属性properties中的值 ----
                // 'fill-extrusion-color': ['get', 'color'],
                // 'fill-extrusion-height': ['get', 'height'],
                // 'fill-extrusion-base': ['get', 'base_height'],
            }, opts.paintOpts || {}),

            'layout': Object.assign({

            }, opts.layoutOpts || {})
        });

        if (isFit) this.fitBounds(getGeoJSONFirstCoord(geoJson), opts.fitOpts || {})

        return layerID;
    }

    /**
     * 设置3D填充 geoJSON
     * @type {*}
     */
    setGeoJSONByFillExtrusion = this.getSetLayerFN(this.addGeoJSONByFillExtrusion);

    /**
     * 添加WMS Layer
     * @param {String} url
     * @param {Object} wmsParams wms参数
     * @param {Number} tileSize 切片大小
     * @return {string}
     */
    addWMSLayer(url, wmsParams = {}, tileSize = 256) {
        const layerID = generateUUID('geoJSON');
        const {query} = queryString.parseUrl(url);

        wmsParams = Object.assign({
            bbox: '{bbox-epsg-3857}',
            format: 'image/png',
            service: 'WMS',
            version: '1.1.1',
            request: 'GetMap',
            width: 256,
            height: 256,
            layers: 'Natural2015'
        }, query, wmsParams);

        this.addLayer({
            'id': layerID,
            'type': 'raster',
            'source': {
                'type': 'raster',
                'tiles': [
                    `${url}?${objToUrlParams(wmsParams)}`
                ],
                'tileSize': tileSize || 256
            },
            'paint': {}
        });

        return layerID;
    }

    /**
     * 设置WMS Layer
     * @type {*}
     */
    setWMSLayer = this.getSetLayerFN(this.addWMSLayer);

    /**
     * 添加文字和雪碧图Icon
     * @param {Array} data 数据
     * @param {Array} data[].data.coordinates 标记点的经纬度坐标[lng, lat]
     * @param {Array} [data[].data.title] 文字
     * @param {Array} [data[].data.icon] 雪碧图Icon名字, 读取sprite@2x.json中的名称
     * @param {Array} [data[].properties] GeoJSON中的properties
     * @param {Object} opts
     * @param {Object} [opts.layoutOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-symbol
     * @param {Object} [opts.paintOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-symbol
     * @param {Object} [opts.fitOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/api/#cameraoptions
     * @param {Boolean} isFit
     * @return {string}
     */
    addFontAndIconLayer(data = [], opts = {}, isFit = false) {
        const layerID = generateUUID('fontAndIcon');
        const bounds = [];
        const features = data.map(item => {
            const {data, properties} = item;
            bounds.push(data.coordinates);
            return {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": data.coordinates
                },
                "properties": Object.assign({
                    "title": data.title,
                    "icon": data.icon
                }, properties || {})
            }
        });

        this.addLayer({
            "id": layerID,
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": features,
                }
            },
            "layout": Object.assign({
                "icon-size": 1,
                "icon-image": "{icon}",
                "text-field": "{title}",
                "text-font": ["simsun"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }, opts.layoutOpts || {}),
            "paint": Object.assign({

            }, opts.paintOpts || {})
        });

        if (isFit) this.fitBounds(bounds, opts.fitOpts || {});

        return layerID;
    }


    /**
     * 设置文字和雪碧图Icon
     * @type {*}
     */
    setFontAndIconLayer = this.getSetLayerFN(this.addFontAndIconLayer);

    /**
     * 添加圆Layer
     * @param {Array} data 数据
     * @param {Array} data[].data.center 中心点坐标[lng, lat]
     * @param {Array} data[].data.radius 半径,单位是'千米'
     * @param {Array} [data[].circleProperties] 圆GeoJSON中的properties描述
     * @param {Array} [data[].lineProperties] 线GeoJSON中的properties描述
     * @param {Object} opts
     * @param {Object} [opts.circleFillPaintOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.circleFillLayoutOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.linePaintOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-line
     * @param {Object} [opts.lineLayoutOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-line
     * @param {Object} [opts.fitOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/api/#cameraoptions
     * @param {Boolean} isFit
     * @return {{circleLayerID: string, lineLayerID: string}}
     */
    addCircleLayer(data = [], opts = {}, isFit = true) {
        const circleData = [];
        const lineData = [];
        data.forEach(item => {
            let {data, circleProperties, lineProperties} = item;

            const circleGeoJSON = Turf.circle(data.center, data.radius, {
                steps: 360,
                units: 'kilometers',
                properties: circleProperties
            });

            circleData.push({
                data: circleGeoJSON.geometry.coordinates[0],
                properties: circleProperties || {}
            })

            lineData.push({
                data: circleGeoJSON.geometry.coordinates[0],
                properties: lineProperties || {}
            })
        });

        const circleLayerID = this.addPolygonLayer(circleData, {paintOpts: opts.circleFillPaintOpts, layoutOpts: opts.circleFillLayoutOpts}, false);
        const lineLayerID = this.addLineLayer(lineData, {paintOpts: opts.linePaintOpts, layoutOpts: opts.lineLayoutOpts}, false);

        if (isFit) this.fitBounds(circleData[0].data, opts.fitOpts || {});

        return {circleLayerID, lineLayerID};

    }

    /**
     * 设置圆Layer
     * @type {*}
     */
    setCircleLayer = this.getSetLayerFN(this.addCircleLayer);

    /**
     * 添加线
     * @param {Array| Object} data 数据
     * @param {Array} data[].data 坐标[[lng1, lat1], [lng2, lat2],...]
     * @param {Array} [data[].properties] GeoJSON中的properties描述
     *
     * @param {Object} opts
     * @param {Object} [opts.paintOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-line
     * @param {Object} [opts.layoutOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-line
     * @param {Object} [opts.fitOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/api/#cameraoptions
     * @param {Boolean} isFit
     * @return {String}
     *
     * usage:
     * addLineLayer([
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
                    ],
                    properties: {}
                }
         ])

         或者
        addLineLayer({data: [ [[1, 2], [3, 4]], [[1, 2], [3, 4]] ], properties: {}})
     */
    addLineLayer(data = [], opts = {}, isFit = true){
        const layerID = generateUUID('line');
        let bounds = [];

        const geoData = Array.isArray(data) ? {
            type: "FeatureCollection",
            features: data.map(item => {
                const { data, properties } = item;
                bounds = bounds.concat(data);
                return {
                    'type': 'Feature',
                    'properties': Object.assign({}, properties || {}),
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': data
                    }
                }
            })
        }: {
            'type': 'Feature',
            'properties': Object.assign({}, data.properties || {}),
            'geometry': {
                'type': 'MultiLineString',
                'coordinates': data.data
            }
        };

        this.addLayer({
            'id': layerID,
            'type': 'line',
            'source': {
                'type': 'geojson',
                data: geoData
            },
            'paint': Object.assign({
                'line-width': 1,
                'line-color': "#33C9EB"
            }, opts.paintOpts || {}),
            'layout': Object.assign({}, opts.layoutOpts || {})
        });

        if (isFit) this.fitBounds(bounds, opts.fitOpts || {});

        return layerID;
    }

    /**
     * 设置线
     * @type {*}
     */
    setLineLayer = this.getSetLayerFN(this.addLineLayer);

    /**
     * 添加多边形
     * @param {Array} data 数据
     * @param {Array} data[].data 坐标[[lng1, lat1], [lng2, lat2],...]
     * @param {Array} [data[].properties] GeoJSON中的properties描述
     * @param {Object} opts
     * @param {Object} [opts.paintOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.layoutOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.fitOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/api/#cameraoptions
     * @param {Boolean} isFit
     * @return {String}
     */
    addPolygonLayer(data, opts = {}, isFit = true){
        const layerID = generateUUID('polygon');

        let bounds = [];
        const features = data.map(item => {
            const { data, properties } = item;
            bounds = bounds.concat(data);
            return {
                'type': 'Feature',
                'properties': Object.assign({}, properties || {}),
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [data]
                }
            }
        });

        this.addLayer({
            'id': layerID,
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': features

                }
            },
            'layout': Object.assign({}, opts.layoutOpts || {}),
            'paint': Object.assign({
                'fill-color': '#088',
                'fill-opacity': 0.8
            }, opts.paintOpts || {})
        });

        if (isFit) this.fitBounds(bounds, opts.fitOpts || {});

        return layerID;
    }

    /**
     * 设置多边形
     * @type {*}
     */
    setPolygonLayer = this.getSetLayerFN(this.addPolygonLayer);

    /**
     * 添加高程切片
     * @param {Array} url 山地投影 mapbox://mapbox.terrain-rgb || https://domain/{x}/{y}/{z}.png
     * @param {Object} opts
     * @param {Object} [opts.paintOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.layoutOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.fitOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/api/#cameraoptions
     * @return {String}
     */
    addRasterDemLayer(url, opts = {}, isFit = true) {
        const layerID = generateUUID('raster_dem');

        this.addLayer({
            "id": layerID,
            "source": {
                "type": "raster-dem",
                ...(() => {
                    if (new RegExp(/^mapbox:/).test(url)) {
                        return {url}
                    }else {
                        return {tiles: [url]}
                    }
                })(),
                "encoding": "mapbox",
            },
            "type": "hillshade",
            "paint": Object.assign({
                "hillshade-illumination-anchor": "map",     // 地图旋转时, 山脊照明方向
                // "hillshade-shadow-color": "#FF3030",        // 远离光源的区域的阴影颜色
                // "hillshade-highlight-color": "#FF3030",     // 面向光源的区域的阴影颜色
                "hillshade-accent-color": "#ff3030",        // 阴影色彩用来强调崎岖的地形，如陡峭的悬崖和峡谷
                "hillshade-exaggeration": 1,    // 亮度
            }, opts.paintOpts || {}),
            "layout": Object.assign({}, opts.layoutOpts || {}),
        });

        return layerID;
    }

    /**
     * 设置高程切片
     * @type {*}
     */
    setRasterDemLayer = this.getSetLayerFN(this.addRasterDemLayer);

    /**
     * 添加固定像素半径的圆
     * @param {Array} data 数据
     * @param {Array} data[].data.center 中心点坐标[lng, lat]
     * @param {Array} data[].data.radius 半径,单位是'像素'
     * @param {Array} [data[].properties] 圆GeoJSON中的properties描述
     * @param {Object} opts
     * @param {Object} [opts.paintOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.layoutOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/style-spec#layers-fill
     * @param {Object} [opts.fitOpts] 参数说明 https://www.mapbox.com/mapbox-gl-js/api/#cameraoptions
     * @param {Boolean} isFit
     * @return {String}
     */
    addPixelCircleLayer(data, opts = {}, isFit = true) {
        const layerID = generateUUID('pixel_circle');

        let bounds = [];
        const features = data.map(item => {
            const { data, properties } = item;
            bounds.push(data.center);
            return {
                'type': 'Feature',
                'properties': Object.assign({circleRadius: data.radius}, properties || {}),
                'geometry': {
                    'type': 'Point',
                    'coordinates': data.center
                }
            }
        });

        this.addLayer({
            "id": layerID,
            "source": {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': features
                }
            },
            "type": "circle",
            "paint": Object.assign({
                "circle-radius": ['get', 'circleRadius'],         // 圆的直径,单位像素
                "circle-color": "#B42222",                        // 圆的颜色
            }, opts.paintOpts || {}),
            "layout": Object.assign({}, opts.layoutOpts || {}),
        });

        if (isFit) this.fitBounds(bounds, opts.fitOpts || {});

        return layerID;
    }

    /**
     * 设置固定像素半径的圆
     * @type {*}
     */
    setPixelCircleLayer = this.getSetLayerFN(this.addPixelCircleLayer);


    /**
     * 将自定义贴图添加到地图中
     *
     * 制作贴图的过程:
     *  1. 固定好地图容器的宽高, 中心点, 缩放等级, pitch, bearing
     *  2. 将做好的地图截图给UI设计人员, 保证图片的宽高
     *  3. 再次加载图片时,要和地图截图时的容器的宽高, 中心点, 缩放等级保持一致,这样才能正确加载图片
     *
     * @param imgUrl 贴图url
     * @param mkImgForMapEnvParams 制作图片时，地图的环境变量(地图容器的宽高, 地图缩放等级, 地图中心点, pitch, bearing )
     */
    addCustomImgToMapLayer = (imgUrl, mkImgForMapEnvParams = {}) => {
        const map = this.map;
        const containerDom = this.containerDom;     // 地图容器的dom
        const layerID = generateUUID('custom_image');

        // 缓存当前地图的环境变量
        const currentMapEnvParams = {
            // 地图容器的宽高
            containerWH: {
                width: containerDom.clientWidth,
                height: containerDom.clientHeight
            },
            mapParams: {
                zoom: map.getZoom(),    // 地图缩放等级
                center: [map.getCenter().lng, map.getCenter().lat], // 地图中心点
                pitch: map.getPitch(),
                bearing: map.getBearing(),
            }
        }

        // 还原制作贴图时的环境
        const {containerWH, mapParams} = mkImgForMapEnvParams;
        containerDom.style.setProperty('width', `${containerWH.width}px`);
        containerDom.style.setProperty('height', `${containerWH.height}px`);
        map.setCenter(mapParams.center);
        map.setZoom(mapParams.zoom);
        map.setPitch(mapParams.pitch);
        map.setBearing(mapParams.bearing);
        map.resize();

        // 将贴图添加到地图中
        const bounds = map.getBounds();
        const northWest = bounds.getNorthWest();
        const northEast = bounds.getNorthEast();
        const southEast = bounds.getSouthEast();
        const southWest = bounds.getSouthWest();

        this.addLayer({
            id: layerID,
            "type": "raster",
            "source": {
                type: "image",
                url: imgUrl,
                coordinates: [
                    [northWest.lng, northWest.lat],
                    [northEast.lng, northEast.lat],
                    [southEast.lng, southEast.lat],
                    [southWest.lng, southWest.lat],

                ]
            },
            "paint": {
                "raster-fade-duration": 0
            }
        });


        // 恢复到当前的地图环境
        containerDom.style.setProperty('width', `${currentMapEnvParams.containerWH.width}px`);
        containerDom.style.setProperty('height', `${currentMapEnvParams.containerWH.height}px`);
        map.setCenter(currentMapEnvParams.mapParams.center);
        map.setZoom(currentMapEnvParams.mapParams.zoom);
        map.setPitch(currentMapEnvParams.mapParams.pitch);
        map.setBearing(currentMapEnvParams.mapParams.bearing);
        map.resize();
    }

    /**
     * 设置自定义贴图添加到地图中
     * @type {*}
     */
    setCustomImgToMapLayer = this.getSetLayerFN(this.addCustomImgToMapLayer);


    /**
     * 生成栅格线数据
     * @param {Object} params
     * @param {Object} params.bounds
     * @param {Object} params.bounds.ne     // 东北点
     * @param {Object} params.bounds.sw     // 西南点
     * @param {Number} params.gridHorizontalNum     // 网格水平线数量
     * @param {Number} params.gridVerticalNum       // 网格垂直线数量
     * @param {Number} params.crossPointLineLngLengthRate   // 交叉点线长度经度占比
     * @param {Number} params.crossPointLineLatLengthRate   // 交叉点线长度维度占比
     *
     * @return {{crossPoints: Array, gridLines: *[], crossPointLines: Array}}
     */
    mkGridLineData = (params) => {
        const horizontalLine = [];      // 水平线
        const verticalLine = [];        // 垂直线
        const crossPoints = [];         // 交叉点
        const crossPointLines = [];     // 交叉线

        const {bounds, gridHorizontalNum, gridVerticalNum, crossPointLineLngLengthRate, crossPointLineLatLengthRate } = params;
        const maxLng = Math.max(bounds.ne.lng, bounds.sw.lng);
        const minLng = Math.min(bounds.ne.lng, bounds.sw.lng);
        const maxLat = Math.max(bounds.ne.lat, bounds.sw.lat);
        const minLat = Math.min(bounds.ne.lat, bounds.sw.lat);

        const lngStep = (maxLng - minLng) / gridVerticalNum;
        const latStep = (maxLat - minLat) / gridHorizontalNum;


        for(let i = 0; i < gridVerticalNum; i++){
            const currentLng = minLng + i * lngStep;
            verticalLine.push([[currentLng, minLat], [currentLng, maxLat]]);
        }

        for(let i = 0; i < gridHorizontalNum; i++){
            const currentLat = minLat + i * latStep;
            horizontalLine.push([[minLng, currentLat], [maxLng, currentLat]]);
        }


        for(let i = 0; i < verticalLine.length; i++){
            const lng = verticalLine[i][0][0];
            for(let j = 0; j < horizontalLine.length; j++){
                const lat = horizontalLine[j][0][1];
                crossPoints.push([lng, lat]);

                crossPointLines.push([[lng * (1 - crossPointLineLngLengthRate), lat],[lng * (1 + crossPointLineLngLengthRate), lat]]);
                crossPointLines.push([[lng, lat * (1 - crossPointLineLatLengthRate)],[lng, lat * (1 + crossPointLineLatLengthRate)]]);
            }
        }


        return {
            gridLines: [...horizontalLine, ...verticalLine],
            crossPoints,
            crossPointLines,
        }
    };
}

