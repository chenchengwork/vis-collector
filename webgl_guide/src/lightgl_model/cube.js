import GL from '../lightgl/main';
export default function main() {
    var angle = 0;
    var gl = GL.create();
    var mesh = GL.Mesh.cube();
    var shader = new GL.Shader('\
      void main() {\
        gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;\
      }\
    ', '\
      void main() {\
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\
      }\
    ');

    gl.onupdate = function (seconds) {
        angle += 45 * seconds;
    };

    gl.ondraw = function () {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.loadIdentity();
        gl.translate(0, 0, -5);
        gl.rotate(30, 1, 0, 0);
        gl.rotate(angle, 0, 1, 0);

        shader.draw(mesh);
    };

    gl.fullscreen();
    gl.animate();
}
