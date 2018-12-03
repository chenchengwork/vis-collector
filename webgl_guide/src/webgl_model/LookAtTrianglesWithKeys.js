import GL_Util from '../myCore/GL_Util';

const VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec4 a_Color;
	varying vec4 v_Color;
	void main(){
		gl_Position =  a_Position;
		v_Color = a_Color;
	}
`;

const FSHADER_SOURCE = `
	#ifdef GL_ES
	precision mediump float;	// float指定精度
	#endif
	
	varying vec4 v_Color;
	void main(){
		gl_FragColor = v_Color;
	}
`;

export default function LookAtTrianglesWithKeys(){
	const gl_util = new GL_Util('webgl');
	const gl = gl_util.getWebGLContext();
	const glProgram = gl_util.getGlProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);

	// Set the vertex coordinates and color (the blue triangle is in the front)
	const n = initVertexBuffers(gl, glProgram);
	if (n < 0) {
		console.log('Failed to set the vertex information');
		return;
	}

	gl.clearColor(0, 0, 0, 1);

	// const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	// if(!u_ViewMatrix) {
	// 	console.log('Failed to get the storage locations of u_ViewMatrix');
	// 	return;
	// }

	document.onkeydown = function(ev){ keydown(ev, gl, n); };

	draw(gl, n);   // Draw

}

const initVertexBuffers = (gl, glProgram) => {
	const verticesColors = new Float32Array([
		// Vertex coordinates and color
		// 0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
		// -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
		// 0.5, -0.5,  -0.4,  1.0,  0.4,  0.4,

        0.0,  1.0,  0.0,  0.4,  1.0,  0.4, // The back green one
        -1.0, -1.0,  -0.0,  0.4,  1.0,  0.4,
        1.0, -1.0,  -0.0,  1.0,  0.4,  0.4,


		// 0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
		// -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
		// 0.0, -0.6,  -0.2,  1.0,  1.0,  0.4,
        //
		// 0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // The front blue one
		// -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
		// 0.5, -0.5,   0.0,  1.0,  0.4,  0.4,
	]);

	var n = 3;

	const vertexColorbuffer = gl.createBuffer();

	if (!vertexColorbuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	const FSIZE = verticesColors.BYTES_PER_ELEMENT;

	const a_Position = gl.getAttribLocation(glProgram, 'a_Position');
	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}

	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
	gl.enableVertexAttribArray(a_Position);


	const a_Color = gl.getAttribLocation(glProgram, 'a_Color');
	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}

	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6,FSIZE * 3);
	gl.enableVertexAttribArray(a_Color);

	return n;
};


let g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25; // Eye position
function keydown(ev, gl, n) {
	if(ev.keyCode == 39) { // The right arrow key was pressed
		g_eyeX += 0.01;
	} else
	if (ev.keyCode == 37) { // The left arrow key was pressed
		g_eyeX -= 0.01;
	} else { return; }
	draw(gl, n);
}

function draw(gl, n, u_ViewMatrix) {
	// 获取相机实视图
	// const cameraView = GlMatrix.getLookAtMatrix([g_eyeX, g_eyeY, g_eyeZ], [0, 0, 0], [0, 1, 0]);
	// gl.uniformMatrix4fv(u_ViewMatrix, false, cameraView);

	gl.clear(gl.COLOR_BUFFER_BIT);     // Clear <canvas>

	gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle
}



