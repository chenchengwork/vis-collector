/**
 * 绘制三角形
 */


import {
	getWebGLContext,
	initShaders
} from '../core/cuon-utils';


const VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec4 a_Color;
	uniform mat4 u_xformMatrix;	// 缩放矩阵 
	uniform mat4 u_ViewMatrix;	// 视图矩阵
	varying vec4 v_Color;
	void main(){
		// gl_Position = u_ViewMatrix * u_xformMatrix * a_Position;
		gl_Position =  a_Position;
		v_Color = a_Color;
	}
`;

const FSHADER_SOURCE = `
	#ifdef GL_ES
		precision mediump float;	
	#endif
	
	varying vec4 v_Color;
	void main(){
		gl_FragColor = v_Color;
	}
`;

export default function main() {
	const gl = getWebGLContext(document.querySelector('#webgl'));

	if (!gl) {
		console.log('初始化webGL上下文失败');
		return false;
	}

	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
		console.log('初始化着色器失败');
		return false;
	}

	//------------绑定着色器顶点和颜色-> start-------------
	const n = initVertexBuffers(gl);
	if (n < 0) {
		console.log("初始化顶点buffer失败");
		return false;
	}

	// 给顶点传入颜色
	// const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	// gl.vertexAttrib3f(a_Color, 0.0, 1.0, 0.0);

	// 传入缩放变换矩阵
	// const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
	// gl.uniformMatrix4fv(u_xformMatrix, false, new Float32Array([
	// 	1.0, 0.0, 0.0, 0.0,
	// 	0.0, 1.5, 0.0, 0.0,
	// 	0.0, 0.0, 1.0, 0.0,
	// 	0.0, 0.0, 0.0, 1.0,
	// ]));
    //
	// // 传入视图矩阵
	// const viewMatrix = new Matrix4();
	// viewMatrix.lookAt(0.20, 0.25, 0.25, 0,0,0, 0,1,0);
	// const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	// gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements)

	//------------绑定着色器顶点和颜色-> end-------------


	// 指定清除canvas的颜色
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// 清空canvas
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawArrays(gl.TRIANGLES, 0, n);
}


const initVertexBuffers = (gl) => {
	const vertices = new Float32Array([
		0.0, 0.5,  1.0, 0.0, 0.0,
		-0.5, -0.5, 0.0, 1.0, 0.0,
		0.5, -0.5,	0.0, 0.0, 1.0
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
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
	// 连接a_Position变量与分配给它的缓冲区对象
	gl.enableVertexAttribArray(a_Position);


	//---- 获取颜色的位置 -----
	const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	if (a_Color < 0) {
		console.log('Failed to get the storage location of a_Color');
		return false;
	}
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
	gl.enableVertexAttribArray(a_Color);

	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return n;
}
