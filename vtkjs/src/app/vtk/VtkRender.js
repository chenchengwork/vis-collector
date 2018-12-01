import macro from 'vtk.js/Sources/macro';
// import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkOpenGLRenderWindow from './VtkOpenGLRender';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';

function vtkFullScreenRenderWindow(publicAPI, model) {
    // VTK renderWindow/renderer
    model.renderWindow = vtkRenderWindow.newInstance();
    model.renderer = vtkRenderer.newInstance();
    model.renderWindow.addRenderer(model.renderer);

    // 实例化webgl渲染窗口
    model.openGLRenderWindow = vtkOpenGLRenderWindow.newInstance({
        myGL: model.myGL
    });
    model.renderWindow.addView(model.openGLRenderWindow);

    // 交互设置
    // model.interactor = vtkRenderWindowInteractor.newInstance();
    // model.interactor.setInteractorStyle(
    //     vtkInteractorStyleTrackballCamera.newInstance()
    // );
    // model.interactor.setView(model.openGLRenderWindow);
    // model.interactor.initialize();
    // model.interactor.bindEvents(model.container);

    // Expose background
    publicAPI.setBackground = model.renderer.setBackground;

    // Update BG color
    publicAPI.setBackground(...model.background);

    // Handle window resize
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

    // publicAPI.resize();
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
    vtkFullScreenRenderWindow(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend);

// ----------------------------------------------------------------------------

export default { newInstance, extend };