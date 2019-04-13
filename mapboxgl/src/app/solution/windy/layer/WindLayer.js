import mapboxgl from "mapbox-gl";
import WindGL from '../glWindy';

export default class WindLayer {
    constructor(opts) {
        opts = Object.assign({
            id: "wind_layer",
        }, opts);

        // 以下是必加属性
        this.id = opts.id;
        this.type = 'custom';
        this.renderingMode = "3d";
    }


    onAdd(map, gl) {
        this.map = map;
        this.windData = null;
        const canvas = map.getCanvas();

        const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
        // const gl = canvas.getContext('webgl', {antialiasing: false});

        const wind = this.wind = new WindGL(gl);
        wind.numParticles = 65536;

        // function frame() {
        //     if (wind.windData) {
        //         wind.draw();
        //     }
        //     requestAnimationFrame(frame);
        // }
        // frame();


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
            wind.draw();
            this.windData = data;
        })

    }

    render(gl, matrix) {
        // console.log(this.windData)
        // if(this.windData){
        //     this.wind.draw();
        // }

    }
}




const getWindData = (name) => new Promise((resolve, reject) => {
    const windFiles = {
        0: '2016112000',
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
