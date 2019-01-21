import "mapbox-gl/dist/mapbox-gl.css";
import { PureComponent } from 'react';
import mapboxgl from 'mapbox-gl';
import CustomGlLayer from './layers/CustomGlLayer';
import TiffLayer from './layers/TiffLayer';


export default class GeoTiff extends PureComponent{

    componentDidMount() {
        this.initMap((map) => {
            this.addOsmLayer(map);

            // 自定义gl layer
            map.addLayer(new CustomGlLayer());

            // tiff layer
            new TiffLayer(map).render()
        })

    }

    /**
     * 初始化地图
     * @param loadedMapCallback
     * @private
     */
    initMap = (loadedMapCallback) => {
        const map = new mapboxgl.Map({
            container: this.containerRef,
            style:{
                "version": 8,
                // "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",                 // 加载图标来源
                // "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf",  // 加载字体
                "sources": {},
                "layers": []
            },
            center: [116.2317,39.9427],  // 北京中心点
            zoom: 2,
            pitch: 0
        });

        map.on('load', () => loadedMapCallback(map));
    };

    /**
     * 添加基础瓦片地图
     * @param map
     */
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

    render(){
        return (
            <div>
                <div style={{textAlign: "center"}}>geotiff融合mapboxgl</div>
                <div style={{position: "relative"}}>
                    <div
                        ref={(ref) => this.containerRef = ref}
                        style={{ position: "fixed", width: "100%", height: "100%" }}
                    ></div>
                </div>
            </div>
        )
    }
}
