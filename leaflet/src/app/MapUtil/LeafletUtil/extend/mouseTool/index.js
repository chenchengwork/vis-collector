import Measure from './Measure';
import IconMarker from '../../img/marker.png';
// import fire from 'fir'

const cacheMouseStartEventCb = {
    marker: {
        eventName: 'click',
        eventCb: null,
    },
    rectangle: {
        eventName: 'mousedown',
        eventCb: null,
    },
    circle: {
        eventName: 'mousedown',
        eventCb: null,
    },
    polyline: {
        eventName: 'dblclick',
        eventCb: null,
    },
    polygon: {
        eventName: 'dblclick',
        eventCb: null,
    }
}

/**
 * 枚举形状类型
 * @type {{polygon: string, polyline: string}}
 */
const EnumShapeType = {
    polygon: 'polygon',
    polyline: 'polyline'
};

/**
 * 默认鼠标样式
 * @type {string}
 */
let defaultMapMouseCursor = 'move';

const wrapMouse = (L, map, createMark, setMarkBounds, drawEndCb) => {
    map._container.style.cursor = 'crosshair';
    map.dragging.disable();

    const mousedownCb = (downEvent) => {
        let markObj =  null;

        const mousemoveCb = (moveEvent) => {
            if (markObj){
                setMarkBounds(markObj, downEvent, moveEvent);
            }else {
                markObj =  createMark(downEvent, moveEvent);
            }
        };

        const mouseupCb = () => {
            map.off('mouseup', mouseupCb);
            map.off('mousemove', mousemoveCb);
            drawEndCb(markObj);
        };

        map.on('mousemove', mousemoveCb);
        map.on('mouseup', mouseupCb)
    };

    map.on('mousedown', mousedownCb);

    return mousedownCb;
};

const wrapMousePP = (L, map, createMark, setMarkBounds, drawEndCb) => {
    map._container.style.cursor = 'crosshair';
    let markObj =  null;
    let cacheMousemoveCb = null;

    const clickCb = (clickedEvent) => {
        markObj =  createMark(markObj, clickedEvent);

        const mousemoveCb = (moveEvent) => {
            setMarkBounds(markObj, moveEvent);
        };

        map.off('mousemove', cacheMousemoveCb);
        map.on('mousemove', mousemoveCb);
        cacheMousemoveCb = mousemoveCb;
    };

    const dblClickCb = () => {
        map.off('mousemove', cacheMousemoveCb);
        drawEndCb(markObj)
        markObj = null;
    }

    map.on('click', clickCb);
    map.on('dblclick', dblClickCb);

    return dblClickCb;
}

/**
 * 绘制多边形或折线
 * @param type
 * @param map
 * @param L
 * @param options
 * @returns {Promise<any>}
 */
const drawPolygonOrPolyline = (type, map, L, options = {}) => new Promise((resolve, reject) => {
    const createMark = (markObj, clickedEvent) => {
        if(markObj){
            let currentLatLngs = markObj.getLatLngs();
            if (type == EnumShapeType.polygon) {
                currentLatLngs[0].push(L.latLng(clickedEvent.latlng.lat, clickedEvent.latlng.lng));
            }else if (type == EnumShapeType.polyline) {
                currentLatLngs.push(L.latLng(clickedEvent.latlng.lat, clickedEvent.latlng.lng));
            }
            markObj.setLatLngs(currentLatLngs);

            return markObj;
        }

        const shape = {
            [EnumShapeType.polygon]: L.polygon,
            [EnumShapeType.polyline]: L.polyline,
        };

        return shape[type](
            [[clickedEvent.latlng.lat, clickedEvent.latlng.lng]],
            Object.assign({
                color: "#ff7800",
                weight: 1,
            }, options)
        ).addTo(map);
    };

    const setMarkBounds = (markObj,  moveEvent) => {
        let currentLatLngs = markObj.getLatLngs();
        if (type == EnumShapeType.polygon) {
            if (currentLatLngs[0].length < 2) {
                currentLatLngs[0].push(L.latLng(moveEvent.latlng.lat, moveEvent.latlng.lng));
            } else {
                currentLatLngs[0].pop();
                currentLatLngs[0].push(L.latLng(moveEvent.latlng.lat, moveEvent.latlng.lng));
            }
        }else if (type == EnumShapeType.polyline) {
            if (currentLatLngs.length < 2) {
                currentLatLngs.push(L.latLng(moveEvent.latlng.lat, moveEvent.latlng.lng));
            } else {
                currentLatLngs.pop();
                currentLatLngs.push(L.latLng(moveEvent.latlng.lat, moveEvent.latlng.lng));
            }
        }

        markObj.setLatLngs(currentLatLngs);
    };

    try {
        cacheMouseStartEventCb[type].eventCb = wrapMousePP(L, map, createMark, setMarkBounds, (markObj) => {
            let currentLatLngs = markObj.getLatLngs();
            if (type == EnumShapeType.polygon) {
                currentLatLngs[0].pop();
                currentLatLngs[0].pop();
            }else if (type == EnumShapeType.polyline) {
                currentLatLngs.pop();
                currentLatLngs.pop();
            }

            markObj.setLatLngs(currentLatLngs);

            resolve(markObj)
        })
    }catch (e){
        reject(e)
    }
});


