import * as React from "react";
import { GL, getGL, raf, resize, loadImage } from './lib/webgl_util';

export default class WebGL extends React.PureComponent {
    componentDidMount(){
        const gl = getGL("plane_triangle");
        this.draw(gl);
    }

    // 绘制平面三角形
    draw = (gl: GL): void => {
        // console.log("gl", gl._V)
        const drawTriangle = require("./webgl1/drawTriangle").default;


        const getImage = (() => {
            let images: HTMLImageElement[] = [];

            return () => {
                if(images.length <= 0) {
                    loadImage(require("./img/img_512.png")).then((image1) => {
                        loadImage(require("./img/img_256.png")).then((image2) => {
                            images = [image1, image2];
                        })
                    })
                }

                return images;
            }
        })();

        const doDrawImage = require("./webgl1/drawImage").default;

        const drawTextureImage = () => {
            const images = getImage();
            images.length == 2 && doDrawImage(gl, images);
        };

        const draw3D = require("./webgl1/draw3D").default;

        const drawBezierLine = require("./webgl1/drawBezierLine").default


        //
        const doDrawElementsInstanced = () => {
            const drawElementsInstanced = require("./webgl2/drawElementsInstanced").default;
            drawElementsInstanced(gl)
        };

        function tick() {
            // 重置画布大小
            resize(gl);

            // 设置视口坐标系, gl.viewport告诉WebGL如何将裁剪空间（-1 到 +1）中的点转换到像素空间， 也就是画布内
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            // 剔除遮挡面, 即被遮挡的面不会被绘制
            gl.enable(gl.CULL_FACE);

            // 开启深度检测
            gl.enable(gl.DEPTH_TEST);


            // 设置清除颜色,这只会改变webgl的内部状态,但不会绘制任何东西
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            // 真正的绘制是使用了clear方法后, 开始绘制的
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
            gl.clear(gl.COLOR_BUFFER_BIT );

            // 绘制webgl2的标准
            if(gl.isWebgl2) {
                doDrawElementsInstanced();
            }
            // 绘制webgl1的标准
            else {
                // drawTriangle(gl);     // 绘制三角形

                // 参考文章: http://taobaofed.org/blog/2018/12/17/webgl-texture/
                // drawTextureImage(); // 绘制纹理图片

                draw3D(gl)

                // drawBezierLine(gl);
            }

            raf(tick);
        }

        tick();
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



