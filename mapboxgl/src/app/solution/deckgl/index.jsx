import React, { PureComponent } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL from 'react-map-gl';
const ACCESS_TOKEN = 'pk.eyJ1IjoiY2hlbmNoZW5nMTIiLCJhIjoiY2poN2JjcmJuMDY1cjJ3cDl0OG0xeWxzdyJ9.Jyy5bvJDCvtjPXSPZMazTg';

export default class DeckGL extends PureComponent{
    state = {
        viewport: {
            mapboxApiAccessToken: ACCESS_TOKEN,
            mapStyle: {
                "version": 8,
                "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
                // "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
                sources: {},
                layers: []
            },
            disableTokenWarning: true,
            width: "100%",
            height: "100%",
            latitude: 37.7577,
            longitude: -122.4376,
            zoom: 8,
            style:{
                position: "fixed",
                padding: 0,
                margin: 0
            },
            onLoad: (e) => {
                console.log(e.target.getStyle())
            }
        }
    };
    render(){
        return (
            <ReactMapGL
                {...this.state.viewport}
                onViewportChange={(viewport) => {
                    // console.log(111, viewport)
                    this.setState({viewport: {...viewport, mapStyle: {
                                "version": 8,
                                "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
                                // "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
                                sources: {},
                                layers: []
                            },}})
                }}
            />
        );
    }
}