export default class MouseTool{
    /**
     *
     * @param {Object} map leaflet地图实例
     */
    constructor(map, L) {
        defaultMapMouseCursor = map._container.style.cursor || 'move';

        this.map = map;
        this.L = L;
        // 测距工具
        this.measure = new Measure(map, L);
    }

    /**
     * 清除事件
     * @private
     */
    _clearEvent(){
        Object.values(cacheMouseStartEventCb).forEach((item) => this.map.off(item.eventName, item.eventCb));
    }

    /**
     * 关闭鼠标工具
     */
    close() {
        this.measure.clear();
        this._clearEvent();

        this.map.dragging.enable();
        this.map._container.style.cursor = defaultMapMouseCursor;
    }

    /**
     * 绘制标记
     * @param {Object} options 配置说明： http://leafletjs.com/reference-1.2.0.html#marker
     * @param {Boolean} isFitBounds 是否移动到目标区域
     * @returns {Promise<any>}
     */
    marker(options = {}, isFitBounds = false) {
        this._clearEvent();
        return new Promise((resolve, reject) => {
            const map = this.map;
            const L = this.L;
            map._container.style.cursor = 'crosshair';

            try{
                const clickCb = (e) => {
                    const marker = L.marker(
                        [e.latlng.lat, e.latlng.lng],
                        Object.assign({
                            icon: L.icon({
                                iconUrl: IconMarker,
                                iconSize: [16, 16],
                                // iconAnchor: [16, 16],
                            })
                        }, options)
                    ).addTo(map);

                    resolve(marker);
                    this.close();
                };

                map.on('click', clickCb);
                cacheMouseStartEventCb.marker.eventCb = clickCb;

            }catch (e){
                reject(e)
            }
        })
    }

    /**
     * 绘制矩形
     * @param {Object} options 配置说明： http://leafletjs.com/reference-1.2.0.html#rectangle
     * @param {Boolean} isFitBounds 是否移动到目标区域
     * @returns {Promise<any>}
     */
    rectangle(options = {}, isFitBounds = false){
        this._clearEvent();
        return new Promise((resolve, reject) => {
            const map = this.map;
            const L = this.L;

            const createMark = (downEvent, moveEvent) => {
                return L.rectangle(
                    [[downEvent.latlng.lat, downEvent.latlng.lng ],[moveEvent.latlng.lat, moveEvent.latlng.lng]],

                    Object.assign({
                        color: "#ff7800",
                        weight: 1
                    }, options)

                ).addTo(map);
            };

            const setMarkBounds = (rectangleObj, downEvent, moveEvent) => {
                rectangleObj.setBounds(L.latLngBounds(
                    L.latLng(downEvent.latlng.lat, downEvent.latlng.lng),
                    L.latLng(moveEvent.latlng.lat, moveEvent.latlng.lng)
                ));
            };

            try {
                cacheMouseStartEventCb.rectangle.eventCb = wrapMouse(L, map, createMark, setMarkBounds, (markObj) => {
                    resolve(markObj)
                    this.close();
                })
            }catch (e){
                reject(e)
            }
        });
    }

    /**
     * 绘制圆形
     * @param {Object} options 配置说明： http://leafletjs.com/reference-1.2.0.html#circle
     * @param {Boolean} isFitBounds 是否移动到目标区域
     * @returns {Promise<any>}
     */
    circle(options = {}, isFitBounds = false){
        this._clearEvent();
        return new Promise((resolve, reject) => {
            const map = this.map;
            const L = this.L;

            const createMark = (downEvent, moveEvent) => {
                return L.circle(
                    [downEvent.latlng.lat, downEvent.latlng.lng],

                    Object.assign({
                        color: "#ff7800",
                        weight: 1,
                        radius: map.distance([downEvent.latlng.lat, downEvent.latlng.lng ],[moveEvent.latlng.lat, moveEvent.latlng.lng])
                    }, options)

                ).addTo(map);
            };

            const setMarkBounds = (circleObj, downEvent, moveEvent) => {
                circleObj.setRadius(map.distance(
                    [downEvent.latlng.lat, downEvent.latlng.lng],
                    [moveEvent.latlng.lat, moveEvent.latlng.lng]
                ));
            };

            try {
                cacheMouseStartEventCb.circle.eventCb = wrapMouse(L, map, createMark, setMarkBounds, (markObj) => {
                    resolve(markObj)
                    this.close();
                })
            }catch (e){
                reject(e)
            }
        });
    }

    /**
     * 绘制多边形
     * @param {Object} options 配置说明： http://leafletjs.com/reference-1.2.0.html#polygon
     * @param {Boolean} isFitBounds
     * @returns {Promise<any>}
     */
    polygon(options = {}, isFitBounds = false){
        this._clearEvent();
        return drawPolygonOrPolyline(EnumShapeType.polygon,this.map, this.L, options).then(resp => {
            this.close();
            return resp;
        }, (e) => e)
    }

    /**
     * 绘制折线
     * @param {object} options   配置说明： http://leafletjs.com/reference-1.2.0.html#polyline
     * @param {Boolean} isFitBounds
     * @returns {Promise<any>}
     */
    polyline(options = {}, isFitBounds = false){
        this._clearEvent();
        return drawPolygonOrPolyline(EnumShapeType.polyline,this.map, this.L, options).then(resp => {
            this.close();
            return resp;
        }, (e) => e)
    }
}
