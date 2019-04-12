// olGeoTiff class

/**
 * base class for openlayers geotiff support
 * @param {*} layer 
 */
function olGeoTiff(layer) {
  // layer of the OL map that holds the tiff tiles
  this.layer = layer;

  // options object for plotty plot
  this.plotOptions = {
    domain: [-1, 1],
    width: 256,
    height: 256,
    noDataValue: false,
    palette: null,

    /**
     * data array
     * @param rasters parsed geotiff multiband data
     * @returns array of float values calculated by dataFunction()
     */
    data: function(rasters) {
      var data = [];
        console.log(rasters);
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

    /**
     * data function
     * @param b array single arrayitem of parsed geotiff multiband data
     * @return float calculated value (by default returns the first band)
     */
    dataFunction: function(b) {
      return b[1];
    },
  };

  // object that holds all rastered tiffs identified by their url
  this.urlToTiff = {};

  // plotty instance for this layer
  this.plot = new plotty.plot({});
    // this sets the custom tile load function on init of this class
  this.layer.getSource().setTileLoadFunction(this.tileLoadFunction.bind(this));
}

/**
 * fetch tiff and set callbacks
 * @param {*} url url of the geotiff file
 * @param {*} listener callback on ajax success
 * @param {*} errorListener callback on ajax error
 */
olGeoTiff.prototype.fetchTiff = function(url, listener, errorListener) {
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
}

/**
 * custom tile load function
 * @param {*} imageTile 
 * @param {*} src 
 */
olGeoTiff.prototype.tileLoadFunction = function(imageTile, src) {

    // replace the imageTile with a canvas
  var imageCanvas = document.createElement('canvas');
  imageCanvas.naturalWidth = this.plotOptions.width;
  imageCanvas.naturalHeight = this.plotOptions.height;
  imageCanvas.width = this.plotOptions.width;
  imageCanvas.height = this.plotOptions.height;
  imageTile.unlistenImage_();
  imageTile.image_ = imageCanvas;

  imageTile.imageListenerKeys_ = [
    ol.events.listenOnce(imageTile.image_, ol.events.EventType.ERROR,
      imageTile.handleImageError_, imageTile),
    ol.events.listenOnce(imageTile.image_, ol.events.EventType.LOAD,
      imageTile.handleImageLoad_, imageTile)
  ];

  // fetch data of this tile
  this.fetchTiff(
    // url of tile
    src,
    
    // callback function that executes when the tiff is parsed and ready
    function(urlToTiff) {
      // get plotty instance
      var plot = this.plot;

      // set plotty settings
      plot.setDomain(this.plotOptions.domain);
      plot.setData(
        this.plotOptions.data(urlToTiff.rasters),
        this.plotOptions.width,
        this.plotOptions.height
      );
      if(this.plotOptions.palette)
        plot.setColorScale(this.plotOptions.palette);
      if(this.plotOptions.noDataValue !== false)
        plot.setNoDataValue(this.plotOptions.noDataValue);

      // render plot and trigger load event
      plot.render();
      imageCanvas.getContext('2d').drawImage(plot.getCanvas(), 0, 0);
      imageCanvas.dispatchEvent(new Event('load'));
    }.bind(this),

    // callback function in case of AJAX error
    function(error) {
      // trigger error event
      imageCanvas.dispatchEvent(new Event('error'));
    }
  );
};

/**
 * redraw the given layer
 */
olGeoTiff.prototype.redraw = function() {
    this.layer.getSource().refresh();
}
