import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxDraw from '@mapbox/mapbox-gl-draw';

// import "tj-mapbox-gl-draw/style/mapbox-gl-draw.css"
// import MapboxDraw from 'tj-mapbox-gl-draw';

// import 'gl-draw-foxgis/dist/gl-draw-foxgis.css';
// import MapboxDraw from 'gl-draw-foxgis';

// import CutLineMode from 'mapbox-gl-draw-cut-line-mode';
// import RectangleMode from './modes/rectangle';
// const modes = MapboxDraw.modes;
// modes.cut_line = CutLineMode;
// modes.draw_rectangle = RectangleMode;


/**
 * 枚举事件类型
 * @type {{onCreate: string, onUpdate: string, onDelete: string, onCombine: string, onUncombine: string, onSelectionchange: string, onModechange: string, onRender: string, onActionable: string}}
 */
const EnumEventType = {
    onCreate: 'draw.create',
    onUpdate: 'draw.update',
    onDelete: 'draw.delete',
    onCombine: 'draw.combine',
    onUncombine: 'draw.uncombine',
    onSelectionchange: 'draw.selectionchange',
    onModechange: 'draw.modechange',
    onRender: 'draw.render',
    onActionable: 'draw.actionable',
};

const bindDrawEvent = (() => {
    const usedEvent = {};

    return (map, draw, bindEventObj = {}) => {
        const eventTypes = Object.values(EnumEventType);
        for(let [eventType, eventFn] of Object.entries(bindEventObj)) {
            if (eventTypes.indexOf(eventType) === -1) throw new Error(eventType + '事件类型不存在');
            map.on(eventType, eventFn);
        }
    }

})();

export default class MouseTool{
    static EventType = EnumEventType;

    constructor(map, opts = {}, bindEventObj = {}){
        this.map = map;

        const draw = this.draw = new MapboxDraw(Object.assign({
            // modes,
            displayControlsDefault: false,
        }, opts));

        map.addControl(draw);

        bindDrawEvent(map, draw, bindEventObj);
    }

    /**
     * 重置鼠标绑定事件
     * @param bindEventObj
     */
    resetMouseEvent(bindEventObj = {}) {
        bindDrawEvent(this.map, this.draw, bindEventObj);
    }

    /**
     * 通过鼠标绘制连续的线段
     */
    drawLine() {
        const draw = this.draw;
        draw.changeMode(draw.modes.DRAW_LINE_STRING);
    }

    /**
     * 通过鼠标绘制多边形
     */
    drawPolygon() {
        const draw = this.draw;
        draw.changeMode(draw.modes.DRAW_POLYGON);
    }

    /**
     * 通过鼠标绘制点
     */
    drawPoint() {
        const draw = this.draw;
        draw.changeMode(draw.modes.DRAW_POINT);
    }

    /**
     * 依据featureID删除绘制的形成
     * @param {String} featureID
     */
    deleteByFeatureID(featureID) {
        this.draw.delete(featureID);
    }

    /**
     * 删除所有的绘制Layer
     */
    deleteAll() {
        this.draw.deleteAll();
    }

}
