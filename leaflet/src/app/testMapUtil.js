export const drawWindyByJson = (mapUtil) => {
    // $.get('/asserts/data/windy_json/windy_20000.json').then((data) => {
    // $.get('/asserts/data/windy_json/lv1.json').then((data) => {
    $.get('/asserts/data/windy_json/windy_10.json').then((data) => {
        const windy = mapUtil.addWindyLayer(data, {
            // crs: L.CRS.EPSG3857,
            // colorScale: [
            //     "rgb(36,104, 180)",
            //     "rgb(60,157, 194)",
            //     "rgb(128,205,193 )",
            //     "rgb(151,218,168 )",
            //     "rgb(198,231,181)",
            //     "rgb(238,247,217)",
            //     "rgb(255,238,159)",
            //     "rgb(252,217,125)",
            //     "rgb(255,182,100)",
            //     "rgb(252,150,75)",
            //     "rgb(250,112,52)",
            //     "rgb(245,64,32)",
            //     "rgb(237,45,28)",
            //     "rgb(220,24,32)",
            //     "rgb(180,0,35)"
            // ]
        }).addTo(mapUtil.map);

        // 动态设置windy数据
        // setTimeout(() => {
        //     $.get('/asserts/data/windy_json/windy_10.json').then((data) => {
        //         windy.setData(data)
        //     })
        // }, 4000)
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

                const descInfo = {
                    "uMin": -25,
                    "uMax": 26.56,
                    "vMin": -28.26,
                    "vMax": 25.26
                };
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

                console.time("time->");
                for(let i = 0; i < data.length; i += 4){
                    const flag = data[i+2] == 0 ? -1 : 1;
                    // console.log(data[i+2])
                    // u风场
                    windData[0].data.push((data[i] * (uMax - descInfo.uMin) / 255 + uMin) * flag);

                    // v风场
                    windData[1].data.push((data[i+1] * (vMax - vMin) / 255 + vMin) * flag);
                }
                console.timeEnd("time->");

                console.log(windData);
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
    ).then((windData) => {
        const windy = mapUtil.addWindyLayer(windData, {

        }).addTo(mapUtil.map);
    })

};
