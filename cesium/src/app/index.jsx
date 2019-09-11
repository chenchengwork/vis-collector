import './Map.scss';
import CesiumUtil from './util/CesiumUtil';
import { Component } from 'react';
import {getTileServiceProvider} from "./util/constants/cesium";

export default class Map extends Component {
    constructor(props){
        super(props)
        this.state = {
            top:'20px',
            left:'20px'
        }
    }
    componentDidMount() {
        // this.drawAirLine();
        // this.draw3DTileFeature();
        this.draw3DTileForBim();
        // this.drawDem();
    }

    // 绘制航线
    drawAirLine() { //两点之间绘制弧线路径
        const Cesium = CesiumUtil.Cesium;
        const cesiumUtil = new CesiumUtil('cesiumContainer', {
            imageryProvider: new CesiumUtil.Cesium.UrlTemplateImageryProvider({
                url : getTileServiceProvider("Google.Satellite.Map"),
                maximumLevel : 5
            }), //图像图层提供者
            // imageryProvider: new CesiumUtil.Cesium.SingleTileImageryProvider({
            //     url : require('./img/earth.jpg'),
            //     //rectangle : Cesium.Rectangle.fromDegrees(-75.0, 28.0, -67.0, 29.75)
            // })
        });
        const viewer = cesiumUtil.viewer;

        // 添加路网图切片
        cesiumUtil.addMapTile('GaoDe.Satellite.Annotion');

        // 设置镜头位置与方向
        viewer.scene.camera.setView( {
            //镜头的经纬度、高度。镜头默认情况下，在指定经纬高度俯视（pitch=-90）地球
            destination : Cesium.Cartesian3.fromDegrees( 116.3, 39.9, 10000000 ),//北京10000公里上空

            //下面的几个方向正好反映默认值
            orientation: {
                heading: Cesium.Math.toRadians(0), // 代表镜头左右方向,正值为右,负值为左,360度和0度是一样的
                pitch: Cesium.Math.toRadians(-90), // 代表镜头上下方向,正值为上,负值为下.
                roll: Cesium.Math.toRadians(0) // 代表镜头左右倾斜.正值,向右倾斜,负值向左倾斜
            }
        });

        // 设置地球进入效果
        setTimeout( () =>
        {
            viewer.scene.camera.flyTo( {
                destination : Cesium.Cartesian3.fromDegrees( 116, 39.9, 17000000 ),  // 相机目标位置
                orientation : { // 相机镜头对准的方法
                    heading : Cesium.Math.toRadians( -0 ), // 代表镜头左右方向,正值为右,负值为左,360度和0度是一样的
                    pitch : Cesium.Math.toRadians( -90 ),   // 代表镜头上下方向,正值为上,负值为下.
                    roll : Cesium.Math.toRadians( 0 )       // 代表镜头左右倾斜.正值,向右倾斜,负值向左倾斜
                },
                duration : 2,//动画持续时间
                complete : () => { //飞行完毕后执行的动作
                    // console.log("动画完成")
                    // addEntities();
                }
            } );
        }, 1000 );


        viewer.scene.globe.baseColor = new Cesium.Color(8 / 255.0, 24 / 255.0, 52 / 255.0, 1.0);
        let numberOfArcs = 30;
        let startLon = 116.314295;
        let startLat = 39.904194;
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        let startTime = viewer.clock.startTime;
        let midTime = Cesium.JulianDate.addSeconds(startTime, 43200, new Cesium.JulianDate());
        let stopTime = Cesium.JulianDate.addSeconds(startTime, 86400, new Cesium.JulianDate());
        for (let i = 0; i < numberOfArcs; ++i) {
            let color = Cesium.Color.fromRandom({
                alpha: 1.0
            });
            let stopLon = Cesium.Math.nextRandomNumber() * 358 - 179;
            let stopLat = Cesium.Math.nextRandomNumber() * 178 - 89;
            let property = new Cesium.SampledPositionProperty();
            let startPosition = Cesium.Cartesian3.fromDegrees(startLon, startLat, 0);
            property.addSample(startTime, startPosition);
            let stopPosition = Cesium.Cartesian3.fromDegrees(stopLon, stopLat, 0);
            property.addSample(stopTime, stopPosition);
            let midPoint = Cesium.Cartographic.fromCartesian(property.getValue(midTime));
            midPoint.height = Cesium.Math.nextRandomNumber() * 500000 + 800000;
            let midPosition = viewer.scene.globe.ellipsoid.cartographicToCartesian(
                midPoint, new Cesium.Cartesian3());
            property = new Cesium.SampledPositionProperty();
            property.addSample(startTime, startPosition);
            property.addSample(midTime, midPosition);
            property.addSample(stopTime, stopPosition);
            let arcEntity = viewer.entities.add({
                position: property,
                // point: {
                //     pixelSize: 8,
                //     color: Cesium.Color.TRANSPARENT,
                //     outlineColor: color,
                //     outlineWidth: 3
                // },
                model: {
                    uri: '/asserts/Cesium_Air.gltf',
                    minimumPixelSize: 32
                },
                orientation: new Cesium.VelocityOrientationProperty(property),
                path: {
                    resolution: 1200,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.16,
                        color: color
                    }),
                    width: 5,
                    leadTime: 1e10,
                    trailTime: 1e10
                }
            });
            arcEntity.position.setInterpolationOptions({
                interpolationDegree: 5,
                interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
            });
        }

        // 屏幕空间点击事件
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        const self = this;
        handler.setInputAction( (click1) => {
            var pickedObject = viewer.scene.pick(click1.position); //点击
            // var pickedObject = viewer.scene.pick(click1.endPosition);//鼠标移动
            // self.tooltip.style.top = click1.position.y;
            // self.tooltip.style.left = click1.position.x;
            // self.tooltip.innerHTML = "1111"
            this.setState({
                top: click1.position.y + 'px',
                left: click1.position.x + 'px',
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    // 绘制3d tile
    draw3DTileForBim = () => {
        const Cesium = CesiumUtil.Cesium;
        const cesiumUtil = new CesiumUtil('cesiumContainer', {
            imageryProvider: new CesiumUtil.Cesium.UrlTemplateImageryProvider({
                url : getTileServiceProvider("Google.Satellite.Map"),
                maximumLevel : 5
            }),
        });
        const viewer = cesiumUtil.viewer;
        const scene = viewer.scene;
        const tileset = scene.primitives.add(
            new Cesium.Cesium3DTileset({
                // url: Cesium.IonResource.fromAssetId(8564),
                url: "http://localhost:4000/asserts/school_3d_tile/tileset.json",
            })
        );

        tileset.readyPromise.then(function(tileset) {
            viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 4.0));
        }).otherwise(function(error) {
            console.log(error);
        });

        tileset.colorBlendMode = Cesium.Cesium3DTileColorBlendMode.REPLACE;
    }

    // 绘制3D tile feature
    draw3DTileFeature = () => {
        const Cesium = CesiumUtil.Cesium;
        const cesiumUtil = new CesiumUtil('cesiumContainer', {
            terrainProvider: Cesium.createWorldTerrain(),
            // sceneMode : Cesium.SceneMode.SCENE2D
        });
        const viewer = cesiumUtil.viewer;

        viewer.scene.globe.depthTestAgainstTerrain = true;

// Set the initial camera view to look at Manhattan
        var initialPosition = Cesium.Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 749);
        var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
        viewer.scene.camera.setView({
            destination: initialPosition,
            orientation: initialOrientation,
            endTransform: Cesium.Matrix4.IDENTITY
        });

// Load the NYC buildings tileset.
        var tileset = new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(4693) });
        viewer.scene.primitives.add(tileset);

