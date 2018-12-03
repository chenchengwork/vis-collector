// --------- 导入webgl model -----------

import rotateTriangles from './webgl_model/rotateTriangles';
import drawTriangles from './webgl_model/drawTriangles';
import texture from './webgl_model/texture';
import LookAtTrianglesWithKeys from './webgl_model/LookAtTrianglesWithKeys';
import testOrtho from './webgl_model/testOrtho';
import drawCube from './webgl_model/drawCube';
import drawLightedCube from './webgl_model/drawLightedCube';
import drawPointLightedCube from './webgl_model/drawPointLightedCube';
import drawPointLightedCube_preFragment from './webgl_model/drawPointLightedCube_preFragment';
import drawJointModel from './webgl_model/drawJointModel';

// --------- 导入lightgl model -----------


// --------- 导入twgl model -----------




// --------- 执行webgl -----------
(() => {
    // rotateTriangles();
    // drawTriangles();
    // texture();
    // LookAtTrianglesWithKeys();
    // testOrtho();
    // drawCube();
    // drawLightedCube();
    // drawPointLightedCube();
    drawPointLightedCube_preFragment();
    // drawJointModel();
})();


// --------- 执行lightgl -----------

(() => {

})();


// --------- 执行twgl -----------

(() => {

})();

