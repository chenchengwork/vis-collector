import {AnimationLoop, Program, VertexArray, Buffer, setParameters} from '@luma.gl/core';
import GL from '@luma.gl/constants';
const VERTEX_SHADER = `\
attribute vec2 positions;
void main(void) {
  gl_Position = vec4(positions,0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `\
precision highp float;
void main(void) {
  gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`;

export default class DrawGL extends AnimationLoop {

    constructor(props = {}) {
        super(Object.assign(props, {debug: true}));
    }

    onInitialize({gl, canvas, aspect}) {
        const SQUARE_VERTS = [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5];          // eslint-disable-line
        const SQUARE_VERTS_INDEX = [0, 1, 2, 0, 2, 3];  // eslint-disable-line

        const program = new Program(gl, {
            vs: VERTEX_SHADER,
            fs: FRAGMENT_SHADER
        });


        const squareVertexArray = new VertexArray(gl, {
            program,
            attributes: {
                positions: new Buffer(gl, {data: new Float32Array(SQUARE_VERTS)}),
                elements: new Buffer(gl, { target: GL.ELEMENT_ARRAY_BUFFER, data: new Uint16Array(SQUARE_VERTS_INDEX) }),
            },
            // elements 放在外面也是可以的
            // elements: new Buffer(gl, {target: GL.ELEMENT_ARRAY_BUFFER, data: new Uint16Array(SQUARE_VERTS_INDEX)}),
        });

        setParameters(gl, {
            clearColor: [0, 0, 0, 1],
            clearDepth: [1],
            depthTest: true,
            depthFunc: gl.LEQUAL
        });

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        program
            .draw({
                logPriority: false,
                vertexArray: squareVertexArray,
                drawMode: gl.TRIANGLES,
                isIndexed: true,
                vertexCount: 6
            });
    }
}

