const PNG = require('pngjs').PNG;
const fs = require('fs');
const path = require("path");

const srcFile = process.argv[2];    // srcJson/windy_10.json
if(!srcFile){
    throw new Error("请传入源文件")
}

if(!fs.existsSync(srcFile)){
    throw new Error(`${srcFile}文件不存在!`);
}

const name = process.argv[3] || path.basename(srcFile, ".json");

const data = JSON.parse(fs.readFileSync(srcFile));
// const data = JSON.parse(fs.readFileSync('windy_10.json'));
// const data = JSON.parse(fs.readFileSync('creat_big.json'));

const getMin = (data) => {
    let value = 0;
    data.forEach(item => value = Math.min(value, item));
    return value;
};

const getMax = (data) => {
    let value = 0;
    data.forEach(item => value = Math.max(value, item));
    return value;
};

const u = {
    values: data[0].data,
    minimum: getMin(data[0].data),
    maximum: getMax(data[0].data),
    Ni: data[0].header.nx,
    Nj: data[0].header.ny,
    refTime: data[0].header.refTime,
};
const v = {
    values: data[1].data,
    minimum: getMin(data[1].data),
    maximum: getMax(data[1].data),
    Ni: data[1].header.nx,
    Nj: data[1].header.ny,
    refTime: data[1].header.refTime,
};

// 以下是windy.js
if(true) {

    let width = u.Ni;
// let height = u.Nj - 1;
    let height = u.Nj;

    const png = new PNG({
        colorType: 2,
        filterType: 4,
        width: width,
        height: height * 2
    });

    // for (let y = 0; y < height; y++) {
    //     for (let x = 0; x < width; x++) {
    //         const i = (y * width + x) * 4;
    //         // const k = y * width + (x + width / 2) % width;
    //         const k = y * width + x;
    //         png.data[i + 0] = Math.floor(255 * (u.values[k] - u.minimum) / (u.maximum - u.minimum));
    //         png.data[i + 1] = Math.floor(255 * (v.values[k] - v.minimum) / (v.maximum - v.minimum));
    //         png.data[i + 2] = 0;
    //         png.data[i + 3] = 255;
    //     }
    // }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 8;
            const k = y * width + x;
            const uArr = u.values[k].toString().split(".");
            const uInt = parseInt(uArr[0]);
            const uDecimal = parseInt(uArr[1]);

            const vArr = v.values[k].toString().split(".");
            const vInt = parseInt(vArr[0]);
            const vDecimal = parseInt(vArr[1]);

            // png.data[i + 0] = Math.floor(255 * (u.values[k] - u.minimum) / (u.maximum - u.minimum));
            // png.data[i + 1] = Math.floor(255 * (v.values[k] - v.minimum) / (v.maximum - v.minimum));
            png.data[i + 0] = Math.abs(uInt);
            png.data[i + 1] = Math.abs(vInt);
            png.data[i + 2] = parseInt(`${uInt > 0 ? 1 : 2}${vInt > 0 ? 1 : 2}`);
            png.data[i + 3] = 255;

            png.data[i + 4] = uDecimal;
            png.data[i + 5] = vDecimal;
            png.data[i + 6] = 0;
            png.data[i + 7] = 255;
        }
    }

    png.pack().pipe(fs.createWriteStream(`output/${name}.png`));


// TODO 以下是windy.js的json格式
    data[0].header.min = u.minimum;
    data[0].header.max = u.maximum;
    data[1].header.min = v.minimum;
    data[1].header.max = v.maximum;
    fs.writeFileSync(`output/${name}.json`, JSON.stringify([data[0].header, data[1].header], null, 2) + '\n');

}
// 以下是webgl-windy.js
else {

    let width = u.Ni;
    // let height = u.Nj - 1;
    let height = u.Nj;

    const png = new PNG({
        colorType: 2,
        filterType: 4,
        width: width,
        height: height
    });

// for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//         const i = (y * width + x) * 4;
//         const k = y * width + (x + width / 2) % width;
//         png.data[i + 0] = Math.floor(255 * (u.values[k] - u.minimum) / (u.maximum - u.minimum));
//         png.data[i + 1] = Math.floor(255 * (v.values[k] - v.minimum) / (v.maximum - v.minimum));
//         // png.data[i + 2] = 0;
//         png.data[i + 2] = u.values[k] < 0 ? 0 : 1;
//         png.data[i + 3] = 255;
//     }
// }


    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            // const k = y * width + (x + width / 2) % width;
            const k = y * width + x;
            png.data[i + 0] = Math.floor(255 * (u.values[k] - u.minimum) / (u.maximum - u.minimum));
            png.data[i + 1] = Math.floor(255 * (v.values[k] - v.minimum) / (v.maximum - v.minimum));
            png.data[i + 2] = 0;
            png.data[i + 3] = 255;
        }
    }

    png.pack().pipe(fs.createWriteStream(`output/${name}_webgl.png`));

// // TODO 以下是webgl-windy的json格式
    //
    fs.writeFileSync(`output/${name}_webgl.json`, JSON.stringify({
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

}
