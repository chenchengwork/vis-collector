import macro from 'vtk.js/Sources/macro';
import Renderer from "vtk.js/Sources/Rendering/Core/Renderer";
import vtkMath from "vtk.js/Sources/Common/Core/Math";
const { vtkDebugMacro, vtkErrorMacro, vtkWarningMacro } = macro;

function vtkRenderer(publicAPI, model){
    const RESET_CAMERA_EVENT = {
        type: 'ResetCameraEvent',
        renderer: publicAPI,
    };

    publicAPI.resetCamera = (bounds = null, map) => {
        // {x: 0.7803439666666667, y: 0.3812026096585083, z: 0}
        let viewAngle = 30.0;     // 视角角度
        if(map) {
            console.log('map.transform->', map.transform);
            console.log('地图绕X轴的旋转角度->', map.transform._pitch);
            console.log('地图绕Z轴的旋转角度->', map.transform.angle);
            viewAngle = map.transform._fov * 180
        }


        const boundsToUse = bounds || publicAPI.computeVisiblePropBounds();
        const center = [0, 0, 0];

        if (!vtkMath.areBoundsInitialized(boundsToUse)) {
            vtkDebugMacro('Cannot reset camera!');
            return false;
        }

        let vn = null;

        if (publicAPI.getActiveCamera()) {
            vn = model.activeCamera.getViewPlaneNormal();
        } else {
            vtkErrorMacro('Trying to reset non-existant camera');
            return false;
        }

        // Reset the perspective zoom factors, otherwise subsequent zooms will cause
        // the view angle to become very small and cause bad depth sorting.
        model.activeCamera.setViewAngle(viewAngle);

        center[0] = (boundsToUse[0] + boundsToUse[1]) / 2.0;
        center[1] = (boundsToUse[2] + boundsToUse[3]) / 2.0;
        center[2] = (boundsToUse[4] + boundsToUse[5]) / 2.0;

        let w1 = boundsToUse[1] - boundsToUse[0];
        let w2 = boundsToUse[3] - boundsToUse[2];
        let w3 = boundsToUse[5] - boundsToUse[4];
        w1 *= w1;
        w2 *= w2;
        w3 *= w3;
        let radius = w1 + w2 + w3;

        // If we have just a single point, pick a radius of 1.0
        radius = radius === 0 ? 1.0 : radius;

        // compute the radius of the enclosing sphere
        radius = Math.sqrt(radius) * 0.5;

        // default so that the bounding sphere fits within the view fustrum

        // compute the distance from the intersection of the view frustum with the
        // bounding sphere. Basically in 2D draw a circle representing the bounding
        // sphere in 2D then draw a horizontal line going out from the center of
        // the circle. That is the camera view. Then draw a line from the camera
        // position to the point where it intersects the circle. (it will be tangent
        // to the circle at this point, this is important, only go to the tangent
        // point, do not draw all the way to the view plane). Then draw the radius
        // from the tangent point to the center of the circle. You will note that
        // this forms a right triangle with one side being the radius, another being
        // the target distance for the camera, then just find the target dist using
        // a sin.
        const angle = vtkMath.radiansFromDegrees(model.activeCamera.getViewAngle());
        const parallelScale = radius;
        const distance = radius / Math.sin(angle * 0.5);

        // check view-up vector against view plane normal
        const vup = model.activeCamera.getViewUp();
        if (Math.abs(vtkMath.dot(vup, vn)) > 0.999) {
            vtkWarningMacro('Resetting view-up since view plane normal is parallel');
            model.activeCamera.setViewUp(-vup[2], vup[0], vup[1]);
        }

        // update the camera
        model.activeCamera.setFocalPoint(center[0], center[1], center[2]);
        model.activeCamera.setPosition(
            center[0] + distance * vn[0],
            center[1] + distance * vn[1],
            center[2] + distance * vn[2]
        );

        publicAPI.resetCameraClippingRange(boundsToUse);

        // setup default parallel scale
        model.activeCamera.setParallelScale(parallelScale);

        // update reasonable world to physical values
        model.activeCamera.setPhysicalScale(radius);
        model.activeCamera.setPhysicalTranslation(
            -center[0],
            -center[1],
            -center[2]
        );

        // Here to let parallel/distributed compositing intercept
        // and do the right thing.
        publicAPI.invokeEvent(RESET_CAMERA_EVENT);

        return true;
    };
}

const DEFAULT_VALUES = {};

const extend = (publicAPI, model, initialValues = {}) => {
    Object.assign(model, DEFAULT_VALUES, initialValues);

    Renderer.extend(publicAPI, model);

    vtkRenderer(publicAPI, model);
};

export const newInstance = macro.newInstance(extend);

export default { newInstance, extend };
