export const SHADER_VERTEX = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    attribute vec3 aOffset;
    varying vec3 vColor;
    void main(void) {
      vColor = aColor;
      gl_Position = vec4(aPosition + aOffset, 1.0);
    }
`;

export const SHADER_FRAGMENT = `
   precision highp float;
   varying vec3 vColor;
    void main(void) {
      gl_FragColor = vec4(vColor, 1.0);
    }
`;
