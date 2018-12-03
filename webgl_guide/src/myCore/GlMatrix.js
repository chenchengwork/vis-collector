import * as glMatrix from 'gl-matrix/src/gl-matrix';

export default class GlMatrix {
    static glMatrix = glMatrix;

    /**
     * 获取视图矩阵
     * @param {Array} eye   [x, y, z]
     * @param {Array} center [x, y, z]
     * @param {Array} up    [x, y, z]
     * @returns {Float32Array}
     */
    static getLookAtMatrix(eye = [], center = [], up = []) {
        const lookAtMatrix = glMatrix.mat4.create();
        const eyeVec3 = glMatrix.vec3.fromValues(...eye);
        const centerVec3 = glMatrix.vec3.fromValues(...center);
        const upVec3 = glMatrix.vec3.fromValues(...up);
        glMatrix.mat4.lookAt(lookAtMatrix, eyeVec3, centerVec3, upVec3 );

        return lookAtMatrix;
    }

    /**
     * 获取透视投影矩阵
     * @param {number} fovy  定义了 camera 在 y 方向上的视线角度（介于 0 ~ 180 之间）, 单位是角度
     * @param {number} aspect 定义了近裁剪面的宽高比 aspect = w/h
     * @param {number} near 相机到近裁剪面的距离
     * @param {number} far  相机到远裁剪面的距离
     * @returns {mat4}
     */
    static getPerspectiveMatrix(fovy, aspect, near, far) {
        const outMatrix = glMatrix.mat4.create();
        glMatrix.mat4.perspective(outMatrix, fovy/180 * Math.PI, aspect, near, far);
        return outMatrix;
    }

    /**
     * 获取正交投影矩阵
     * @param {number} left     near裁剪面左边的位置
     * @param {number} right    near裁剪面右边的位置
     * @param {number} bottom   near裁剪面低边的位置
     * @param {number} top      near裁剪面顶边的位置
     * @param {number} near 相机到近裁剪面的距离
     * @param {number} far  相机到远裁剪面的距离
     * @returns {mat4}
     */
    static getOrthoMatrix(left, right, bottom, top, near, far) {
        const outMatrix = glMatrix.mat4.create();
        glMatrix.mat4.ortho(outMatrix, left, right, bottom, top, near, far);
        return outMatrix;
    }

    /**
     * mat4矩阵相乘
     * @param {mat4} a
     * @param {mat4} b
     * @returns {mat4}
     */
    static mutiplyMat4 (a, b) {
        const resMat4 = glMatrix.mat4.create();
        glMatrix.mat4.mul(resMat4, a, b);

        return resMat4;
    }

    /**
     * 获取逆矩阵
     * @param {mat4} a
     * @returns {mat4}
     */
    static getInvertMat4(a) {
        const invertMat4 = glMatrix.mat4.create();
        glMatrix.mat4.invert(invertMat4, a);
        return invertMat4;
    }

    /**
     * 获取转置矩阵
     * @param {mat4} a
     * @returns {mat4}
     */
    static getTransposeMat4(a){
        const transposeMat4 = glMatrix.mat4.create();
        glMatrix.mat4.invert(transposeMat4, a);
        return transposeMat4;
    }

    /**
     * 获取逆转置矩阵
     * @param {mat4} a
     * @returns {mat4}
     */
    static getInvertTransposeMat4(a) {
        return GlMatrix.getTransposeMat4(GlMatrix.getInvertMat4(a));
    }

    /**
     * 获取移动矩阵
     * @param {Array} vec3 移动向量
     * @returns {mat4}
     */
    static getTranslateMat4(vec3){
        const resMat4 = glMatrix.mat4.create();
        glMatrix.mat4.fromTranslation(resMat4, glMatrix.vec3.fromValues(...vec3));
        return resMat4;
    }

    /**
     * 获取旋转矩阵
     * @param {Number} angle 移动向量 度数
     * @param {Array} vec3 旋转轴
     * @returns {mat4}
     */
    static getRotationMat4(angle, vec3){
        const resMat4 = glMatrix.mat4.create();
        glMatrix.mat4.fromRotation(resMat4, angle/180 * Math.PI, glMatrix.vec3.fromValues(...vec3));
        return resMat4;
    }

    /**
     * 获取缩放矩阵
     * @param {Array} vec3
     * @returns {mat4}
     */
    static getScaleMat4(vec3 = []){
        const resMat4 = glMatrix.mat4.create();
        glMatrix.mat4.fromScaling(resMat4, glMatrix.vec3.fromValues(...vec3));
        return resMat4;
    }


    /**
     * 获取vec3矢量
     * @param {Array} vec3
     * @returns {vec3}
     */
    static getVec3(vec3 = []) {
        return glMatrix.vec3.fromValues(...vec3);
    }

    /**
     * 获取vec3归一化矢量
     * @param {Array} vec3
     * @returns {vec3}
     */
    static getVec3ByNormalize(vec3 = []) {
        const normalizeVec3 = glMatrix.vec3.create();
        glMatrix.vec3.normalize(normalizeVec3, glMatrix.vec3.fromValues(...vec3));

        return normalizeVec3;
    }

}

