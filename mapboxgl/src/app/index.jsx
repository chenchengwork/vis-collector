import React from 'react';
import loadable from "../loadable"
import "./index.scss"
const EnumComponents = [
    // loadable(import("./UseMapboxUtil")),
    // loadable(import("./solution/deckgl/TripsLayer")),    // 测试deckgl
    loadable(import("./solution/geotiffjs")),
    // loadable(import("./solution/threejs")),      // 测试threejs
    // loadable(import("./solution/vtkjs")),        // 测试vtkjs
    // loadable(import("./solution/chinaMap")),     // 测试chinaMap
    // loadable(import("./solution/beijingMap"))    // 测试beijingMap
];

export default  () => EnumComponents.map((V_Component, index) => <V_Component key={index}/>);

