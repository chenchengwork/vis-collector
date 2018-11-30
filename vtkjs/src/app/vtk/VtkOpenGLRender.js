import macro from 'vtk.js/Sources/macro';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';

const vtkOpenGLRender = (publicAPI, model) => {

    // 获取3D上下文
    publicAPI.get3DContext = () => {
        // model.webgl2 = true;
        return model.myGL;
    };
};

const DEFAULT_VALUES = {
    myGL: null,     //
};

const extend = (publicAPI, model, initialValues = {}) => {
    Object.assign(model, DEFAULT_VALUES, initialValues);

    vtkOpenGLRenderWindow.extend(publicAPI, model);

    vtkOpenGLRender(publicAPI, model);
};

export const newInstance = macro.newInstance(extend);

export default { newInstance, extend };
