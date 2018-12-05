import macro from 'vtk.js/Sources/macro';
import OpenGLRenderer from "vtk.js/Sources/Rendering/OpenGL/Renderer";

function vtkOpenGLRenderer(publicAPI, model){
    // 禁止渲染之前自动清除其输出
    publicAPI.clear = () => {
        // console.log("override gl clear");

        let clearMask = 0;
        const gl = model.context;

        if (!model.renderable.getTransparent()) {
            const background = model.renderable.getBackgroundByReference();
            // renderable ensures that background has 4 entries.
            model.context.clearColor(
                background[0],
                background[1],
                background[2],
                background[3]
            );
            clearMask |= gl.COLOR_BUFFER_BIT;
        }

        if (!model.renderable.getPreserveDepthBuffer()) {
            gl.clearDepth(1.0);
            clearMask |= gl.DEPTH_BUFFER_BIT;
            // gl.depthMask(true);
        }

        gl.colorMask(true, true, true, true);

        const ts = publicAPI.getTiledSizeAndOrigin();
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(ts.lowerLeftU, ts.lowerLeftV, ts.usize, ts.vsize);
        gl.viewport(ts.lowerLeftU, ts.lowerLeftV, ts.usize, ts.vsize);

        // gl.clear(clearMask);

        gl.enable(gl.DEPTH_TEST);
    }
}

const DEFAULT_VALUES = {};

const extend = (publicAPI, model, initialValues = {}) => {
    Object.assign(model, DEFAULT_VALUES, initialValues);

    OpenGLRenderer.extend(publicAPI, model);

    vtkOpenGLRenderer(publicAPI, model);
};

export const newInstance = macro.newInstance(extend);

export default { newInstance, extend };
