import "mapbox-gl/dist/mapbox-gl.css";
import { PureComponent } from 'react';
import mapboxgl from 'mapbox-gl';

// import * as plotty from 'plotty';
import * as plotty from './myPlotty/plotty';
import * as GeoTIFF from 'geotiff';

function mercator2lonlat(mercator){
    var lonlat={lng:0, lat:0};
    var x = mercator.x/20037508.34*180;
    var y = mercator.y/20037508.34*180;
    y= 180/Math.PI*(2*Math.atan(Math.exp(y*Math.PI/180))-Math.PI/2);
    lonlat.lng = x;
    lonlat.lat = y;

    return lonlat;
}

const getBoundsByLngLat = (mercator) => {
    const minLngLat = {lng: mercator[0], lat: mercator[1]};
    const maxLngLat = {lng: mercator[2], lat: mercator[3]};
    return [
        [minLngLat.lng, maxLngLat.lat],
        [maxLngLat.lng, maxLngLat.lat],
        [maxLngLat.lng, minLngLat.lat],
        [minLngLat.lng, minLngLat.lat],
    ]
};

/**
 * 加载tiff文件
 * @param url
 * @return {Promise}
 */
const loadTiff = (url) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
        // if(e) return reject(e);
        resolve(this.response);
    };

    xhr.send();
});


const pool = new GeoTIFF.Pool();

/**
 * 草原和沙漠颜色表
 */
plotty.addColorScale("grasslandDesertColorScale", [
    "rgba(166,97,26, 0)",
    "rgb(223,194,125)",
    "rgb(245,245,245)",
    "rgb(128,205,193)",
    "rgb(1,133,113)",
    "rgb(1,133,113)",
    "rgb(1,133,113)",
], [-1, -0.6, -0.2, 0, 0.2, 0.6, 1].map(item => (item + 1)/ 2));

const tiffs = [
    // "a1_ndvi_46.3180N_48.4920N__125.245E_128.502E__2017_04_02_02.20.11.tif",
    // "stripped.tiff",

    // {
    //     filename: "a1_ndvi_46.3180N_48.4920N__125.245E_128.502E__2017_04_02_02.20.11.tif",
    //     plotParams: {
    //         domain:[-1,  1],
    //         colorScale: "grasslandDesertColorScale",
    //     }
    // },

    {
        filename: "stripped.tiff",
        plotParams: {
            domain:[10, 65000],
            // domain:[-1,  1],
            colorScale: "viridis",
        }
    }
];


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
        tiffs.forEach((item) => {
            const { filename, plotParams } = item;

            console.time(filename + "->加载tiff时间");
            loadTiff('tiff/' + filename).then((resp) => {
                console.timeEnd(filename + "->加载tiff时间");

                console.time(filename + "->解析tiff时间");
                GeoTIFF.fromArrayBuffer(resp)
                    .then(parser => parser.getImage())
                    .then((image) => {
                        console.log("image->", image);
                        console.log("getBoundingBox->", image.getBoundingBox());

                        const width = image.getWidth();
                        const height = image.getHeight();

                        image.readRasters({
                            samples: [0],
                            window: [0, 0, width, height],
                            fillValue: 0,
                            pool,
                        }).then((rasters) => {
                            console.timeEnd(filename + "->解析tiff时间");
                            const canvas = document.createElement("canvas");

                            const plot = new plotty.plot({
                                canvas,
                                data: rasters[0],
                                width,
                                height,
                                // domain:[10, 65000],
                                // colorScale: "viridis",
                                clampLow: false,
                                // clampHigh: true,
                                ...plotParams
                            });

                            console.log("plot =>", plot)

                            plot.render();

                            map.addLayer({
                                "id": `tiff-image-${filename}`,
                                "source": {
                                    "type": "image",
                                    "url": canvas.toDataURL("image/png"),
                                    // "coordinates": [
                                    //     [100.923828, 38.272688],
                                    //     [120.923828, 38.272688],
                                    //     [120.923828, 29.272688],
                                    //     [100.923828, 29.272688]
                                    // ],
                                    "coordinates": getBoundsByLngLat(image.getBoundingBox())
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
            }).catch(e => console.error(e));
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

