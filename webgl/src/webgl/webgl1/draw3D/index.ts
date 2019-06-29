import { createProgram, memoize, m4, degToRad, bindVertexBuffer, dat } from '../../lib/webgl_util';

interface Context {
    program: WebGLProgram;
    aPositionLoc: number;
    aColorLoc: number;
    aNormalLoc: number;
    uMvpMatrixLoc: WebGLUniformLocation;
    uInverseTransposeModelMatrixLoc: WebGLUniformLocation;
    uLightDirectionLoc: WebGLUniformLocation;
    uLightColorLoc: WebGLUniformLocation;
    uMvpMatrix: Float32Array;
    uInverseTransposeModelMatrix: Float32Array;
    aPosition: {
        data: Float32Array,
        n: number
    };
    aColor: Uint8Array;
    aNormal: Float32Array;

}

let context: Context;

const drawTriangle = (gl: WebGLRenderingContext) => {
    const { program, aPositionLoc, aColorLoc, aNormalLoc, uMvpMatrixLoc, uInverseTransposeModelMatrixLoc, uLightDirectionLoc, uLightColorLoc, uMvpMatrix, uInverseTransposeModelMatrix, aPosition, aColor, aNormal } = context;
    gl.useProgram(program);

    // 绑定aPosition的数据
    bindVertexBuffer(gl, aPosition.data, aPositionLoc, 3);

    // 绑定颜色数据
    bindVertexBuffer(gl, aColor, aColorLoc, 3, gl.UNSIGNED_BYTE, true);

    // 绑定法向量
    bindVertexBuffer(gl, aNormal, aNormalLoc, 3);

    // 设置mvp矩阵
    gl.uniformMatrix4fv(uMvpMatrixLoc, false, uMvpMatrix);

    // 设置模型逆转置矩阵
    gl.uniformMatrix4fv(uInverseTransposeModelMatrixLoc, false, uInverseTransposeModelMatrix);

    // 设置入射光角度
    gl.uniform3fv(uLightDirectionLoc, new Float32Array([0.5, 0.7, 1]));

    // 入射光颜色
    gl.uniform4fv(uLightColorLoc, new Float32Array([0.2, 1, 0.2, 1]));

    gl.drawArrays(gl.TRIANGLES, 0, aPosition.n);
};


export default (gl: WebGLRenderingContext) => {
    if(!context) context = getContext(gl);

    drawTriangle(gl)
}

const createDatUI = (gl: WebGLRenderingContext, data: any, updateUMatrix: Function) => {
    const gui = new dat.GUI({
        autoPlace: true,
        width: 350
    });

    gui.add(data, 'translationX', -800, 800).onChange(updateUMatrix);
    gui.add(data, 'translationY', -800, 800).onChange(updateUMatrix);
    gui.add(data, 'translationZ', -800, 800).onChange(updateUMatrix);
    gui.add(data, 'rotationX', degToRad(-360), degToRad(360)).onChange(updateUMatrix);
    gui.add(data, 'rotationY',  degToRad(-360), degToRad(360)).onChange(updateUMatrix);
    gui.add(data, 'rotationZ',  degToRad(-360), degToRad(360)).onChange(updateUMatrix);
    gui.add(data, 'scaleX', -5, 5).onChange(updateUMatrix);
    gui.add(data, 'scaleY', -5, 5).onChange(updateUMatrix);
    gui.add(data, 'scaleY', -5, 5).onChange(updateUMatrix);
};

