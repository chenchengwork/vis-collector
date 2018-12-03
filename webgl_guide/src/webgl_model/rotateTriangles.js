import {
	getWebGLContext,
	initShaders
} from '../core/cuon-utils';

import { Matrix4 } from '../core/cuon-matrix';

var VSHADER_SOURCE =`
    attribute vec4 a_Position;
    attribute float a_PointSize;
    uniform mat4 u_ModelMatrix;
    void main() {
        // 设置顶点着色器的位置
        gl_Position = a_Position * u_ModelMatrix; 
        // 设置点的大小
        gl_PointSize = a_PointSize;
    }
`;

var FSHADER_SOURCE =`
    precision mediump float;
    uniform vec4 u_FragColor; 
    void main() { 
        // 设置片元着色器颜色
        gl_FragColor = u_FragColor;
    }
`;

var ANGLE_STEP = 45.0;

export default function main() {
	// Retrieve <canvas> element
	const canvas = document.getElementById('webgl');

	// 获取WebGL渲染上下文
	const gl = getWebGLContext(canvas, true);
	window.gl = gl;

	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// 初始化着色器
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

	// 获取attribute变量的存储位置
	const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');

	if (a_Position < 0 || a_PointSize < 0) {
		console.error('获取attribute变量的存储位置失败');
		return false;
	}

	// 将顶点位置传给顶点变量
	// gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);                    // 非矢量方法
	gl.vertexAttrib1f(a_PointSize, 10.0);                    // 非矢量方法
	// gl.vertexAttrib3fv(a_Position, new Float32Array(0.0, 0.0, 0.0));    // 矢量版函数

	const n = initVertexBuffers(gl);
	if (n < 0) {
		console.log("初始化顶点buffer失败");
		return false;
	}
	// 获取uniform变量的存储位置
	const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (!u_FragColor){
		console.log('获取uniform变量的存储位置失败');
		return false;
	}
	// 将颜色传递给uniform
	gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);

	// 指定清除canvas的颜色
	gl.clearColor(0.0, 0.0, 0.0, 1.0);



	// Get storage location of u_ModelMatrix
	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	if (!u_ModelMatrix) {
		console.log('Failed to get the storage location of u_ModelMatrix');
		return;
	}

	// Current rotation angle
	var currentAngle = 0.0;
	// Model matrix
	var modelMatrix = new Matrix4();

	// Start drawing
	var tick = function() {
		currentAngle = animate(currentAngle);  // Update the rotation angle
		draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);   // Draw the triangle
		requestAnimationFrame(tick, canvas); // Request that the browser calls tick
	};
	tick();


	return;

	// 清除canvas
	gl.clear(gl.COLOR_BUFFER_BIT);

	/**
	 * @param1 mode 绘制模式
	 * gl.POINTS 绘制点
	 * gl.LINES
	 *
	 * @param2 first 指定从哪个d顶点开始绘制
	 * @param3 count 指定绘制需要用到多少个定点
	 */
	gl.drawArrays(gl.TRIANGLES, 0, n);
}


/**
 * 初始化顶点buffer
 * @param gl
 * @return {number}
 */
function initVertexBuffers(gl) {
	const vertices = new Float32Array([
		0.0, 0.5,   -0.5, -0.5,   0.5, -0.5
	]);

	const n = 3; // The number of vertices

	// Create a buffer object
	// 创建缓冲对象
	const vertexBuffer = gl.createBuffer();
	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	// Bind the buffer object to target
	// 将缓冲区对象绑定到目标
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// Write date into the buffer object
	// 向缓冲区对象中写入数据
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	// Assign the buffer object to a_Position variable
	// 将缓冲区对象分配给a_Position变量
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	// Enable the assignment to a_Position variable
	// 连接a_Position变量与分配给它的缓冲区对象
	gl.enableVertexAttribArray(a_Position);

	return n;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
	// Set the rotation matrix
	modelMatrix.setRotate(currentAngle, 0, 0, 1); // Rotation angle, rotation axis (0, 0, 1)

	// Pass the rotation matrix to the vertex shader
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Draw the rectangle
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	// Update the current rotation angle (adjusted by the elapsed time)
	var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
	return newAngle %= 360;
}

