import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkCalculator from 'vtk.js/Sources/Filters/General/Calculator';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import customVtkRenderWindow from './CustomVtkRenderWindow';
import { vec3, mat4 } from 'gl-matrix';

export const getActor = (map) => {
    const coneSource = vtkConeSource.newInstance({height: 1.0});
    const filter = vtkCalculator.newInstance();

    filter.setInputConnection(coneSource.getOutputPort());
    filter.setFormula({
        getArrays: (inputDataSets) => ({
            input: [],
            output: [
                {
                    location: FieldDataTypes.CELL,
                    name: 'Random',
                    dataType: 'Float32Array',
                    attribute: AttributeTypes.SCALARS,
                },
            ],
        }),
        evaluate: (arraysIn, arraysOut) => {
            const [scalars] = arraysOut.map((d) => d.getData());
            for (let i = 0; i < scalars.length; i++) {
                scalars[i] = Math.random();
            }
        },
    });

    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(filter.getOutputPort());

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);

    return actor;
};

export const render = (gl, matrix, map,  actor) => {

    const customVtkRender = customVtkRenderWindow.newInstance({
        container: map.getCanvas(),
        myGL: gl
    });

    const renderer = customVtkRender.getRenderer();
    const renderWindow = customVtkRender.getRenderWindow();

    renderer.addActor(actor);

    //------------ 设置自己的相机 start ------------------
    const myCamera = renderer.makeCamera();

    const scale = 0.01;
    const projectionMatrix = new Float32Array(matrix);
    const translateMatrix =mat4.fromTranslation(mat4.create(), vec3.fromValues(0.7803439666666667, 0.3812026096585083, 0));
    const scaleMatrix = mat4.fromScaling(mat4.create(), vec3.fromValues(scale, -scale, scale));

    // 模型矩阵(平移和缩放)
    const modelMatrix = mat4.multiply(mat4.create(), translateMatrix, scaleMatrix);
    // 投影矩阵 * 模型矩阵
    const finalMatrix = mat4.multiply(mat4.create(), projectionMatrix, modelMatrix);

    myCamera.setViewMatrix(mat4.create());
    myCamera.setProjectionMatrix(finalMatrix);
    myCamera.computeViewPlaneNormal();          // 根据设置的相机位置、焦点等信息，重新计算视平面(View Plane)的法向量
    renderer.setActiveCamera(myCamera);
    //------------ 设置自己的相机 end ------------------

    renderWindow.render();
    map.triggerRepaint();
};

// 获取后裁剪面的距离
const getFarZ = (map) => {
    const fov = 0.6435011087932844;
    let cameraToCenterDistance = map.transform.cameraToCenterDistance;
    const halfFov = fov / 2;
    const groundAngle = Math.PI / 2 + map.transform._pitch;
    const topHalfSurfaceDistance = Math.sin(halfFov) * cameraToCenterDistance / Math.sin(Math.PI - groundAngle - halfFov);

    // Calculate z distance of the farthest fragment that should be rendered.
    const furthestDistance = Math.cos(Math.PI / 2 - map.transform._pitch) * topHalfSurfaceDistance + cameraToCenterDistance;

    // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
    const farZ = furthestDistance * 1.01;

    return farZ;
}

