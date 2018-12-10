import * as THREE from "three";

import OBJLoader from "./loader/OBJLoader";
import MTLLoader from "./loader/MTLLoader";
import VTKLoader from "./loader/VTKLoader";
import FBXLoader from "./loader/FBXLoader";
import {MeshLine, MeshLineMaterial} from "./MeshLine";

// import font_json from '../font/Microsoft_YaHei_Regular.json';
import font_json from '../font/FZZhengHeiS-R-GB_Regular.json';

export default class ThreeUtil{
	static loaderType = {
		obj: 'obj',
		vtk: 'vtk'
	};

	constructor(container){
		if(!container) throw new Error("未定义container");
		this.container = container;

		// 创建场景
		this.scene = new THREE.Scene();

		// 创建透视相机
		this.camera = new THREE.PerspectiveCamera( 15, container.clientWidth / container.clientHeight, 1, 8000);
		this.camera.position.set(0, 0, 3500);
		// this.camera.position.set(-100, 1000, 3500);

		// 初始化WebGL渲染引擎
		this.webGLRenderer = new THREE.WebGLRenderer({
			alpha: false, // 是否将背景设置为透明
		});
		this.webGLRenderer.setPixelRatio( window.devicePixelRatio );
		this.webGLRenderer.setSize( container.clientWidth, container.clientHeight );
		this.webGLRenderer.setClearColor(0xffffff, 0)
	}

	/**
	 * 过程化处理方法
	 * @param processFN
	 * @param args
	 */
	use(processFN, ...args){
		if(typeof processFN !== 'function') throw new Error('use中要传入函数');

		processFN.apply(this, args);

		return this;
	}

