import React, {useRef, useEffect} from "react";

import WindGL from './glWindy';

const Windy = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        getDataByImg()
        const canvas = canvasRef.current;
        const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
        const gl = canvas.getContext('webgl', {antialiasing: false});

        const wind = new WindGL(gl);
        wind.numParticles = 65536;

        function frame() {
            if (wind.windData) {
                wind.draw();
            }
            requestAnimationFrame(frame);
        }
        frame();


        function updateRetina() {
            const ratio = pxRatio;
            canvas.width = canvas.clientWidth * ratio;
            canvas.height = canvas.clientHeight * ratio;
            wind.resize();
        }
        updateRetina();


        // 获取风场数据
        getWindData(0).then((data) => {
            console.log(data);
            wind.setWind(data);
        })
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                width: "100%",
                height: "100%",
                backgroundColor: "#000"
            }}
        />
    )
};


export default Windy;


const getWindData = (name) => new Promise((resolve, reject) => {
    const windFiles = {
        0: 'a',
        1: '2016112000',
        6: '2016112006',
        12: '2016112012',
        18: '2016112018',
        24: '2016112100',
        30: '2016112106',
        36: '2016112112',
        42: '2016112118',
        48: '2016112200'
    };

    const getJSON = (url, callback) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open('get', url, true);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                callback(xhr.response);
            } else {
                throw new Error(xhr.statusText);
            }
        };
        xhr.send();
    };


    getJSON('http://localhost:4000/example/windy_demo/wind/' + windFiles[name] + '.json', function (windData) {
        const windImage = new Image();
        windData.image = windImage;
        windImage.src = 'http://localhost:4000/example/windy_demo/wind/' + windFiles[name] + '.png';
        windImage.onload = function () {
            // wind.setWind(windData);
            resolve(windData);
        };
    });
});

const getDataByImg = () => {
    const img = document.createElement("img");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    img.setAttribute("src", "http://localhost:4000/example/windy_demo/wind/a.png");
    img.onload = () => {
        //将图片放到canvas
        ctx.drawImage(img,0,0);
        console.log(img.height);
        //获取到图片数据
        //开始复制的左上角位置的 x 坐标,开始复制的左上角位置的 y 坐标,将要复制的矩形区域的宽度。将要复制的矩形区域的高度。
        const imgData = ctx.getImageData(0,0,img.width,img.height);
        //想更清楚图片数据的可以   console.log(imgData);
        //一个包含颜色信息的数组，以4个一个单位，分别表示rgba
        const data = imgData.data;
        console.log(data);



        const descInfo = {
            "uMin": -25,
            "uMax": 26.56,
            "vMin": -28.26,
            "vMax": 25.26
        };

        const windy = [
            {
                data: [],
                header: {}
            },
            {
                data: [],
                header: {}
            }
        ];

        console.time("time->");
        for(let i = 0; i < data.length; i += 4){
            // u风场
            windy[0].data.push(data[i] * (descInfo.uMax - descInfo.uMin) / 255 + descInfo.uMin);

            // v风场
            windy[1].data.push(data[i+1] * (descInfo.vMax - descInfo.vMin) / 255 + descInfo.vMin);
        }
        console.timeEnd("time->");
        console.log(windy);
    }
}
