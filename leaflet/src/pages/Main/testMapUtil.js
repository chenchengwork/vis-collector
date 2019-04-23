export const drawWindyByJson = (mapUtil) => {
    // $.get('/asserts/data/windy_json/windy_20000.json').then((data) => {
    $.get('/asserts/data/windy_json/lv1.json').then((data) => {
    // $.get('/asserts/data/windy_json/windy_10.json').then((data) => {

        console.log("data->", data);

        const windy = mapUtil.addWindyLayer(data, {
            colorScale: ["rgb(180,0,35)"],
            frameRate: 60
        }).addTo(mapUtil.map);

        // setInterval(() => {
        //     windy.setData(data)
        // }, 2000)

        // const dataNull = [];
        // for(let i = 0; i < data[0].data.length; i++){
        //     dataNull.push(null);
        // }
        //
        // const newData = [];
        // const step = data[0].data.length / 10;
        // for(let i = 0; i < 10; i++){
        //     // console.log(data[0].data.slice(i * step, step));
        //     const start = i * step;
        //     const end = (i+1) *step;
        //     const uData = dataNull.slice();
        //     const vData = dataNull.slice();
        //     for(let j = start; j < end; j++){
        //         uData[j] = data[0].data[j];
        //         vData[j] = data[1].data[j];
        //     }
        //
        //     newData.push([
        //         {
        //             // data: data[0].data.slice(i * step, (i+1) *step),
        //             data: uData,
        //             header: data[0].header
        //         },
        //         {
        //             // data: data[1].data.slice(i * step, (i+1) * step),
        //             data: vData,
        //             header: data[1].header
        //         }
        //     ])
        // }
        //
        // let windy = null;
        //
        // newData.forEach((item, index) => {
        //     setTimeout(() => {
        //         console.log('item', item)
        //         if(!windy){
        //             windy = mapUtil.addWindyLayer(item, {
        //                 colorScale: ["rgb(180,0,35)"],
        //                 frameRate: 60
        //             }).addTo(mapUtil.map)
        //         }else{
        //             windy.setData(item)
        //         }
        //
        //     }, index * 500);
        // })

    }).catch(e => console.error(e));
};

export const drawWindyBySplitJson = (mapUtil) => {

    $.get('/asserts/data/split_windy_json/output/header.json').then((header) => {
        const splitNum = header.splitNum;
        const gridNum = header.nx * header.ny;
        // console.log('gridNum->', gridNum)
        const dataNull = [];
        let windy = null;
        for(let i = 0; i < gridNum; i++){
            dataNull.push(null);
        }

        const uData = dataNull.slice();
        const vData = dataNull.slice();
        const step = gridNum / splitNum;
        for(let i = 1; i <= splitNum; i++){
            const start = (i-1) * step;
            const end = (i) *step;

            // setTimeout(() => {
                $.get(`/asserts/data/split_windy_json/output/${i}_data.json`).then((data) => {

                    for(let j = start; j < end; j++){
                        // const uArr = data[0][j-start].split(".");
                        // const vArr = data[1][j-start].split(".");
                        // uData[j] = `${uArr[0]}.${uArr[1].slice(0, 4)}`;
                        // vData[j] = `${vArr[0]}.${vArr[1].slice(0, 4)}`;

                        uData[j] = data[0][j-start];
                        vData[j] = data[1][j-start];
                    }

                    const windData = [
                        {
                            data: uData,
                            header: {
                                ...header,
                                "parameterCategory": 2,
                                "parameterNumber": 2
                            },
                        },
                        {
                            data: vData,
                            header:{
                                ...header,
                                "parameterCategory": 2,
                                "parameterNumber": 3
                            },
                        }
                    ];

                    // console.log('windData->', windData)

                    if(!windy){
                        windy = mapUtil.addWindyLayer(windData, {
                            colorScale: ["rgb(180,0,35)"],
                            frameRate: 60
                        }).addTo(mapUtil.map);
                    }else {
                        windy.setData(windData);
                    }
                })
            // }, 1000 * i)
        }

    });
};

