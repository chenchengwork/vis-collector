export const SHADER_VERTEX = `
    attribute vec4 aPosition;
    attribute vec4 aColor;
    attribute vec4 aNormal;
    uniform mat4 uMvpMatrix;
    uniform mat4 uInverseTransposeModelMatrix;
    varying vec4 vColor;
    varying vec4 vNormal;
    void main(void) {
        gl_Position = uMvpMatrix * aPosition;
        vColor = aColor;
        vNormal = uInverseTransposeModelMatrix * aNormal;
    }
`;

export const SHADER_FRAGMENT = `
    #ifdef GL_ES
    precision highp float;
    #endif
    varying vec4 vColor;
    varying vec4 vNormal;
    uniform vec3 uLightDirection;
    uniform vec4 uLightColor;
    
    void main(void) {
        // gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
        float light = dot(normalize(vec3(vNormal)), uLightDirection);
        vec4 realColor = uLightColor;
        
        gl_FragColor = realColor;
        gl_FragColor.rgb *= light;
    }
`;
