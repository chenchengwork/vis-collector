import "mapbox-gl/dist/mapbox-gl.css";
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';

import GltfLayer from './three/GltfLayer';
import MarkLayer from './three/MarkLayer';
import Circle from './three/popup/Circle';
import { MarkMove, MarkCamera } from './three/popup/Mark';

const createDOM = (VisComponent, props = {}) => {
    const el = document.createElement('div');
    let domRef = null;
    ReactDOM.render(<VisComponent ref={(ref) => domRef = ref} {...props}/>, el);

    return {el, domRef};
};

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbmNoZW5nMTIiLCJhIjoiY2poN2JjcmJuMDY1cjJ3cDl0OG0xeWxzdyJ9.Jyy5bvJDCvtjPXSPZMazTg';

//
// const center = [100.923828, 39.272688];
const center = [116.2317,39.5427];  // 北京中心点

// 参照: https://bl.ocks.org/andrewharvey/7b61e9bdb4165e8832b7495c2a4f17f7
export default () => {
    const map = new mapboxgl.Map({
        container: 'map',
        // style: 'mapbox://styles/mapbox/streets-v9',
        style:{
            "version": 8,
            // "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
            // "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
            "sources": {},
            "layers": []
        },
        center,
        zoom: 9,
        pitch: 50
    });

    map.on('load', function () {
        // 添加基础底图
        addOsmLayer(map);

        // 添加gltf layer
        // addGltfLayer(map);

        // addMarkLayer(map);

        addPopup(map)
    });
}

const addOsmLayer = (map) => {
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
};


// 添加gltf layer
const addGltfLayer = (map) => {
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

    setTimeout(() => {
        const layer = map.getLayer("three_gltf_layer").implementation;
        layer.setData({
            coordinates: [100.923828, 38.172118],
        });
    }, 3000)
}

// 添加mark layer
const addMarkLayer = (map) => {
    // const scale = 1;
    let scale = 0.0000249532127261;
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
};

const addPopup = (map) => {

    // 基准点
    new mapboxgl.Marker({
        element: createDOM(Circle).el
    })
        .setLngLat(center)
        .addTo(map);

    const createdMark = {
        markMove: {
            transferPrisoner: {
                mark: null,
                domRef: null,
            },
        }
    };

    const markMoveData = {
        transferPrisoner: {
            position: center,
            number: 20,
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

    for(let [key, val] of Object.entries(markMoveData)){
        // 创建marker
        if(!createdMark.markMove[key].mark){
            const {style, classify} = options.markMove;
            if(classify.hasOwnProperty(key)) {
                const dom = createDOM(MarkMove, {...style, ...classify[key], number: val.number});

                const mark = new mapboxgl.Marker({
                    element: dom.el,
                    offset: [0, -45]
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


    new mapboxgl.Marker({
        element: createDOM(MarkCamera, {width: 30, height: 30}).el,
        offset: [0, -Math.sqrt(30 * 30 + 30 *30) / 2]
    })
        .setLngLat([center[0] - 0.1, center[1] - 0.1])
        .addTo(map);
}
