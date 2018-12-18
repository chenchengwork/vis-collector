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
            const line = lines[i];
            //
            const polyline = this.addPolyline(line.path);

            const ItemPoints = [];
            for (let j = 0; j < line.path.length; j++){
                const point = this.addCircleMarker(line.path[j]);
                ItemPoints.push(point);
            }

            polylines.push(polyline);
            points.push(ItemPoints);
        }

        return {
            polylines,
            points
        };
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
