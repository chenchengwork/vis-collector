import React, { PureComponent } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL from 'react-map-gl';
const ACCESS_TOKEN = 'pk.eyJ1IjoiY2hlbmNoZW5nMTIiLCJhIjoiY2poN2JjcmJuMDY1cjJ3cDl0OG0xeWxzdyJ9.Jyy5bvJDCvtjPXSPZMazTg';

const mapStyle = {
    "version": 8,
    "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
    // "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
    sources: {
        "osm-tile_e3153e21-9e81-402a-c011-5312369292d8":{
            "type":"raster",
            "tiles":[
                "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
            ],
            "tileSize":256
        }
    },
    layers: [
        {
            "id":"osm-tile_e3153e21-9e81-402a-c011-5312369292d8",
            "type":"raster",
            "source":"osm-tile_e3153e21-9e81-402a-c011-5312369292d8"
        }
    ]
};


export default class BaseMap extends PureComponent{
    state = {
        viewport: {
            mapboxApiAccessToken: ACCESS_TOKEN,
            mapStyle,
            disableTokenWarning: true,      // 禁止token警告
            width:  window.innerWidth,      // 容器宽度
            height:  window.innerHeight,    // 容器高度
            longitude: 100.923828,      // 中心点 经度
            latitude: 39.272688,        // 中心点 纬度
            zoom: 3,                    // 缩放等级
            style:{                     // 定义容器的样式
                position: "fixed",
                padding: 0,
                margin: 0
            },
            getCursor: (state) => console.log(state),
            onLoad: (e) => {
                const map = e.target;
                var features = map.queryRenderedFeatures(
                    // [100.923828, 39.272688],
                    map.getBounds(),
                    // { layers: ['osm-tile_e3153e21-9e81-402a-c011-5312369292d8'] }
                );
                console.log(features)
                // console.log(map.getStyle())
            }
        }
    };

    componentDidMount() {
        console.log(this.mapRef.getMap());
        window.addEventListener("resize", this.resize)
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize);
    }

    resize = () => {
        this.setState({
            viewport: {
                ...this.state.viewport,
                width: window.innerWidth,
                height: window.innerHeight,
            }
        })
    };


    render(){
        return (
            <ReactMapGL
                ref={(ref) => this.mapRef = ref}
                {...this.state.viewport}
                onViewportChange={(viewport, interactionState, oldViewState) => {
                    this.setState({viewport: {...viewport, mapStyle}})
                }}
            />
        );
    }
}
