const PNG = require('pngjs').PNG;
const fs = require('fs');

// const data = JSON.parse(fs.readFileSync('windy_10.json'));
const data = JSON.parse(fs.readFileSync('creat_big.json'));
// const name = process.argv[2];
const name = "a";
console.log(data)
// const uData = data[0];
// const vData = data[1];

const getMin = (data) => {
    let min = 0;
    for(let i = 0; i < data.length; i++){
        if(min > data[i]){
            min = data[i];
        }
    }

    return min;
}

const getMax = (data) => {
    let max = 0;
    for(let i = 0; i < data.length; i++){
        if(max < data[i]){
            max = data[i];
        }
    }

    return max;
}

const u = {
    values: data[0].data,
    // minimum: Math.min(...data[0].data),
    minimum: getMin(...data[0].data),
    // maximum: Math.max(...data[0].data),
    maximum: getMax(...data[0].data),
    Ni: data[0].header.nx,
    Nj: data[0].header.ny,
    refTime: data[0].header.refTime,
};
const v = {
    values: data[1].data,
    // minimum: Math.min(...data[1].data),
    minimum: Math.getMin(...data[1].data),
    // maximum: Math.max(...data[1].data),
    maximum: getMax(...data[1].data),
    Ni: data[1].header.nx,
    Nj: data[1].header.ny,
    refTime: data[1].header.refTime,
};

const width = u.Ni;
const height = u.Nj - 1;

const png = new PNG({
    colorType: 2,
    filterType: 4,
    width: width,
    height: height
});

for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const k = y * width + (x + width / 2) % width;
        png.data[i + 0] = Math.floor(255 * (u.values[k] - u.minimum) / (u.maximum - u.minimum));
        png.data[i + 1] = Math.floor(255 * (v.values[k] - v.minimum) / (v.maximum - v.minimum));
        png.data[i + 2] = 0;
        png.data[i + 3] = 255;
    }
}

png.pack().pipe(fs.createWriteStream(name + '.png'));

fs.writeFileSync(name + '.json', JSON.stringify({
    source: 'http://nomads.ncep.noaa.gov',
    // date: formatDate(u.dataDate + '', u.dataTime),
    date: u.refTime,
    width: width,
    height: height,
    uMin: u.minimum,
    uMax: u.maximum,
    vMin: v.minimum,
    vMax: v.maximum
}, null, 2) + '\n');

function formatDate(date, time) {
    return date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2) + 'T' +
        (time < 10 ? '0' + time : time) + ':00Z';
}
