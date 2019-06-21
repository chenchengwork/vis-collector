import { initProgram, createBuffer } from '../../lib/webgl_util'

// 获取图片的顶点数据
const getImageVBO = (x: number, y: number, width: number, height: number) => {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    return new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ])
};

const drawImage = (gl: WebGLRenderingContext, program: WebGLProgram, image: HTMLImageElement) => {
    // 创建纹理映射的几何图形
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const positionBuffer = createBuffer(gl, getImageVBO(0, 0, image.width, image.height));
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    // 设置纹理坐标,纹理坐标的范围永远是0~1
    const texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
    const texcoordBuffer = createBuffer(gl, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]));

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texcoordLocation);

    // set the resolution 设置分辨率
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2fv(resolutionLocation, new Float32Array([gl.drawingBufferWidth, gl.drawingBufferHeight]))

    // 创建纹理
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // 上传图片到纹理中
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    const u_image = gl.getUniformLocation(program, "u_image");
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // 对纹理图像进行Y轴翻转
    gl.activeTexture(gl.TEXTURE0);  // 开启0号纹理单元, 激活纹理单元
    gl.uniform1i(u_image, 0);    // 将0号纹理单元传递给着色器, 绑定纹理单元


    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

export default (gl: WebGLRenderingContext, image: HTMLImageElement) => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader")
    const prg = initProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);

    drawImage(gl, prg, image)
}
