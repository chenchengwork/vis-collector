import React, { PureComponent, Fragment } from 'react';

/**
 * vtk.js和mapbox的融合方法
 */
// import drawMapbox from './drawMapbox';
// export default class Vtk extends PureComponent {
//     componentDidMount(){
//         drawMapbox();
//     }
//
//     render() {
//         return (
//             <Fragment>
//                 <div id="map" style={{width: "100%", height: 400}}></div>
//             </Fragment>
//         );
//     }
// }



/**
 * three.js和mapbox的融合方法
 */
import drawThree from './drawThree';
export default class ThreeMapbox extends PureComponent {
    componentDidMount(){
        drawThree();
    }

    render() {
        return (
            <Fragment>
                <div id="map" style={{position: "fixed",width: "100%", height: "100%"}}></div>
            </Fragment>
        );
    }
}



