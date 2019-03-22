import "mapbox-gl/dist/mapbox-gl.css";
import { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import GltfLayer from './layer/GltfLayer';
import MarkLayer from './layer/MarkLayer';

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
            zoom: 4,
            pitch: 50
        });

        map.on('load', () => {
            this.addOsmLayer(map);

            this.addGltfLayer(map);

            this.addMarkLayer(map);

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

    addGltfLayer = (map) => {
        const scale = 5.41843220338983e-4;
        map.addLayer(new GltfLayer({
            id: "three_gltf_layer",
            data: {
                url: "/gltf/radar/34M_17.gltf",               // gltf模型url
                coordinates: [100.923828, 39.272688],          // 模型所在的位置
                scale: { x: scale, y: -scale, z: scale },     // 缩放
                rotate: { x: Math.PI / 2, y: 0, z: 0 }        // 旋转
            }
        }));

        // setTimeout(() => {
        //     const layer = map.getLayer("three_gltf_layer").implementation;
        //     layer.setData({
        //         coordinates: [100.923828, 38.172118],
        //     });
        // }, 3000)
    }

    addMarkLayer = (map) => {
        // const scale = 1;
        // let scale = 0.00000249532127261;
        /*
            123e3 -> 123000
            123e-3 -> 0.123
         */
        let scale = 2.49e-6;    // 科学计数法
        map.addLayer(new MarkLayer({
            id: "three_mark_layer",
            data: {
                coordinates: center,          // 模型所在的位置
                scale: { x: scale, y: scale, z: scale },     // 缩放
                rotate: { x: -Math.PI / 2, y: 0, z: 0 }        // 旋转
            }
        }));

        // map.on("zoom", (e) => {
        //     console.log(e)
        //     console.log(map.getZoom())
        //     const layer = map.getLayer("three_mark_layer").implementation;
        //     // scale = scale / 1.051235548610105264;
        //     layer.setData({
        //         scale: { x: scale, y: scale, z: scale },     // 缩放
        //     })
        // })
    }

    render(){
        return (
            <div>
                <div style={{textAlign: "center"}}>threejs融合mapboxgl</div>
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

