import LeafletUtil from './LeafletUtil';

const L = LeafletUtil.G.L;

/**
 *  地图工具类
 */
export default class MapUtil extends LeafletUtil{
    static G = LeafletUtil.G;

    constructor(mapId, options = {}) {
        super(mapId, options);
        this.typhoonPointCoordinateToInfoMap = {};      //台风点坐标与信息的mapping
    }

    /**
     * 绘制台风轨迹
     * @param {Array} lines
     * [{
            "name":"",
            "path":[[lat, lng],...],
            "tfxh":"1514"
        }]
     */
    drawTyphoon(lines, pointCb = () => {}) {
        let polylines = []
        let points = [];

        for (let i = 0; i < lines.length; i++) {
            const typhoon = this.drawSingleTyphoon(lines[i]);
            polylines.push(typhoon.polyline);
            points.push(typhoon.points);
        }

        return {
            polylines,
            points
        };
    }

    // 绘制单条台风
    drawSingleTyphoon(line){
        const points = [];
        const polyline = this.addPolyline(line.path);
        for (let j = 0; j < line.path.length; j++){
            const point = this.addCircleMarker(line.path[j]);
            points.push(point);
        }

        return {
            polyline,
            points
        }
    }

    redrawSingleTyphoon(line, polyline, points){
        polyline.setLatLngs(line.path);

        for (let j = 0; j < line.path.length; j++){
            if(points[j]){
                points[j].setLatLng(line.path[j])
            }else {

            }
            // const point = this.addCircleMarker(line.path[j]);
            // points.push(point);
        }
    }


    /**
     * 添加风资源图层
     * @param {Object} windyData
     * @returns {*}
     */
    addWindyLayer(windyData, opts = {}) {
        const windyVelocityLayer = L.windyVelocityLayer(Object.assign({
            data: windyData,
            maxVelocity: 15,    // 调整风速大小
        }, opts));

        return windyVelocityLayer
    }


    /**
     * 依据坐标和dom的宽高，计算position的left和top
     * @param {Object} map
     * @param {Array} coordinate [lat,lng]
     * @param {String} domId
     * @returns {{left: number, top: number}}
     */
    getPositionByCoordinate(map,coordinate,domId){

        const mapWidth = map.getSize().x,
            mapHeight = map.getSize().y,
            boxWidth = $('#'+domId).width(),
            boxHeight = $('#'+domId).height(),
            coord = this.map.latLngToContainerPoint(L.latLng(coordinate[0], coordinate[1]));

        const left = coord.x + boxWidth > mapWidth ? coord.x - boxWidth - 50 : coord.x + 50;
        const top = coord.y - boxHeight/2 > mapHeight ? coord.y + boxHeight/2 : coord.y - boxHeight/2;

        return { left, top }
    }
}
