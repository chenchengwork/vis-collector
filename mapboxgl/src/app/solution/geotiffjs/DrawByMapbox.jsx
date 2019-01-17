import "mapbox-gl/dist/mapbox-gl.css";
import { PureComponent } from 'react';
import mapboxgl from 'mapbox-gl';

import * as plotty from 'plotty';
import * as GeoTIFF from 'geotiff';

//[479985, 4664085, 711015, 4899015]

function mercator2lonlat(mercator){
    var lonlat={lng:0, lat:0};
    var x = mercator.x/20037508.34*180;
    var y = mercator.y/20037508.34*180;
    y= 180/Math.PI*(2*Math.atan(Math.exp(y*Math.PI/180))-Math.PI/2);
    lonlat.lng = x;
    lonlat.lat = y;

    return lonlat;
}

const getBoundsBymercator = (mercator) => {
    const minLngLat = mercator2lonlat({x: mercator[0], y: mercator[1]});
    const maxLngLat = mercator2lonlat({x: mercator[2], y: mercator[3]});

    // 42.1006N_44.2439N__134.749E_137.551E

    return [
        [134.749, 44.2439],
        [137.55, 44.2439],
        [137.55, 42.1006],
        [134.749, 42.1006],
    ];

    return [
        [minLngLat.lng, maxLngLat.lat],
        [maxLngLat.lng, maxLngLat.lat],
        [maxLngLat.lng, minLngLat.lat],
        [minLngLat.lng, minLngLat.lat],
    ]
};


export default class GeoTiff extends PureComponent{

    componentDidMount() {

        const map = new mapboxgl.Map({
            container: this.containerRef,
            style:{
                "version": 8,
                "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",                 // 加载图标来源
                "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf",  // 加载字体
                "sources": {},
                "layers": []
            },
            center: [116.2317,39.9427],  // 北京中心点
            zoom: 4,
            pitch: 0
        });

        map.on('load', () => {
            this.addOsmLayer(map);
            this.addTiffLayer(map);

            console.log(mercator2lonlat({x:479985, y:4664085}));
            console.log(mercator2lonlat({x:711015, y:4899015}));
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


    addTiffLayer = (map) => {
        const pool = new GeoTIFF.Pool();

        plotty.addColorScale("mycolorscale", [
            "rgba(166,97,26, 0)",
            "rgb(223,194,125)",
            "rgb(245,245,245)",
            "rgb(128,205,193)",
            "rgb(1,133,113)",
            "rgb(1,133,113)",
            "rgb(1,133,113)",
        ], [-1, -0.6, -0.2, 0, 0.2, 0.6, 1].map(item => (item + 1)/ 2));

        const tiffs = [
            // "a1_ndvi_42.1006N_44.2439N__134.749E_137.551E__2017_04_01_01.38.08.tif",
            "stripped.tiff",
        ];

        tiffs.forEach(function(filename) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'tiff/' + filename, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function(e) {
                console.time("readRasters " + filename);
                GeoTIFF.fromArrayBuffer(this.response)
                    .then(parser => parser.getImage())
                    .then((image) => {
                        console.log(image);
                        // console.log("getGDALMetadata",image.getGDALMetadata());
                        // console.log("getOrigin",image.getOrigin());
                        // console.log("getResolution",image.getResolution());
                        console.log("getBoundingBox", image.getBoundingBox());

                        const width = image.getWidth();
                        const height = image.getHeight();

                        image.readRasters({
                            samples: [0],
                            window: [0, 0, width, height],
                            fillValue: 0,
                            pool,
                        })
                            .then(function (rasters) {
                                console.timeEnd("readRasters " + filename);
                                const canvas = document.createElement("canvas");
                                // document.body.appendChild(canvas);

                                const plot = new plotty.plot({
                                    canvas,
                                    data: rasters[0],
                                    width,
                                    height,
                                    // domain:[10, 65000],
                                    domain:[-1,  1],
                                    // colorScale: "viridis",
                                    colorScale: "mycolorscale",
                                    clampLow: false,
                                    // clampHigh: true,
                                });

                                plot.render();

                                map.addLayer({
                                    "id": "tiff-image",
                                    "source": {
                                        "type": "image",
                                        "url": canvas.toDataURL("image/png"),
                                        // "coordinates": [
                                        //     [100.923828, 38.272688],
                                        //     [120.923828, 38.272688],
                                        //     [120.923828, 29.272688],
                                        //     [100.923828, 29.272688]
                                        // ],
                                        "coordinates": getBoundsBymercator(image.getBoundingBox())
                                    },
                                    "type": "raster",
                                    "paint": {
                                        "raster-opacity": 0.85
                                    },
                                    "layout": {},
                                });

                                canvas.remove();
                            });
                    });
            };
            xhr.send();
        });

    };

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