export const drawWindyByImg = (mapUtil) => {

    const getWindDataByImg = (jsonUrl, imgUrl) => new Promise((resolve, reject) => {

        $.get(jsonUrl).then((windyJson) => {

            const img = document.createElement("img");
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            img.setAttribute("src", imgUrl);
            img.onload = () => {
                //将图片放到canvas
                ctx.drawImage(img,0,0);
                //获取到图片数据
                const imgData = ctx.getImageData(0,0,img.width,img.height);
                //想更清楚图片数据的可以   console.log(imgData);
                //一个包含颜色信息的数组，以4个一个单位，分别表示rgba
                const data = imgData.data;
                // console.log(data);

                const [uHeader, vHeader] = windyJson;
                const {min: uMin, max: uMax} = uHeader;
                const {min: vMin, max: vMax} = vHeader;

                const windData = [
                    {
                        data: [],
                        header: uHeader
                    },
                    {
                        data: [],
                        header: vHeader
                    }
                ];
                console.log("data->", data);
                console.time("time->");
                // for(let i = 0; i < data.length; i += 4){
                //     // u风场
                //     windData[0].data.push((data[i] * (uMax - uMin) / 255 + uMin));
                //
                //     // v风场
                //     windData[1].data.push((data[i + 1] * (vMax - vMin) / 255 + vMin));
                // }

                for(let i = 0; i < data.length; i += 8){
                    const flag = data[i + 2].toString();
                    const uFlag = flag[0] == 1 ? 1 : -1;
                    const vFlag = flag[1] == 1 ? 1 : -1;
                    // u风场
                    const uInt = data[i];
                    windData[0].data.push(parseFloat(`${uInt * uFlag}.${data[i+4]}`));

                    // v风场
                    const vInt = data[i + 1];
                    windData[1].data.push(parseFloat(`${vInt * vFlag}.${data[i+5]}`));
                }
                console.timeEnd("time->");

                console.log("windData->", windData);
                resolve(windData);

                canvas.remove();
                img.remove();
            }

        }).catch(e => console.error(e));
    });

    getWindDataByImg(
        "http://localhost:4000/asserts/data/windy_img/windy_10.json",
        "http://localhost:4000/asserts/data/windy_img/windy_10.png"
        // "http://localhost:4000/asserts/data/windy_img/lv1.json",
        //     "http://localhost:4000/asserts/data/windy_img/lv1.png"

        // "http://localhost:4000/asserts/data/windy_img/test.json",
        //     "http://localhost:4000/asserts/data/windy_img/test.png"
    ).then((windData) => {
        // return;
        const windy = mapUtil.addWindyLayer(windData, {
            colorScale: ["rgb(180,0,35)"]
        }).addTo(mapUtil.map);
    })

};

export const drawWindyByTif = (mapUtil) => {
    const GeoTIFF = require('geotiff/src/main');

    // GeoTIFF.fromUrl("/asserts/data/windy_tif/u_v_tiled.tif")
    // GeoTIFF.fromUrl("/asserts/data/windy_tif/tt.tif")
    // GeoTIFF.fromUrl("/asserts/data/windy_tif/float4.tif")
    // GeoTIFF.fromUrl("/asserts/data/windy_tif/uv_4326.tif")


    let windy = null;


    const draw = (tiffs) => {
        tiffs.forEach(url => {

            GeoTIFF.fromUrl(url)
                .then((tif) => tif.getImage())
                .then((image) => {
                    // console.log("image.getBoundingBox", image.getBoundingBox());
                    const [minLng, minLat, maxLng, maxLat] = image.getBoundingBox();

                    image.readRasters().then((imageData) => {
                        const width = imageData.width;
                        const height = imageData.height;
                        const uData = imageData[0];
                        const vData = imageData[1];
                        //

                        const lngLat = {
                            "lo2": maxLng,
                            "lo1": minLng,
                            "la2": maxLat,
                            "la1": minLat,
                        };

                        const other = {
                            "dx": (maxLng - minLng) / width,
                            "dy": (minLat - maxLat) / height,
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
                                    "parameterCategory": 2,
                                    "parameterNumber": 3,
                                    ...lngLat,
                                    ...other
                                }
                            }
                        ];

                        console.log('windData->', windData)

                        // if(windy){
                        //     windy.setData(windData)
                        //     return;
                        // }

                        windy = mapUtil.addWindyLayer(windData, {
                            colorScale: ["rgb(180,0,35)"],
                            frameRate: 60
                        }).addTo(mapUtil.map);
                    })
                })
        })
    };

    // draw(["/asserts/data/windy_tif/u_v.tif"])
    draw(["/asserts/data/windy_tif/u_5_x.tif"])
    // draw(["/asserts/data/windy_tif/u_1_x.tif"])
    // draw(["/asserts/data/windy_tif/bigdataquery.tiff"])

    // draw([
    //     "/asserts/data/windy_tif/4_11_5.tif",
    //     "/asserts/data/windy_tif/4_12_5.tif",
    //     "/asserts/data/windy_tif/4_13_5.tif",
    //     "/asserts/data/windy_tif/4_14_5.tif",
    //
    //     "/asserts/data/windy_tif/4_11_6.tif",
    //     "/asserts/data/windy_tif/4_12_6.tif",
    //     "/asserts/data/windy_tif/4_13_6.tif",
    //     "/asserts/data/windy_tif/4_14_6.tif",
    //
    //     "/asserts/data/windy_tif/4_11_7.tif",
    //     "/asserts/data/windy_tif/4_12_7.tif",
    //     "/asserts/data/windy_tif/4_13_7.tif",
    //     "/asserts/data/windy_tif/4_14_7.tif",
    // ])
}


