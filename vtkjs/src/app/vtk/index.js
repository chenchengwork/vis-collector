import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkCalculator from 'vtk.js/Sources/Filters/General/Calculator';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';

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
    renderer.resetCamera(null, map);
    renderWindow.render();
}

