import "mapbox-gl/dist/mapbox-gl.css";
import { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import Circle from "./popup/Circle";
import { MarkCamera, MarkMove } from "./popup/Mark";

const createDOM = (VisComponent, props = {}) => {
    const el = document.createElement('div');
    let domRef = null;
    ReactDOM.render(<VisComponent ref={(ref) => domRef = ref} {...props}/>, el);

    return {el, domRef};
};

const center = [116.2317,39.5427];  // 北京中心点


export default class ChinaMap extends PureComponent{

    componentDidMount() {
        const map = new mapboxgl.Map({
            container: this.containerRef,
            // style: 'mapbox://styles/mapbox/streets-v9',
            style:{
                "version": 8,
                "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
                "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
                "sources": {},
                "layers": []
            },
            center: [116.2317,39.9427],  // 北京中心点
            zoom: 8,
            pitch: 50
        });

        map.on('load', () => {
            // 添加北京地图
            this.addBeijingLayer(map);

            // add popup
            this.addPopup(map);

            console.log(JSON.stringify(map.getStyle()))
        });
    }

    addBeijingLayer = (map) => {
        const beijing = require("./geojson/beijing.json");
        const beijing_road = require("./geojson/beijing_road.json");

        map.addLayer({
            'id': 'beijing',
            'type': 'fill',
            'source': {
                'type': 'geojson',
                'data': beijing
            },
            'layout': {},
            'paint': {
                'fill-color': '#088',
                'fill-opacity': 0.8
            }
        });

        map.addLayer({
            'id': 'beijing_road',
            'type': 'line',
            'source': {
                'type': 'geojson',
                'data': beijing_road
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#888",
                "line-width": 8
            }
        });
    }

    addPopup = (map) => {

        // 基准点
        new mapboxgl.Marker({
            element: createDOM(Circle).el
        })
            .setLngLat(center)
            .addTo(map);

        // 存储已创建的标记
        const createdMark = {
            markMove: {
                transferPrisoner: {
                    mark: null,
                    domRef: null,
                },
            },

            camera: {

            }
        };


        const options = {
            markMove: {
                style: {
                    width: 100,
                    height: 90
                },
                classify: {
                    transferPrisoner: {
                        icon: "icon-jiaohuan",
                        desc: "转运犯人 | 人数:",
                    },
                }
            }
        };


        // 创建移动标记
        const markMoveData = {
            transferPrisoner: {
                position: center,
                number: 20,
            },
        };
        for(let [key, val] of Object.entries(markMoveData)){
            // 创建marker
            if(!createdMark.markMove[key].mark){
                const {style, classify} = options.markMove;
                if(classify.hasOwnProperty(key)) {
                    const dom = createDOM(MarkMove, {...style, ...classify[key], number: val.number});

                    const mark = new mapboxgl.Marker({
                        element: dom.el,
                        offset: [0, -style.height / 2]
                    })
                        .setLngLat(val.position)
                        .addTo(map);

                    createdMark.markMove[key] = {
                        mark,
                        domRef: dom.domRef
                    }
                }
            }
            // 更新marker数据
            else {
                createdMark.markMove[key].mark.setLngLat(val.position);
                createdMark.markMove[key].domRef.updateNumber(val.number);
            }
        }



        // 创建摄像头
        const cameraData =  [
            {
                status: 1,
                position: [center[0] - 0.1, center[1] - 0.1],
            }
        ];

        cameraData.forEach(item => {
            // #CBCF2F
            const statusToColor = {
                "1": "#CBCF2F"
            };

            const width = 30;
            const height = 30;

            const dom = createDOM(MarkCamera, {width, height, bgColor: statusToColor[item.status]});
            new mapboxgl.Marker({
                element: dom.el,
                offset: [0, -Math.sqrt(30 * 30 + 30 *30) / 2]
            })
                .setLngLat(item.position)
                .addTo(map);
        });

    }

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

