/**
 * 创建3D Cube
 */
import GL_Util from '../myCore/GL_Util';
import GlMatrix from '../myCore/GlMatrix';


const v_shader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_MvpMatrix;
    varying vec4 v_Color;
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
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
    const gl_util = new GL_Util('webgl');
    const gl = gl_util.getWebGLContext();
    const glProgram = gl_util.getGlProgram(gl, v_shader, f_shader);
    // const glProgram = gl_util.getGlProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    gl.program = glProgram;

    const n = initVertexBuffers(gl);

    // Set the eye point and the viewing volume
    const u_MvpMatrix = gl.getUniformLocation(glProgram, 'u_MvpMatrix');
    const pMatrix = GlMatrix.getPerspectiveMatrix(30, 1, 1, 100);
    const vMatrix = GlMatrix.getLookAtMatrix([3, 3, 7], [0, 0, 0], [0, 1, 0]);
    const mvpMatrix = GlMatrix.glMatrix.mat4.create();
    GlMatrix.glMatrix.mat4.mul(mvpMatrix, pMatrix, vMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);

    // 指定清除canvas的颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 开启深度检测，隐藏面消除，物体遮挡将不会被绘制出来
    gl.enable(gl.DEPTH_TEST);
    // 清除颜色和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}

function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var verticesColors = new Float32Array([
        // Vertex coordinates and color
        1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
        -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
        1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
        1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
        1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
        -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        0, 3, 4,   0, 4, 5,    // right
        0, 5, 6,   0, 6, 1,    // up
        1, 6, 7,   1, 7, 2,    // left
        7, 4, 3,   7, 3, 2,    // down
        4, 7, 6,   4, 6, 5     // back
    ]);

    // Create a buffer object
    var vertexColorBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if (!vertexColorBuffer || !indexBuffer) {
        return -1;
    }

    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);
    // Assign the buffer object to a_Color and enable the assignment
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}
