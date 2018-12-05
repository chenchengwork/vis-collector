import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import "./threeLoader/GLTFLoader";


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

    const translate = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 148.98190, lat: -35.39847 });

    const transform = {
        translateX: translate.x,
        translateY: translate.y,
        translateZ: translate.z,
        rotateX: Math.PI / 2,
        rotateY: 0,
        rotateZ: 0,
        scale: 5.41843220338983e-8
    };

    class CustomLayer {
        constructor() {
            this.id = 'custom_layer';
            this.type = 'custom';

            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

            const directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);

            const directionalLight2 = new THREE.DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            this.scene.add(directionalLight2);

            const loader = new THREE.GLTFLoader();
            loader.load('/gltf/radar/34M_17.gltf', (function (gltf) {
                this.scene.add(gltf.scene);
            }).bind(this));
        }

        onAdd(map, gl) {
            this.map = map;

            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl
            });

            this.renderer.autoClear = false;
        }

        // render3D(gl, matrix) {
        render(gl, matrix) {

            const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), transform.rotateX);
            const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), transform.rotateY);
            const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), transform.rotateZ);

            // 转换为three.js格式的投影矩阵
            const m = new THREE.Matrix4().fromArray(matrix);

            // 转换为three.js格式的模型矩阵
            const l = new THREE.Matrix4().makeTranslation(transform.translateX, transform.translateY, transform.translateZ)
                .scale(new THREE.Vector3(transform.scale, -transform.scale, transform.scale))
                .multiply(rotationX)
                // .multiply(rotationY)
                // .multiply(rotationZ);

            this.camera.projectionMatrix = m.multiply(l);
            // this.camera.projectionMatrix = m;
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    }

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

        map.addLayer(new CustomLayer());
    });
}
