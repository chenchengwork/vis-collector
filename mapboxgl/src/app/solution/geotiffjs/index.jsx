import { PureComponent } from 'react';
import DrawByPlotty from './DrawByPlotty';
import DrawByMapbox from './DrawByMapbox';
import DrawByTwgl from './DrawByTwgl';


export default class GeoTiff extends PureComponent{

    render(){
        // return (<DrawByPlotty />)
        return ( <DrawByMapbox />)
        // return ( <DrawByTwgl />)
    }
}

