export interface GL extends WebGLRenderingContext{
    isWebgl2?: boolean;
}

export const getGL = (domID: string): GL => {
    const canvas: HTMLCanvasElement = document.querySelector("#" + domID);
    const flag = "webgl";   // webgl1
    // const flag = "webgl2";     // webgl2
    const gl = canvas.getContext(flag);     // 获取webgl上下文

    // @ts-ignore
    flag === "webgl2" ? gl.isWebgl2 = true : gl.isWebgl2 = false;

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
};

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


/**
 * 重置画布大小
 * @param gl
 */
export const resize = (gl: WebGLRenderingContext) => {
    // window.devicePixelRatio表示一个像素等于多少个真实的像素数
    const realToCSSPixels = window.devicePixelRatio;

    // 获取浏览器显示的画布的CSS像素值, 然后计算出设备像素设置drawingbuffer, 获取设备的真实像素数
    const displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    const displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    // 检查画布尺寸是否相同, 如果画布像素数和真实设备像素数不相同,则设置为相同的像素数
    if (gl.canvas.width  !== displayWidth || gl.canvas.height !== displayHeight) {
        // 设置为相同的尺寸
        gl.canvas.width  = displayWidth;
        gl.canvas.height = displayHeight;
    }
};

/**
 * 加载图片
 * @param url
 * @param opts
 */
export const loadImage = (url: string, opts?: {crossOrigin: string}): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        try {
            const image = new Image();

            image.onload = () => resolve(image);

            image.onerror = () => reject(new Error("Could not load image ".concat(url, ".")));

            image.crossOrigin = opts && opts.crossOrigin || 'anonymous';
            image.src = url;
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 记忆函数
 * @param func
 * @param context
 */
// 参考实现： https://github.com/addyosmani/memoize.js
export const memoize = (func: Function, context?: any): any => {
    const stringifyJson = JSON.stringify,
        cache: {[index: string]: any} = {};

    const cachedfun = function() {
        const hash = stringifyJson(arguments);
        return (hash in cache) ? cache[hash] : cache[hash] = func.apply(this, arguments);
    };

    cachedfun.__cache = (function() {
        cache.remove || (cache.remove = function() {
            var hash = stringifyJson(arguments);
            return (delete cache[hash]);
        });
        return cache;
    }).call(context);

    return cachedfun;
}
