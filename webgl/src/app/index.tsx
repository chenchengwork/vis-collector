import * as React from "react";
import { getGL, initProgram, raf } from './lib/webgl_util';
import * as dat from 'dat.gui';

export default class WebGL extends React.PureComponent {
    componentDidMount(){
        const gl = getGL("plane_triangle");
        this.draw(gl);



        const data = {
            flipY: true,
            scale: 1,
            size: '512',
            wrap: 'CLAMP',
            SRGB: false,
            postProcess: 'no-operation',
            MAG_FILTER: 'NEAREST',
            MIN_FILTER: 'NEAREST',
            generateMipMap: false,
            customMipmap: false,
            extLod: false,
            extLodLevel: 0
        };

        const gui = new dat.GUI({
            autoPlace: true,
            width: 350
        });

        const recreateTexture = (e: any) => {
            console.log('data->', data)
            console.log('e->', e);
        }

        gui.add(data, 'flipY').onChange(recreateTexture);
        gui.add(data, 'scale', 0, 2);
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
        gui.add(data, 'extLod');
        gui.add(data, 'extLodLevel', 0, 5);
        gui.add(data, 'customMipmap').onChange(recreateTexture);

    }

    // 绘制平面三角形
    draw = (gl: WebGLRenderingContext): void => {
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

        const drawTextureImage = () => {
            const doDrawImage = require("./case/drawImage").default;
            const image = getImage();
            image && doDrawImage(gl, image);
        };


        function runWebGLApp() {
            // 设置视口坐标系
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            // 开启深度检测
            gl.enable(gl.DEPTH_TEST);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            drawTriangle();     // 绘制三角形
            drawTextureImage(); // 绘制纹理图片

            window.requestAnimationFrame(runWebGLApp);
        }

        runWebGLApp();
    };

    render() {
        return (
            <React.Fragment>
                <h1>Hello WebGL!</h1>
                <canvas id="plane_triangle" width={500} height={500} />
            </React.Fragment>
        );
    }
}



