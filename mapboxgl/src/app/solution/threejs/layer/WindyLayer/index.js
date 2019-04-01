import mapboxgl from "mapbox-gl";


export default class MarkLayer {
    constructor(opts) {
        opts = Object.assign({
            id: "three_mark_layer",
            data: {
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

        const objects = {
            markObject: null,     // 模型对象
        };

        // 更新数据
        this.setData = (data) => {
            const mark = this.mkMark();
            this.scene.add(mark)

            this.data = formatData(Object.assign({}, opts.data, data));
        };

        this.setData(opts.data);
    }

    mkMark() {
        // const geometry = new THREE.ConeBufferGeometry( 0.00001, 0.00015, 8 );
        const geometry = new THREE.ConeBufferGeometry( 200, 5500, 32, 0 );
        const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        const cone = new THREE.Mesh( geometry, material );

        return cone;
    }


    onAdd(map, gl) {
        this.map = map;

        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
        });

        this.renderer.autoClear = false;
    }

    render(gl, matrix) {
        // console.log(this.map.transform.scale)
        // console.log(this.map.getZoom())
        // 转换为three.js格式的投影矩阵
        const m = new THREE.Matrix4().fromArray(matrix);
        const { modelMatrix } = this.data;

        this.camera.projectionMatrix = m.multiply(modelMatrix);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
}
