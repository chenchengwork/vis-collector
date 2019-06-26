export const SHADER_VERTEX = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    uniform mat4 uMatrix;
    varying vec4 vColor;
    void main(void) {
        gl_Position = uMatrix * aPosition;
        vColor = aColor;
    }
`;

export const SHADER_FRAGMENT = `
    #ifdef GL_ES
    precision highp float;
    #endif
    varying vec4 vColor;
    
    void main(void) {
        // gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
        gl_FragColor = vColor;
    }
`;
