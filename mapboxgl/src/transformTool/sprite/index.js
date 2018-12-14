#!/usr/bin/env node

const spritezero = require('@mapbox/spritezero');
const fs = require('fs');
const glob = require('glob');
const path = require('path');

const inputDir = 'input';       // 源目录
const outputDir = 'output';     // 输出目录

[1, 2, 4].forEach(function(pxRatio) {
    const svgs = glob.sync(path.resolve(path.join(__dirname, `${inputDir}/*.svg`)))
        .map((f) => ({
            svg: fs.readFileSync(f),
            id: path.basename(f).replace('.svg', '')
        }));
    const pngPath = path.resolve(path.join(__dirname, `${outputDir}/sprite@${pxRatio}x.png`));
    const jsonPath = path.resolve(path.join(__dirname, `${outputDir}/sprite@${pxRatio}x.json`));

    // Pass `true` in the layout parameter to generate a data layout
    // suitable for exporting to a JSON sprite manifest file.
    // format设置为true，生成json描述文件
    spritezero.generateLayout({ imgs: svgs, pixelRatio: pxRatio, format: true }, (err, dataLayout) => {
        if (err) return;
        fs.writeFileSync(jsonPath, JSON.stringify(dataLayout));
    });

    // Pass `false` in the layout parameter to generate an image layout
    // suitable for exporting to a PNG sprite image file.
    // format设置为false，生成所有icon整合的图片
    spritezero.generateLayout({ imgs: svgs, pixelRatio: pxRatio, format: false }, (err, imageLayout) => {
        spritezero.generateImage(imageLayout, (err, image) => {
            if (err) return;
            fs.writeFileSync(pngPath, image);
        });
    });
});
