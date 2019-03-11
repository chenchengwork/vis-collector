import * as THREE from "three";
import ThreeUtil from "../util/ThreeUtil";

/**
 * 自定义图形
 */
export default function customShape(scene){

    scene.add(mkPlayGround());
    scene.add(mkBox());
}

/**
 * 生成操场
 * @return {THREE.Object3D}
 */
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


/**
 * 生成盒子
 * @param scene
 */
const mkBox = () => {
    return ThreeUtil.mkRectangularBox({
        shape:{
            coordinate: [460, 100, 380],
            length: [200, 50, 180]
        },
        material:{
            color: 0x2E8B57,		// 颜色
            lineWidth: 10			// 线宽
        }
    })
};
