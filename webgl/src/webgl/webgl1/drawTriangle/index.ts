import { createProgram, bindVertexBuffer, memoize } from '../../lib/webgl_util';

interface Context {
    program: WebGLProgram;
    aPositionLoc: number;
    aColorLoc: number;
    aPosition: {
        data: Float32Array;
        n: number;
    };
    aColor: Uint8Array;
}

let context: Context;

const drawTriangle = (gl: WebGLRenderingContext) => {
    const {program, aColorLoc, aPositionLoc, aPosition, aColor} = context;
    gl.useProgram(program);


    bindVertexBuffer(gl, aPosition.data, aPositionLoc, 3, gl.FLOAT, false, 0, 0)

    //---- 获取颜色的位置 -----
    bindVertexBuffer(gl, aColor, aColorLoc, 3, gl.UNSIGNED_BYTE, true, 0, 0)

    // 解除缓冲区关系
    gl.drawArrays(gl.TRIANGLES, 0, aPosition.n);
};


export default (gl: WebGLRenderingContext) => {
    if (!context) context = getContext(gl);
    drawTriangle(gl)
}

const getContext = memoize((gl: WebGLRenderingContext):Context => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader");
    const program = createProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);
    const aPositionLoc = gl.getAttribLocation(program, 'aPosition');
    const aColorLoc = gl.getAttribLocation(program, 'aColor');
    const aPosition = getPositions();
    const aColor = getColors();

    return {program, aPositionLoc, aColorLoc, aPosition, aColor };
});

const getPositions = () => {
    const data = new Float32Array([
        0.0, 0.1, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
    ]);

    return {data, n: data.length / 3}
};


const getColors = () => new Uint8Array([
    200,  70, 120,
    80, 70, 200,
    70, 200, 210
]);

