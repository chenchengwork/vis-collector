import React, { PureComponent } from 'react';
import styles from './Map.scss';
import MapUtil from './MapUtil';



import { lines } from './data/testData';
const ZOOM = MapUtil.G.ZOOM;
const L = MapUtil.G.L;

export default class Map extends PureComponent {
    state = {
        mapUtil: null,
    };

    // componentDidCatch(e){
    //     console.error(e);
    // }


    componentDidMount() {
        const mapUtil = new MapUtil('mapid', {
            crs:L.CRS.EPSG3857
            // crs:MapUtil.G.L.CRS.EPSG4326,
        });

        this.setState({mapUtil});

        const map = mapUtil.map;


        // 绘制点到地图中
        // mapUtil.setMarker([31.59, 120.29]);

        /*mapUtil.map.on('layeradd', (e) => {
            mapUtil.map.removeLayer(e.layer)
        })

        mapUtil.map.on('overlayadd', (e) => {
            console.log(e)
            // mapUtil.map.removeLayer(e.layer)
        })*/

        // 绘制台风到地图
        let typhoonData = mapUtil.drawTyphoon(lines);

        // 实现台风动态清除效果
        setTimeout(() => {
            const newLines = lines.slice(0, 20);
            const newTyphoonData = [];

            // 老数据 > 新数据
            if(typhoonData.polylines.length > newLines.length){

            }
            // 老数据 < 新数据
            else if(typhoonData.polylines.length < newLines.length){

            }
            // 老数据 == 新数据
            else {

            }

            typhoonData.polylines.forEach((polyline, index) => {
                if(newLines[index]){
                    polyline.setLatLngs(newLines[index].path);
                }else {
                    setTimeout(() => {
                        polyline.remove();
                        typhoonData.points[index].forEach(point => point.remove());

                        // typhoonData.polylines.splice(index, 1);
                        // typhoonData.points.splice(index, 1);
                    }, 100 * index);
                }
            });
        }, 3000)



        // mapUtil.drawTyphoon(newLines);

        // 绘制风环形流场
        $.get('/asserts/data/windy_20000.json').then((resp) => {
            const windy = mapUtil.addWindyLayer(resp.data, {
                crs: L.CRS.EPSG3857
            }).addTo(mapUtil.map);

            // 动态设置windy数据
            setTimeout(() => {
                $.get('/asserts/data/windy_10.json').then((resp) => {
                    windy.setData(resp.data)
                })
            }, 4000)
        }).catch(e => console.error(e));

        // 添加高德路网图
        // const GaoDeAnnotion = L.tileLayer.tileServiceProvider('GaoDe.Satellite.Annotion', ZOOM);
        // mapUtil.map.addLayer(GaoDeAnnotion);

        // 删除路网图
        // mapUtil.map.removeLayer(GaoDeAnnotion);

        // mapUtil.setWMSLayer('http://10.0.5.170:8081/rasdaman/ows', {
        //     crs: MapUtil.G.L.CRS.EPSG4326,
        //     service: "WMS",
        //     version: '1.3.0',
        //     request: "GetMap",
        //     layers: "radar_demo_3857",
        //     width: 256,
        //     height: 256,
        //     tileSize: 512,
        //     format:"image/png"
        // });



        //-----以下是鼠标相关的操作-----

        // 开启测距
        // mapUtil.mouseTool.measure.start();

        // 清空测距
        // setTimeout(() => {
        //     mapUtil.mouseTool.measure.clear();
        //     console.log('measure clear');
        // }, 5000)


        // mapUtil.mouseTool.rectangle().then(resp => console.log(resp));
        // mapUtil.mouseTool.circle().then(resp => console.log(resp));
        // mapUtil.mouseTool.polygon().then(resp => console.log(resp));
        // mapUtil.mouseTool.polyline().then(resp => console.log(resp));
        // mapUtil.mouseTool.marker().then(resp => console.log(resp));

        // 关闭鼠标
        // setTimeout(() => {
        //     mapUtil.mouseTool.close();
        // }, 2000)


        //-----test移动marker-----
        // (() => {
        //     // const parisKievLL = [[48.8567, 2.3508], [50.45, 30.523333]];
        //     const parisKievLL = [[51.507222, -0.1275], [48.8567, 2.3508],[41.9, 12.5], [52.516667, 13.383333], [44.4166,26.1]];
        //     /**
        //      * 第二个参数使用说明：
        //      * 数组： 代表每条折线移动完成所需要的时间
        //      * 数字： 代表全路程所需要的时间
        //      */
        //     const marker1 = L.Marker.movingMarker(parisKievLL, [3000, 9000, 9000, 4000], {
        //         icon: L.icon({
        //             iconUrl: require('./MapUtil/LeafletUtil/img/marker.png'),
        //             iconSize: [16, 16],
        //             iconAnchor: [16, 16],
        //         })}).addTo(map);
        //
        //     L.polyline(parisKievLL).addTo(map);
        //
        //     marker1.once('click', function () {
        //         marker1.start();
        //         marker1.closePopup();
        //         marker1.unbindPopup();
        //         marker1.on('click', function() {
        //             if (marker1.isRunning()) {
        //                 marker1.pause();
        //             } else {
        //                 marker1.start();
        //             }
        //         });
        //
        //         setTimeout(function() {
        //             marker1.bindPopup('<b>Click me to pause !</b>').openPopup();
        //         }, 2000);
        //     });
        //
        //     marker1.bindPopup('<b>Click me to start !</b>', {closeOnClick: false});
        //     marker1.openPopup();
        // })()


        // ----- add geojson ------
        // mapUtil.addGeoJSON(require('./data/test_geo.json'));
        // mapUtil.map.fitBounds([
        //     [41.866712, -87.615733],
        // ])
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



