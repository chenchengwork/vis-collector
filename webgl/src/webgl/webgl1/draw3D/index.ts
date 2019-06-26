import { initProgram, memoize, m4, radToDeg, degToRad } from '../../lib/webgl_util';
import * as dat from "dat.gui";

const bindVertexBuffer = ((
    gl: WebGLRenderingContext,
    vertices: Float32Array| Uint8Array,
    aLoc: number,
    size: number,
    type: number = gl.FLOAT,
    normalize: boolean = false,
    stride: number = 0,
    offset: number = 0
) => {
    // 创建缓冲区对象
    const aPositionBuffer: WebGLBuffer = gl.createBuffer();
    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, aPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 将缓冲区对象分配给aPosition变量
    gl.vertexAttribPointer(aLoc, size, type, normalize, stride, offset);
    // 连接aPosition变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(aLoc);
});

const drawTriangle = (gl: WebGLRenderingContext, program: WebGLProgram, data?: number[]): number => {
    const vertices: Float32Array = getVertices();
    const colors: Uint8Array = getColors();

    // 顶点数量
    const n = vertices.length / 3;

    // 绑定aPosition的数据
    bindVertexBuffer(gl, vertices, gl.getAttribLocation(program, 'aPosition'), 3);

    // 绑定颜色数据
    bindVertexBuffer(gl, colors, gl.getAttribLocation(program, 'aColor'), 3, gl.UNSIGNED_BYTE, true);

    // 设置矩阵
    const uMatrixLoc = gl.getUniformLocation(program, "uMatrix");
    gl.uniformMatrix4fv(uMatrixLoc, false, getUMatrix(gl))

    // 解除缓冲区关系
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    return n;
};

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

let isCreatedDatUI = false;

export default (gl: WebGLRenderingContext) => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader");
    const program = initProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);

    if(!isCreatedDatUI){
        createDatUI(gl, data);
        isCreatedDatUI = true;
    }

    drawTriangle(gl, program)
}

const createDatUI = (gl: WebGLRenderingContext, data: any) => {
    const gui = new dat.GUI({
        autoPlace: true,
        width: 350
    });

    const recreateTexture = (value: any) => {
        // console.log('data->', data)
        // console.log('value->', value);
    }

    gui.add(data, 'translationX', 0, 800).onChange(recreateTexture);
    gui.add(data, 'translationY', 0, 800).onChange(recreateTexture);
    gui.add(data, 'translationZ', 0, 800).onChange(recreateTexture);
    gui.add(data, 'rotationX', 0, degToRad(360)).onChange(recreateTexture);
    gui.add(data, 'rotationY', 0, degToRad(360)).onChange(recreateTexture);
    gui.add(data, 'rotationZ', 0, degToRad(360)).onChange(recreateTexture);
    gui.add(data, 'scaleX', -5, 5).onChange(recreateTexture);
    gui.add(data, 'scaleY', -5, 5).onChange(recreateTexture);
    gui.add(data, 'scaleY', -5, 5).onChange(recreateTexture);
}

const getUMatrix = (gl: WebGLRenderingContext) => {
    const {translationX, translationY, translationZ, rotationX, rotationY, rotationZ, scaleX, scaleY, scaleZ} =data;
    // const color = [Math.random(), Math.random(), Math.random(), 1];

    let matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    matrix = m4.translate(matrix, translationX, translationY, translationZ);
    matrix = m4.xRotate(matrix, rotationX);
    matrix = m4.yRotate(matrix, rotationY);
    matrix = m4.zRotate(matrix, rotationZ);
    matrix = m4.scale(matrix, scaleX, scaleY, scaleZ);

    return matrix;
};


const getVertices = memoize(() => {
    return new Float32Array([
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
        0, 150,   0])
});

const getColors = memoize(() => {
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
})



