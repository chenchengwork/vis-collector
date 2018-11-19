import React, { PureComponent } from 'react';
import testVtk from './testVtk';
/*
  SVG SMIL animation动画详解
  https://www.zhangxinxu.com/wordpress/2014/08/so-powerful-svg-smil-animation/
 */

export default class Index extends PureComponent {

    componentDidMount(){
        testVtk()
    }

    render() {

        return (
            <div>
                vtk.js
            </div>
        );
    }
}