    /**
	 * 加载fbx模型
     * @param path
     * @return {Promise}
     */
	static loadFbx(path){
        const loader = new FBXLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                path,
				( object ) => resolve(object),
				() => {},
				(error) => reject(error)
			)
		})
	}

	/**
	 * 导入mtl和obj模型
	 * @param {Object} options
	 * @param {String} options.mtlPath	mtl文件所在路径
	 * @param {String} options.mtlFileName mtl文件名称
	 * @param {String} options.objPath obj文件路径
	 * @param {String} options.objFileName obj文件名称
	 *
	 * @param {Function} options.progress 模型导入过程回调
	 */
    static loadMtlObj(options){
        var mtlLoader = new MTLLoader();
        mtlLoader.setPath( options.mtlPath ); 		// 设置mtl文件所在路径

		return new Promise((resolve, reject) => {
            mtlLoader.load( options.mtlFileName, function( materials ) {
                materials.preload();

                const objLoader = new OBJLoader();
                objLoader.setMaterials( materials ); 	// 设置obj使用的材质贴图
                objLoader.setPath( options.objPath ); 	// 设置obj文件所在路径
                objLoader.load( options.objFileName, function ( object ) {
                    resolve(object);

                }, function ( xhr ) {
                    if ( xhr.lengthComputable ) {
                        var percentComplete = xhr.loaded / xhr.total * 100;
                        if(typeof options.progress == "function"){
                            options.progress( Math.round(percentComplete, 2));
                        }
                    }
                }, function(error){
                    reject(error);
                });

            });
		})
    }

	/**
	 * 导入vtk模型
	 * @param {Object} options
	 * @param {String} options.path	vtk文件所在路径
	 *
	 * @param {Function} options.completeCallback 模型导入完成回调
	 * @param {Function} options.errorCallback 模型导入完成回调
	 */
    static loadVTK(path){
		const loader = new VTKLoader();
        return new Promise((resolve, reject) => {
			loader.load(
				path,
				(geometry) => {
					geometry.center();
					geometry.computeVertexNormals();
					resolve(geometry);
				},
				() => {},
				(error) => reject(error)
			);
        })
	}

    /**
	 * 获取text网格
     * @param {String} text
     * @param {Object} opts
     * @param {Object} opts.geometry
     * @param {Object} opts.material
     * @return {Mesh}
     */
	static mkTextMesh(text, opts = {}){
		let { geometry, material } = opts;
		geometry = geometry || {};
        material = material || {};

        const textGeometry = new THREE.TextGeometry(text, Object.assign({
            "font" : new THREE.Font(font_json),
            "size" : 10,
            "height" : 1,
            "bevelEnabled" : true,
            "bevelSize": 2
        }, geometry));

        const textMesh = new THREE.Mesh(textGeometry,new THREE.MultiMaterial( [
            new THREE.MeshPhongMaterial( Object.assign({ color: 0x2E8B57, shading: THREE.FlatShading }, material) ),
            // new THREE.MeshPhongMaterial( { color: 0x2E8B57, shading: THREE.SmoothShading } )
        ]));

        return textMesh;
	}

	/**
	 * 获取矩形盒子
	 * @param opts
	 */
	static mkRectangularBox(opts){
		const [x, y, z] = opts.shape.coordinate;
		const [x_length, y_length, z_length] = opts.shape.length;
		const materialOpts = opts.material;

		const box = [
			{
				coordinate: [-x, y, z],
				length: [x_length, -y_length, -z_length]
			},
			{
				coordinate: [-x, -y, z],
				length: [x_length, y_length, -z_length]
			},
			{
				coordinate: [-x, y, -z],
				length: [x_length, -y_length, z_length]
			},
			{
				coordinate: [-x, -y, -z],
				length: [x_length, y_length, z_length]
			},
			{
				coordinate: [x, y, -z],
				length: [-x_length, -y_length, z_length]
			},
			{
				coordinate: [x, -y, -z],
				length: [-x_length, y_length, z_length]
			},

			{
				coordinate: [x, y, z],
				length: [-x_length, -y_length, -z_length]
			},
			{
				coordinate: [x, -y, z],
				length: [-x_length, y_length, -z_length]
			},
		];

		const createLineSegments = (vertices) => {
			const group = new THREE.Object3D();
			const lineSegmentVertices = [];
			for (let i = 0; i < vertices.length; i = i + 2){
				if(vertices[i] && vertices[i + 1]){
					lineSegmentVertices.push([
						new THREE.Vector3(...vertices[i]),
						new THREE.Vector3(...vertices[i + 1])
					]);
				}
			}

			lineSegmentVertices.forEach(item => {
				const line = new MeshLine();
				const geometry = new THREE.Geometry();
				geometry.vertices.push(...item);

				line.setGeometry(geometry);

				const material = new MeshLineMaterial({
					color: new THREE.Color(materialOpts.color),
					lineWidth: materialOpts.lineWidth
				});

				const mesh = new THREE.Mesh(line.geometry, material); // this syntax could definitely be improved!
				group.add(mesh);
			})

			return group;
		};

		const getShape = (box) => {
			const vectices = [];
			box.map(item => vectices.push(...[
				[item.coordinate[0], item.coordinate[1], item.coordinate[2] + item.length[2]],
				item.coordinate,

				item.coordinate,
				[item.coordinate[0] + item.length[0], item.coordinate[1], item.coordinate[2]],

				item.coordinate,
				[item.coordinate[0], item.coordinate[1] + item.length[1], item.coordinate[2]],
			]));

			return vectices;
		};

		const rectangularBox = createLineSegments(getShape(box));

		return rectangularBox;
	}

    /**
	 * 制作 bmfont text
	 * @param {String} text
	 * @param {Object} geometryOpts 参数说明：https://github.com/Jam3/layout-bmfont-text#layout--createlayoutopt
	 * @param {Object} materialOpts 材质参数：http://techbrood.com/threejs/docs/#%E5%8F%82%E8%80%83%E6%89%8B%E5%86%8C/%E6%9D%90%E6%96%99(Materials)/%E5%9F%BA%E7%A1%80%E7%BD%91%E5%AD%94%E6%9D%90%E6%96%99(MeshBasicMaterial)
     * @returns {Promise<textGeometry, textObject3D>}
	 *
	 * 制作bmfont过程：
	 * https://blog.csdn.net/linchaolong/article/details/39105239
	 *
     */
    static mkBMFontText = async (text, geometryOpts = {}, materialOpts = {}, textScale) => new Promise((resolve, reject) => {
        const loadFont = require("load-bmfont");
        const createGeometry = require("three-bmfont-text");

        loadFont('asserts/fnt/55.fnt', (err, font) => {
            if (err) {
            	reject(err);
            	return false;
            }

            // the texture atlas containing our glyphs
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load('asserts/fnt/55_0.png', (texture) => {
                const textGeometry = createGeometry({
                    text: text,
                    width: 700,
                    align: 'center',
                    font: font,
                    flipY: texture.flipY
                });

                // 更新字体
                // geometry.update('Lorem ipsum\nDolor sit amet.')

                // 设置材质
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    color: 0xaaffff,
                    side: THREE.DoubleSide
                });

                const textMesh = new THREE.Mesh(textGeometry, material)
                const layout = textGeometry.layout;
                textMesh.position.set(-layout.width/2, -layout.height/2, 0);

                // add textObject3D
                const textObject3D = new THREE.Object3D()
                textObject3D.add(textMesh)
                textScale = textScale || (1 / (window.devicePixelRatio || 1));
                textObject3D.scale.multiplyScalar(textScale);
                textObject3D.rotateX(Math.PI * 180/180);

                resolve({textGeometry, textObject3D});
            })
        })
    });
}
