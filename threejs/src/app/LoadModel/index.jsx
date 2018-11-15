import { PureComponent } from 'react';
import * as THREE from 'three';
import OrbitControls from "./util/loader/OrbitControls";
import ThreeUtil from './util/ThreeUtil';

export default class LoadModel extends PureComponent {
	componentDidMount(){
		this.render3D();
	}

	render3D(){
		let G_Object3DGroup = null;		// 所有的3d模型组
		let G_mark2_arr = []; 		// 标注2模型
		let G_controls = null;

		// ------------------
		let G_raycaster = null;
		let G_mouse = new THREE.Vector2();
		let G_interSected = null;

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

			// 点击事件
			.use(function() {
				const container = this.container;

				G_raycaster = new THREE.Raycaster();
				container.addEventListener( 'click', onDocumentMouseClick, false );
				function onDocumentMouseClick( event ) {
					event.preventDefault();
					G_mouse.x = ( event.clientX / container.clientWidth ) * 2 - 1;
					G_mouse.y = - ( event.clientY / container.clientHeight ) * 2 + 1;
				}
			})

			// 添加模型放大缩小控制
			.use(addOrbitControls)

			// 添加自定义形状
			.use(customShape)

			// 加载模型
			// .use(loadModel)

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

				let object3DGroup_step = 0;
				let mark2_step = 0;
				const render = () => {
					if (G_controls) G_controls.update();

					// 设置旋转
					// if(G_Object3DGroup) G_Object3DGroup.rotation.y = object3DGroup_step += 0.005;
					// if(G_mark2_arr && G_mark2_arr.length > 0) {
                     //    mark2_step += 0.05;
                     //    G_mark2_arr.forEach((mark2) => mark2.rotation.y = mark2_step);
                    // }

					// ----------交互--------------
					G_raycaster.setFromCamera( G_mouse, camera );

					const intersects = G_raycaster.intersectObjects( scene.children, true );
					if ( intersects.length > 0 ) {
						if ( G_interSected != intersects[0].object ) {
							G_interSected = intersects[0].object;
							// console.log(G_interSected)
						}else {
							// console.log(G_interSected)
						}

					} else {
						// console.log(G_interSected)
						// if ( G_interSected ) G_interSected.material.emissive.setHex( G_interSected.currentHex );

						G_interSected = null;

					}
					// ----------交互--------------


					camera.lookAt( scene.position );
					renderer.render(scene, camera);
				}

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
            console.log(geometry);
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

/**
 * 加载模型
 * @return {Promise<void>}
 */
async function loadModel() {
    const scene = this.scene;

    const EnumInitMapModel = [
        {
            type: 'build1',
            loaderType: ThreeUtil.loaderType.obj,
            model: {
                mtlPath: "/asserts/yun_yan/3d/build/",
                objPath:"/asserts/yun_yan/3d/build/",
                mtlFileName:"init_map_build1.mtl",
                objFileName:"init_map_build1.obj",
            }
        },
        {
            type: 'build2',
            loaderType: ThreeUtil.loaderType.obj,
            model: {
                mtlPath: "/asserts/yun_yan/3d/build/",
                objPath:"/asserts/yun_yan/3d/build/",
                mtlFileName:"init_map_build2.mtl",
                objFileName:"init_map_build2.obj",
            }
        },
        {
            type: 'build3',
            loaderType: ThreeUtil.loaderType.obj,
            model: {
                mtlPath: "/asserts/yun_yan/3d/build/",
                objPath:"/asserts/yun_yan/3d/build/",
                mtlFileName:"init_map_build3.mtl",
                objFileName:"init_map_build3.obj",
            }
        },
        {
            type: 'mark1',
            loaderType: ThreeUtil.loaderType.obj,
            model: {
                mtlPath: "/asserts/yun_yan/3d/mark/",
                objPath:"/asserts/yun_yan/3d/mark/",
                mtlFileName:"init_map_mark1.mtl",
                objFileName:"init_map_mark1.obj",
            }
        },
        {
            type: 'mark2',
            loaderType: ThreeUtil.loaderType.obj,
            model: {
                mtlPath: "/asserts/yun_yan/3d/mark/",
                objPath:"/asserts/yun_yan/3d/mark/",
                mtlFileName:"init_map_mark2.mtl",
                objFileName:"init_map_mark2.obj",
            }
        },
        {
            type: 'map',
            loaderType: ThreeUtil.loaderType.vtk,
            model: {
                path: "/asserts/yun_yan/3d/map/map.vtk",
            }
        }
    ];

    const loadModelPromises = EnumInitMapModel.map((item) => new Promise((resolve, reject) => {
        switch (item.loaderType) {
            case ThreeUtil.loaderType.obj:
                this.loadMtlObj({
                    ...item.model,
                    progress:function(persent){
                        // console.log(persent)
                    },
                    completeCallback:function(object){
                        resolve({object, type: item.type, loaderType: item.loaderType});
                    },
                    errorCallback: function(error) {
                        reject(error);
                    }
                });

                break;

            case ThreeUtil.loaderType.vtk:
                this.loadVTK({
                    path: item.model.path,
                    completeCallback:function(object){
                        resolve({object, type: item.type, loaderType: item.loaderType});
                    },
                });

                break;
        }
    }));

    const G_Object3DGroup = await Promise.all(loadModelPromises).then((resp) => {
        const group = new THREE.Object3D();
        let mark2Object = null;

        resp.forEach((item) => {
            let object = null;
            let objects = [];

            //----加工导入的模型-----
            if(item.loaderType == ThreeUtil.loaderType.obj) {
                object = item.object;
                const y = 62.412;
                switch (item.type) {
                    case 'build1':
                        [
                            [-203, y, 163],
                            [27, y,  150],
                            [146, y, -22],
                            [250, y, 140],
                        ].map((item, index) => {
                            const objectClone = object.clone();

                            objectClone.traverse(function(child) {
                                if (child instanceof THREE.Mesh) {
                                    child.name = 'build_1_' + index;
                                    child.material.side = THREE.DoubleSide; // 设置贴图模式为双面贴图
                                    const formatMaterial = (childMaterial) => Array.isArray(childMaterial) ? childMaterial : [childMaterial];

                                    formatMaterial(child.material).map((material) => {
                                        material.fog = false;		// 设置rgb通道R通道颜色
                                        material.transparent=true;	// 材质允许透明
                                    });
                                }
                            });

                            objectClone.position.set(...item);
                            objects.push(objectClone);
                        });
                        break;

                    case 'build2':
                        [
                            [-223, y, 103],
                            [-17, y, 95],
                            [94, y, -102],
                            [206, y, 90],
                        ].map((item, index) => {
                            const objectClone = object.clone();
                            objectClone.traverse(function(child) {
                                if (child instanceof THREE.Mesh) {
                                    child.name = 'build_2_' + index;
                                    child.material.side = THREE.DoubleSide; // 设置贴图模式为双面贴图
                                    const formatMaterial = (childMaterial) => Array.isArray(childMaterial) ? childMaterial : [childMaterial];

                                    formatMaterial(child.material).map((material) => {
                                        material.fog = false;		// 设置rgb通道R通道颜色
                                        material.transparent=true;	// 材质允许透明
                                    });
                                }
                            });

                            objectClone.position.set(...item);
                            objects.push(objectClone);
                        });

                        break;

                    case 'build3':
                        [
                            [-283, y, 133],
                            [-75, y - 18, 100],
                            [54, y - 18, -50],
                            [160, y - 18, 120],
                        ].map((item, index) => {
                            const objectClone = object.clone();
                            objectClone.traverse(function(child) {
                                if (child instanceof THREE.Mesh) {
                                    child.name = 'build_3_' + index;
                                    child.material.side = THREE.DoubleSide; // 设置贴图模式为双面贴图
                                    const formatMaterial = (childMaterial) => Array.isArray(childMaterial) ? childMaterial : [childMaterial];

                                    formatMaterial(child.material).map((material) => {
                                        material.fog = false;		// 设置rgb通道R通道颜色
                                        material.transparent=true;	// 材质允许透明
                                    });
                                }
                            });

                            objectClone.position.set(...item);
                            objects.push(objectClone);
                        });
                        break;

                    case 'mark1':
                        const mark1Scale = 0.2;
                        [
                            [-263, 250, 123]
                        ].map((item, index) => {
                            const objectClone = object.clone();
                            objectClone.traverse(function(child) {
                                if (child instanceof THREE.Mesh) {
                                    child.name = 'mark_1_' + index;
                                    child.material.side = THREE.DoubleSide; // 设置贴图模式为双面贴图
                                    const formatMaterial = (childMaterial) => Array.isArray(childMaterial) ? childMaterial : [childMaterial];

                                    formatMaterial(child.material).map((material) => {
                                        material.fog = false;
                                        material.color.set(0x2E8B57);
                                        material.transparent=true;	// 材质允许透明
                                    });
                                }
                            });

                            objectClone.scale.set(mark1Scale, mark1Scale, mark1Scale);
                            objectClone.rotateY(90/180 * Math.PI);
                            objectClone.position.set(...item);
                            objects.push(objectClone)
                        });
                        break;

                    case 'mark2':
                        mark2Object = object;
                        break;
                }
            } else if(item.loaderType == ThreeUtil.loaderType.vtk){
                switch(item.type) {
                    case 'map':
                        const material = new THREE.MeshLambertMaterial( { color: 0x00FFFF, fog: false, side: THREE.DoubleSide } );
                        const mesh = new THREE.Mesh( item.object, material );
                        mesh.name = "map";
                        mesh.rotateX(-90/180 * Math.PI);

                        objects.push(mesh);
                        break;
                }
            }

            if (objects.length > 0) objects.forEach(item => group.add(item));
        });

        // 添加盒子
        group.add(this.mkRectangularBox({
            shape:{
                coordinate: [460, 100, 380],
                length: [200, 50, 180]
            },
            material:{
                color: 0x2E8B57,		// 颜色
                lineWidth: 10			// 线宽
            }
        }));

        // 添加文字
        [
            {
                text: "云岩区学校总数",
                coordinate: [-313, 310, 123],
            }
        ].forEach(item => {
            const textMesh = ThreeUtil.mkTextMesh(item.text);
            textMesh.position.set(...item.coordinate);
            group.add(textMesh);
        });

        // 添加特效标注2
        [
            [-163, 250, 123]
        ].forEach(item => {
            const mark2 = this.mkMark2(mark2Object);
            mark2.scale.set(0.2, 0.2, 0.2);
            mark2.position.set(...item);
            // G_mark2_arr.push(mark2);
            group.add(mark2);
        });


        return group;
    },(error) => {
        console.error(error);
    });

    scene.add(G_Object3DGroup);
}


