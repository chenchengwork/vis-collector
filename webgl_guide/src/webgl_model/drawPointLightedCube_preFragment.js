/**
 * 绘制带有点光照，逐片元光照的cube
 */

import GL_Util from '../myCore/GL_Util';
import GlMatrix from '../myCore/GlMatrix';

const v_sharder = `
    // 1. 准备顶点
    attribute vec4 a_Position;  // 顶点的位置
    attribute vec4 a_Color;     // 顶点的颜色
    attribute vec4 a_Normal;    // 顶点的法向量
    
    // 2. 准备操作矩阵
    uniform mat4 u_MvpMatrix;   // mvp矩阵
    uniform mat4 u_ModelMatrix; // 模型矩阵
    uniform mat4 u_NormalMatrix;    // 基于模型矩阵，得到的逆转置矩阵，用于获取模型变换后的法向量
    
    
    // 3. 差值顶点数据
    varying vec3 v_Position;
    varying vec4 v_Color;
    varying vec3 v_Normal;
    
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        
        v_Position = vec3(u_ModelMatrix * a_Position);
        v_Color = a_Color;
        v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
    }
`;

const f_sharder = `
    #ifdef GL_ES
        precision mediump float;
    #endif
    
    uniform vec3 u_LightPosition;   // 光照的位置
    uniform vec3 u_LightColor;      // 光照的颜色
    uniform vec3 u_AmbientLight;    // 环境的颜色
    
    varying vec3 v_Position;
    varying vec4 v_Color;
    varying vec3 v_Normal;
    
    void main(){
        vec3 lightDirection = normalize(u_LightPosition - v_Position);
        float nDotL = max(dot(lightDirection, normalize(v_Normal)), 0.0);
        vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
        vec3 ambient = u_AmbientLight * v_Color.rgb;
        
        gl_FragColor = vec4(diffuse + ambient, v_Color.a);
    }
`;



export default function main() {
    const gl_util = new GL_Util('webgl');
    const canvas = gl_util.canvas;
    const gl = gl_util.getWebGLContext();
    const glProgram = gl_util.getGlProgram(gl, v_sharder, f_sharder);
    const n = initVertexBuffers(gl, glProgram);

    initUniformBuffers(gl, glProgram, canvas);

    draw(gl, n);
}

function draw(gl, n) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

/**
 * 初始化uniform
 * @param gl
 * @param glProgram
 * @param canvas
 */
function initUniformBuffers(gl, glProgram, canvas) {
    const u_MvpMatrix = gl.getUniformLocation(glProgram, 'u_MvpMatrix');
    const u_ModelMatrix = gl.getUniformLocation(glProgram, 'u_ModelMatrix');
    const u_NormalMatrix = gl.getUniformLocation(glProgram, 'u_NormalMatrix');
    const u_LightColor = gl.getUniformLocation(glProgram, 'u_LightColor');
    const u_LightPosition = gl.getUniformLocation(glProgram, 'u_LightPosition');
    const u_AmbientLight = gl.getUniformLocation(glProgram, 'u_AmbientLight');

    if (!u_MvpMatrix || !u_LightColor || !u_LightPosition) {
        throw new Error('Failed to get the storage location');
    }

    // 设置光照颜色
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

    // 设置点光照位置
    gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);

    // 环境光颜色
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    // 设置转变法向量的矩阵
    // const mMatrix = GlMatrix.mutiplyMat4(GlMatrix.getTranslateMat4([0, 0.9, 0]), GlMatrix.getRotationMat4(90, [0, 0, 1]));
    const mMatrix = GlMatrix.getRotationMat4(90, [0, 1, 0]);
    gl.uniformMatrix4fv(u_NormalMatrix, false, GlMatrix.getInvertTransposeMat4(mMatrix));

    // 设置模型矩阵
    gl.uniformMatrix4fv(u_ModelMatrix, false, mMatrix);

    // 设置mvp矩阵
    const pMatrix = GlMatrix.getPerspectiveMatrix(30, canvas.width/canvas.height, 1, 100);
    const vMatrix = GlMatrix.getLookAtMatrix([6, 6, 14], [0, 0, 0], [0, 1, 0]);
    const mvpMatrix = GlMatrix.mutiplyMat4(GlMatrix.mutiplyMat4(pMatrix, vMatrix), mMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);
}

function initVertexBuffers(gl, glProgram) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var vertices = new Float32Array([   // Coordinates
        2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
        2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
        2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
        -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
        -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
        2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
    ]);


    var colors = new Float32Array([    // Colors
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
    ]);


    var normals = new Float32Array([    // Normal
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);


    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);


    // Write the vertex property to buffers (coordinates, colors and normals)
    if (!initArrayBuffer(gl, glProgram, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, glProgram, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, glProgram, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer (gl, glProgram, attribute, data, num, type) {
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(glProgram, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
}
