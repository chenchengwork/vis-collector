import macro from 'vtk.js/Sources/macro';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';

import vtkOpenGLViewNodeFactory from "../ViewNodeFactory";

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


    model.myFactory = vtkOpenGLViewNodeFactory.newInstance();
    /* eslint-disable no-use-before-define */
    model.myFactory.registerOverride('vtkRenderWindow', newInstance);
    /* eslint-enable no-use-before-define */

    vtkOpenGLRender(publicAPI, model);
};

export const newInstance = macro.newInstance(extend);

export default { newInstance, extend };
