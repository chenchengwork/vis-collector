import 'vtk.js/Sources/favicon';

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkCalculator from 'vtk.js/Sources/Filters/General/Calculator';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
// import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkFullScreenRenderWindow from './VtkRender';

import macro from 'vtk.js/Sources/macro';

export default (container, canvas) => {
    testMacro();

    const gl = canvas.getContext("webgl");

    // ----------------------------------------------------------------------------
    // Standard rendering code setup
    // ----------------------------------------------------------------------------


    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        background: [0, 0, 0],
        // container: container,
        myGL: gl
    });

    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    // ----------------------------------------------------------------------------
    // Example code
    // ----------------------------------------------------------------------------
    // create a filter on the fly, sort of cool, this is a random scalars
    // filter we create inline, for a simple cone you would not need
    // this
    // ----------------------------------------------------------------------------

    const coneSource = vtkConeSource.newInstance({height: 1.0});
    const filter = vtkCalculator.newInstance();

    filter.setInputConnection(coneSource.getOutputPort());
    // filter.setFormulaSimple(FieldDataTypes.CELL, [], 'random', () => Math.random());
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

    renderer.addActor(actor);
    renderer.resetCamera();
    renderWindow.render();
}


const testMacro = () => {
    // // 设置字符串的首字母为大写
    // console.log(macro.capitalize("abc"));
    //
    // // 设置字符串的首字母为小写
    // console.log(macro.uncapitalize("Abc"));
    //
    // // 格式化byte(字节)为单位的最近单位的字符串
    // console.log(macro.formatBytesToProperUnit(1024))        // 1.02 KB
    // console.log(macro.formatBytesToProperUnit(1024 * 1024)) // 1.05 MB
    // console.log(macro.formatBytesToProperUnit(1024 * 1024 * 1024))  // 1.07 GB
    // console.log(macro.formatBytesToProperUnit(1024 * 1024 * 1024 * 1024)) // 1.10 TB
    //
    // // 将大数值以1000为单元, 替换成指定的分隔符进行显示
    // console.log(macro.formatNumbersWithThousandSeparator(1000000000, ","));
    //
    // // macro.safeArrays 将传入的对象属性为为数组的,对该属性的数组浅clone
    // const myArray = [1];
    // const myModel = {a: myArray};
    // macro.safeArrays(myModel);
    // myArray.push(2);    // 经过安全处理后, 在数组中push一个新数值, 但myModel.a仍然是[1]
    // console.log(myModel);
    //
    //
    // // 获取可枚举的对象key
    // console.log(macro.enumToString({a: 1}, 1)); // a
    //
    // // 生成vtkObject
    // console.log(macro.obj({}, {}));
    //
    //
    // // 将modal对象中的值, 通过指定key生成,能获取公共方法的publicAPI对象
    // const myPublicAPI_1 = {};
    // const myModel_1 = {name: "chencheng", age: 22};
    // macro.get(myPublicAPI_1, myModel_1, [
    //     "name", "age"
    // ]);
    // console.log(myPublicAPI_1.getName());
    // console.log(myPublicAPI_1.getAge());


    // 将modal对象中的值, 通过指定key生成,能获取公共方法的publicAPI对象
    const myPublicAPI_2 = {};
    const myModel_2 = {name: "chencheng", age: 22};
    macro.obj(myPublicAPI_2, myModel_2);        //
    macro.setGet(myPublicAPI_2, myModel_2, [
        "name", "age"
    ]);
    myPublicAPI_2.setName("hello chencheng")
    console.log(myPublicAPI_2.getName());


    // // 顺序执行传入相同参数的多个方法
    // const aFn = (a) => {
    //     console.log(a);
    //     return a + 1;
    // };
    // const bFn = (a) => {
    //     console.log(a);
    //     return a + 1;
    // };
    // macro.chain(aFn, bFn)("abc");

};
