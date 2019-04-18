import Windy from './Windy';
(function(L, Windy){

    L.WindyTileLayer = L.GridLayer.extend({
        options: {
            tileSize: 512
        },

        initialize: function(options) {
            // console.log('222')
            L.setOptions(this, options);
        },

        createTile: function (coords, done) {
            // console.log("coords->", coords)
            var tile = document.createElement('div');
            tile.innerHTML = [coords.x, coords.y, coords.z].join(', ');
            tile.style.outline = '1px solid red';

            setTimeout(function () {
                done(null, tile);	// Syntax is 'done(error, tile)'
            }, 500 + Math.random() * 1500);

            return tile;
        }

    });

    L.windyTileLayer = function(options) {
        return new L.WindyTileLayer(options);
    };
})(L, Windy)
