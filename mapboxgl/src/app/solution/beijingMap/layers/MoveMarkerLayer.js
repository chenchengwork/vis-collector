import {MarkMove} from "../popup/Mark";
import { mkMarker } from "./util";

const width = 100;
const height = 90;
const EnumContent = {
    transferPrisoner: {
        bgColor: "rgba(211, 84, 0 ,1)",
        icon: "icon-jiaohuan",
        desc: "转运犯人 | 人数:",
    },
    escortPrisoner: {
        bgColor: "#FAD65F",
        icon: "icon-shoukao",
        desc: "押解犯人 | 人数:",
    },
    seeDoctor: {
        bgColor: "#FF5151",
        icon: "icon-hongshizi",
        desc: "外出就医 | 人数:",
    },
};

export default class MoveMarkerLayer{
    isCreated = false;
    createdMarker = {};

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
     * @param [type]
     * usage:
     *  可以指定type类型, 不指定将删除所有的marker
     */
    destroy(type = null){
        if(!type){
            Object.values(this.createdMarker).forEach(item => item.marker.remove());
        }else {
            this.createdMarker[type].marker.remove();
        }
    }

    _create(data){
        (Array.isArray(data) ? data : [data]).forEach(item => this.createdMarker[item.type] = this._createMarker(item));

        this.isCreated = true;
    }

    _update(data){
        const unCreatedData = []; // 收集未被创建类型的数据

        (Array.isArray(data) ? data : [data]).forEach(item => {
            const {type, position, number} = item;
            if(this.createdMarker[type]){
                const {domRef, marker} = this.createdMarker[type];

                // 更新数据和位置
                marker.setLngLat(position);
                domRef.updateNumber(number);
            }else {
                unCreatedData.push(item);
            }
        });
    }

    /**
     * 创建一个mark
     * @param itemData
     * @return {{domRef: null, mark: *}}
     * @private
     */
    _createMarker(itemData){
        const {type, position, number} = itemData;

        const { marker, domRef} = mkMarker(
            {
                component: MarkMove,
                props: {width, height, ...EnumContent[type], number}
            },
            {offset: [0, -height / 2]});
        marker.setLngLat(position).addTo(this.map);

        return { domRef, marker }
    }

}
