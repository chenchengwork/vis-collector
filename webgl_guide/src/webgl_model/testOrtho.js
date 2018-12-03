/**
 *  测试正交投影
 */

import GL_Util from '../myCore/GL_Util';
import GlMatrix from '../myCore/GlMatrix';

const v_sharder = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;
    
    varying vec4 v_Color;
    void main(){
        gl_Position = u_ViewMatrix * a_Position;
        v_Color = a_Color;
    }
`;


const f_shader = `
    #ifdef GL_ES
        precision mediump float;
    #endif
    varying vec4 v_Color;
    
    void main(){
        gl_FragColor = v_Color;
    }
    
`;

export default function main() {
    const gl_util = new GL_Util("webgl");

    const gl = gl_util.getWebGLContext();
    const glProgram = gl_util.getGlProgram(gl, v_sharder, f_shader);
    gl.program = glProgram;

    const n = initVertexBuffers(gl);


    // 指定清除canvas的颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}


const initVertexBuffers = (gl) => {
    const vertices = new Float32Array([
        0.0, 0.5, 0.0, 1.0, 1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 0.0,
        0.5, -0.5, 0.0,	1.0, 0.0, 0.0, 1.0
    ]);

    const n = 3;

    const FSIZE = vertices.BYTES_PER_ELEMENT;

    // 创建缓冲区对象
    const vertexBuffer = gl.createBuffer();
    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    //---- 获取顶点的位置 -----
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return false;
    }

    // 将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * 7, 0);
    // 连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);


    //---- 获取颜色的位置 -----
    const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return false;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 7, FSIZE * 4);
    gl.enableVertexAttribArray(a_Color);

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    //---- 设置视图矩阵 -----
    const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix) {
    	console.log('Failed to get the storage locations of u_ViewMatrix');
    	return;
    }
    const cameraView = GlMatrix.getOrthoMatrix(-1.0, 1.0, -1.0, 1.0, -0.5, 1.0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, cameraView);

    return n;
}
