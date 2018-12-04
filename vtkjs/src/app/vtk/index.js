import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkCalculator from 'vtk.js/Sources/Filters/General/Calculator';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';

import vtkCamera from 'vtk.js/Sources/Rendering/Core/Camera';

import customVtkRenderWindow from './CustomVtkRenderWindow';


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

    // 设置自己的相机
    console.log(map.transform)
    const myCamera = vtkCamera.newInstance();
    myCamera.setDistance(map.transform.cameraToCenterDistance);
    myCamera.setClippingRange(1, getFarZ(map));     // 设置相机的前后裁剪平面
    // myCamera.setPosition(512/2, 512/2, 1)


    // {x: 0.7803439666666667, y: 0.3812026096585083, z: 0}
    // mapboxgl.MercatorCoordinate.fromLngLat({ lng: 100.923828, lat: 39.272688 });
    myCamera.setFocalPoint(0.7803439666666667, 0.3812026096585083, 0);  // 设置焦点
    myCamera.setViewAngle(map.transform._fov * 180);    // 定义视角

    // 设置投影矩阵
    myCamera.setProjectionMatrix(
        myCamera.getProjectionMatrix(map.transform.width / map.transform.height, 1, getFarZ(map))
    );

    myCamera.computeViewPlaneNormal(); // 根据设置的相机位置、焦点等信息，重新计算视平面(View Plane)的法向量

    renderer.setActiveCamera(myCamera);


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

