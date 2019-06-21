export const getGL = (domID: string):WebGLRenderingContext => {
    const canvas: HTMLCanvasElement = document.querySelector("#" + domID);
    const gl = canvas.getContext("webgl");
    return gl;
};

export const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

/**
 * 加载shader
 * @param {WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} source
 * @return {WebGLShader}
 */
const loadShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
    // 创建渲染器对象
    const shader = gl.createShader(type);
    if (shader == null) {
        throw new Error('create shader failed');
    }

    // 传入shader编码
    gl.shaderSource(shader, source);

    // 编译shader
    gl.compileShader(shader);

    // 检查编译结果
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('Failed to compile shader: ' + error);
    }

    return shader;
};

/**
 * 初始化WebGL Program
 * @param {WebGLRenderingContext} gl
 * @param {string} vxShader
 * @param {string} fgShader
 * @return {WebGLProgram}
 */
export const initProgram = (gl: WebGLRenderingContext, vxShader: string, fgShader: string):WebGLProgram => {
    const prg: WebGLProgram = gl.createProgram();
    gl.attachShader(prg, loadShader(gl, gl.VERTEX_SHADER, vxShader));
    gl.attachShader(prg, loadShader(gl, gl.FRAGMENT_SHADER, fgShader));
    gl.linkProgram(prg);
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        const error: string = gl.getProgramInfoLog(prg);
        gl.deleteProgram(prg);
        gl.deleteShader(fgShader);
        gl.deleteShader(vxShader);
        throw new Error("Failed to link program:" + error);
    }
    gl.useProgram(prg);

    return prg;
}

/**
 * 创建数据buffer
 */
export const createBuffer = (gl: WebGLRenderingContext, value: Float32Array, usage?: number) => {
    usage = usage || gl.STATIC_DRAW;
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, value, usage);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);   // 清空缓存

    return buffer;
};

/**
 * 创建数据索引 buffer
 * @param gl
 * @param value
 * @param usage
 */
export const createElementsBuffer = (gl: WebGLRenderingContext, value: Uint16Array, usage?: number) => {
    usage = usage || gl.STATIC_DRAW;
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, value, usage);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);   // 清空缓存

    return buffer;
};
