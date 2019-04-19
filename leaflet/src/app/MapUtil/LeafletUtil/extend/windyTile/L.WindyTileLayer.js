import Windy from './Windy';
(function(L, Windy){

    L.WindyTileLayer = L.GridLayer.extend({
        options: {
            tileSize: 256
        },

        initialize: function(options) {
            // console.log('222')
            L.setOptions(this, options);
            console.log(this)
            this.on("load", () => {
                console.log(this._tiles)
            })
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
            // const tile = document.createElement('canvas');
            const tile = L.DomUtil.create("img");
            tile.innerHTML = [coords.x, coords.y, coords.z].join(', ');
            tile.style.outline = '1px solid red';

            setTimeout(function () {
                done(null, tile);	// Syntax is 'done(error, tile)'
            }, 500 + Math.random() * 1500);

            const tileBounds = this._tileCoordsToBounds(coords);
// console.log('coords->',  this._tileCoordsToBounds(coords))
// console.log(this._tiles);
            const {x, y, z} = coords;
            tile.setAttribute("src", `http://10.0.4.101:59249/tile/${z}/${x}/${y}.tif`);
            // fetch(`http://10.0.4.101:59249/tile/${z}/${x}/${y}.tif`)
            return tile;
        },

    });

    L.windyTileLayer = function(options) {
        return new L.WindyTileLayer(options);
    };
})(L, Windy)
