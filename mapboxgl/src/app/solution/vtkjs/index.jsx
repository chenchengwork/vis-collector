import "mapbox-gl/dist/mapbox-gl.css";
import { PureComponent } from 'react';
import mapboxgl from 'mapbox-gl';
import {getActor, render} from "./vtk";

const center = [116.2317,39.5427];  // 北京中心点


export default class VtkJS extends PureComponent{

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
            zoom: 4,
            pitch: 50
        });

        map.on('load', () => {
            this.addOsmLayer(map);
            map.addLayer(getGlLayer())
            console.log(JSON.stringify(map.getStyle()))
        });
    }

    addOsmLayer = (map) => {
        map.addLayer({
            "id": "base_layer",
            "type": "raster",
            "source": {
                "type": "raster",
                'tiles': [
                    // 高德的卫星地图osm瓦片服务
                    // "http://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
                    // 普通地图
                    "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
                ],
                'tileSize': 256
            },
            "paint": {},
            "layout": {},
        });
    }


    render(){
        return (
            <div>
                <div style={{textAlign: "center"}}>vtkjs融合mapboxgl</div>
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


const getGlLayer = () => {
    let highlightLayer = {
        id: 'gl_layer',
        type: 'custom',

        onAdd: function (map, gl) {
            this.map = map;
            this.actor = getActor(map);
        },

        render: function (gl, matrix) {
            render(gl, matrix, this.map, this.actor);
        },
    };

    return highlightLayer;
}
