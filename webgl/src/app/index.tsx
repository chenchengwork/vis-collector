import * as React from "react";
import { getGL, initProgram, raf, resize } from './lib/webgl_util';
import * as dat from 'dat.gui';

export default class WebGL extends React.PureComponent {
    componentDidMount(){
        const gl = getGL("plane_triangle");
        this.draw(gl);

        // const backingStore = gl.backingStorePixelRatio || gl.webkitBackingStorePixelRatio || gl.mozBackingStorePixelRatio || gl.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
        // const pixelRatio = (window.devicePixelRatio || 1) / backingStore;

        // const data = {
        //     flipY: true,
        //     scale: 1,
        //     size: '512',
        //     wrap: 'CLAMP',
        //     SRGB: false,
        //     postProcess: 'no-operation',
        //     MAG_FILTER: 'NEAREST',
        //     MIN_FILTER: 'NEAREST',
        //     generateMipMap: false,
        //     customMipmap: false,
        //     extLod: false,
        //     extLodLevel: 0
        // };
        //
        // const gui = new dat.GUI({
        //     autoPlace: true,
        //     width: 350
        // });
        //
        // const recreateTexture = (e: any) => {
        //     console.log('data->', data)
        //     console.log('e->', e);
        // }
        //
        // gui.add(data, 'flipY').onChange(recreateTexture);
        // gui.add(data, 'scale', 0, 2);
        // gui.add(data, 'size', [512, 300]).onChange(recreateTexture);
        // gui.add(data, 'wrap', ['CLAMP', 'REPEAT']);
        // gui.add(data, 'SRGB').onChange(recreateTexture);
        // gui.add(data, 'postProcess', ['no-operation', 'c^(1.0/2.2)', 'c^2.2']);
        // gui.add(data, 'MAG_FILTER', ['LINEAR', 'NEAREST']).onChange(recreateTexture);
        // gui.add(data, 'MIN_FILTER', [
        //     'LINEAR', 'NEAREST',
        //     'NEAREST_MIPMAP_NEAREST', 'LINEAR_MIPMAP_NEAREST',
        //     'NEAREST_MIPMAP_LINEAR', 'LINEAR_MIPMAP_LINEAR'
        // ]).onChange(recreateTexture);
        // gui.add(data, 'generateMipMap').onChange(recreateTexture);
        // gui.add(data, 'extLod');
        // gui.add(data, 'extLodLevel', 0, 5);
        // gui.add(data, 'customMipmap').onChange(recreateTexture);

    }

    // 绘制平面三角形
    draw = (gl: WebGLRenderingContext): void => {
        const program1 = require("./case/drawTriangle").getProgram(gl)
        const program2 = require("./case/drawImage").getProgram(gl)


        const drawTriangle = () => {
            const drawTriangle = require("./case/drawTriangle").default;

            drawTriangle(gl, [
                0.0, 0.1,  1.0, 0.0, 0.0,
                -0.5, -0.5, 0.0, 1.0, 0.0,
                0.5, -0.5,	0.0, 0.0, 1.0
            ]);

            drawTriangle(gl, [
                0.0, 0.3,  1.0, 0.0, 0.0,
                -0.3, -0.3, 0.0, 1.0, 0.0,
                0.3, -0.3,	0.0, 0.0, 1.0
            ]);
        };

        const getImage = (() => {
            let image: HTMLImageElement = null;

            return () => {
                if(image == null) {
                    const realImage = new Image();
                    realImage.src = require("./img/leaves.jpg");
                    realImage.onload = () => {
                        image = realImage
                    };
                }

                return image;
            }
        })();

        const doDrawImage = require("./case/drawImage").default(gl);

        const drawTextureImage = () => {

            const image = getImage();
            image && doDrawImage(image);
        };

        function runWebGLApp() {
            // 重置画布大小
            resize(gl);

            // 设置视口坐标系, gl.viewport告诉WebGL如何将裁剪空间（-1 到 +1）中的点转换到像素空间， 也就是画布内
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            // 开启深度检测
            gl.enable(gl.DEPTH_TEST);

            // 设置清除颜色,这只会改变webgl的内部状态,但不会绘制任何东西
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            // 真正的绘制是使用了clear方法后, 开始绘制的
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            drawTriangle();     // 绘制三角形
            drawTextureImage(); // 绘制纹理图片

            raf(runWebGLApp);
        }

        runWebGLApp();
    };

    render() {
        return (
            <React.Fragment>
                {/*<h1>Hello WebGL!</h1>*/}
                <div style={{position: "fixed", width: "100%", height: "100%"}}>
                <canvas id="plane_triangle" style={{width: "100%", height: "100%"}} />
                </div>
            </React.Fragment>
        );
    }
}



