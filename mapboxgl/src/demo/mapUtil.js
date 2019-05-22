import ReactDOM from 'react-dom';

/**
 * 将react添加到dom中
 * @param VisComponent
 * @param props
 * @return {{domRef: *, el: HTMLElement}}
 */
export const reactToDOM = (VisComponent, props = {}) => {
    const el = document.createElement('div');
    let domRef = null;

    ReactDOM.render(<VisComponent {...props}/>, el);

    return {el, domRef};
};

/**
 * 添加ui marker到地图中
 * @param mapboxgl
 * @param map
 * @param params
 * @param markerParams
 * @return {*}
 */
export const addUiMarkerToMap = (mapboxgl, map, params, markerParams = {}) => {
    const { reactToDom, position } = params;

    return new mapboxgl.Marker({
        element: reactToDom.el,
        ...markerParams
    })
        .setLngLat(position)
        .addTo(map);
}

/**
 * 创建地图
 * @param mapboxgl
 * @param {HTMLElement} container
 * @param {Object} options
 * @param loadCb
 * @return {mapboxgl}
 */
export const createMap = (mapboxgl, container, options, loadCb) => {
    const {center, zoom, pitch, bearing, isInteractive, comResource} = options;

    const map = new mapboxgl.Map({
        container,
        style:{
            "version": 8,
            // "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
            // "glyphs": `${this.resource.mapFont.replace(/\/$/, "")}/{fontstack}/{range}.pbf`, // 加载字体
            "sources": {},
            "layers": []
        },
        center,
        zoom,
        pitch,
        bearing,
        interactive: isInteractive
    });

    map.on('load', () => {
        loadCb && loadCb(map)
    });

    return map;
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
export const addOsmTileLayer = (map, osmTile, opts = {}) => {
    const layerID = 'osm-tile';

    map.addLayer({
        "id": layerID,
        "type": "raster",
        "source": {
            "type": "raster",
            'tiles': [
                osmTile
            ],
            'tileSize': 256
        },

        "paint": Object.assign({}, opts.paintOpts || {}),
        "layout": Object.assign({}, opts.layoutOpts || {}),
    });

    return layerID;
}


/**
 * 将自定义贴图添加到地图中
 *
 * 制作贴图的过程:
 *  1. 固定好地图容器的宽高, 中心点, 缩放等级
 *  2. 将做好的地图截图给UI设计人员, 保证图片的宽高
 *  3. 再次加载图片时,要和地图截图时的容器的宽高, 中心点, 缩放等级保持一致,这样才能正确加载图片
 *
 * @param map 地图实例
 * @param containerDom 地图容器的dom
 * @param imgUrl 贴图url
 * @param mkImgForMapEnvParams 制作图片时，地图的环境变量(地图容器的宽高, 地图缩放等级, 地图中心点, pitch, bearing )
 */
export const addCustomImgToMap = (map, containerDom, imgUrl, mkImgForMapEnvParams = {}) => {
    // 缓存当前地图的环境变量
    const currentMapEnvParams = {
        // 地图容器的宽高
        contanerWH: {
            width: containerDom.clientWidth,
            height: containerDom.clientHeigh
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

    map.addLayer({
        id: "texture-img",
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
    containerDom.style.setProperty('width', `${currentMapEnvParams.contanerWH.width}px`);
    containerDom.style.setProperty('height', `${currentMapEnvParams.contanerWH.height}px`);
    map.setCenter(currentMapEnvParams.mapParams.center);
    map.setZoom(currentMapEnvParams.mapParams.zoom);
    map.setPitch(currentMapEnvParams.mapParams.pitch);
    map.setBearing(currentMapEnvParams.mapParams.bearing);
    map.resize();
}

/**
 * 重绘制地图
 * @param map
 * @param prevProps
 * @param props
 */
export const redrawMap = (map, prevProps, props) => {
    const {options: prevOptions} = prevProps;

    const { width, height, options } = props;
    const { center, zoom, pitch, bearing, isInteractive } = options.map;

    const oldMap = prevOptions.map;
    if(oldMap.center[0] !== center[0] || oldMap.center[1] !== center[1]) map.setCenter(center);
    if(oldMap.pitch !== pitch) map.setPitch(pitch);
    if(oldMap.bearing !== bearing) map.setBearing(bearing);
    if(oldMap.zoom !== zoom) map.zoomTo(parseFloat(zoom), {duration: 4000, animate: true,});
    if(oldMap.isInteractive !== isInteractive) {
        // 是否开启交互
        if (isInteractive) {
            map.boxZoom.enable();
            map.scrollZoom.enable();
            map.dragPan.enable();
            map.dragRotate.enable();
            map.keyboard.enable();
            map.doubleClickZoom.enable();
            map.touchZoomRotate.enable();
        } else {
            map.boxZoom.disable();
            map.scrollZoom.disable();
            map.dragPan.disable();
            map.dragRotate.disable();
            map.keyboard.disable();
            map.doubleClickZoom.disable();
            map.touchZoomRotate.disable();
        }
    }

    if(prevOptions.width !== width || prevProps.height !== height) map.resize();
}









