import styles from './index.scss';
import MapboxUtil from './MapboxUtil';
import TestMap from './TestMap';

import { Component } from 'react';
import { EnumMapboxStyles } from './MapboxUtil/constants';

export default class UseMapboxUtil extends Component {
    state = {
        mapboxStyle: MapboxUtil.G.styles.streets_v9,
        center: MapboxUtil.G.CENTER,
        zoom: 9,
        pitch: 0,       // 地图倾斜角度 45
        bearing: 0,     // 地图旋转参数，单位是度数 20
        wms: '',
    };

    mapboxUtil = null;

    componentDidMount() {
        this.drawMap();
        window.addEventListener('resize', this.redraw)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.redraw)
    }

    redraw = () => {
        const map = this.map;
        if(map){
            map.resize();
        }
    };

    drawMap = () => {
        const mapboxgl = MapboxUtil.G.mapboxgl;
        const { center, zoom, mapboxStyle, pitch, bearing } = this.state;

        // ------------初始化地图------------------
        const mapboxUtil = this.mapboxUtil = new MapboxUtil('mapbox-gl-id', {
            center,
            zoom: 4,
            pitch,      // 地图倾斜角度 40
            bearing,    // 地图旋转参数，单位是度数 20
            // localIdeographFontFamily: "'Noto Sans', 'Noto Sans CJK SC', sans-serif",

            style: {
                "version": 8,
                "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
                "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
                "sources": {},
                "layers": []
            },

        }, (map) => {
            this.map = map;
            const testMap = new TestMap(this.mapboxUtil);

            // 添加基础底图
            testMap.doSetOsmTileLayer();

            // 添加中国贴图
            testMap.doSetCustomImgToMapLayer(
                require("./img/china_map.png"),
                {
                    containerWH: {
                        width: 707,
                        height: 524,
                    },
                    mapParams: {
                        zoom: 3,
                        center: [104.223828, 37.972688],
                        pitch: 0,
                        bearing: 0
                    }
                }
            );

            // -------- 绘制经纬度线 start ----------
            console.log("map bounds:", map.getBounds());
            testMap.doAddGridLine();


            // testMap.doSetGeoJSONByFill();

            // testMap.doSetGeoJSONByFillExtrusion();

            // testMap.doSetWMS();

            // testMap.doSetImageOverlay();

            // testMap.doSetFontAndIconLayer();

            // testMap.doSetCircleLayer();

            // testMap.doSetLineLayer();

            // testMap.doSetPolygonLayer();

            // testMap.doSetDemLayer();
            //
            // testMap.doSetPixelCircleLayer();

        });
    }

    // 处理mapbox样式
    handleMapboxStyle = (mapboxStyle) => {
        this.setState({mapboxStyle});
    }


    handleOk = () => {
        const { mapboxStyle, pitch, bearing } = this.state;
        const map = this.mapboxUtil.map;
        // 处理mapbox样式
        if (G.mapboxStyle != mapboxStyle) {
            map.setStyle(mapboxStyle, {optimize: true})
        }

        // 处理pitch
        map.setPitch(pitch, {});

        // 处理bearing
        map.setBearing(bearing, {});

    }

    render() {
        const { mapboxStyle, pitch, bearing, wms } = this.state;

        return (<div id="mapbox-gl-id" style={{width: 1389, height: 681}}></div>)

        return (
            <div className={styles["mapbox-gl-map"]}>
                <div className={styles.condition}>
                    <div>
                        <span>地图样式(style):</span>
                        <select value={mapboxStyle} onChange={(e) => this.setState({mapboxStyle: e.target.value})}>
                            {
                                Object.keys(EnumMapboxStyles).map(styleKey => <option key={styleKey} value={EnumMapboxStyles[styleKey]}>{styleKey}</option>)
                            }
                        </select>
                    </div>
                    <div>
                        <span>地图倾斜角度(pitch):</span>
                        <input value={pitch} onChange={(e) => this.setState({pitch: e.target.value})}/>
                    </div>
                    <div>
                        <span>地图旋转角度(bearing):</span>
                        <input value={bearing} onChange={(e) => this.setState({bearing: e.target.value})}/>
                    </div>

                    <div>
                        <span>WMS地址:</span>
                        <input value={wms} onChange={(e) => this.setState({wms: e.target.value})} style={{width: '80%'}}/>
                        <div style={{color: 'green'}}>示例:&nbsp;&nbsp;&nbsp;&nbsp;{`http://10.0.5.170:8081/rasdaman/ows?bbox={bbox-epsg-3857}&crs=EPSG:3857&service=WMS&version=1.3.0&request=GetMap&layers=WorldDem30m&width=256&height=256&styles=&format=image/png`}</div>
                    </div>

                    <button onClick={this.handleOk}>确定</button>
                </div>

                <div id="mapbox-gl-id"></div>
            </div>
        );
    }
}
