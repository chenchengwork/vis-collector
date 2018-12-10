import { PureComponent } from 'react';
import * as THREE from 'three';
import OrbitControls from "./util/controls/OrbitControls";
import ThreeUtil from './util/ThreeUtil';

export default class LoadModel extends PureComponent {
	componentDidMount(){
		this.render3D();
	}

	render3D(){
		let G_controls = null;

		new ThreeUtil(document.getElementById("space"))
			// 设置光源
			.use(function (){
				const scene = this.scene;
				// 添加环境光源， 应用到整个场景和所有对象上
				scene.add( new THREE.AmbientLight( 0xffffff ) );

				// 添加一个平行光做为主光源营造反射光面，并添加三个点光源对暗部适当补光后效果
				const directionalLight = new THREE.DirectionalLight( 0xffffff );
				directionalLight.position.set( -5, 5, 5).normalize();
				scene.add( directionalLight );

				// 添加雾化效果
				// scene.fog = new THREE.Fog(0xffffff, 1500, 5000);
			})
			// 添加模型放大缩小控制
			.use(addOrbitControls)

			// 添加自定义形状
			.use(customShape)

			// 加载模型
			// .use(loadModel)

            // 加载3D模型
            .use(function(){
                // 添加盒子
                // addBox(this.scene);

                // 加载obj模型
                loadObjModel(this.scene);

                // 加载vtk模型
                // loadVtkModel(this.scene);

                // 加载fbx模型
                loadFbxModel(this.scene);
            })

			// 将渲染器添加到dom中
			.use(function () {
				const container = this.container;
				const renderer = this.webGLRenderer;
				const scene = this.scene;
				const camera = this.camera;

				container.appendChild( renderer.domElement );

				const animate = () => {
					requestAnimationFrame(animate);
					render();
				};

				const render = () => {
				    // 用户自定义动画
					if(scene.customAnimate){
                        scene.customAnimate();
                    }

					camera.lookAt( scene.position );
					renderer.render(scene, camera);
				};

				animate();
			})
	}

    render() {
		return (
		    <div>
                <h2>3D模型加载</h2>
                <div
                    id="space"
                    style={{position: 'fixed', width: '100%', height: "100%", textAlign: 'center'}}
                ></div>
            </div>
		);
    }
}

/**
 * 缩放控制
 */
function addOrbitControls(){
    const camera = this.camera;
    const container = this.container;

    const G_controls = new OrbitControls(camera,container);
    G_controls.enableDamping=true;
    G_controls.enableKeys=false;
    G_controls.enablePan=true;
    G_controls.dampingFactor = 0.1;
    G_controls.rotateSpeed=0.1;
    G_controls.autoRotate=false;
}

/**
 * 自定义图形
 * @return {Promise<void>}
 */
async function customShape(){
    const scene = this.scene;

    // 添加坐标系辅助线
    scene.add( new THREE.AxesHelper(1000) );

    //
    const mkMark1 = (opts) => {
        const color = opts.color;
        const lineHeight = opts.lineHeight;

        const Object3D = new THREE.Object3D();

        const mkOuterCircle = () => {
            const Object3D = new THREE.Object3D();

            const geometry = new THREE.TorusGeometry(50, 3, 16, 100, 60 / 180 * Math.PI);
            const material = new THREE.MeshBasicMaterial({color: color});
            const torus = new THREE.Mesh(geometry, material);

            Object3D.add(torus);
            for (let i = 1; i <= 4; i++) {
                const torusClone = torus.clone();

                torusClone.rotateZ((12 + 60) * i / 180 * Math.PI);

                Object3D.add(torusClone)
            }

            return Object3D;
        };

        const mkCylinder = () => {
            const geometry = new THREE.CylinderGeometry(35, 35, 2, 32);
            const material = new THREE.MeshBasicMaterial({color: color});
            const cylinder = new THREE.Mesh(geometry, material);
            cylinder.rotateX(90 / 180 * Math.PI);
            return cylinder;
        };

        const mkCone = () => {
            const geometry = new THREE.ConeGeometry(2, 270, 32);
            const material = new THREE.MeshBasicMaterial({color: color});
            const cone = new THREE.Mesh(geometry, material);
            cone.rotateX(-180 / 180 * Math.PI);
            cone.position.set(0, -lineHeight/2, 0);
            return cone;
        };

        Object3D.add(mkOuterCircle(), mkCylinder(), mkCone());

        return Object3D;
    };

    const mkPlayGround = () => {
        const group = new THREE.Object3D();

        const planeWidth = 150;
        const planeHeight = 200;
        const centerCircleRadius = 10;
        const semicircleRadius = 30;

        //操场背景矩形
        const mkRect = () => {
            const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1);
            const material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
            const plane = new THREE.Mesh(geometry, material);
            plane.rotateX(-90 / 180 * Math.PI);

            return plane;
        };

        // 中心圆
        const mkCenterCircle = () => {
            const geometry = new THREE.TorusGeometry( centerCircleRadius, 0.5, 16, 100 );
            const material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
            const torus = new THREE.Mesh( geometry, material );
            torus.rotateX(-90 / 180 * Math.PI);

            return torus;
        }

        // 中心线
        const mkCenterLine = (isPositive) => {
            const length = planeHeight/2 - centerCircleRadius - semicircleRadius;
            const z = isPositive ? -(length/2 + centerCircleRadius) : length/2 + centerCircleRadius;

            const geometry = new THREE.CylinderGeometry( 0.5, 0.5, length, 32 );
            const material = new THREE.MeshBasicMaterial( {color: 0xFF0000} );
            const cylinder = new THREE.Mesh( geometry, material );
            cylinder.rotateX(-90 / 180 * Math.PI);
            cylinder.position.set(0, 0, z);
            return cylinder;
        };

        // 半圆
        const mkSemicircle = (isClockwise) => {
            const z = isClockwise ? planeHeight/2 : -planeHeight/2;
            const flipAngle = isClockwise ? -90 : 90;

            const geometry = new THREE.TorusGeometry( semicircleRadius, 0.5, 16, 100, Math.PI );
            const material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
            const torus = new THREE.Mesh( geometry, material );
            torus.rotateX(flipAngle / 180 * Math.PI);
            torus.position.set(0,0, z);
            return torus;
        }


        group.add(mkRect(), mkCenterCircle(), mkSemicircle(false), mkSemicircle(true), mkCenterLine(true), mkCenterLine(false));

        group.rotateY(30/180 * Math.PI);
        return group
    }

    scene.add(mkPlayGround());

    // 添加bmfont text
    const { textGeometry, textObject3D } = await ThreeUtil.mkBMFontText("中国");
    // textGeometry.update("朝鲜");
    scene.add(textObject3D);
}


