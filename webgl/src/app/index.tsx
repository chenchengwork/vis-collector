import * as React from "react";
import { getGL, initProgram, raf, resize } from './lib/webgl_util';
import * as dat from 'dat.gui';

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
            let images: HTMLImageElement[] = [];

            return () => {
                if(images.length <= 0) {
                    const image512 = new Image();
                    image512.src = require("./img/img_512.png");
                    image512.onload = () => {
                        images[0] = image512;

                        const image256 = new Image();
                        image256.src = require("./img/img_256.png");
                        image256.onload = () => {
                            images[1] = image256;
                        }
                    };
                }

                return images;
            }
        })();

        const doDrawImage = require("./case/drawImage").default(gl);

        const drawTextureImage = () => {
            const images = getImage();
            images.length == 2 && doDrawImage(images);
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

            // 参考文章: http://taobaofed.org/blog/2018/12/17/webgl-texture/
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