const getContext = memoize((gl: WebGLRenderingContext): Context => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader");
    const program = createProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);
    const aPositionLoc = gl.getAttribLocation(program, 'aPosition');
    const aColorLoc = gl.getAttribLocation(program, 'aColor');
    const aNormalLoc = gl.getAttribLocation(program, 'aNormal');
    const uMvpMatrixLoc = gl.getUniformLocation(program, "uMvpMatrix");
    const uInverseTransposeModelMatrixLoc = gl.getUniformLocation(program, "uInverseTransposeModelMatrix");
    const uLightDirectionLoc = gl.getUniformLocation(program, "uLightDirection");
    const uLightColorLoc = gl.getUniformLocation(program, "uLightColor");

    const data = {
        translationX: 0,
        translationY: 0,
        translationZ: 399,
        rotationX: degToRad(0),
        rotationY: degToRad(0),
        rotationZ: degToRad(0),
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
    };

    const getUMatrix = () => {
        const {translationX, translationY, translationZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ } = data;

        let cameraMatrix = m4.lookAt([0, 0, 1000], [0,0,500], [0, 1, 0]);
        // 通过相机矩阵获得视图矩阵
        let viewPortMatrix = m4.inverse(cameraMatrix);

        // 投影矩阵的作用,是将像素空间转换到裁剪空间
        // let projectMatrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
        let projectMatrix = m4.perspective(degToRad(60), gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000);

        // 计算模型矩阵
        let modelMatrix = m4.translation(translationX, translationY, translationZ);
        modelMatrix = m4.xRotate(modelMatrix, rotationX);
        modelMatrix = m4.yRotate(modelMatrix, rotationY);
        modelMatrix = m4.zRotate(modelMatrix, rotationZ);
        modelMatrix = m4.scale(modelMatrix, scaleX, scaleY, scaleZ);

        // 逆转置模型举证
        let uInverseTransposeModelMatrix = m4.transpose(m4.inverse(modelMatrix));

        let uMvpMatrix = m4.multiply(projectMatrix, viewPortMatrix);
        uMvpMatrix = m4.multiply(uMvpMatrix, modelMatrix);

        return { uMvpMatrix: new Float32Array(uMvpMatrix), uInverseTransposeModelMatrix };
    };

    createDatUI(gl, data, () => {
        const {uMvpMatrix, uInverseTransposeModelMatrix} = getUMatrix()
        context.uMvpMatrix = uMvpMatrix
        context.uInverseTransposeModelMatrix = uInverseTransposeModelMatrix
    });

    let {uMvpMatrix, uInverseTransposeModelMatrix} = getUMatrix();

    const aPosition = getPositions();
    const aColor = getColors();
    const aNormal = getNormals();

    return { program, aPositionLoc, aColorLoc, aNormalLoc,  uMvpMatrixLoc, uInverseTransposeModelMatrixLoc, uLightDirectionLoc, uLightColorLoc, uMvpMatrix, uInverseTransposeModelMatrix, aPosition, aColor, aNormal };
});


