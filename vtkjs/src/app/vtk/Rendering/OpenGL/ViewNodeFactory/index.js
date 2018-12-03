import macro from 'vtk.js/Sources/macro';
import vtkOpenGLViewNodeFactory from 'vtk.js/Sources/Rendering/OpenGL/ViewNodeFactory';
// import vtkOpenGLRenderer from "vtk.js/Sources/Rendering/OpenGL/Renderer";
import vtkOpenGLRenderer from "../Renderer";


const DEFAULT_VALUES = {};

const extend = (publicAPI, model, initialValues = {}) => {
    Object.assign(model, DEFAULT_VALUES, initialValues);

    vtkOpenGLViewNodeFactory.extend(publicAPI, model);

    publicAPI.registerOverride('vtkRenderer', vtkOpenGLRenderer.newInstance);
};

export const newInstance = macro.newInstance(extend);

export default { newInstance, extend };
