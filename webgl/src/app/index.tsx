import * as React from "react";
import { getGL, initProgram, raf } from './lib/webgl_util';

export default class WebGL extends React.PureComponent {
    componentDidMount(){
        const gl = getGL("plane_triangle");

        this.draw(gl);
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
        }


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



