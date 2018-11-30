import React, { PureComponent, Fragment } from 'react';


// import testVtk from './testVtk';
// import drawMapbox from './drawMapbox';
//
// class Vtk extends PureComponent {
//
//     componentDidMount(){
//         console.log()
//         testVtk(this.container, this.canvas);
//
//         drawMapbox();
//     }
//
//     render() {
//
//         return (
//             <Fragment>
//                 <div id="map" style={{width: "100%", height: 400}}></div>
//
//                 <div ref={(ref) => this.container = ref} style={{width: 400, height: 400}}>
//                     <canvas ref={(ref) => this.canvas = ref } width={720} height={720}>当前浏览器不支持canvas</canvas>
//                 </div>
//             </Fragment>
//         );
//     }
// }
//
//
//


// import drawThreebox from './drawThreebox';
import drawThree from './drawThree';


class Three extends PureComponent {

    componentDidMount(){
        // drawThreebox();
        drawThree();
    }

    render() {

        return (
            <Fragment>
                <div id="map" style={{width: "100%", height: 400}}></div>


            </Fragment>
        );
    }
}

export default Three;



