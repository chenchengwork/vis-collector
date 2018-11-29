import macro from 'vtk.js/Sources/macro';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';

const STYLE_CONTAINER = {
    margin: '0',
    padding: '0',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
};

function applyStyle(el, style) {
    Object.keys(style).forEach((key) => {
        el.style[key] = style[key];
    });
}

function vtkFullScreenRenderWindow(publicAPI, model) {
    // Full screen DOM handler
    if (!model.rootContainer) {
        model.rootContainer = document.querySelector('body');
    }

    if (!model.container) {
        model.container = document.createElement('div');
        applyStyle(model.container, model.containerStyle || STYLE_CONTAINER);
        model.rootContainer.appendChild(model.container);
    }

    // VTK renderWindow/renderer
    model.renderWindow = vtkRenderWindow.newInstance();
    model.renderer = vtkRenderer.newInstance();
    model.renderWindow.addRenderer(model.renderer);

    // OpenGlRenderWindow
    model.openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();
    model.openGLRenderWindow.setContainer(model.container);
    model.renderWindow.addView(model.openGLRenderWindow);

    // Interactor
    model.interactor = vtkRenderWindowInteractor.newInstance();
    model.interactor.setInteractorStyle(
        vtkInteractorStyleTrackballCamera.newInstance()
    );
    model.interactor.setView(model.openGLRenderWindow);
    model.interactor.initialize();
    model.interactor.bindEvents(model.container);

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
        'rootContainer',
        'container',
        'controlContainer',
    ]);

    // Object specific methods
    vtkFullScreenRenderWindow(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend);

// ----------------------------------------------------------------------------

export default { newInstance, extend };
