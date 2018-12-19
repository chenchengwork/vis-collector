import "mapbox-gl/dist/mapbox-gl.css";
import { PureComponent, Fragment } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import Circle from "./popup/Circle";

import { MoveMarkerLayer, CameraMarkerLayer, PoliceMarkerLayer, PrisonMarkerLayer } from "./layers";

const createDOM = (VisComponent, props = {}) => {
    const el = document.createElement('div');
    let domRef = null;
    ReactDOM.render(<VisComponent ref={(ref) => domRef = ref} {...props}/>, el);

    return {el, domRef};
};

const center = [116.2317,39.5427];  // 北京中心点

export default class Index extends PureComponent{
    state = {
        options: {
            center: [116.2317,39.9427],     // 北京中心点
            zoom: 8,                        // 缩放等级
            pitch: 50,                      // 倾斜角度
            bearing: 0,                     // 倾斜角度
            isInteractive: true,            // 是否开启交互
        }
    };

    updateOptions = (options) => this.setState({options});

    render(){
        const { options } = this.state;

        return (
            <Fragment>
                <ControlPanel updateOptions={this.updateOptions} options={options} />
                <ChinaMap options={options} />
            </Fragment>
        )
    }
}


class ControlPanel extends PureComponent{
    state = {
        options: this.props.options
    };

    setOptions = (key, value) => this.setState({options: {...this.state.options, [key]: value}});

    handleOk = () => this.props.updateOptions(this.state.options);

    render(){
        const groupStyle = {
            display: "flex",
            marginBottom: 5
        };
        const itemTitleStyle = {
            width: "30%"
        }


        const { zoom, pitch, bearing, center, isInteractive } = this.state.options;

        return (
            <div style={{position: "absolute", width: 300, height: 200, background: "#7B68EE", zIndex: 3}}>
                <div style={groupStyle}>
                    <div style={itemTitleStyle}>中心:</div>
                    <input value={JSON.stringify(center)} onChange={(e) => this.setOptions("center", JSON.parse(e.target.value.trim()))}/>
                </div>

                <div style={groupStyle}>
                    <div style={itemTitleStyle}>等级:</div>
                    <input value={zoom} onChange={(e) => this.setOptions("zoom", e.target.value.trim())}/>
                </div>

                <div style={groupStyle}>
                    <span style={itemTitleStyle}>倾斜角度:</span>
                    <input value={pitch} onChange={(e) => this.setOptions("pitch", e.target.value.trim())}/>
                </div>

                <div style={groupStyle}>
                    <span style={itemTitleStyle}>旋转角度:</span>
                    <input value={bearing} onChange={(e) => this.setOptions("bearing", e.target.value.trim())}/>
                </div>

                <div style={groupStyle}>
                    <span style={itemTitleStyle}>开启交互:</span>
                    <input type="checkbox" checked={isInteractive} onChange={(e) => this.setOptions("isInteractive", e.target.checked)}/>
                </div>
                <div style={{textAlign: "center"}}>
                    <button onClick={this.handleOk}>确定</button>
                </div>
            </div>
        )
    }
}



class ChinaMap extends PureComponent{

