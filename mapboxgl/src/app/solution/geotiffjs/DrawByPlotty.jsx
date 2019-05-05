import { PureComponent } from 'react';
// import * as plotty from 'plotty';
import * as plotty from './myPlotty/plotty';
import * as GeoTIFF from 'geotiff';

export default class DrawByPlotty extends PureComponent{

    componentDidMount() {
        // this.draw();
        this.drawTiff();
    }

    draw = () => {
        let  width = 100;
        let  height = 100;
        let  exampledata = new Float32Array(height * width);

        let  xoff = width / 3;
        let  yoff = height / 3;

        for (let y = 0; y <= height; y++) {
            for (let x = 0; x <= width; x++) {
                // calculate sine based on distance
                let x2 = x - xoff;
                let y2 = y - yoff;
                let d = Math.sqrt(x2*x2 + y2*y2);
                let t = Math.sin(d/6.0);

                // save sine
                exampledata[(y*width)+x] = t;
            }
        }

        const plot = new plotty.plot({
            canvas: document.getElementById("canvas"),
            data: exampledata, width: width, height: height,
            domain: [-1, 1], colorScale: 'viridis'
        });

        plot.render();
    }

    drawTiff = () => {
        const tiffs = [
            "stripped.tiff",
            // "nat_color.tif",
            // "tiled.tiff",

            // "tiledplanar.tiff",
            // "float32.tiff",
            // "uint32.tiff",
            // "int32.tiff",
            // "float64.tiff",
            // "lzw.tiff",
            // "tiledplanarlzw.tiff",
            // "float64lzw.tiff",
            // "lzw_predictor.tiff",
            // "deflate.tiff",
            // "deflate_predictor.tiff",
            // "deflate_predictor_tiled.tiff",
        ];


        const rgbtiffs = [
            // "stripped.tiff",
            // "rgb.tiff",

            // "BigTIFF.tif",
            // "rgb_paletted.tiff",
            // "cmyk.tif",
            // "ycbcr.tif",
            // "cielab.tif",
            // "5ae862e00b093000130affda.tif",
            // "jpeg.tiff",
            // "jpeg_ycbcr.tiff",
        ];

        const pool = new GeoTIFF.Pool();
        // const bandsSelect = document.getElementById("bands");
        // for (let i = 0; i < 15; ++i) {
        //     const option = document.createElement("option");
        //     option.value = i;
        //     option.text = i+1;
        //     bandsSelect.appendChild(option);
        // }


        tiffs.forEach(function(filename) {
            const tifUrl = 'tiff/' + filename;

            var div = document.createElement("div");
            div.style.float = "left";
            var header = document.createElement("p");
            header.innerHTML = filename;
            var canvas = document.createElement("canvas");
            canvas.id = filename;
            canvas.width = 700;
            canvas.height = 500;
            div.appendChild(header);
            div.appendChild(canvas);
            document.getElementById("canvases").appendChild(div);


            fetch(tifUrl)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => GeoTIFF.fromArrayBuffer(arrayBuffer))
                .then(tif => tif.getImage())
                .then((image) => {
                    console.log(image);
                    console.log("getGDALMetadata",image.getGDALMetadata());
                    console.log("getOrigin",image.getOrigin());
                    console.log("getResolution",image.getResolution());
                    console.log("getBoundingBox", image.getBoundingBox());
                    // console.log(image.getTiePoints());
                    // var imageWindow = null;

                    let plot = null;
                    image.readRasters({
                        samples: [0],
                        window: [0, 0, image.getWidth(), image.getHeight()],
                        fillValue: 0,
                        pool,
                    })
                        .then(function (rasters) {
                            console.timeEnd("readRasters " + filename);
                            var canvas = document.getElementById(filename);
                            console.log('rasters[0]->', rasters[0])
                            plot = new plotty.plot({
                                canvas,
                                data: rasters[0],
                                width: image.getWidth(),
                                height: image.getHeight(),
                                domain:[10, 65000],
                                colorScale: "viridis",
                                clampLow: false,
                                // clampHigh: true,
                            });
                            plot.render();
                        });
                });
        });


        rgbtiffs.forEach(function(filename) {
            const tifUrl = 'tiff/' + filename;
            var div = document.createElement("div");
            div.style.float = "left";
            var header = document.createElement("p");
            header.innerHTML = filename;
            var canvas = document.createElement("canvas");
            canvas.id = filename;
            div.appendChild(header);
            div.appendChild(canvas);
            document.getElementById("canvases").appendChild(div);

            fetch(tifUrl)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => GeoTIFF.fromArrayBuffer(arrayBuffer))
                .then(tif => tif.getImage())
                .then((image) => {
                    var plot;
                    console.time("readRGB " + filename);
                    console.log('image', image);

                    image.readRGB({ pool }).then(function(raster) {
                        console.log("raster", raster.length)
                        console.timeEnd("readRGB " + filename);
                        canvas.width = image.getWidth();
                        canvas.height = image.getHeight();
                        var ctx = canvas.getContext("2d");
                        var imageData = ctx.createImageData(image.getWidth(), image.getHeight());
                        var data = imageData.data;
                        var o = 0;
                        for (var i = 0; i < raster.length; i+=3) {
                            data[o] = raster[i];
                            data[o+1] = raster[i+1];
                            data[o+2] = raster[i+2];
                            data[o+3] = 255;
                            o += 4;
                        }
                        ctx.putImageData(imageData, 0, 0);
                    });
                });
        });
    }


    render(){

        return (
            <div>
                <div id="canvases"></div>
                <select id="bands"></select>
            </div>
        );
    }
}

