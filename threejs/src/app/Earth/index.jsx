import img_2_no_clouds_4k from './images/2_no_clouds_4k.jpg'
import img_elev_bump_4k from './images/elev_bump_4k.jpg'
import img_water_4k from './images/water_4k.png'
import img_fair_clouds_4k from './images/fair_clouds_4k.png'
import img_galaxy_starfield from './images/galaxy_starfield.png'

import { PureComponent } from 'react';
import * as THREE from 'three';
import Detector from "./util/Detector";
import TrackballControls from "./util/TrackballControls";

export default class Earth extends PureComponent {
	componentDidMount(){
		this.createEarth();
	}

	createEarth() {
		var webglEl = document.getElementById('earth');

		if (!Detector.webgl) {
			Detector.addGetWebGLMessage(webglEl);
			return;
		}

		var width  = window.innerWidth,
			height = window.innerHeight;

		// Earth params
		var radius   = 0.5,
			segments = 32,
			rotation = 6;

		var scene = new THREE.Scene();

		var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
		camera.position.z = 1.5;

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);

		scene.add(new THREE.AmbientLight(0x333333));

		var light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(5,3,5);
		scene.add(light);

		var sphere = createSphere(radius, segments);
		sphere.rotation.y = rotation;
		scene.add(sphere)

		var clouds = createClouds(radius, segments);
		clouds.rotation.y = rotation;
		scene.add(clouds)

		var stars = createStars(90, 64);
		scene.add(stars);

		var controls = new TrackballControls(camera);

		webglEl.appendChild(renderer.domElement);

		render();

		function render() {
			controls.update();
			sphere.rotation.y += 0.0005;
			clouds.rotation.y += 0.0005;
			requestAnimationFrame(render);
			renderer.render(scene, camera);
		}



		function createSphere(radius, segments) {
			return new THREE.Mesh(
				new THREE.SphereGeometry(radius, segments, segments),
				new THREE.MeshPhongMaterial({
					map:         THREE.ImageUtils.loadTexture(img_2_no_clouds_4k),
					bumpMap:     THREE.ImageUtils.loadTexture(img_elev_bump_4k),
					bumpScale:   0.005,
					specularMap: THREE.ImageUtils.loadTexture(img_water_4k),
					specular:    new THREE.Color('grey')
				})
			);
		}

		function createClouds(radius, segments) {
			return new THREE.Mesh(
				new THREE.SphereGeometry(radius + 0.003, segments, segments),
				new THREE.MeshPhongMaterial({
					map:         THREE.ImageUtils.loadTexture(img_fair_clouds_4k),
					transparent: true
				})
			);
		}

		function createStars(radius, segments) {
			return new THREE.Mesh(
				new THREE.SphereGeometry(radius, segments, segments),
				new THREE.MeshBasicMaterial({
					map:  THREE.ImageUtils.loadTexture(img_galaxy_starfield),
					side: THREE.BackSide
				})
			);
		}
	}

    render() {
		return (
			<div>
                <h2>3D地球</h2>
				<div id="earth" style={{height: 600, textAlign: 'center'}}></div>
			</div>
        );
    }
}




