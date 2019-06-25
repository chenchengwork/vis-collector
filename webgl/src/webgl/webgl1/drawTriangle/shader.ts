export const SHADER_VERTEX = `
    attribute vec4 aVertexPosition;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main(void) {
        gl_Position = aVertexPosition;
        v_Color = a_Color;
    }
`;

export const SHADER_FRAGMENT = `
    #ifdef GL_ES
    precision highp float;
    #endif
    
    varying vec4 v_Color;
    void main(void) {
        // gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
        gl_FragColor = v_Color;
    }
`;
