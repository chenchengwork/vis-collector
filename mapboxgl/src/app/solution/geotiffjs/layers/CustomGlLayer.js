import mapboxgl from "mapbox-gl";

export default class CustomGlLayer{
    id = 'customGlLayer';
    type = 'custom';

    onAdd(map, gl) {
        const vertexSource = "" +
            "uniform mat4 u_matrix;" +
            "attribute vec2 a_pos;" +
            "void main() {" +
            "    gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);" +
            "}";

        const fragmentSource = "" +
            "void main() {" +
            "    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);" +
            "}";

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        this.aPos = gl.getAttribLocation(this.program, "a_pos");

        const helsinki = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 25.004, lat: 60.239 });
        const berlin = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 13.403, lat: 52.562 });
        const kyiv = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 30.498, lat: 50.541 });
        //
        // console.log("helsinki =>", helsinki)
        // var coord = new mapboxgl.MercatorCoordinate(1, 0.5, 0);
        // console.log(coord.toLngLat());


        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            helsinki.x, helsinki.y,
            berlin.x, berlin.y,
            kyiv.x, kyiv.y,
        ]), gl.STATIC_DRAW);
    }

    render(gl, matrix) {
        gl.useProgram(this.program);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, matrix);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.aPos);
        gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    }
}
