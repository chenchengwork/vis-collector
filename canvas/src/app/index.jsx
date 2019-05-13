import React, { PureComponent } from 'react';

const coms = [
    // require("./TestReactHook").default,
    require("./TestTopo").default,
];

export default class Index extends PureComponent {

    render() {
        return coms.map((Com, index) => <Com key={index} />)
    }
}



