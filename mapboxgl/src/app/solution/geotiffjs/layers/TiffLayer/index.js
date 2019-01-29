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

    download = (url) => {
        let downloadElement = document.createElement('img');
        const href = url;      //创建下载的链接
        downloadElement.src = href;
        // downloadElement.target = "_blank";
        // downloadElement.download = filename;                //下载后文件名
        document.body.appendChild(downloadElement);
        // downloadElement.click();                            //点击下载
        // document.body.removeChild(downloadElement);         //下载完成移除元素
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

            const url = plot.getCanvas().toDataURL("image/png");
            // console.log(url);
            // this.download(url);

            map.addLayer({
                "id": layerId,
                "source": {
                    "type": "image",
                    "url": url,
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
