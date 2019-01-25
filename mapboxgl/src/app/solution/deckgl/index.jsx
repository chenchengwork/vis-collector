import React from 'react';
import loadable from "../../../loadable"
const EnumComponents = [
    loadable(import("./ArcLayer")),
    // loadable(import("./BaseMap")),    // 测试deckgl
];

export default  () => EnumComponents.map((V_Component, index) => <V_Component key={index}/>);

