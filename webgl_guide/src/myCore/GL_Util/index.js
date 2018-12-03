/**
 * 加载shader glsl到webgl中
 * @param {WebGLRenderingContext} gl
 * @param {Number} type     shader类型
 * @param {String} source   glsl编程语言
 * @returns {WebGLShader}
 */
const loadShader = (gl, type, source) => {
    // 创建着色器对象
    const shader = gl.createShader(type);
    if (shader == null) {
        console.log('unable to create shader');
        return null;
    }

    // 将glsl编程绑定到着色器对象上
    gl.shaderSource(shader, source);

    // 编译着色器
    gl.compileShader(shader);

    // 检查编译结果
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('Failed to compile shader: ' + error);
    }

    return shader;
}

export default class GL_Util {

    /**
     *
     * @param {String} canvasID
     */
    constructor(canvasID){
        /**
         *
         * @type {Element | null}
         */
        this.canvas = document.querySelector("#" + canvasID);
    }

    /**
     * 获取webgl 上下文
     * @param {Object} opts 3d webgl上下文参数
     * opts参数说明：
     *   alpha: boolean值表明canvas包含一个alpha缓冲区。
         depth: boolean值表明绘制缓冲区包含一个深度至少为16位的缓冲区。
         stencil: boolean值表明绘制缓冲区包含一个深度至少为8位的模版缓冲区。
         antialias: boolean值表明是否抗锯齿。
         premultipliedAlpha: boolean值表明页面排版工人将在混合alpha通道前承担颜色缓冲区。
         preserveDrawingBuffer: 如果这个值为true缓冲区将不会清除它，会保存下来，直到被清除或被使用者覆盖。
         failIfMajorPerformanceCaveat: boolean值表明在一个系统性能低的环境创建该上下文。
     *
     * @returns {*}
     */
    getWebGLContext(opts = {}) {
        const canvas = this.canvas;

        const names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        let context = null;
        for (let i = 0; i < names.length; ++i) {
            try {
                context = canvas.getContext(names[i], opts);
            } catch (e) {
            }

            if (context) break;
        }
        if (!context) throw new Error('Failed to get the rendering context for WebGL');

        return context;
    }

    /**
     * 获取webgl编程对象
     * @param {WebGLRenderingContext} gl
     * @param {String} vshader
     * @param {String} fshader
     * @returns {*}
     */
    getGlProgram(gl, vshader, fshader) {
        // 创建着色器对象
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }

        // 创建一个编程对象
        const program = gl.createProgram();
        if (!program) {
            return null;
        }

        // 绑定着色器对象到编程对象上
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // 关联编程对象到gl中
        gl.linkProgram(program);

        // 检查关联结果
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            throw new Error('Failed to link program: ' + error);
        }

        // webgl使用该编程对象
        gl.useProgram(program);
        // gl.program = program;

        return program;
    }


}
