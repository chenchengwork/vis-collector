import React, { PureComponent } from 'react';
import styles from './Map.scss';
import MapUtil from './MapUtil';
import {CENTER} from "./MapUtil/LeafletUtil/constants";

const ZOOM = MapUtil.G.ZOOM;
const L = MapUtil.G.L;

import * as testUtil from './testMapUtil';

export default class Map extends PureComponent {
    state = {
        mapUtil: null,
    };

    // componentDidCatch(e){
    //     console.error(e);
    // }


    componentDidMount() {

        const mapUtil = new MapUtil('mapid', {

            // center: [49.015284, 8.402703],
            // zoom: 15,
        });



        // 绘制台风到地图
        let typhoonData = testUtil.testDrawTyphoon(mapUtil);


        // 绘制风环形流场
        /*
            风场header中必须的字段包括:
            parameterCategory,
            parameterNumber,
            lo1,
            la1,
            dx,
            dy,
            nx,
            ny,
            refTime,
            forecastTime
        */

        // 绘制风场
        testUtil.drawWindyByJson(mapUtil);
        // testUtil.drawWindyBySplitJson(mapUtil);
        // testUtil.drawWindyByImg(mapUtil);
        // testUtil.drawWindyByTif(mapUtil);


        // mapUtil.addWindyTile()

        // testUtil.setWMSLayer();

        // 鼠标相关的操作
        // testUtil.testMouse();

        // 移动的marker
        // testUtil.testMoveMarker(L, mapUtil)
    }

    resetMap = (opts = {}) => {
        this.state.mapUtil.map.remove();

        const mapUtil = new MapUtil('mapid', opts);

        this.setState({mapUtil});
    }

    render() {
        const { mapUtil } = this.state;
        return (
            <div className={styles["leaflet-map"]}>
                {/*{mapUtil ? <ControlPanel mapUtil={mapUtil} resetMap={this.resetMap}/> : null }*/}
                <div id="mapid"></div>
            </div>
        );
    }
}



