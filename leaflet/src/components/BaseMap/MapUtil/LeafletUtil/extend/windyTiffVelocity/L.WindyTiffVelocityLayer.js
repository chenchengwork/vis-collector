import Windy from './Windy';
(function(L, Windy){
    L.WindyTiffVelocityLayer = (L.Layer ? L.Layer : L.Class).extend({
        options: {
            tifUrl: null,
            maxVelocity: 10, // used to align color scale
            colorScale: null,
            data: null
        },

        _map: null,
        _canvasLayer: null,
        _windy: null,
        _context: null,
        _timer: 0,
        _mouseControl: null,

        initialize: function(options) {
            L.setOptions(this, options);
        },

        onAdd: function(map) {
            // create canvas, add overlay control
            this._canvasLayer = L.windyTiffCanvasLayer().delegate(this);
            this._canvasLayer.addTo(map);
            this._map = map;
        },

        onRemove: function(map) {
            this._destroyWind();
        },

        setData: function setData(data) {
            this.options.data = data;

            if (this._windy) {
                this._windy.setData(data);
                this._clearAndRestart();
            }

            this.fire('load');
        },

        /*------------------------------------ PRIVATE ------------------------------------------*/

        onDrawLayer: function(overlay, params) {
            var self = this;

            if (!this._windy) {
                this._initWindy(this);
                return;
            }

            /*if (!this.options.data) {
                return;
            }*/

            if (this._timer) clearTimeout(self._timer);

            this._timer = setTimeout(function () {
                self._startWindy();
            }, 750); // showing velocity is delayed
        },

        _startWindy: function() {

            var bounds = this._map.getBounds();
            var size = this._map.getSize();

            const url = `http://10.0.4.226:8080/geoserver/cite/wms?service=WMS&version=1.1.0&request=GetMap&layers=cite:climate_u-v&styles=&bbox=${bounds._southWest.lng},${bounds._southWest.lat},${bounds._northEast.lng},${bounds._northEast.lat}&width=${size.x}&height=${size.y}&srs=EPSG:4326&format=img/tif`;
            // getTif(this.options.tifUrl, this._map.getZoom(), bounds).then((windData) => {
            getTif(url, this._map.getZoom(), bounds).then((windData) => {
                this._windy.setData(windData);
                this._windy.start(
                    [
                        [0, 0],
                        [size.x, size.y]
                    ],
                    size.x,
                    size.y,
                    [
                        [bounds._southWest.lng, bounds._southWest.lat],
                        [bounds._northEast.lng, bounds._northEast.lat]
                    ]);
            });
        },

        _initWindy: function(self) {
            // windy object, copy options
            const options = Object.assign({ canvas: self._canvasLayer._canvas }, self.options);
            this._windy = new Windy(options);

            // prepare context global var, start drawing
            this._context = this._canvasLayer._canvas.getContext('2d');
            this._canvasLayer._canvas.classList.add("velocity-overlay");
            this.onDrawLayer();

            this._map.on('dragstart', self._windy.stop);
            this._map.on('dragend', self._clearAndRestart);
            this._map.on('zoomstart', self._windy.stop);
            this._map.on('zoomend', self._clearAndRestart);
            this._map.on('resize', self._clearWind);

            this._initMouseHandler();
        },

        _initMouseHandler: function() {
            // if (!this._mouseControl && this.options.displayValues) {
            //     var options = this.options.displayOptions || {};
            //     options['leafletVelocity'] = this;
            //     this._mouseControl = L.control.velocity(options).addTo(this._map);
            // }
        },

        _clearAndRestart: function(){
            // console.log("_clearAndRestart")
            // TODO 暂时不清除
            if (this._context) this._context.clearRect(0, 0, 3000, 3000);
            if (this._windy) this._startWindy();
        },

        _clearWind: function() {
            if (this._windy) this._windy.stop();
            if (this._context) this._context.clearRect(0, 0, 3000, 3000);
        },

        _destroyWind: function() {
            if (this._timer) clearTimeout(this._timer);
            if (this._windy) this._windy.stop();
            if (this._context) this._context.clearRect(0, 0, 3000, 3000);
            if (this._mouseControl) this._map.removeControl(this._mouseControl);
            this._mouseControl = null;
            this._windy = null;
            this._map.removeLayer(this._canvasLayer);
        }
    });

    L.windyTiffVelocityLayer = function(options) {
        return new L.WindyTiffVelocityLayer(options);
    };
})(L, Windy)



const getTif = (tifUrl, zoom, bounds) => {
    const GeoTIFF = require('geotiff/src/main');
    const fetch = require("../../lib/fetch").default;

    const extent = [
        bounds._southWest.lng,
        bounds._southWest.lat,
        bounds._northEast.lng,
        bounds._northEast.lat
    ];

    return new Promise((resolve, reject) => {
        // fetch(`http://10.0.5.39:9000/api/v1/bigdataquery?z=${zoom}&extent=${JSON.stringify(extent)}`)
        // fetch(`http://10.0.4.52:9000/api/v1/bigdataquery?z=${zoom}&extent=${extent.join(",")}`)
        fetch(`${tifUrl}?z=${zoom}&extent=${extent.join(",")}`)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => GeoTIFF.fromArrayBuffer(arrayBuffer))
            .then((tif) => tif.getImage())
            .then((image) => {
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

                    resolve(windData);

                    // return;

                    // const options = {
                    //     canvas: tile,
                    //     data: windData,
                    //     // colorScale: ["rgb(180,0,35)"],
                    //     // colorScale: ["rgb(0,128,0)"],
                    //     colorScale: ["rgb(0,0,0)"],
                    //     frameRate: 60
                    // };
                    // const windy = new Windy(options);
                    // const size = {x: 256, y: 256};
                    // // const size = {x: 512, y: 512};
                    // // var size = this._map.getSize();
                    //
                    // windy.start(
                    //     [
                    //         [0, 0],
                    //         [size.x, size.y]
                    //     ],
                    //     size.x,
                    //     size.y,
                    //     [
                    //         [tileBounds._southWest.lng, tileBounds._southWest.lat],
                    //         [tileBounds._northEast.lng, tileBounds._northEast.lat]
                    //     ]
                    // );


                }).catch(e => {
                    // console.log(`报错tif-->${z}/${x}/${y}.tif`)
                    // console.log("image.readRasters报错")
                    // console.error(e)
                    reject(e);
                })
            })
            .catch((e) => {
                // console.warn(`----------获取失败:${z}/${x}/${y}.tif---------------`)
                // done(null, tile);
                reject(e);
            });
    })

}
