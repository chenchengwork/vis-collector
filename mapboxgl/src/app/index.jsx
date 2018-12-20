import React, { Component } from 'react';
import loadable from "../loadable"

const UseMapboxUtil = loadable(import("./UseMapboxUtil"));
const Threejs = loadable(import("./solution/threejs"));
const VtkJS = loadable(import("./solution/vtkjs"));

const ChinaMap = loadable(import("./solution/chinaMap"));
const BeijingMap = loadable(import("./solution/beijingMap"));

export default class Map extends Component {
    render() {
        return (
            <div>
                <UseMapboxUtil />
                {/*<Threejs />*/}
                {/*<VtkJS />*/}
                {/*<ChinaMap />*/}
                {/*<BeijingMap />*/}
            </div>
        );
    }
}
