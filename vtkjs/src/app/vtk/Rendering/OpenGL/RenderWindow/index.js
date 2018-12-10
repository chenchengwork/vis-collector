import macro from 'vtk.js/Sources/macro';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkOpenGLViewNodeFactory from 'vtk.js/Sources/Rendering/OpenGL/ViewNodeFactory';
import vtkOpenGLRenderer from "../Renderer";
// import OpenGLRenderer from "vtk.js/Sources/Rendering/OpenGL/Renderer";


const vtkOpenGLRender = (publicAPI, model) => {
    // 获取3D上下文
    publicAPI.get3DContext = () => model.myGL;
};

const DEFAULT_VALUES = {
    myGL: null,     //
};

const extend = (publicAPI, model, initialValues = {}) => {
    Object.assign(model, DEFAULT_VALUES, initialValues);
    vtkOpenGLRenderWindow.extend(publicAPI, model);

    model.myFactory = vtkOpenGLViewNodeFactory.newInstance();
    model.myFactory.registerOverride('vtkRenderWindow', newInstance);
    model.myFactory.registerOverride('vtkRenderer', vtkOpenGLRenderer.newInstance);

    vtkOpenGLRender(publicAPI, model);
};

export const newInstance = macro.newInstance(extend);

export default { newInstance, extend };
