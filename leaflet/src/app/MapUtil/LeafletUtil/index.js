import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import IconMarker from './img/marker.png';

// 加载切片服务配置
import "./extend/tileServiceProvider";
// import "./extend/NonTiledLayer";
import "./extend/NonTiledLayer.WCS";

// 加载鼠标工具
import MouseTool from './extend/mouseTool';

// 加载风速layer
import "./extend/windyVelocity";

// 加载风速tile layer
import "./extend/windyTile";

// 加载移动Marker
import "./extend/movingMarker";

// 加载地理编码工具
import GeoCoder from './GeoCoder';

// 加载mapUtil枚举文件
import { ZOOM, CENTER } from './constants';

/**
 * 记录清除地图回调函数
 * @type {Map<any, any>}
 */
let cacheClearCallBack = new Map();

/**
 * 触发清除地图回调
 */
const triggerClearMapCb = () => {
	for(let [cb, {params, context}] of cacheClearCallBack.entries()) {
		cb.apply(context, params);
	}
};

/**
 * Leaflet 地图工具类
 */
export default class LeafletUtil {
    static G = {
        L,
        ZOOM
    };

    /**
     * 初始化地图
     * @param {String} mapId    地图容器id
     * @param {Object} options  地图配置 https://leafletjs.com/reference-1.3.0.html#map-option
     * @returns {null|*}
     */
    constructor(mapId, options = {}) {
        this.containerDom = mapId instanceof HTMLElement ? mapId : document.querySelector(`#${mapId}`);

        this.map = L.map(this.containerDom, Object.assign({
            crs:L.CRS.EPSG3857,     // 投影坐标系, 墨卡托投影
            // crs:L.CRS.EPSG4326,    // 大地坐标系
            center: CENTER,
            zoom: ZOOM.minZoom,
            // layers: [L.tileLayer.tileServiceProvider('Google.Satellite.Map', ZOOM)],
            layers: [L.tileLayer.tileServiceProvider('Geoq.Normal.Map', ZOOM)],
            zoomControl: false,
            doubleClickZoom: false,
            renderer: L.canvas()
            // renderer: L.svg()
        }, options));

        // 鼠标工具
        this.mouseTool = new MouseTool(this.map, L);
        // 地理编码工具
        this.geoCoder = new GeoCoder();
    }

    /**
     * 将*addLayer方法转换成setLayer方法
     * @param {Function} addLayer
     * @return {*}
     */
    getSetLayerFN = (addLayer = () => {}) => (() => {
        let oldLayer = null;
        return (...params) => {
            if (oldLayer) oldLayer.remove()
            return oldLayer = addLayer.apply(this, params);
        }
    })();

    addWindyTile = () => {
        const layer = L.windyTileLayer({});
        return layer.addTo(this.map);
        this.map.addLayer(layer);
        return layer;
    }

	/**
	 * 绑定清除地图的回调
	 * @param {Function} cb 回调方法
	 * @param {Array} params 回调参数
	 * @param {Object} context 上下文
	 */
	onClearMap = (cb = () => {}, params = [], context = null) => {
		cacheClearCallBack.set(cb, { params: Array.isArray(params) ? params : [params], context });
	}

	/**
	 * 解除清除地图的回调
	 * @param cb
	 */
	offClearMap = (cb) =>{
		if (cacheClearCallBack.has(cb)) {
			cacheClearCallBack.delete(cb);
		}
	}

    /**
     * 清空地图
     * @param {Array} keepLayers 需要保留的layer [layerIns]
     */
    clearMap = (keepLayers = []) => {
        this.mouseTool.measure.clear();

        setTimeout(() => {
            this.map.eachLayer((layer) => {
                if (keepLayers.indexOf(layer) === -1) {
                    layer.remove();
                }
            });

            triggerClearMapCb();
        }, 0)
    }

    /**
     * 添加WMS切片到地图中
     * @param {String} url WMS服务地址
     * @param {Object} options 配置说明： http://leafletjs.com/reference-1.2.0.html#tilelayer-wms
     * @returns {*}
     */
    addWMSLayer = (url, options = {}) => {
        const wmsTileLayer = L.tileLayer.wms(url, Object.assign({
            layers: '',
            format: 'image/png',
            transparent: true,
            version: '',
            styles: '',
        }, options));

        this.map.addLayer(wmsTileLayer);

        return wmsTileLayer;
    }

    /**
     * 设置WMS切片到地图中
     * @type {*}
     */
    setWMSLayer = this.getSetLayerFN(this.addWMSLayer);

    addTMSLayer = (url, options = {}) => {
        const tmsTileLayer = L.tileLayer(url, options || {});

        this.map.addLayer(tmsTileLayer);

        return tmsTileLayer;
    }

    /**
     * 设置TMS切片到地图中
     * @type {*}
     */
    setTMSLayer = this.getSetLayerFN(this.addTMSLayer);

