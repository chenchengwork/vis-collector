import React, { PureComponent } from 'react';
import testVtk from './testVtk';
/*
  SVG SMIL animation动画详解
  https://www.zhangxinxu.com/wordpress/2014/08/so-powerful-svg-smil-animation/
 */

export default class Index extends PureComponent {

    componentDidMount(){
        console.log()
        testVtk(this.container, this.canvas)
    }

    render() {

        return (
            <div ref={(ref) => this.container = ref} style={{width: 400, height: 400}}>
                {/*<canvas ref={(ref) => this.canvas = ref } width={400} height={400}>当前浏览器不支持canvas</canvas>*/}
            </div>
        );
    }
}



