import macro from 'vtk.js/Sources/macro';
import OpenGLRenderer from "vtk.js/Sources/Rendering/OpenGL/Renderer";

function vtkOpenGLRenderer(publicAPI, model){
    // 禁止渲染之前自动清除其输出
    publicAPI.clear = () => {
        // console.log("override gl clear");
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
