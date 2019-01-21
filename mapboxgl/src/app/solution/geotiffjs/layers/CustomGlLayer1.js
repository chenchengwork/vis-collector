import mapboxgl from "mapbox-gl";
// import * as plotty from 'plotty';
import * as plotty from '../myPlotty/plotty';
import * as GeoTIFF from 'geotiff';
import { getBoundsByLngLat, loadTiff, generateUUID } from './TiffLayer/util';
const pool = new GeoTIFF.Pool();

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

const plotParams = {
    domain:[10, 65000],
    // domain:[-1,  1],
    colorScale: "viridis",
};

export default class CustomGlLayer{
    id = 'customGlLayer1';
    type = 'custom';

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
            });

            // 修改图片的透明度
            map.setPaintProperty(layerId, 'raster-opacity', 0.5);
            // map.setLayoutProperty('my-layer', 'visibility', 'none');
        }
    };

    drawImage = (tiffImg,gl) => {
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
            const plot = this.plot = new plotty.plot({
                // canvas: document.createElement("canvas"),
                // canvas: map.getCanvas(),
                gl: gl,
                data: rasters[0],
                width,
                height,
                clampLow: false,
                ...plotParams
            });

            plot.render();
        });
    };


    onAdd(map, gl) {
        this.map = map;

        tiffs.forEach((item) => {
            const { filename, plotParams } = item;
            loadTiff('tiff/' + filename).then((resp) => {
                GeoTIFF.fromArrayBuffer(resp)
                    .then(parser => parser.getImage())
                    .then((image) => {
                        this.drawImage(image, gl);
                    });
            }).catch(e => console.error(e));
        });
    }

    render(gl, matrix) {
        if(this.plot) {
            this.plot.matrix = matrix;
            this.plot.render()
        }

        // gl.useProgram(this.program);
        // gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, matrix);
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        // gl.enableVertexAttribArray(this.aPos);
        // gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    }
}
