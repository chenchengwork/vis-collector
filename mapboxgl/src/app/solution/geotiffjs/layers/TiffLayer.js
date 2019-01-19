// import * as plotty from 'plotty';
import * as plotty from '../myPlotty/plotty';
import * as GeoTIFF from 'geotiff';
import { getBoundsByLngLat, loadTiff } from '../util';
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
    },
    // {
    //     filename: "deflate.tiff",
    //     plotParams: {
    //         domain:[10, 65000],
    //         // domain:[-1,  1],
    //         colorScale: "viridis",
    //     }
    // }
];




export default class TiffLayer {

    render(map){
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
                            // console.log(rasters)
                            const plot = new plotty.plot({
                                canvas,
                                data: rasters[0],
                                width,
                                height,
                                clampLow: false,
                                // clampHigh: true,
                                ...plotParams
                            });

                            console.log("plot =>", plot.setData);

                            plot.render();

                            map.addLayer({
                                "id": `tiff-image-${filename}`,
                                "source": {
                                    "type": "image",
                                    "url": canvas.toDataURL("image/png"),
                                    "coordinates": getBoundsByLngLat(image.getBoundingBox())
                                },
                                "type": "raster",
                                "paint": {
                                    "raster-opacity": 0.85
                                },
                                "layout": {},
                            });


                            loadTiff('tiff/deflate.tiff').then((resp) => {
                                console.timeEnd(filename + "->加载tiff时间");

                                console.time(filename + "->解析tiff时间");
                                GeoTIFF.fromArrayBuffer(resp)
                                    .then(parser => parser.getImage())
                                    .then((image) => {
                                        console.log(image);
                                        const width = image.getWidth();
                                        const height = image.getHeight();
                                        image.readRasters({
                                            samples: [0],
                                            window: [0, 0, width, height],
                                            fillValue: 0,
                                            pool,
                                        }).then((rasters) => {
                                            plot.setData(rasters[0], width, height )
                                        });

                                    })
                            });




                            // canvas.remove();
                        });
                    });
            }).catch(e => console.error(e));
        });
    };
}
