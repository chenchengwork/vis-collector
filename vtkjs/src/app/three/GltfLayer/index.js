import * as THREE from "three";
import mapboxgl from "mapbox-gl";
import "./GLTFLoader";

const formatData = (data) => {
    let {url, coordinates, scale, rotate } = data;

    const translate = mapboxgl.MercatorCoordinate.fromLngLat({ lng: coordinates[0], lat: coordinates[1] });
    const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), rotate.x);
    const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), rotate.y);
    const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), rotate.z);

    // 计算模型矩阵
    const modelMatrix = new THREE.Matrix4().makeTranslation(translate.x, translate.y, translate.z)
        .scale(new THREE.Vector3(scale.x, scale.y, scale.z))
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(rotationZ);

    return {
        url,
        modelMatrix,
    }
};

export default class CustomLayer {
    constructor(opts) {
        opts = Object.assign({
            id: "three_gltf_layer",
            data: {
                url: "",                            // gltf模型url
                coordinates: [],                    // 模型所在的位置
                scale: { x: 1, y: 1, z: 1 },        // 缩放
                rotate: { x: 0, y: 0, z: 0 }        // 旋转
            }
        }, opts);

        // 以下是必加属性
        this.id = opts.id;
        this.type = 'custom';
        this.renderingMode = "3d";


        // 以下是自定义属性
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        const loader = new THREE.GLTFLoader();
        const objects = {
            gltf: null,     // gltf 模型对象
        };

        // 更新数据
        this.setData = (data) => {
            if(!this.data || (data.url && this.data.url != data.url)) {
                loader.load(data.url, ((gltf) => {
                    // 删除旧模型
                    if(objects.gltf) objects.gltf.remove();

                    objects.gltf = gltf.scene;

                    this.scene.add(gltf.scene);
                }));
            }

            this.data = formatData(Object.assign({}, opts.data, data));
        };

        this.setData(opts.data);


        // const directionalLight = new THREE.DirectionalLight(0xffffff);
        // directionalLight.position.set(0, -70, 100).normalize();
        // this.scene.add(directionalLight);
        //
        // const directionalLight2 = new THREE.DirectionalLight(0xffffff);
        // directionalLight2.position.set(0, 70, 100).normalize();
        // this.scene.add(directionalLight2);

    }


    onAdd(map, gl) {
        this.map = map;

        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl
        });

        this.renderer.autoClear = false;
    }

    render(gl, matrix) {
        // 转换为three.js格式的投影矩阵
        const m = new THREE.Matrix4().fromArray(matrix);
        const { modelMatrix } = this.data;

        this.camera.projectionMatrix = m.multiply(modelMatrix);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
}
