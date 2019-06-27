import * as dat from "dat.gui";

export interface GL extends WebGLRenderingContext{
    isWebgl2?: boolean;
}

export {dat};

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
 * 创建着色器程序对象
 * @param gl
 * @param vxShader
 * @param fgShader
 */
export const createProgram = (gl: WebGLRenderingContext, vxShader: string, fgShader: string):WebGLProgram => {
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
 * 绑定顶点buffer
 */
export const bindVertexBuffer = ((
    gl: WebGLRenderingContext,
    vertices: Float32Array| Uint8Array,
    aLoc: number,
    size: number,
    type: number = gl.FLOAT,
    normalize: boolean = false,
    stride: number = 0,
    offset: number = 0
) => {
    // 创建缓冲区对象
    const aPositionBuffer: WebGLBuffer = gl.createBuffer();

    // 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, aPositionBuffer);

    // 将数据添加到缓存区中
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 将缓冲区对象分配给aPosition变量
    gl.vertexAttribPointer(aLoc, size, type, normalize, stride, offset);

    // 连接aPosition变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(aLoc);

    // 解除缓冲区关系
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

});



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
};

/**
 * 记忆函数
 * @param func
 * @param context
 */
// 参考实现： https://github.com/addyosmani/memoize.js
export const memoize = (func: Function, context?: any): Function => {
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
};

/**
 * 矩阵工具
 */
export const m4 = {
    // 透视投影
    perspective: function(fieldOfViewInRadians: number, aspect: number, near: number, far: number) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        const rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },
    // 正交投影
    projection: (width:number, height:number, depth:number) => ([
        2 / width, 0, 0, 0,
        0, -2 / height, 0, 0,
        0, 0, 2 / depth, 0,
        -1, 1, 0, 1,
    ]),

    multiply: (a: number[], b: number[]) => {
        const a00 = a[0 * 4 + 0];
        const a01 = a[0 * 4 + 1];
        const a02 = a[0 * 4 + 2];
        const a03 = a[0 * 4 + 3];
        const a10 = a[1 * 4 + 0];
        const a11 = a[1 * 4 + 1];
        const a12 = a[1 * 4 + 2];
        const a13 = a[1 * 4 + 3];
        const a20 = a[2 * 4 + 0];
        const a21 = a[2 * 4 + 1];
        const a22 = a[2 * 4 + 2];
        const a23 = a[2 * 4 + 3];
        const a30 = a[3 * 4 + 0];
        const a31 = a[3 * 4 + 1];
        const a32 = a[3 * 4 + 2];
        const a33 = a[3 * 4 + 3];
        const b00 = b[0 * 4 + 0];
        const b01 = b[0 * 4 + 1];
        const b02 = b[0 * 4 + 2];
        const b03 = b[0 * 4 + 3];
        const b10 = b[1 * 4 + 0];
        const b11 = b[1 * 4 + 1];
        const b12 = b[1 * 4 + 2];
        const b13 = b[1 * 4 + 3];
        const b20 = b[2 * 4 + 0];
        const b21 = b[2 * 4 + 1];
        const b22 = b[2 * 4 + 2];
        const b23 = b[2 * 4 + 3];
        const b30 = b[3 * 4 + 0];
        const b31 = b[3 * 4 + 1];
        const b32 = b[3 * 4 + 2];
        const b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    translation: (tx:number, ty:number, tz:number) => ([
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        tx, ty, tz, 1,
    ]),

    xRotation: (angleInRadians:number) => {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation: (angleInRadians:number) => {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation: (angleInRadians:number) => {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    scaling: (sx:number, sy:number, sz:number) => ([
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
    ]),

    translate: (m:number[], tx:number, ty:number, tz:number) => m4.multiply(m, m4.translation(tx, ty, tz)),

    xRotate: (m:number[], angleInRadians:number) => m4.multiply(m, m4.xRotation(angleInRadians)),

    yRotate: (m:number[], angleInRadians:number) => m4.multiply(m, m4.yRotation(angleInRadians)),

    zRotate: (m:number[], angleInRadians:number) => m4.multiply(m, m4.zRotation(angleInRadians)),

    scale: (m:number[], sx:number, sy:number, sz:number) => m4.multiply(m, m4.scaling(sx, sy, sz)),
};

/**
 * 弧度转角度
 */
export const radToDeg = (r: number) => r * 180 / Math.PI;

/**
 * 角度转弧度
 */
export const degToRad = (d: number) => d * Math.PI / 180;
