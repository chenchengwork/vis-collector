import "mapbox-gl/dist/mapbox-gl.css";
import { PureComponent } from 'react';
import mapboxgl from 'mapbox-gl';
// import WindLayer from './layer/WindLayer';

import drawWind from './drawWind';

export default class ChinaMap extends PureComponent{

    componentDidMount() {
        const map = new mapboxgl.Map({
            container: this.containerRef,
            // style: 'mapbox://styles/mapbox/streets-v9',
            style:{
                "version": 8,
                "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
                "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
                "sources": {},
                "layers": []
            },
            center: [116.2317,39.9427],  // 北京中心点
            zoom: 4,
            pitch: 0
        });

        map.on('load', () => {
            this.addOsmLayer(map);
            console.log(map.getBounds())
            const canvas = document.createElement("canvas");
            map.addSource('wind_canvas', {
                type: 'canvas',
                canvas: canvas,
                animate: true,
                coordinates: [
                    [146.75171953123885, 46.79940187958502],
                    [85.71168046874095, 46.79940187958502],
                    [85.71168046874095, 32.323463859132445],
                    [146.75171953123885, 32.323463859132445]
                ]
            });

            map.addLayer({
                id: 'canvas',
                type: 'raster',
                source: 'wind_canvas',
                    // data-source: 'my-dataset',
            });

            console.log(canvas)
            drawWind(canvas)

            // this.addWindLayer(map);
        });
    }

    addOsmLayer = (map) => {
        map.addLayer({
            "id": "base_layer",
            "type": "raster",
            "source": {
                "type": "raster",
                'tiles': [
                    // 高德的卫星地图osm瓦片服务
                    // "http://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
                    // 普通地图
                    "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
                ],
                'tileSize': 256
            },
            "paint": {},
            "layout": {},
        });
    }

    addWindLayer = (map) => {
        // map.addLayer(new WindLayer());
    }

    render(){
        return (
            <div>
                <div style={{textAlign: "center"}}>webgl wind融合mapboxgl</div>
                <div style={{position: "relative"}}>
                    <div
                        ref={(ref) => this.containerRef = ref}
                        style={{position: "fixed", width: "100%", height: "100%", border: "1px solid green"}}
                    >
                        {/*<canvas
                            ref={(ref) => this.windCanvasRef = ref}
                            style={{
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                                zIndex: 1
                            }}
                        />*/}
                    </div>
                </div>
            </div>
        )
    }
}

