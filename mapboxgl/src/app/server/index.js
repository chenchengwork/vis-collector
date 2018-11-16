const MBTiles = require('@mapbox/mbtiles');

new MBTiles('./data/trails.mbtiles?mode={ro, rw, rwc}', function(err, mbtiles) {
    console.log(mbtiles) // mbtiles object with methods listed below

    mbtiles.getTile(1, 1, 1, function(err, data, headers) {
        console.log(data)
        // `data` is your gzipped buffer - use zlib to gunzip or inflate
    });
});
