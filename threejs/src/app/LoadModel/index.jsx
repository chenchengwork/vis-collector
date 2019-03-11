import { PureComponent } from 'react';
import * as THREE from 'three';
import OrbitControls from "./util/controls/OrbitControls";
import ThreeUtil from './util/ThreeUtil';

import customShape from './view/customShape';
import loadFont from './view/loadFont';
import { loadObjModel, loadFbxModel, loadVtkModel } from "./view/loadModel"

export default class LoadModel extends PureComponent {
	componentDidMount(){
		this.render3D();
	}

	render3D(){
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

                // 添加坐标系辅助线
                scene.add( new THREE.AxesHelper(1000) );
			})
			// 添加模型放大缩小控制
			.use(addOrbitControls)

            // 加载3D模型
            .use(async function(){
                // 加载字体
                await loadFont(this.scene);

                // 添加自定义形状
                customShape(this.scene);


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








