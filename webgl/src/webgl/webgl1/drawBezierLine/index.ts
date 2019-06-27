import { createProgram, bindVertexBuffer, memoize } from '../../lib/webgl_util';

interface Point{
    x: number;
    y: number;
    z: number;
}

interface Context {
    program: WebGLProgram;
    aPositionLoc: number;
    aColorLoc: number;
    aPosition: {
        data: Float32Array;
        indexes: Uint8Array;
        n: number;
    };
    aColor: Uint8Array;
}

let context: Context;

const drawBezierLine = (gl: WebGLRenderingContext) => {
    const {program, aColorLoc, aPositionLoc, aPosition, aColor} = context;
    gl.useProgram(program);

    bindVertexBuffer(gl, aPosition.data, aPositionLoc, 3, gl.FLOAT, false, 0, 0);

    const indexesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, aPosition.indexes, gl.STATIC_DRAW);


    //---- 获取颜色的位置 -----
    // bindVertexBuffer(gl, aColor, aColorLoc, 3, gl.UNSIGNED_BYTE, true, 0, 0)
    gl.lineWidth(5);    // 设置线宽
    // 解除缓冲区关系
    // gl.drawArrays(gl.LINE_STRIP, 0, aPosition.n);
    // gl.drawArrays(gl.LINES, 0, aPosition.n);
    gl.drawElements(gl.LINES, aPosition.indexes.length, gl.UNSIGNED_BYTE, 0)
};


export default (gl: WebGLRenderingContext) => {
    if (!context) context = getContext(gl);
    drawBezierLine(gl)
}

const getContext = memoize((gl: WebGLRenderingContext):Context => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader");
    const program = createProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);
    const aPositionLoc = gl.getAttribLocation(program, 'aPosition');
    const aColorLoc = gl.getAttribLocation(program, 'aColor');
    const aPosition = getPositions();

    const aColor = getColors();

    return {program, aPositionLoc, aColorLoc, aPosition, aColor };
});

const getPositions = () => {
    let bezierPoint1 = create3DBezier(
        { x : -0.7,  y : 0,   z : 0 },    // p0
        { x : -0.25, y : 0.5, z : 0 },    // p1
        { x : 0.25,  y : 0.5, z : 0 },    // p2
        { x : 0.7,   y : 0,   z : 0 },    // p3
        20,
        1.0
    );

    let bezierPoint2 = create3DBezier(
        { x : -0.5,  y : 0,   z : 0 },    // p0
        { x : -0.25, y : 0.25, z : 0 },    // p1
        { x : 0.25,  y : 0.25, z : 0 },    // p2
        { x : 0.5,   y : 0,   z : 0 },    // p3
        20,
        1.0
    );

    const lineSegment = [
        bezierPoint1,
        bezierPoint2,
    ];

    // bezierPoint1 = [
    //     -0.7, 0, 0,
    //     -0.25, 0.5, 0,
    //
    //     0.25, 0.5, 0,
    //     0.7, 0, 0
    // ]

    const points = [...bezierPoint1, ...bezierPoint2];


    let indexes = [];
    for(let i = 0; i < points.length / 3; i++){
        indexes.push(i);
        if(indexes.length != 0 && indexes.length % 2 == 0 && i != 19){
            indexes.push(i);
        }
    }
    // indexes = [0, 1, 1, 2, 2, 3]
    // console.log('indexes->', indexes)
    // const data = new Float32Array([...bezierPoint1, ...bezierPoint2]);
    const data = new Float32Array(points);
    return {data, indexes: new Uint8Array(indexes), n: data.length / 3}
};


const getColors = () => new Uint8Array([
    200,  70, 120,
    80, 70, 200,
    70, 200, 210
]);



/**
 * 生成四阶贝塞尔曲线定点数据
 * @param p0 {Object}   起始点  { x : number, y : number, z : number }
 * @param p1 {Object}   控制点1 { x : number, y : number, z : number }
 * @param p2 {Object}   控制点2 { x : number, y : number, z : number }
 * @param p3 {Object}   终止点  { x : number, y : number, z : number }
 * @param num {Number}  线条精度
 * @param tick {Number} 绘制系数
 * @returns {Array}
 */
function create3DBezier(p0:Point, p1:Point, p2:Point, p3:Point, num: number, tick: number) {
    let pointMum = num || 100;
    let _tick = tick || 1.0;
    let t = _tick / (pointMum - 1);
    let points = [];
    for (let i = 0; i < pointMum; i++) {
        let point = getBezierNowPoint(p0, p1, p2, p3, i, t);
        points.push(point.x);
        points.push(point.y);
        points.push(point.z);
    }

    return points;
}

/**
 * 四阶贝塞尔曲线公式
 * @param p0
 * @param p1
 * @param p2
 * @param p3
 * @param t
 * @returns {*}
 * @constructor
 */
function Bezier(p0:number, p1:number, p2:number, p3:number, t: number) {
    let P0, P1, P2, P3;
    P0 = p0 * (Math.pow((1 - t), 3));
    P1 = 3 * p1 * t * (Math.pow((1 - t), 2));
    P2 = 3 * p2 * Math.pow(t, 2) * (1 - t);
    P3 = p3 * Math.pow(t, 3);

    return P0 + P1 + P2 + P3;
}

/**
 * 获取四阶贝塞尔曲线中指定位置的点坐标
 * @param p0
 * @param p1
 * @param p2
 * @param p3
 * @param num
 * @param tick
 * @returns {{x, y, z}}
 */
function getBezierNowPoint(p0:Point, p1:Point, p2:Point, p3:Point, num:number, tick:number) {
    return {
        x : Bezier(p0.x, p1.x, p2.x, p3.x, num * tick),
        y : Bezier(p0.y, p1.y, p2.y, p3.y, num * tick),
        z : Bezier(p0.z, p1.z, p2.z, p3.z, num * tick),
    }
}
