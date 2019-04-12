if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    var L = require('leaflet');
    var GeoTIFF = require('geotiff');
}

L.LeafletGeotiff = L.TileLayer.extend({

    options: {
        domain: [-1, 1],
        width: 256,
        height: 256,
        noDataValue: 10,
        palette: 'viridis',
    },

    initialize: function(url, options) {
        if(typeof(GeoTIFF) === 'undefined'){
            throw new Error("GeoTIFF not defined");
        };

        this._url = url;
        this.raster = {};
        this.urlToTiff = {};
        L.Util.setOptions(this, options);

        this.plot = new plotty.plot({});
    },

    data: function(rasters) {
        var data = [];
        // loop every single datapoint
        for(var i = 0; i<rasters[0].length; i++) {
            // first value is always null so you can index all bands
            // by positive numbers (band1 = b[1])
            var bands = [null];

            // add all other available bands to this array
            for(var b = 0; b<rasters.length; b++) bands.push(rasters[b][i]);

            // calculate single float value for this multiband array
            // push float value to the data array and continue with next datapoint
            data.push( this.dataFunction(bands) );
        }
        // return the data array
        return data;
    },

    dataFunction: function(b) {
        return b[1];
    },

    fetchTiff: function(url, listener, errorListener) {
        var urlToTiff = this.urlToTiff;
        if (urlToTiff[url]) {
            // in this case the tiff is already received and parsed
            if (urlToTiff[url].rasters) {
                listener(urlToTiff[url]);
            }
            else if (urlToTiff[url].error) {
                errorListener(urlToTiff[url].error);
            }
            // in this case the tiff was already requested
            else {
                urlToTiff[url].listeners.push(listener);
                urlToTiff[url].errorListeners.push(errorListener);
            }
        }
        // in this case the tiff was not yet requested
        else {
            urlToTiff[url] = {
                rasters: null,
                error: null,
                listeners: [listener],
                errorListeners: [errorListener]
            };

            // send new request
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            var that = this;

            // setup the async function that is executed AFTER the tile was loaded
            xhr.onloadend = function(e) {
                if (xhr.status == 200) {
                    // save rasters of parsed tiff
                    var parsed = GeoTIFF.parse(this.response);
                    urlToTiff[url].rasters = parsed.getImage().readRasters();
                    var listeners = urlToTiff[url].listeners;
                    for (var i = 0; i < listeners.length; ++i) listeners[i](urlToTiff[url]);
                    urlToTiff[url].listeners = [];
                }
                else {
                    urlToTiff[url].error = e;
                    var errorListeners = urlToTiff[url].errorListeners;
                    for (var i = 0; i < errorListeners.length; ++i) errorListeners[i](e);
                    urlToTiff[url].errorListeners = [];
                }
            }

            // send ajax request
            xhr.send();
        }
    },

    createTile: function (coords, done) {
        var tile = document.createElement('img');

        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

        if (this.options.crossOrigin || this.options.crossOrigin === '') {
            tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
        }

        /*
         Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
         http://www.w3.org/TR/WCAG20-TECHS/H67
        */
        tile.alt = '';

        /*
         Set role="presentation" to force screen readers to ignore this
         https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
        */
        tile.setAttribute('role', 'presentation');

        // tile.src = this.getTileUrl(coords);
        var src = this.getTileUrl(coords);
        this.tileLoad(tile, src, done);
        return tile;
    },
    tileLoad: function(tile, src, done) {
        var imageCanvas = document.createElement('canvas');
        imageCanvas.naturalWidth = this.options.width;
        imageCanvas.naturalHeight = this.options.height;
        imageCanvas.width = this.options.width;
        imageCanvas.height = this.options.height;

        var that = this;

        // fetch data of this tile
        this.fetchTiff(
            // url of tile
            src,

            // callback function that executes when the tiff is parsed and ready
            function(urlToTiff) {
                // get plotty instance
                var plot = this.plot;

                // set plotty settings
                plot.setDomain(this.options.domain);
                plot.setData(
                    this.data(urlToTiff.rasters),
                    this.options.width,
                    this.options.height
                );
                if(this.options.palette)
                    plot.setColorScale(this.options.palette);
                if(this.options.noDataValue !== false)
                    plot.setNoDataValue(this.options.noDataValue);

                // render plot and trigger load event
                plot.render();
                imageCanvas.getContext('2d').drawImage(plot.getCanvas(), 0, 0);
                tile.src = imageCanvas.toDataURL();
                // L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
            }.bind(this),

            // callback function in case of AJAX error
            function(error) {
                // trigger error event
                // L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));
            }
        );
    },
   /* _tileOnLoad: function (done, tile) {
        // For https://github.com/Leaflet/Leaflet/issues/3332
        if (Browser.ielt9) {
            setTimeout(Util.bind(done, this, null, tile), 0);
        } else {
            done(null, tile);
        }
    },

    _tileOnError: function (done, tile, e) {
        var errorUrl = this.options.errorTileUrl;
        if (errorUrl && tile.getAttribute('src') !== errorUrl) {
            tile.src = errorUrl;
        }
        done(e, tile);
    },*/

});

L.leafletGeotiff = function (url, options) {
    return new L.LeafletGeotiff(url, options);
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = L;
}