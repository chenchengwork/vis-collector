import React, { Component } from 'react';
import UseMapboxUtil from './UseMapboxUtil';
import Threejs from './solution/threejs';
import VtkJS from './solution/vtkjs';

import ChinaMap from './solution/chinaMap';
import BeijingMap from './solution/beijingMap';

export default class Map extends Component {
    render() {
        return (
            <div>
                {/*<UseMapboxUtil />*/}
                {/*<Threejs />*/}
                <VtkJS />
                {/*<ChinaMap />*/}
                {/*<BeijingMap />*/}
            </div>
        );
    }
}