export const drawWindyByTifLayer = (mapUtil) => {
    // http://10.0.4.52:9000/api/v1/bigdataquery
    // http://localhost:4000/asserts/data/windy_tif/u_v.tif
    mapUtil.addTifWindyLayer({
        tifUrl: "http://localhost:4000/asserts/data/windy_tif/u_v.tif",
        colorScale: ["rgb(180,0,35)"],
        frameRate: 60
    });
};

// 测试WMS
export const setWMSLayer = (mapUtil) => {
    mapUtil.setWMSLayer('http://10.0.5.170:8081/rasdaman/ows', {
        crs: MapUtil.G.L.CRS.EPSG4326,
        service: "WMS",
        version: '1.3.0',
        request: "GetMap",
        layers: "radar_demo_3857",
        width: 256,
        height: 256,
        tileSize: 512,
        format:"image/png"
    });
};

// 测试鼠标事件
export const testMouse = (mapUtil) => {
    const mouseTool = mapUtil.mouseTool;
    // 开启测距
    mouseTool.measure.start();

    // 清空测距
    // setTimeout(() => {
    //     mouseTool.measure.clear();
    //     console.log('measure clear');
    // }, 5000)

    // 使用鼠标绘制形状
    // mouseTool.rectangle().then(resp => console.log(resp));
    // mouseTool.circle().then(resp => console.log(resp));
    // mouseTool.polygon().then(resp => console.log(resp));
    // mouseTool.polyline().then(resp => console.log(resp));
    // mouseTool.marker().then(resp => console.log(resp));

    // 关闭鼠标
    // setTimeout(() => {
    //     mouseTool.close();
    // }, 2000)
};

// 测试移动的marker
export const testMoveMarker = (L, mapUtil) => {
    const map = mapUtil.map;
    // const parisKievLL = [[48.8567, 2.3508], [50.45, 30.523333]];
    const parisKievLL = [[51.507222, -0.1275], [48.8567, 2.3508],[41.9, 12.5], [52.516667, 13.383333], [44.4166,26.1]];

    /**
     * 第二个参数使用说明：
     * 数组： 代表每条折线移动完成所需要的时间
     * 数字： 代表全路程所需要的时间
     */
    const marker1 = L.Marker.movingMarker(parisKievLL, [3000, 9000, 9000, 4000], {
        icon: L.icon({
            iconUrl: require('./img/marker.png'),
            iconSize: [16, 16],
            // iconAnchor: [16, 16],
        })}).addTo(map);

    L.polyline(parisKievLL).addTo(map);

    marker1.once('click', function () {
        marker1.start();
        marker1.closePopup();
        marker1.unbindPopup();
        marker1.on('click', function() {
            if (marker1.isRunning()) {
                marker1.pause();
            } else {
                marker1.start();
            }
        });

        setTimeout(function() {
            marker1.bindPopup('<b>Click me to pause !</b>').openPopup();
        }, 2000);
    });

    marker1.bindPopup('<b>Click me to start !</b>', {closeOnClick: false});
    marker1.openPopup();

}

// 测试绘制台风
export const testDrawTyphoon = (mapUtil) => {
    const lines = require("./data/testData").default;

    let polylines = [];
    let points = [];
    // 绘制单条台风
    const drawSingleTyphoon = (line) => {
        const points = [];
        const polyline = mapUtil.addPolyline(line.path);
        for (let j = 0; j < line.path.length; j++){
            const point = mapUtil.addCircleMarker(line.path[j]);
            points.push(point);
        }

        return {
            polyline,
            points
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const typhoon = drawSingleTyphoon(lines[i]);
        polylines.push(typhoon.polyline);
        points.push(typhoon.points);
    }

    return {
        polylines,
        points
    };
}

// 依据地理位置获取geo
export const testGeoCoder = (mapUtil) => {
    const geoCoder = mapUtil.geoCoder;
    geoCoder.getGeo({address: "北京市朝阳区阜通东大街6号"}).then((resp) => {
        console.log("getGeo->", resp);
    });

    geoCoder.getRegeo({location: [100.923828, 39.272688].join(",")}).then((resp) => {
        console.log("getRegeo->", resp);
    });

    geoCoder.getDistrict({keywords: "北京"}).then((resp) => {
        console.log("getDistrict->", resp);
       mapUtil.setGeoJSONLayer(resp.geoJSON, {}, true);
    }).catch(e => console.error(e));
}
