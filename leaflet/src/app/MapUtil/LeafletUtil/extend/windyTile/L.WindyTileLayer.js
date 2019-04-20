import Windy from './Windy';
const GeoTIFF = require('geotiff/src/main');

(function(L, Windy){

    L.WindyTileLayer = L.GridLayer.extend({
        options: {
            // tileSize: 512,
            tileSize: 256,
            minZoom: 4,
            maxZoom: 18
        },

        initialize: function(options) {
            // console.log('222')
            L.setOptions(this, options);

            // this.on("load", () => {
            //     console.log(this._tiles)
            // })
        },

        // 同步方式加载img
        // createTile: function (coords) {
        //     // console.log("coords->", coords)
        //     const tile = document.createElement('div');
        //     tile.innerHTML = [coords.x, coords.y, coords.z].join(', ');
        //     tile.style.outline = '1px solid red';
        //
        //     const {x, y, z} = coords;
        //     tile.setAttribute("src", `http://10.0.5.138:51652/tile/${z}/${x}/${y}.tif`)
        //
        //     return tile;
        // },


        // 异步方式加载
        createTile: function (coords, done) {
            // console.log("coords->", coords)
            // const tile = L.DomUtil.create("div");
            const tile = L.DomUtil.create("canvas");
            tile.style.outline = '1px solid red';
            tile.innerHTML = [coords.z, coords.x, coords.y].join(', ');
            const tileBounds = this._tileCoordsToBounds(coords);

            const {x, y, z} = coords;
            // tile.setAttribute("src", `http://10.0.4.101:59249/tile/${z}/${x}/${y}.tif`);
            // tile.setAttribute("src", `http://10.0.4.221:9000/${z}/${x}/${y}.tif`);
            // done(null, tile);
            // return tile;

            fetch(`http://10.0.5.51:9000/${z}/${x}/${y}.tif`)
            // fetch(`http://localhost:4000/asserts/data/windy_tif/${z}_${x}_${y}.tif`)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => GeoTIFF.fromArrayBuffer(arrayBuffer))
                .then((tif) => {
                    // console.log(tif)
                    return tif.getImage();
                })
                .then((image) => {
                    done(null, tile);
                    // return;

                    const [minLng, minLat, maxLng, maxLat] = image.getBoundingBox();

                    image.readRasters().then((imageData) => {
                        const width = imageData.width;
                        const height = imageData.height;
                        const uData = imageData[0];
                        const vData = imageData[1];

                        const lngLat = {
                            "lo2": maxLng,
                            "lo1": minLng,
                            "la2": maxLat,
                            "la1": minLat,
                        }

                        const other = {
                            "dx": (maxLng - minLng) / width,
                            "dy": (minLat - maxLat) / height,
                            // dx: "0.040544070051016054",
                            // dy: "-0.028572421603732637",
                            "nx": width,
                            "ny": height,
                        };

                        const windData = [
                            {
                                data: uData,
                                header: {
                                    ...lngLat,
                                    ...other,
                                    "parameterCategory": 2,
                                    "parameterNumber": 2
                                }
                            },
                            {
                                data: vData,
                                header: {
                                    "lo2": 359,
                                    "lo1": 0,
                                    "dx": 1,
                                    "dy": 1,
                                    "nx": 360,
                                    "ny": 181,
                                    "la2": -90,
                                    "la1": 90,
                                    "parameterCategory": 2,
                                    "parameterNumber": 3,
                                    ...lngLat,
                                    ...other
                                }
                            }
                        ];

                        console.log('windData->', windData)

                        // return;

                        const options = {
                            canvas: tile,
                            data: windData,
                            // colorScale: ["rgb(180,0,35)"],
                            // colorScale: ["rgb(0,128,0)"],
                            colorScale: ["rgb(0,0,0)"],
                            frameRate: 60
                        };
                        const windy = new Windy(options);
                        const size = {x: 256, y: 256};
                        // const size = {x: 512, y: 512};
                        // var size = this._map.getSize();

                        windy.start(
                            [
                                [0, 0],
                                [size.x, size.y]
                            ],
                            size.x,
                            size.y,
                            [
                                [tileBounds._southWest.lng, tileBounds._southWest.lat],
                                [tileBounds._northEast.lng, tileBounds._northEast.lat]
                            ]
                        );


                    }).catch(e => {
                        console.log(`报错tif-->${z}/${x}/${y}.tif`)
                        // console.log("image.readRasters报错")
                        // console.error(e)
                    })
                })
                .catch((e) => {
                    console.warn(`----------获取失败:${z}/${x}/${y}.tif---------------`)
                    done(null, tile);
                });


            return tile;
        },

    });

    L.windyTileLayer = function(options) {
        return new L.WindyTileLayer(options);
    };
})(L, Windy)
