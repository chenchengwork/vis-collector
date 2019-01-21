import * as plotty from 'plotty';
// import * as plotty from '../../myPlotty/plotty';
import * as GeoTIFF from 'geotiff';
import { getBoundsByLngLat, loadTiff, generateUUID } from './util';
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

const plotParams = {
    domain:[10, 65000],
    // domain:[-1,  1],
    colorScale: "viridis",
};

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
    constructor(map){
        this.map = map;
        this.plotMap = new Map();
    }

    clear = () => {
        const map = this.map;
        for(let [layerId, value] of this.plotMap) {
            const { plot } = value;
            plot.getCanvas().remove();
            map.removeLayer(layerId);
            map.removeSource(layerId);
            this.plotMap.delete(layerId);
        }
    };

    updateImage = (params) => {
        for(let [layerId, value] of this.plotMap){
            const { plot } = value;
            const source = map.getSource(layerId);

            // plot.setDomain([]);
            // plot.setColorScale("name");
            // plot.setClamp("clampLow", "clampHigh");

            plot.render();

            source.updateImage({
                // url: 'https://www.mapbox.com/images/bar.png',
                url: plot.getCanvas().toDataURL("image/png"),
                // coordinates: [
                //     [-76.54335737228394, 39.18579907229748],
                //     [-76.52803659439087, 39.1838364847587],
                //     [-76.5295386314392, 39.17683392507606],
                //     [-76.54520273208618, 39.17876344106642]
                // ]
            });

            // 修改图片的透明度
            map.setPaintProperty(layerId, 'raster-opacity', 0.5);
            // map.setLayoutProperty('my-layer', 'visibility', 'none');
        }
    };

    drawImage = (tiffImg) => {
        const map = this.map;
        const width = tiffImg.getWidth();
        const height = tiffImg.getHeight();

        tiffImg.readRasters({
            samples: [0],
            window: [0, 0, width, height],
            fillValue: 0,
            pool,
        }).then((rasters) => {
            const layerId = generateUUID("image");
            const plot = new plotty.plot({
                canvas: document.createElement("canvas"),
                data: rasters[0],
                width,
                height,
                clampLow: false,
                ...plotParams
            });

            plot.render();

            map.addLayer({
                "id": layerId,
                "source": {
                    "type": "image",
                    "url": plot.getCanvas().toDataURL("image/png"),
                    "coordinates": getBoundsByLngLat(tiffImg.getBoundingBox())
                },
                "type": "raster",
                "paint": {
                    "raster-opacity": 0.85
                },
                "layout": {},
            });

            this.plotMap.set(layerId, {layerId, plot})
        });
    };

    render(){
        this.clear();

        tiffs.forEach((item) => {
            const { filename, plotParams } = item;
            loadTiff('tiff/' + filename).then((resp) => {
                GeoTIFF.fromArrayBuffer(resp)
                    .then(parser => parser.getImage())
                    .then((image) => {
                        this.drawImage(image);
                    });
            }).catch(e => console.error(e));
        });
    };
}