    componentDidMount() {
        const {center, zoom, pitch, bearing, isInteractive} = this.props.options;

        const map = this.map = new mapboxgl.Map({
            container: this.containerRef,
            style:{
                "version": 8,
                "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
                "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
                "sources": {
                    // 北京地图geojson
                    "beijing":{
                        'type': 'geojson',
                        'data': require("./geojson/beijing.json")
                    },
                    // 北京环路geojson
                    "beijing_road": {
                        'type': 'geojson',
                        'data': require("./geojson/beijing_road.json")
                    }
                },
                "layers": []
            },
            center,
            zoom,
            pitch,
            bearing,
            interactive: isInteractive
        });

        map.on('load', () => {
            // 添加北京地图
            this.addBeijingLayer(map);

            // add popup
            this.addPopup(map);

            // console.log(JSON.stringify(map.getStyle()))
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.map){
            const { center, zoom, pitch, bearing, isInteractive } = this.props.options;

            this.map.setCenter(center);
            this.map.setPitch(pitch);
            this.map.setBearing(bearing);
            this.map.zoomTo(parseFloat(zoom), {
                duration: 4000,
                animate: true,
            });

            // 是否开启交互
            if(isInteractive) {
                this.map.boxZoom.enable();
                this.map.scrollZoom.enable();
                this.map.dragPan.enable();
                this.map.dragRotate.enable();
                this.map.keyboard.enable();
                this.map.doubleClickZoom.enable();
                this.map.touchZoomRotate.enable();
            }else {
                this.map.boxZoom.disable();
                this.map.scrollZoom.disable();
                this.map.dragPan.disable();
                this.map.dragRotate.disable();
                this.map.keyboard.disable();
                this.map.doubleClickZoom.disable();
                this.map.touchZoomRotate.disable();
            }
        }
    }

    addBeijingLayer = (map) => {
        // 设置地图的背景颜色
        const bgLayer = map.addLayer({
            id: "background",
            type: "background",
            visibility: "visible",          // 是否可见: visible or none
            "background-color": "#000000"
        });

        map.addLayer({
            'id': 'beijing',
            'type': 'fill',
            source: "beijing",
            'layout': {},
            'paint': {
                'fill-color': '#00242D',
                'fill-opacity': 0.5
            }
        });

        // 道路layer
        map.addLayer({
            'id': 'beijing_road',
            'type': 'line',
            'source': "beijing_road",
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#009FD0",
                "line-width": 2
            }
        });


        map.addLayer({
            id: "active_road_1",
            type: "line",
            source: {
                type: "geojson",
                data: { "type": "Feature", "properties": { "OBJECTID": 1179, "Name": "学院路", "Name_PY": "XueYuan Lu", "Croadclass": "主要大街,城市快速路", "Nroadclass": 43000, "Width": 10.5, "Link_type": 0, "Shape_Leng": 0.0016994075998100001 }, "geometry": { "type": "LineString", "coordinates": [ [ 116.353957000415448, 39.980342000183327 ], [ 116.353921999700674, 39.981473000178994 ], [ 116.35387600027741, 39.982039000199848 ] ] } }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#ED852A",
                "line-width": 2
            }
        });


        // 健翔桥
        map.addLayer({
            id: "active_road_2",
            type: "line",
            source: "beijing_road",
            filter: ["==", "Name", "健翔桥"],
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#ED852A",
                "line-width": 2
            }
        })
    }

    addPopup = (map) => {
        // 基准点
        new mapboxgl.Marker({
            element: createDOM(Circle).el
        })
            .setLngLat(center)
            .addTo(map);

        const moveMarkerLayer = new MoveMarkerLayer(map);
        const cameraMarkerLayer = new CameraMarkerLayer(map);
        const policeMarkerLayer = new PoliceMarkerLayer(map);
        const prisonMarkerLayer = new PrisonMarkerLayer(map);

        // 移动marker
        moveMarkerLayer.setData([
            {
                type: "transferPrisoner",
                position: [116.353957000415448, 39.980342000183327 ],
                number: 20,
            },
            {
                type: "escortPrisoner",
                position: [116.424741000097242, 39.830972999904191 ],
                number: 30,
            },
            {
                type: "seeDoctor",
                position: [116.403464000063764, 39.871902999723829 ],
                number: 2,
            },
        ]);

        // 摄像头
        cameraMarkerLayer.setData([
            [ 116.670866999912278, 39.82804299968484 ],
            [ 116.631204000064713, 39.79739400003325 ],
            [ 116.696312999745373, 39.855230999810942 ],
            [ 116.702285999999049, 39.866808000389085 ],
            [ 116.706839000419677, 39.931044000280565 ],
            [ 116.377354000187097, 39.987796000385288 ],
            [ 116.107128999703718, 39.700354000037237 ],
            [ 116.305814999862491, 39.830653000435802 ],
            [ 116.396954000227083, 39.832002999738791 ],
            [ 116.46483099985096, 39.834322999706842 ],
            [ 116.441310999803022, 39.832176999668945 ],
            [ 116.501443000194513, 39.818122999976651 ],
            [ 116.382862999727877, 39.758155999999587 ],
            [ 116.445311999949013, 39.790927000380918 ]
        ].map((position, index) => ({
            status: [3, 6, 8].indexOf(index) !== -1 ? 2 : 1,
            position,
        })));

        // 警察
        policeMarkerLayer.setData([
            [116.36483099985096, 39.734322999706842],
            [116.341310999803022, 39.832176999668945],
            [116.401443000194513, 39.990927000380918],
            [116.182862999727877, 39.858155999999587],
            [116.245311999949013, 39.990927000380918]
        ].map((position) => ({
            position,
        })));

        // 监狱
        prisonMarkerLayer.setData([
            {
                position: [116.053957000415448, 40.580342000183327],
                name: "延庆监狱",
            },
        ]);

    };

    render(){
        return (
            <div>
                <div style={{textAlign: "center"}}>北京地图</div>
                <div style={{position: "relative"}}>
                    <div
                        ref={(ref) => this.containerRef = ref}
                        style={{position: "fixed", width: "100%", height: "100%", border: "1px solid green"}}
                    ></div>
                </div>
            </div>
        )
    }
}

