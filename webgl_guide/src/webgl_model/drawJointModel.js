/**
 * 绘制单关节模型
 */

import GL_Util from '../myCore/GL_Util';
import GlMatrix from '../myCore/GlMatrix';

const v_sharder = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;
    
    varying vec4 v_Color;
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        
        vec4 color = vec4(1.0, 0.4, 0.0, 1.0);                  // 模型颜色
        vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));   // 光照方向
        vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz); 
        float nDotL = max(dot(lightDirection, normal), 0.0);
        
        v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);
    }
`;

const f_sharder = `
    #ifdef GL_ES
        precision mediump float;
    #endif
    
    varying vec4 v_Color;
    
    void main(){
        gl_FragColor = v_Color;
    }
    
`;

var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // Shading calculation to make the arm look three-dimensional
    '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' + // Light direction
    '  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' +
    '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
    '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
    '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';



export default function main() {
    const gl_util = new GL_Util('webgl');
    const canvas = gl_util.canvas;
    const gl = gl_util.getWebGLContext();
    // const glProgram = gl_util.getGlProgram(gl, v_sharder, f_sharder);
    const glProgram = gl_util.getGlProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    gl.program = glProgram;
    const n = initVertexBuffers(gl, glProgram);

    // initUniformBuffers(gl);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    doDraw(gl, glProgram, canvas, n)();

}

function initVertexBuffers(gl, glProgram) {
    // Vertex coordinates（a cuboid 3.0 in width, 10.0 in height, and 3.0 in length with its origin at the center of its bottom)
    var vertices = new Float32Array([
        1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
        1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
        1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
        -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
        -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
        1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
    ]);

    // Normal
    var normals = new Float32Array([
        0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
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

    // Write the vertex property to buffers (coordinates and normals)
    if (!initArrayBuffer(gl, glProgram, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, glProgram, 'a_Normal', normals, gl.FLOAT, 3)) return -1;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, glProgram, attribute, data, type, num) {
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

    return true;
}


function doDraw(gl, glProgram, canvas, n) {
    var ANGLE_STEP = 3.0;    // 旋转角度步长
    var g_arm1Angle = -90.0; // The rotation angle of arm1 (degrees)
    var g_joint1Angle = 0.0; // The rotation angle of joint1 (degrees)

    const u_MvpMatrix = gl.getUniformLocation(glProgram, 'u_MvpMatrix');
    const u_NormalMatrix = gl.getUniformLocation(glProgram, 'u_NormalMatrix');

    const pMatrix = GlMatrix.getPerspectiveMatrix(50.0, canvas.width / canvas.height, 1.0, 100.0);
    const vMatrix = GlMatrix.getLookAtMatrix([20.0, 10.0, 30.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    const vpMatrix = GlMatrix.mutiplyMat4(pMatrix, vMatrix);

    return () => {
        var arm1Length = 10.0; // Length of arm1

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Arm1
        const translateMatrix1 = GlMatrix.getTranslateMat4([0.0, -12.0, 0.0]);
        const rotateYMatrix1 = GlMatrix.getRotationMat4(g_arm1Angle, [0.0, 1.0, 0.0]); // 绕y轴旋转
        const mMatrix1 = GlMatrix.mutiplyMat4(translateMatrix1, rotateYMatrix1);

        drawBox(gl, n, vpMatrix, mMatrix1, u_MvpMatrix, u_NormalMatrix);

        // Arm2
        const translateMatrix2 = GlMatrix.mutiplyMat4(translateMatrix1, GlMatrix.getTranslateMat4([0.0, arm1Length, 0.0])); 　　　// Move to joint1
        const rotateZMatrix2 = GlMatrix.mutiplyMat4(translateMatrix2,GlMatrix.getRotationMat4(g_joint1Angle, [0.0, 0.0, 1.0]));  // Rotate around the z-axis
        const scaleMatrix2 = GlMatrix.mutiplyMat4(rotateZMatrix2,GlMatrix.getScaleMat4([1.3, 1.0, 1.3]));                     // Make it a little thicker
        const mMatrix2 = GlMatrix.mutiplyMat4(GlMatrix.mutiplyMat4(translateMatrix2, rotateZMatrix2), scaleMatrix2);

        drawBox(gl, n, vpMatrix, mMatrix2, u_MvpMatrix, u_NormalMatrix);
    }
}


// Draw the cube
function drawBox(gl, n, viewProjMatrix, g_modelMatrix, u_MvpMatrix, u_NormalMatrix) {
    const g_mvpMatrix = GlMatrix.mutiplyMat4(viewProjMatrix, g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix);

    const g_normalMatrix = GlMatrix.getInvertTransposeMat4(g_modelMatrix);
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix);
    // Draw
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

