import { PureComponent } from 'react';
import * as plotty from 'plotty';
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
        var imageWindow = [0, 0, 500, 500];
        var tiffs = [
            "stripped.tiff",
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


        var rgbtiffs = [
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
        var bandsSelect = document.getElementById("bands");
        for (var i = 0; i < 15; ++i) {
            var option = document.createElement("option");
            option.value = i;
            option.text = i+1;
            bandsSelect.appendChild(option);
        }


        tiffs.forEach(function(filename) {
            var xhr = new XMLHttpRequest();
            // xhr.open('GET', 'data/' + filename, true);
            xhr.open('GET', 'tiff/' + filename, true);

            xhr.responseType = 'arraybuffer';
            var div = document.createElement("div");
            div.style.float = "left";
            var header = document.createElement("p");
            header.innerHTML = filename;
            var canvas = document.createElement("canvas");
            canvas.id = filename;
            canvas.width = 500;
            canvas.height = 500;
            div.appendChild(header);
            div.appendChild(canvas);
            document.getElementById("canvases").appendChild(div);




            xhr.onload = function(e) {
                console.time("readRasters " + filename);
                GeoTIFF.fromArrayBuffer(this.response)
                    .then(parser => parser.getImage())
                    .then((image) => {
                        console.log(image);
                        console.log("getGDALMetadata",image.getGDALMetadata());
                        console.log("getOrigin",image.getOrigin());
                        console.log("getResolution",image.getResolution());
                        console.log("getBoundingBox", image.getBoundingBox());
                        // console.log(image.getTiePoints());
                        // var imageWindow = null;
                        var width = image.getWidth();
                        var height = image.getHeight();

                        // if (imageWindow) {
                        //     width = imageWindow[2] - imageWindow[0];
                        //     height = imageWindow[3] - imageWindow[1];
                        // }

                        var plot;
                        bandsSelect.addEventListener("change", function (e) {
                            image.readRasters({ samples: [parseInt(bandsSelect.options[bandsSelect.selectedIndex].value)], poolSize: 8 })
                                .then(function (rasters) {
                                    var canvas = document.getElementById(filename);
                                    // plot = new plotty.plot(canvas, rasters[0], width, height, [10, 65000], "viridis", false);
                                    plot = new plotty.plot({
                                        canvas,
                                        data: rasters[0],
                                        width,
                                        height,
                                        domain:[10, 65000],
                                        colorScale: "viridis",
                                        clampLow: false,
                                        // clampHigh: true,
                                    });
                                    plot.render();
                                });
                        });


                        image.readRasters({
                            samples: [0],
                            // window: imageWindow,
                            window: [0, 0, width, height],
                            fillValue: 0,
                            pool,
                        })
                            .then(function (rasters) {
                                console.timeEnd("readRasters " + filename);
                                var canvas = document.getElementById(filename);

                                plot = new plotty.plot({
                                    canvas,
                                    data: rasters[0],
                                    width,
                                    height,
                                    domain:[10, 65000],
                                    colorScale: "viridis",
                                    clampLow: false,
                                    // clampHigh: true,
                                });
                                plot.render();
                            });
                    });
            };
            xhr.send();
        });



        rgbtiffs.forEach(function(filename) {
            var xhr = new XMLHttpRequest();
            // xhr.open('GET', 'data/' + filename, true);
            xhr.open('GET', 'tiff/' + filename, true);
            xhr.responseType = 'arraybuffer';
            var div = document.createElement("div");
            div.style.float = "left";
            var header = document.createElement("p");
            header.innerHTML = filename;
            var canvas = document.createElement("canvas");
            canvas.id = filename;
            div.appendChild(header);
            div.appendChild(canvas);
            document.getElementById("canvases").appendChild(div);


            xhr.onload = function(e) {
                GeoTIFF.fromArrayBuffer(this.response)
                    .then(parser => parser.getImage())
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
            };
            xhr.send();
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

