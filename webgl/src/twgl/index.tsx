import * as React  from 'react';
import * as twgl from 'twgl.js';

const vs = `
attribute vec4 position;

void main() {
  gl_Position = position;
}
`;

const fs = `
precision mediump float;

uniform vec2 resolution;
uniform float time;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float color = 0.0;
  // lifted from glslsandbox.com
  color += sin( uv.x * cos( time / 3.0 ) * 60.0 ) + cos( uv.y * cos( time / 2.80 ) * 10.0 );
  color += sin( uv.y * sin( time / 2.0 ) * 40.0 ) + cos( uv.x * sin( time / 1.70 ) * 40.0 );
  color += sin( uv.x * sin( time / 1.0 ) * 10.0 ) + sin( uv.y * sin( time / 3.50 ) * 80.0 );
  color *= sin( time / 10.0 ) * 0.5;

  gl_FragColor = vec4( vec3( color * 0.5, sin( color + time / 2.5 ) * 0.75, color ), 1.0 );
}
`;
function identity<T>(arg: T): T {
    return arg;
}

function extend<T, U>(first: T, second: U): T & U {
    let result = {} as T & U;
    for (let id in first) {
        (result as any)[id] = (first as any)[id];
            }
    for (let id in second) {
        if (!result.hasOwnProperty(id)) {
            (result as any)[id] = (second as any)[id];
        }
    }
    return result
}

let someValue= "";
let strLength: number = (someValue as string).length;

export default class DrawByTwgl extends React.PureComponent{

    componentDidMount() {
        this.draw();
    }

    draw = () => {
        "use strict";
        // const gl: WebGLRenderingContext = canvas.getContext("webgl");
        const gl: WebGLRenderingContext = (document.querySelector("#c") as HTMLCanvasElement).getContext("webgl");
        const programInfo = twgl.createProgramInfo(gl, [vs, fs]);

        const arrays = {
            position: [
                -1, -1, 0,
                1, -1, 0,
                -1, 1, 0,
                -1, 1, 0,
                1, -1, 0,
                1, 1, 0
            ],
        };

        const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

        function render(time: number) {
            twgl.resizeCanvasToDisplaySize(gl.canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            const uniforms = {
                time: time * 0.001,
                resolution: [gl.canvas.width, gl.canvas.height],
            };

            gl.useProgram(programInfo.program);
            twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
            twgl.setUniforms(programInfo, uniforms);
            twgl.drawBufferInfo(gl, bufferInfo);

            requestAnimationFrame(render);
        }

        requestAnimationFrame(render);
    };

    render(){
        return (
            <canvas id="c" width="500" height="500"></canvas>
    );
    }
}

