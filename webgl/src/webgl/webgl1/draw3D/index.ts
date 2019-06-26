import { createProgram, memoize, m4, degToRad, bindVertexBuffer, dat } from '../../lib/webgl_util';

interface Context {
    program: WebGLProgram;
    aPositionLoc: number;
    aColorLoc: number;
    uMatrixLoc: WebGLUniformLocation;
    uMatrix: number[];
    aPosition: {
        data: Float32Array,
        n: number
    };
    aColor: Uint8Array;
}

let context: Context;

const drawTriangle = (gl: WebGLRenderingContext) => {
    const { program, aPositionLoc, aColorLoc, uMatrixLoc, uMatrix, aPosition, aColor } = context;
    gl.useProgram(program);

    // 绑定aPosition的数据
    bindVertexBuffer(gl, aPosition.data, aPositionLoc, 3);

    // 绑定颜色数据
    bindVertexBuffer(gl, aColor, aColorLoc, 3, gl.UNSIGNED_BYTE, true);

    // 设置矩阵
    gl.uniformMatrix4fv(uMatrixLoc, false, uMatrix);

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

    const recreateTexture = (value: any) => {
        // console.log('data->', data)
        // console.log('value->', value);
    }

    gui.add(data, 'translationX', 0, 800).onChange(updateUMatrix);
    gui.add(data, 'translationY', 0, 800).onChange(updateUMatrix);
    gui.add(data, 'translationZ', 0, 800).onChange(updateUMatrix);
    gui.add(data, 'rotationX', 0, degToRad(360)).onChange(updateUMatrix);
    gui.add(data, 'rotationY', 0, degToRad(360)).onChange(updateUMatrix);
    gui.add(data, 'rotationZ', 0, degToRad(360)).onChange(updateUMatrix);
    gui.add(data, 'scaleX', -5, 5).onChange(updateUMatrix);
    gui.add(data, 'scaleY', -5, 5).onChange(updateUMatrix);
    gui.add(data, 'scaleY', -5, 5).onChange(updateUMatrix);
};

const getContext = memoize((gl: WebGLRenderingContext): Context => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader");
    const program = createProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);
    const aPositionLoc = gl.getAttribLocation(program, 'aPosition');
    const aColorLoc = gl.getAttribLocation(program, 'aColor');
    const uMatrixLoc = gl.getUniformLocation(program, "uMatrix");

    const data = {
        translationX: 45,
        translationY: 150,
        translationZ: 0,
        rotationX: degToRad(40),
        rotationY: degToRad(25),
        rotationZ: degToRad(325),
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
    };

    const getUMatrix = () => {
        const {translationX, translationY, translationZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ } = data;

        let matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
        matrix = m4.translate(matrix, translationX, translationY, translationZ);
        matrix = m4.xRotate(matrix, rotationX);
        matrix = m4.yRotate(matrix, rotationY);
        matrix = m4.zRotate(matrix, rotationZ);
        matrix = m4.scale(matrix, scaleX, scaleY, scaleZ);

        return matrix;
    };

    createDatUI(gl, data, () => context.uMatrix = getUMatrix());
    let uMatrix = getUMatrix();

    const aPosition = getPositions();
    const aColor = getColors();

    return { program, aPositionLoc, aColorLoc, uMatrixLoc, uMatrix, aPosition, aColor };
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