    /**
     * 添加GeoJSON数据
     * @param {Object} data
     * @param {Object} opts
     * @param {boolean} isFit
     */
    addGeoJSONLayer = (data, opts = {}, isFit = false) => {
        const layer = L.geoJSON(data, Object.assign({
            style: function (feature) {
                return {color: feature.properties.color};
            }
        }, opts)).bindPopup(function (layer) {
            return layer.feature.properties.description;
        }).addTo(this.map);

        if(isFit) this.map.fitBounds(layer.getBounds());

        return layer;
    }

    /**
     * 设置GeoJSON数据
     * @type {*}
     */
    setGeoJSONLayer = this.getSetLayerFN(this.addGeoJSONLayer);

    /**
     * 依据经纬度获取距离
     * @param {Array} start 起点坐标 [lat, lng]
     * @param {Array} end 终点坐标 [lat, lng]
     * @returns {number} 单位是: "米"
     */
    getDistanceByLatLng (start, end) {
        return this.map.distance(start,end);
    }


    /**
     * 添加点到地图
     * @param {Array} latlngs [lat, lng]
     * @param {Object} options  配置说明： http://leafletjs.com/reference-1.2.0.html#marker
     * @returns {*}
     */
    addMarker = (latlngs, options = {}) => {
       return L.marker(latlngs, Object.assign({
            icon: L.icon({
                iconUrl: IconMarker,
                iconSize: [16, 16],
                // iconAnchor: [16, 16],
            })
        }, options)).addTo(this.map);
    }

    /**
     * 设置点到地图
     * @type {*}
     */
    setMarker = this.getSetLayerFN(this.addMarker);

    /**
     * 添加矩形到地图
     * @param {Array} bounds [[lat, lng], [lat, lng]]
     * @param options
     */
    addRectangle = (bounds, options = {}) => {
        return L.rectangle(bounds, Object.assign({color: "#ff7800", weight: 1}, options)).addTo(this.map);
    }

    /**
     * 设置矩形到地图
     * @type {*}
     */
    setRectangle = this.getSetLayerFN(this.addRectangle);

    /**
     * 绘制多边形到地图
     * @param {Array} latlngs [[lat, lng], [lat, lng]]
     * @param options
     */
    addPolygon = (latlngs, options = {}) =>{
        return L.polygon(latlngs, Object.assign({color: "#ff7800", weight: 1}, options)).addTo(this.map);
    }

    /**
     * 设置多边形到地图
     * @type {*}
     */
    setPolygon = this.getSetLayerFN(this.addPolygon);


    /**
     * 添加圆形到地图
     * @param {Array} latlngs [lat, lng]
     * @param {Number} radius
     * @param options
     */
    addCirCle = (latlngs, radius, options = {}) => {
        return L.circle(latlngs, {radius, color: "#ff7800", weight: 1}).addTo(this.map);
    }

    /**
     * 设置圆形到地图
     * @type {*}
     */
    setCirCle = this.getSetLayerFN(this.addCirCle);

    /**
     * 添加折线到地图
     * @param latlngs [[lat1, lng1], [lat2, lng2],...]
     * @param options
     * @returns {*}
     */
    addPolyline = (latlngs, options = {}) => {
        return L.polyline(latlngs, Object.assign({
            color: '#FFFF00',
            weight: 1,
        }, options)).addTo(this.map)
    }

    /**
     * 设置折线到地图
     * @type {*}
     */
    setPolyline = this.getSetLayerFN(this.addPolyline);

    /**
     * 添加圆点标记到地图
     * @param latlngs [lat, lng]
     * @param options 配置说明：http://leafletjs.com/reference-1.2.0.html#circlemarker
     * @returns {*}
     */
    addCircleMarker = (latlngs, options = {}) => {
        return L.circleMarker(L.latLng(latlngs[0], latlngs[1]), Object.assign({
            radius: 1,
            color: 'green',
            fillColor: 'green',
            fillOpacity: 1
        }, options)).addTo(this.map)
    }

    /**
     * 设置圆点标记到地图
     * @type {*}
     */
    setCircleMarker = this.getSetLayerFN(this.addCircleMarker);

    /**
     * 添加风资源图层
     * @param {Object} windyData
     * @returns {*}
     */
    addWindyLayer = (windyData, opts = {}) => {
        const windyVelocityLayer = L.windyVelocityLayer(Object.assign({
            data: windyData,
            velocityScale: 0.005,    // 调整风速大小
        }, opts));

        return windyVelocityLayer
    }

    /**
     * 依据坐标和盒子的宽高，计算position的x和y
     * @param {Array} coordinate [ lat, lng ]
     * @param {Number} boxWidth
     * @param {Number} boxHeight
     * @returns {{x: number, y: number}}
     */
    computeBoxPosByCoord = (coordinate, boxWidth, boxHeight) =>{
        const map = this.map;
        const mapWidth = map.getSize().x,
            mapHeight = map.getSize().y,
            coord = this.map.latLngToContainerPoint(L.latLng(coordinate[0], coordinate[1]));

        const x = coord.x + boxWidth > mapWidth ? coord.x - boxWidth - 50 : coord.x + 50;
        const y = coord.y - boxHeight/2 > mapHeight ? coord.y + boxHeight/2 : coord.y - boxHeight/2;

        return { x, y }
    }
}

