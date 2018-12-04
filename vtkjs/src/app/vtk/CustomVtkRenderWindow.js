import macro from 'vtk.js/Sources/macro';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';

// import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';
// import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';


import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkOpenGLRenderWindow from './Rendering/OpenGL/RenderWindow';


function customVtkRenderWindow(publicAPI, model) {
    // VTK renderWindow/renderer
    model.renderWindow = vtkRenderWindow.newInstance();
    model.renderer = vtkRenderer.newInstance();
    model.renderWindow.addRenderer(model.renderer);

    // 实例化webgl渲染窗口
    model.openGLRenderWindow = vtkOpenGLRenderWindow.newInstance({
        myGL: model.myGL
    });
    window.x = model.openGLRenderWindow;
    model.renderWindow.addView(model.openGLRenderWindow);

    // 交互设置
    // model.interactor = vtkRenderWindowInteractor.newInstance();
    // model.interactor.setInteractorStyle(
    //     vtkInteractorStyleTrackballCamera.newInstance()
    // );
    // model.interactor.setView(model.openGLRenderWindow);
    // model.interactor.initialize();
    // model.interactor.bindEvents(model.container);


    // Handle window resize
    // 重新设置视口大小
    publicAPI.resize = () => {
        const dims = model.container.getBoundingClientRect();
        const devicePixelRatio = window.devicePixelRatio || 1;
        model.openGLRenderWindow.setSize(
            Math.floor(dims.width * devicePixelRatio),
            Math.floor(dims.height * devicePixelRatio)
        );
        if (model.resizeCallback) {
            model.resizeCallback(dims);
        }
        model.renderWindow.render();
    };

    publicAPI.setResizeCallback = (cb) => {
        model.resizeCallback = cb;
        publicAPI.resize();
    };

    if (model.listenWindowResize) {
        window.addEventListener('resize', publicAPI.resize);
    }

    publicAPI.resize();
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
    background: [0.32, 0.34, 0.43],
    containerStyle: null,
    controlPanelStyle: null,
    listenWindowResize: true,
    resizeCallback: null,
    controllerVisibility: true,
    myGL: null,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
    Object.assign(model, DEFAULT_VALUES, initialValues);

    // Object methods
    macro.obj(publicAPI, model);
    macro.get(publicAPI, model, [
        'renderWindow',
        'renderer',
        'openGLRenderWindow',
        'interactor',
    ]);

    // Object specific methods
    customVtkRenderWindow(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend);

// ----------------------------------------------------------------------------

export default { newInstance, extend };