// Color buildings based on their height.
        function colorByHeight() {
            tileset.style = new Cesium.Cesium3DTileStyle({
                color: {
                    conditions: [
                        ["${height} >= 300", "rgba(45, 0, 75, 0.5)"],
                        ["${height} >= 200", "rgb(102, 71, 151)"],
                        ["${height} >= 100", "rgb(170, 162, 204)"],
                        ["${height} >= 50", "rgb(224, 226, 238)"],
                        ["${height} >= 25", "rgb(252, 230, 200)"],
                        ["${height} >= 10", "rgb(248, 176, 87)"],
                        ["${height} >= 5", "rgb(198, 106, 11)"],
                        ["true", "rgb(127, 59, 8)"]
                    ]
                }
            });
        }

// Color buildings by their latitude coordinate.
        function colorByLatitude() {
            tileset.style = new Cesium.Cesium3DTileStyle({
                defines: {
                    latitudeRadians: "radians(${latitude})"
                },
                color: {
                    conditions: [
                        ["${latitudeRadians} >= 0.7125", "color('purple')"],
                        ["${latitudeRadians} >= 0.712", "color('red')"],
                        ["${latitudeRadians} >= 0.7115", "color('orange')"],
                        ["${latitudeRadians} >= 0.711", "color('yellow')"],
                        ["${latitudeRadians} >= 0.7105", "color('lime')"],
                        ["${latitudeRadians} >= 0.710", "color('cyan')"],
                        ["true", "color('blue')"]
                    ]
                }
            });
        }

