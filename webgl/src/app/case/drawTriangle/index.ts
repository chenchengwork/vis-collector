import { initProgram } from '../../lib/webgl_util'
const drawTriangle = (gl: WebGLRenderingContext, program: WebGLProgram, data: number[]): number => {
    const vertices = new Float32Array(data);

    // 顶点数量
    const n = 3;

    const FSIZE = vertices.BYTES_PER_ELEMENT;

    // const indices: number[] = [3, 2, 1, 3, 1, 0];

    // 创建缓冲区对象
    const squareVertexBuffer: WebGLBuffer = gl.createBuffer();
    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');

    // 将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, FSIZE * 5, 0);
    // 连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(aVertexPosition);

    //---- 获取颜色的位置 -----
    const a_Color = gl.getAttribLocation(program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_Color);

    // 解除缓冲区关系
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    return n;
};

export default (gl: WebGLRenderingContext, data: number[]) => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader")
    const program = initProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);

    drawTriangle(gl, program, data)
}

export const getProgram = (gl: WebGLRenderingContext) => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader");
    return initProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);
}
