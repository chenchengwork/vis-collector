import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from 'mapbox-gl';
import GltfLayer from './three/GltfLayer';


mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbmNoZW5nMTIiLCJhIjoiY2poN2JjcmJuMDY1cjJ3cDl0OG0xeWxzdyJ9.Jyy5bvJDCvtjPXSPZMazTg';


// 参照: https://bl.ocks.org/andrewharvey/7b61e9bdb4165e8832b7495c2a4f17f7
export default () => {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [148.98190, -35.39847],
        zoom: 17.5,
        pitch: 60
    });

    map.on('load', function () {
        map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#ccc',
                'fill-extrusion-height': ["get", "height"]
            }
        });

        const scale = 5.41843220338983e-8;
        map.addLayer(new GltfLayer({
            id: "three_gltf_layer",
            data: {
                url: "/gltf/radar/34M_17.gltf",               // gltf模型url
                coordinates: [148.98190, -35.39847],          // 模型所在的位置
                scale: { x: scale, y: -scale, z: scale },     // 缩放
                rotate: { x: Math.PI / 2, y: 0, z: 0 }        // 旋转
            }
        }));

        setTimeout(() => {
            const layer = map.getLayer("three_gltf_layer").implementation;
            layer.setData({
                coordinates: [148.98190, -35.39817],
            });
        }, 3000)
    });
}
