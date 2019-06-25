import { initProgram, memoize } from '../../lib/webgl_util';

const getOffsetArray = memoize((count: number) => {
    const offsetArray = [];
    for(let i = 0;i < count;i ++){
        for(let j = 0; j < count; j ++){
            const x = ((i + 1) - count / 2) / count * 4;
            const y = ((j + 1) - count / 2) / count * 4;
            const z = 0;
            offsetArray.push(x,y,z);
        }
    }

    return offsetArray;
});

// 参考文章： https://segmentfault.com/a/1190000017048578
const drawTriangle = (gl: WebGL2RenderingContext, program: WebGLProgram, data: number[]): number => {
    const count = 10;
    const positions = new Float32Array([
        -1/count, 1/count, 0.0,
        -1/count, -1/count, 0.0,
        1/count, 1/count, 0.0,
        1/count, -1/count, 0.0,
    ]);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const colors = new Float32Array([
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,
    ]);
    const colorBuffer = gl.createBuffer();
    const aColor = gl.getAttribLocation(program, 'aColor');
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    const indices = new Uint8Array([
        0,1,2,
        2,1,3
    ]);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW); //给缓冲区填充数据


    const offsetArray = getOffsetArray(count);
    const offsets = new Float32Array(offsetArray);

    const offsetBuffer = gl.createBuffer();
    const aOffsetLocation = gl.getAttribLocation(program, 'aOffset');
    gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, offsets, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aOffsetLocation);
    gl.vertexAttribPointer(aOffsetLocation, 3, gl.FLOAT, false, 12, 0);
    gl.vertexAttribDivisor(aOffsetLocation, 1);

    gl.drawElementsInstanced(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0, count * count);

    return count * count;
};

export default (gl: WebGL2RenderingContext, data: number[]) => {
    const { SHADER_VERTEX, SHADER_FRAGMENT } = require("./shader");
    const program = initProgram(gl, SHADER_VERTEX, SHADER_FRAGMENT);

    drawTriangle(gl, program, data)
}