const getPositions = () => {
    // WebGL中的三角形有正反面的概念，正面三角形的顶点顺序是逆时针方向， 反面三角形是顺时针方向

    // 有逆时针方向的点,造成正面时也会被裁剪
    const dataErr = new Float32Array([
        // left column front
        0,   0,  0,
        30,   0,  0,
        0, 150,  0,
        0, 150,  0,
        30,   0,  0,
        30, 150,  0,

        // top rung front
        30,   0,  0,
        100,   0,  0,
        30,  30,  0,
        30,  30,  0,
        100,   0,  0,
        100,  30,  0,

        // middle rung front
        30,  60,  0,
        67,  60,  0,
        30,  90,  0,
        30,  90,  0,
        67,  60,  0,
        67,  90,  0,

        // left column back
        0,   0,  30,
        30,   0,  30,
        0, 150,  30,
        0, 150,  30,
        30,   0,  30,
        30, 150,  30,

        // top rung back
        30,   0,  30,
        100,   0,  30,
        30,  30,  30,
        30,  30,  30,
        100,   0,  30,
        100,  30,  30,

        // middle rung back
        30,  60,  30,
        67,  60,  30,
        30,  90,  30,
        30,  90,  30,
        67,  60,  30,
        67,  90,  30,

        // top
        0,   0,   0,
        100,   0,   0,
        100,   0,  30,
        0,   0,   0,
        100,   0,  30,
        0,   0,  30,

        // top rung right
        100,   0,   0,
        100,  30,   0,
        100,  30,  30,
        100,   0,   0,
        100,  30,  30,
        100,   0,  30,

        // under top rung
        30,   30,   0,
        30,   30,  30,
        100,  30,  30,
        30,   30,   0,
        100,  30,  30,
        100,  30,   0,

        // between top rung and middle
        30,   30,   0,
        30,   30,  30,
        30,   60,  30,
        30,   30,   0,
        30,   60,  30,
        30,   60,   0,

        // top of middle rung
        30,   60,   0,
        30,   60,  30,
        67,   60,  30,
        30,   60,   0,
        67,   60,  30,
        67,   60,   0,

        // right of middle rung
        67,   60,   0,
        67,   60,  30,
        67,   90,  30,
        67,   60,   0,
        67,   90,  30,
        67,   90,   0,

        // bottom of middle rung.
        30,   90,   0,
        30,   90,  30,
        67,   90,  30,
        30,   90,   0,
        67,   90,  30,
        67,   90,   0,

        // right of bottom
        30,   90,   0,
        30,   90,  30,
        30,  150,  30,
        30,   90,   0,
        30,  150,  30,
        30,  150,   0,

        // bottom
        0,   150,   0,
        0,   150,  30,
        30,  150,  30,
        0,   150,   0,
        30,  150,  30,
        30,  150,   0,

        // left side
        0,   0,   0,
        0,   0,  30,
        0, 150,  30,
        0,   0,   0,
        0, 150,  30,
        0, 150,   0]);

    // 统一按顺时针的点
    const data = new Float32Array([
        // left column front
        0,   0,  0,
        0, 150,  0,
        30,   0,  0,
        0, 150,  0,
        30, 150,  0,
        30,   0,  0,

        // top rung front
        30,   0,  0,
        30,  30,  0,
        100,   0,  0,
        30,  30,  0,
        100,  30,  0,
        100,   0,  0,

        // middle rung front
        30,  60,  0,
        30,  90,  0,
        67,  60,  0,
        30,  90,  0,
        67,  90,  0,
        67,  60,  0,

        // left column back
        0,   0,  30,
        30,   0,  30,
        0, 150,  30,
        0, 150,  30,
        30,   0,  30,
        30, 150,  30,

        // top rung back
        30,   0,  30,
        100,   0,  30,
        30,  30,  30,
        30,  30,  30,
        100,   0,  30,
        100,  30,  30,

        // middle rung back
        30,  60,  30,
        67,  60,  30,
        30,  90,  30,
        30,  90,  30,
        67,  60,  30,
        67,  90,  30,

        // top
        0,   0,   0,
        100,   0,   0,
        100,   0,  30,
        0,   0,   0,
        100,   0,  30,
        0,   0,  30,

        // top rung right
        100,   0,   0,
        100,  30,   0,
        100,  30,  30,
        100,   0,   0,
        100,  30,  30,
        100,   0,  30,

        // under top rung
        30,   30,   0,
        30,   30,  30,
        100,  30,  30,
        30,   30,   0,
        100,  30,  30,
        100,  30,   0,

        // between top rung and middle
        30,   30,   0,
        30,   60,  30,
        30,   30,  30,
        30,   30,   0,
        30,   60,   0,
        30,   60,  30,

        // top of middle rung
        30,   60,   0,
        67,   60,  30,
        30,   60,  30,
        30,   60,   0,
        67,   60,   0,
        67,   60,  30,

        // right of middle rung
        67,   60,   0,
        67,   90,  30,
        67,   60,  30,
        67,   60,   0,
        67,   90,   0,
        67,   90,  30,

        // bottom of middle rung.
        30,   90,   0,
        30,   90,  30,
        67,   90,  30,
        30,   90,   0,
        67,   90,  30,
        67,   90,   0,

        // right of bottom
        30,   90,   0,
        30,  150,  30,
        30,   90,  30,
        30,   90,   0,
        30,  150,   0,
        30,  150,  30,

        // bottom
        0,   150,   0,
        0,   150,  30,
        30,  150,  30,
        0,   150,   0,
        30,  150,  30,
        30,  150,   0,

        // left side
        0,   0,   0,
        0,   0,  30,
        0, 150,  30,
        0,   0,   0,
        0, 150,  30,
        0, 150,   0])

    return {
        data,
        n: data.length / 3,     // 顶点数量
    }
};

const getColors = () => {
    return new Uint8Array([
        // left column front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

        // top rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

        // middle rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

        // left column back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        // top rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        // middle rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

        // top
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,

        // top rung right
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,

        // under top rung
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,

        // between top rung and middle
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,

        // top of middle rung
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,

        // right of middle rung
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,

        // bottom of middle rung.
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,

        // right of bottom
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,

        // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,

        // left side
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220])
}

// 获取法向量
const getNormals = () => {
    return new Float32Array([
        // left column front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // middle rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // left column back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // middle rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // top rung right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // under top rung
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // between top rung and middle
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // top of middle rung
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // right of middle rung
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom of middle rung.
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // right of bottom
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // left side
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0]
    );
}



