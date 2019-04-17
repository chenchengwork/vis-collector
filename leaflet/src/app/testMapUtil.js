export const drawWindyByJson = (mapUtil) => {
    // $.get('/asserts/data/windy_json/windy_20000.json').then((data) => {
    // $.get('/asserts/data/windy_json/lv1.json').then((data) => {
    $.get('/asserts/data/windy_json/windy_10.json').then((data) => {

        console.log("data->", data);
        const newData = [
            {
                data: data[0].data,
                header: data[0].header
            },
            {
                data: data[1].data,
                header: data[1].header
            }
        ]
        data[0].data = data[0].data.slice(0, 5000)
        data[1].data = data[1].data.slice(0, 5000)
        console.log(data)

        const windy = mapUtil.addWindyLayer(data, {
            colorScale: ["rgb(180,0,35)"]
        }).addTo(mapUtil.map);

        setTimeout(() => {
            windy.setData(newData);
        }, 3000)

    }).catch(e => console.error(e));
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
    GeoTIFF.fromUrl("/asserts/data/windy_tif/uv_4326.tif")
    // GeoTIFF.fromUrl("/asserts/data/windy_tif/test_4326_byte_d4.tif")
        .then((tif) => tif.getImage())
        .then((image) => {
            // console.log("image.getBoundingBox", image.getBoundingBox());
            const [minLng, minLat, maxLng, maxLat] = image.getBoundingBox();

            image.readRasters().then((imageData) => {
                const width = imageData.width;
                const height = imageData.height;
                const uData = imageData[0];
                const vData = imageData[1];

                const lngLat = {
                    // "lo2": maxLng,
                    // "lo1": minLng,
                    // "la2": maxLat,
                    // "la1": minLat,


                    "lo2": maxLng,
                    "lo1": minLng,
                    "la2": maxLat,
                    "la1": minLat,
                }

                const other = {
                    "dx": (maxLng - minLng) / width,
                    "dy": (minLat - maxLat) / height,
                    // dx: "0.040544070051016054",
                    // dy: "-0.028572421603732637",
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
                            "lo2": 359,
                            "lo1": 0,
                            "dx": 1,
                            "dy": 1,
                            "nx": 360,
                            "ny": 181,
                            "la2": -90,
                            "la1": 90,
                            "parameterCategory": 2,
                            "parameterNumber": 3,
                            ...lngLat,
                            ...other
                        }
                    }
                ];

                console.log('windData->', windData)
                // const windy = mapUtil.addWindyLayer(windData, {
                //     colorScale: ["rgb(180,0,35)"]
                // }).addTo(mapUtil.map);
            })
        })


}
