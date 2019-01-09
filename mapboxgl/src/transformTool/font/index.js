#!/usr/bin/env node

const fontnik = require('fontnik');
const fs = require('fs');
const path = require('path');


/**
 * 转化字体
 * @param {String} fileName 字体文件
 * @param {String} outputDir 输出目录
 */
const convert = function(fileName, outputDir) {
    const font = fs.readFileSync(path.resolve(__dirname + "/" + fileName));
    outputDir = path.resolve(__dirname, outputDir, path.basename(fileName, path.extname(fileName)));

    fs.access(outputDir, (err) => {
        // 目录不存在
        if (err) {
            fs.mkdir(outputDir, () => {
                output2pbf(font, 0, 255, outputDir);
            })
        }
        // 目录存在
        else {
            output2pbf(font, 0, 255, outputDir);
        }
    });
};

/**
 * 输出pbf文件
 * @param {Object} font 字体文件句柄
 * @param {Number} start 开始位置
 * @param {Number} end 结束位置
 * @param {String} outputDir 输出目录
 */
function output2pbf(font, start, end, outputDir) {
    if (start > 65535) {
        console.log("done!");
        return;
    }

    fontnik.range({font: font, start: start, end: end}, function(err, res) {
        // const outputFilePath = path.resolve(__dirname + "/" + outputDir + start + "-" + end + ".pbf");
        const outputFilePath = path.resolve(outputDir + '/' + start + "-" + end + ".pbf");
        fs.writeFile(outputFilePath, res, function(err){
            if(err) {
                console.error(err);
            } else {
                output2pbf(font, end+1, end+1+255, outputDir);
            }
        });
    });
}

// convert('./input/GuardianTextSansWeb-Bold.ttf', './output/');
// convert('./input/simsun.ttf', './output/');
convert('./input/weiruan_yahei.ttf', './output/');
