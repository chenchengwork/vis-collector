import { initProgram, createBuffer, createProgram, memoize, bindVertexBuffer } from '../../lib/webgl_util'
import * as dat from "dat.gui";

interface Context {
    program: WebGLProgram;
    aPositionLoc: number;
    aTexCoordLoc: number;
    uResolutionLoc: WebGLUniformLocation;
    uScaleLoc: WebGLUniformLocation;
    uPostProcessLoc: WebGLUniformLocation;
    aPosition: {
        data: Float32Array;
        n: number
    },
    aTexCoord: Float32Array;
    texture: WebGLTexture;
}

let context: Context;

const drawImage = (gl: WebGLRenderingContext, images: HTMLImageElement[], data: any) => {
    const { program, aPositionLoc, aTexCoordLoc, uResolutionLoc, uScaleLoc, uPostProcessLoc, aPosition, aTexCoord, texture} = context;
    gl.useProgram(program);

    // 创建纹理映射的几何图形
    bindVertexBuffer(gl, aPosition.data, aPositionLoc, 2, gl.FLOAT);
    // 设置纹理坐标,纹理坐标的范围永远是0~1
    bindVertexBuffer(gl, aTexCoord, aTexCoordLoc, 2, gl.FLOAT)

    // 设置分辨率
    gl.uniform2fv(uResolutionLoc, new Float32Array([gl.drawingBufferWidth, gl.drawingBufferHeight]))
    // 设置缩放
    gl.uniform1f(uScaleLoc, data.scale);


    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    if(data.wrap === 'CLAMP'){
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }else {
        // 注意: 使用gl.REPEAT对图片的尺寸有要求, 宽度和高度必须为 2 的整数次幂，如 32x32 或 1024x256 的图片都是符合要求的，但 500x512 或 300x300 是不符合的
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

    // @ts-ignore
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[data.MAG_FILTER]);

    // @ts-ignore
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[data.MIN_FILTER]);


    // SRGB的模拟实现
    if (data.postProcess === 'no-operation') {
        gl.uniform1i(uPostProcessLoc, 0);
    } else if (data.postProcess === 'c^(1.0/2.2)') {
        gl.uniform1i(uPostProcessLoc, 1);
    } else if (data.postProcess === 'c^2.2') {
        gl.uniform1i(uPostProcessLoc, 2)
    }

    // 开启 Mipmap
    if (data.generateMipMap) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.drawArrays(gl.TRIANGLES, 0, aPosition.n);
};

const createTexture = (gl: WebGLRenderingContext, program: WebGLProgram,images: HTMLImageElement[], format: number) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 上传图片到纹理中
    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, images[0]);
    const u_image = gl.getUniformLocation(program, "u_image");
    gl.activeTexture(gl.TEXTURE0);  // 开启0号纹理单元, 激活纹理单元
    gl.uniform1i(u_image, 0);    // 将0号纹理单元传递给着色器, 绑定纹理单元

    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
};

export default (gl: WebGLRenderingContext, images: HTMLImageElement[]) => {
    if (!context) context = getContext(gl, images);
    drawImage(gl, images, data)
}

const data = {
    scale: 1,
    size: '512',
    wrap: 'CLAMP',
    SRGB: false,
    postProcess: 'no-operation',
    MAG_FILTER: 'NEAREST',
    MIN_FILTER: 'NEAREST',
    generateMipMap: false,
};


const getContext = memoize((gl: WebGLRenderingContext, images: HTMLImageElement[]): Context => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader");
    const program = createProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);
    const aPositionLoc = gl.getAttribLocation(program, "a_position");
    const aTexCoordLoc = gl.getAttribLocation(program, "a_texCoord");
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const uScaleLoc = gl.getUniformLocation(program, "uScale");
    const uPostProcessLoc = gl.getUniformLocation(program, "uPostProcess");

    const aPosition = getImageVBO(0, 0, 512, 512);
    const aTexCoord = getTexCoordVBO();
    // 创建纹理
    const extensions = {
        // SRGB扩展说明: https://developer.mozilla.org/en-US/docs/Web/API/EXT_sRGB
        SRGB: gl.getExtension("EXT_SRGB"),
        TEX_LOD: gl.getExtension("EXT_shader_texture_lod")
    };

    const format = data.SRGB && extensions.SRGB ? extensions.SRGB.SRGB_EXT : gl.RGBA;
    const texture = createTexture(gl, program, images, format);

    createDatUI(gl, data);

    return { program, aPositionLoc, aTexCoordLoc, uResolutionLoc, uScaleLoc, uPostProcessLoc, aPosition, aTexCoord, texture }
});

const createDatUI = (gl: WebGLRenderingContext, data: any) => {

    const gui = new dat.GUI({
        autoPlace: true,
        width: 350
    });

    const recreateTexture = (e: any) => {
        console.log('data->', data)
        console.log('e->', e);
    }

    // gui.add(data, 'flipY').onChange(recreateTexture);
    gui.add(data, 'scale', 0, 6);
    gui.add(data, 'size', [512, 300]).onChange(recreateTexture);
    gui.add(data, 'wrap', ['CLAMP', 'REPEAT']);
    gui.add(data, 'SRGB').onChange(recreateTexture);
    gui.add(data, 'postProcess', ['no-operation', 'c^(1.0/2.2)', 'c^2.2']);
    gui.add(data, 'MAG_FILTER', ['LINEAR', 'NEAREST']).onChange(recreateTexture);
    gui.add(data, 'MIN_FILTER', [
        'LINEAR', 'NEAREST',
        'NEAREST_MIPMAP_NEAREST', 'LINEAR_MIPMAP_NEAREST',
        'NEAREST_MIPMAP_LINEAR', 'LINEAR_MIPMAP_LINEAR'
    ]).onChange(recreateTexture);
    gui.add(data, 'generateMipMap').onChange(recreateTexture);
    // gui.add(data, 'extLod');
    // gui.add(data, 'extLodLevel', 0, 5);
    // gui.add(data, 'customMipmap').onChange(recreateTexture);
}

// 获取图片的顶点数据
const getImageVBO = (x: number, y: number, width: number, height: number) => {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    const data = new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]);

    return {data, n: data.length / 2}
};


const getTexCoordVBO = () => {
    return new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]);
}
