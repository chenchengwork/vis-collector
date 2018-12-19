import {Prison} from "./Marker";
import { mkMarker } from "./util";

const width = 100;
const height = 90;

export default class PrisonMarkerLayer{
    isCreated = false;
    createdMarker = [];

    constructor(map){
        this.map = map;
    }

    /**
     * 设置数据
     * @param {Array| Object} data
     * usage:
     *  this.setData({type: "", position: [], number: 10})
     *  或
     *  this.setData([{type: "", position: [], number: 10}])
     */
    setData(data){
        if(!this.isCreated){
            this._create(data);
        }else {
            this._update(data);
        }
    }

    /**
     * 销毁marker实例
     * usage:
     *  可以指定type类型, 不指定将删除所有的marker
     */
    destroy(){
        this.createdMarker.forEach(item => item.marker.remove());
    }

    _create(data){
        (Array.isArray(data) ? data : [data]).forEach(item => this.createdMarker.push(this._createMarker(item)));

        this.isCreated = true;
    }

    _update(data){

    }

    /**
     * 创建一个mark
     * @param itemData
     * @return {{domRef: null, mark: *}}
     * @private
     */
    _createMarker(itemData){
        const { position, name } = itemData;

        const {marker, domRef} = mkMarker(
        {component: Prison, props: {width, height, name }}
        );

        marker.setLngLat(position).addTo(this.map);

        return {marker, domRef}
    }

}
