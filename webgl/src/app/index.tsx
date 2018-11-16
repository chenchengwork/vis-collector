import * as React from "react";
import { getGL, initProgram, raf } from './lib/webgl_util';

export default class WebGL extends React.PureComponent {
    componentDidMount(){
        const gl: WebGLRenderingContext = getGL("plane_triangle");

        this.drawPlaneTriangle(gl);
    }

    // 绘制平面三角形
    drawPlaneTriangle = (gl: WebGLRenderingContext): void => {
        const SHADER_VERTEX: string = `
            attribute vec4 aVertexPosition;
            attribute vec4 a_Color;
            varying vec4 v_Color;
            void main(void) {
                gl_Position = aVertexPosition;
                v_Color = a_Color;
            }
        `;

        const SHADER_FRAGMENT: string = `
            #ifdef GL_ES
            precision highp float;
            #endif
            
            varying vec4 v_Color;
            void main(void) {
                // gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
                gl_FragColor = v_Color;
            }
        `;

        const initBuffers = (gl: WebGLRenderingContext, prg: WebGLProgram): number => {
            const vertices = new Float32Array([
                0.0, 0.5,  1.0, 0.0, 0.0,
                -0.5, -0.5, 0.0, 1.0, 0.0,
                0.5, -0.5,	0.0, 0.0, 1.0
            ]);

            // 顶点数量
            const n = 3;

            const FSIZE = vertices.BYTES_PER_ELEMENT;

            // const indices: number[] = [3, 2, 1, 3, 1, 0];

            // 创建缓冲区对象
            const squareVertexBuffer: WebGLBuffer = gl.createBuffer();
            // 将缓冲区对象绑定到目标
            gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
            // 向缓冲区对象写入数据
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            const aVertexPosition = gl.getAttribLocation(prg, 'aVertexPosition');

            // 将缓冲区对象分配给a_Position变量
            gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, FSIZE * 5, 0);
            // 连接a_Position变量与分配给它的缓冲区对象
            gl.enableVertexAttribArray(aVertexPosition);


            //---- 获取颜色的位置 -----
            const a_Color = gl.getAttribLocation(prg, 'a_Color');
            gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
            gl.enableVertexAttribArray(a_Color);

            // 解除缓冲区关系
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            return n;
        };


        const drawScene = (gl: WebGLRenderingContext, n: number) => {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            // gl.viewport(0, 0, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, n);
        }

        type G_Params = {
            gl: WebGLRenderingContext,
            n: number,
        };

        let G: G_Params;

        function renderLoop() {

            drawScene(G.gl, G.n);
            // raf(renderLoop);
            window.requestAnimationFrame(renderLoop);
        }

        function runWebGLApp() {
            const prg = initProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);
            const n = initBuffers(gl, prg);
            G = {gl, n};
            renderLoop();

        }
        runWebGLApp();
    };

    render() {
        return (
            <React.Fragment>
                <h1>Hello WebGL!</h1>
                <canvas id="plane_triangle" />
            </React.Fragment>
        );
    }
}