// Color buildings by distance from a landmark.
        function colorByDistance() {
            tileset.style = new Cesium.Cesium3DTileStyle({
                defines : {
                    distance : "distance(vec2(radians(${longitude}), radians(${latitude})), vec2(-1.291777521, 0.7105706624))"
                },
                color : {
                    conditions : [
                        ["${distance} > 0.0012","color('gray')"],
                        ["${distance} > 0.0008", "mix(color('yellow'), color('red'), (${distance} - 0.008) / 0.0004)"],
                        ["${distance} > 0.0004", "mix(color('green'), color('yellow'), (${distance} - 0.0004) / 0.0004)"],
                        ["${distance} < 0.00001", "color('white')"],
                        ["true", "mix(color('blue'), color('green'), ${distance} / 0.0004)"]
                    ]
                }
            });
        }

        // Color buildings with a '3' in their name.
        function colorByNameRegex() {
            tileset.style = new Cesium.Cesium3DTileStyle({
                color : "(regExp('3').test(String(${name}))) ? color('cyan', 0.9) : color('purple', 0.1)"
            });
        }

        // Show only buildings greater than 200 meters in height.
        function hideByHeight() {
            tileset.style = new Cesium.Cesium3DTileStyle({
                show : "${height} > 200"
            });
        }

        // Sandcastle.addToolbarMenu([{
        //     text : 'Color By Height',
        //     onselect : function() {
        //         colorByHeight();
        //     }
        // }, {
        //     text : 'Color By Latitude',
        //     onselect : function() {
        //         colorByLatitude();
        //     }
        // }, {
        //     text : 'Color By Distance',
        //     onselect : function() {
        //         colorByDistance();
        //     }
        // }, {
        //     text : 'Color By Name Regex',
        //     onselect : function() {
        //         colorByNameRegex();
        //     }
        // }, {
        //     text : 'Hide By Height',
        //     onselect : function() {
        //         hideByHeight();
        //     }
        // }]);

        colorByHeight();
    }


    fly(Cesium, viewer) {
        // viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;

        // 模拟飞行数据
        const simulateFlyData = () => {
            const startLon = 116.314295;
            const startLat = 39.904194;

            let data = [];
            let count = 10;
            for(let i = 0; i < count; i++){
                data.push({
                    lon: startLon - i * 10,
                    lat: startLat,
                    height: i == 0 || i == count -1 ? 0 : Cesium.Math.nextRandomNumber() * 500000 + 800000 * 2,
                    time: i == 0 ? 0 : i * 10,
                })
            }

            return data;
        }

        const startTime = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));

        // 创建飞行路径
        const createFlightPath = () => {
            let property = new Cesium.SampledPositionProperty();
            const data = simulateFlyData();

            for (let i = 0; i < data.length; ++i) {
                const { lon, lat, height, time } = data[i];

                // let position = viewer.scene.globe.ellipsoid.cartographicToCartesian(new Cesium.Cartographic(lon, lat, height));
                let position = Cesium.Cartesian3.fromDegrees(lon, lat, height);
                if (i == 0) console.log("start",position)
                property.addSample(
                    Cesium.JulianDate.addSeconds(startTime, time, new Cesium.JulianDate()),
                    position
                );
            }

            return {
                property,
                // startTime: Cesium.JulianDate.addSeconds(startTime, data[0].time, new Cesium.JulianDate()),
                startTime,
                stopTime: Cesium.JulianDate.addSeconds(startTime, data[data.length -1].time, new Cesium.JulianDate()),
            }
        };

        const { property, stopTime } = createFlightPath();

        viewer.clock.startTime = startTime.clone();
        viewer.clock.stopTime = stopTime.clone();
        viewer.clock.currentTime = startTime.clone();
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
        viewer.clock.multiplier = 10;

        // viewer.timeline.zoomTo(startTime, stopTime);

        // 屏幕空间点击事件
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function (click1) {
            console.log(click1);
            var pickedObject = viewer.scene.pick(click1.position);
            console.log(pickedObject);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


        let arcEntity = viewer.entities.add({
            //Set the entity availability to the same interval as the simulation time.
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start: startTime,
                stop: stopTime
            })]),

            //Load the Cesium plane model to represent the entity
            model: {
                uri: '/asserts/Cesium_Air.gltf',
                minimumPixelSize: 64
            },
            orientation: new Cesium.VelocityOrientationProperty(property),

            position: property,

            path: {
                resolution: 1200,
                material: new Cesium.PolylineGlowMaterialProperty({
                    glowPower: 0.16,
                    color: Cesium.Color.fromRandom({
                        alpha: 1.0
                    })
                }),
                width: 5,
                leadTime: 1e10,
                trailTime: 1e10
            }
        });
    }

    // 加载地形数据
    drawDem = () => {
        const Cesium = CesiumUtil.Cesium;
        const cesiumUtil = new CesiumUtil('cesiumContainer', {
            imageryProvider: new CesiumUtil.Cesium.UrlTemplateImageryProvider({
                url : getTileServiceProvider("Google.Satellite.Map"),
                maximumLevel : 28
            }),
            terrainProvider: new Cesium.CesiumTerrainProvider({
                url: "http://10.0.3.221:8000/tilesets/terrain"
            }),
            baseLayerPicker: false,
        });
        const viewer = cesiumUtil.viewer;
        const scene = viewer.scene;

        // 相机飞入目标, 当前是北京坐标116.395645038,39.9299857781
        viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(116.395645038,39.9299857781,15000.0)
        });
    };


    render() {
        const {top,left} = this.state;
        return (
            <div className="cesium-map">
                <div id="cesiumContainer" style={{height:'100%'}}></div>
            </div>
        );
    }
}