// 添加盒子
const addBox = (scene) => {
    scene.add(
        ThreeUtil.mkRectangularBox({
            shape:{
                coordinate: [460, 100, 380],
                length: [200, 50, 180]
            },
            material:{
                color: 0x2E8B57,		// 颜色
                lineWidth: 10			// 线宽
            }
        })
    )
}

// 加载obj模型
const loadObjModel = (scene) => {
    // obj文件大小为1.3M
    const small = {
        mtlPath: "/asserts/models/obj/small/",
        objPath:"/asserts/models/obj/small/",
        mtlFileName:"build_4.mtl",
        objFileName:"build_4.obj",
    };

    // obj文件大小为84M
    // 本地加载模型时间: 3s
    // objLoader解析时间为: 60s
    // 模型真正加载入webgl后不会卡顿
    // 卡顿出现在obj解析过程
    const big = {
        mtlPath: "/asserts/models/obj/big/",
        objPath:"/asserts/models/obj/big/",
        mtlFileName:"bugatti.mtl",
        objFileName:"bugatti.obj",
    };

    ThreeUtil.loadMtlObj(small).then((object) => {
        scene.add(object);
    }).catch(e => console.error(e));
}

// 加载vtk模型
const loadVtkModel = (scene) => {
    ThreeUtil.loadVTK("/asserts/models/vtk/map.vtk").then((geometry) => {
        const material = new THREE.MeshLambertMaterial( { color: 0x00FFFF, fog: false, side: THREE.DoubleSide } );
        const mesh = new THREE.Mesh( geometry, material );
        mesh.name = "map";
        // mesh.rotateX(-90/180 * Math.PI);
        scene.add(mesh);
    }).catch(e => console.error(e));
};

/**
 * 加载fbx模型
 * @param scene
 */
const loadFbxModel = (scene) => {
    const mixers = [];
    var clock = new THREE.Clock();

    // ThreeUtil.loadFbx("http://localhost:4000/asserts/models/fbx/cottage_fbx.fbx").then((object) => {
    // ThreeUtil.loadFbx("http://localhost:4000/asserts/models/fbx/school.fbx").then((object) => {
    ThreeUtil.loadFbx("http://localhost:4000/asserts/models/fbx/Samba_Dancing.fbx").then((object) => {
        object.scale.set(0.5, 0.5, 0.5);

        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.customAnimate = (() => {
            // 处理"变形动画"
            object.mixer = new THREE.AnimationMixer( object );
            mixers.push( object.mixer );

            const action = object.mixer.clipAction( object.animations[ 0 ] );
            action.play();


            return () => {
                if ( mixers.length > 0 ) {
                    for ( let i = 0; i < mixers.length; i ++ ) {
                        mixers[ i ].update( clock.getDelta() );
                    }
                }
            }
        })()

        scene.add(object)
    }).catch(e => console.error(e))
};





