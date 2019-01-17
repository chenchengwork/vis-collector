import { PureComponent } from 'react';
import DrawByPlotty from './DrawByPlotty';
import DrawByMapbox from './DrawByMapbox';


export default class GeoTiff extends PureComponent{

    render(){
        // return (<DrawByPlotty />)
        return ( <DrawByMapbox />)
    }
}

