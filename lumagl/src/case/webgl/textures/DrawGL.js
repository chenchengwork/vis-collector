import {AnimationLoop, setParameters, CubeGeometry, Model, Texture2D} from '@luma.gl/core';
import { Matrix4 } from 'math.gl';
import { addEvents } from '@luma.gl/addons'
import GL from '@luma.gl/constants';

const VERTEX_SHADER = `\
attribute vec3 positions;
attribute vec2 texCoords;   // 纹理顶点
uniform mat4 uMMatrix;
uniform mat4 uMVMatrix;     // 视图矩阵
uniform mat4 uPMatrix;      // 投影矩阵
varying vec2 vTextureCoord;
void main(void) {
  gl_Position = uPMatrix * uMVMatrix * uMMatrix * vec4(positions, 1.0);
  vTextureCoord = texCoords;
}
`;

const FRAGMENT_SHADER = `\
precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
void main(void) {
  // 提取纹理颜色
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;

export default class DrawGL extends AnimationLoop {

    constructor(props = {}) {
        super(Object.assign(props, {debug: true}));
    }

    onInitialize({canvas, gl}) {
        // addMouseHandler(gl.canvas);
        addMouseHandler(canvas);

        setParameters(gl, {
            clearColor: [0, 0, 0, 1],
            clearDepth: 1,
            depthTest: true,
            depthFunc: GL.LEQUAL
        });

        return {
            cube: new Model(gl, {
                vs: VERTEX_SHADER,
                fs: FRAGMENT_SHADER,
                geometry: new CubeGeometry(),
                uniforms: {
                    // uSampler: new Texture2D(gl, require("./img/nehe.gif"))
                    uSampler: new Texture2D(gl, require("./img/img_512.png"))
                }
            })
        };
    }

    onRender({gl, tick, aspect, pyramid, cube}) {
        gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        const projection = new Matrix4().perspective({aspect});
        const view = new Matrix4().lookAt({eye: [0, 0, 0]});
        const uMMatrix = new Matrix4().multiplyRight(appState.moonRotationMatrix);


        const phi = tick * 0.01;

        cube
            .setUniforms({
                uMMatrix,
                uPMatrix: projection,
                uMVMatrix: view
                    .clone()
                    .translate([0, 0, -4])
                    // .rotateXYZ([phi, phi, phi])
            })
            .draw();
    }
}

const appState = {
    mouseDown: false,
    lastMouseX: null,
    lastMouseY: null,
    moonRotationMatrix: new Matrix4()
};

function addMouseHandler(canvas) {
    let z = 0;

    // 使用鼠标滚轮事件,需要将其设置为null
    window.mozInnerScreenX = null;

    addEvents(canvas, {
        onDragStart(event) {
            appState.mouseDown = true;
            appState.lastMouseX = event.clientX;
            appState.lastMouseY = event.clientY;
        },
        onDragMove(event) {
            if (!appState.mouseDown) {
                return;
            }

            if (appState.lastMouseX !== undefined) {
                const radiansX = (event.x - appState.lastMouseX) / 300;
                const radiansY = -(event.y - appState.lastMouseY) / 300;

                const newMatrix = new Matrix4().rotateX(radiansY).rotateY(radiansX);

                appState.moonRotationMatrix.multiplyLeft(newMatrix);
            }

            appState.lastMouseX = event.x;
            appState.lastMouseY = event.y;
        },
        onMouseWheel(e){

            let isAdd = true;
            if(e.wheel > 0){
                z++;
                isAdd = true;
            }else {
                z--;
                isAdd = false;
            }
            const newMatrix = new Matrix4().scale([z,z,z]);
            isAdd ? z-- : z++;
            appState.moonRotationMatrix.multiplyLeft(newMatrix);
        },
        onDragEnd(e) {
            appState.mouseDown = false;
        }
    });
}
