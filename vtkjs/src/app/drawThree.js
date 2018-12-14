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
            "sprite": "http://localhost:4000/mapbox/sprite/sprite",    // 加载图标来源
            "glyphs": "http://localhost:4000/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
            "sources": {},
            "layers": []
        },
        center,
        zoom: 3,
        pitch: 50
    });

    map.on('load', function () {

        // 添加基础底图
        // addOsmLayer(map);

        // 添加gltf layer
        // addGltfLayer(map);

        //---------------------
        // 添加北京市的地图
        // addBeijingLayer(map);

        // addMarkLayer(map);

        // addPopup(map)

        //---------------
        // 添加中国地图
        addChinaLayer(map);

        console.log(JSON.stringify(map.getStyle()))
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


const addChinaLayer = (map) => {
    const china = require("./geojson/china.json");
    map.addLayer({
        'id': 'maine',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': china
        },
        'layout': {},
        'paint': {
            'fill-color': '#088',
            'fill-opacity': 0.8
        }
    });

    const points = [[96.416,42.7588],[96.416,42.7148],[95.9766,42.4951],[96.0645,42.3193],[96.2402,42.2314],[95.9766,41.9238],[95.2734,41.6162],[95.1855,41.792],[94.5703,41.4844],[94.043,41.0889],[93.8672,40.6934],[93.0762,40.6494],[92.6367,39.6387],[92.373,39.3311],[92.373,39.1113],[92.373,39.0234],[90.1758,38.4961],[90.3516,38.2324],[90.6152,38.3203],[90.5273,37.8369],[91.0547,37.4414],[91.3184,37.0898],[90.7031,36.7822],[90.791,36.6064],[91.0547,36.5186],[91.0547,36.0791],[90.8789,36.0352],[90,36.2549],[89.9121,36.0791],[89.7363,36.0791],[89.209,36.2988],[88.7695,36.3428],[88.5938,36.4746],[87.3633,36.4307],[86.2207,36.167],[86.1328,35.8594],[85.6055,35.6836],[85.0781,35.7275],[84.1992,35.376],[83.1445,35.4199],[82.8809,35.6836],[82.4414,35.7275],[82.002,35.332],[81.6504,35.2441],[80.4199,35.4199],[80.2441,35.2881],[80.332,35.1563],[80.2441,35.2002],[79.8926,34.8047],[79.8047,34.4971],[79.1016,34.4531],[79.0137,34.3213],[78.2227,34.7168],[78.0469,35.2441],[78.0469,35.5078],[77.4316,35.4639],[76.8164,35.6396],[76.5527,35.8594],[76.2012,35.8154],[75.9375,36.0352],[76.0254,36.4746],[75.8496,36.6943],[75.498,36.7383],[75.4102,36.958],[75.0586,37.002],[74.8828,36.9141],[74.7949,37.0459],[74.5313,37.0898],[74.5313,37.2217],[74.8828,37.2217],[75.1465,37.4414],[74.8828,37.5732],[74.9707,37.749],[74.8828,38.4521],[74.3555,38.6719],[74.1797,38.6719],[74.0918,38.54],[73.8281,38.584],[73.7402,38.8477],[73.8281,38.9795],[73.4766,39.375],[73.916,39.5068],[73.916,39.6826],[73.8281,39.7705],[74.0039,40.0342],[74.8828,40.3418],[74.7949,40.5176],[75.2344,40.4297],[75.5859,40.6494],[75.7617,40.2979],[76.377,40.3857],[76.9043,41.001],[77.6074,41.001],[78.1348,41.2207],[78.1348,41.3965],[80.1563,42.0557],[80.2441,42.2754],[80.1563,42.627],[80.2441,42.8467],[80.5078,42.8906],[80.4199,43.0664],[80.7715,43.1982],[80.4199,44.165],[80.4199,44.6045],[79.9805,44.8242],[79.9805,44.9561],[81.7383,45.3955],[82.0898,45.2197],[82.5293,45.2197],[82.2656,45.6592],[83.0566,47.2412],[83.6719,47.0215],[84.7266,47.0215],[84.9023,46.8896],[85.5176,47.0654],[85.6934,47.2852],[85.5176,48.1201],[85.7813,48.4277],[86.5723,48.5596],[86.8359,48.8232],[86.748,48.9551],[86.8359,49.1309],[87.8027,49.1748],[87.8906,48.999],[87.7148,48.9111],[88.0664,48.7354],[87.9785,48.6035],[88.5059,48.3838],[88.6816,48.1641],[89.1211,47.9883],[89.5605,48.0322],[89.7363,47.8564],[90.0879,47.8564],[90.3516,47.6807],[90.5273,47.2412],[90.8789,46.9775],[91.0547,46.582],[90.8789,46.3184],[91.0547,46.0107],[90.7031,45.7471],[90.7031,45.5273],[90.8789,45.2197],[91.582,45.0879],[93.5156,44.9561],[94.7461,44.3408],[95.3613,44.2969],[95.3613,44.0332],[95.5371,43.9014],[95.8887,43.2422],[96.3281,42.9346],[96.416,42.7588]];
    points.forEach((item, index) => {
        map.addLayer({
            "id": "point" + index,
            "source": {
                type: "geojson",
                data: {
                    "type": "Point",
                    "coordinates": item
                },
            },
            "type": "circle",
            "paint": {
                "circle-radius": 1,
                "circle-color": "#007cbf"
            }
        });
    })

    // 添加雪碧图和文字
    map.addLayer({
        "id": "points",
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [109.5996,35.7396]
                    },
                    "properties": {
                        "title": "Mapbox DC",
                        "icon": "monument"
                    }
                }, {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [113.4668,22.8076]
                    },
                    "properties": {
                        "title": "Mapbox SF",
                        "icon": "harbor"
                    }
                }]
            }
        },
        "layout": {
            "icon-image": "pedestrian-polygon",
            "icon-size": 0.3,
            "text-field": "{title}",
            "text-font": ["simsun"],
            // "text-offset": [0, 0.6],
            // "text-anchor": "top"
        }
    });


    // add 效果图片
    const Test = () => {
        return (
            <img src={require("./a.png")} style={{
                width: 30,
                height: 170,
                transform:"rotateX(70deg)"
            }}/>
        )
    };

    new mapboxgl.Marker({
        element: createDOM(Test).el
    })
        .setLngLat(center)
        .addTo(map);


    const Test1 = () => (
        <div style={{width: 50, height: 70, transform:"rotateX(50deg) rotateZ(20deg)", background: "black"}}>
            <div style={{fontSize: 15, color: "white"}}>四川省</div>
            <div style={{fontSize: 13, color: "#00E1F8"}}>3245</div>
        </div>
    )

    new mapboxgl.Marker({
        element: createDOM(Test1).el
    })
        .setLngLat([101.9199,30.1904])
        .addTo(map);


};


const addBeijingLayer = (map) => {
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
