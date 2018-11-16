import 'cesium/Widgets/widgets.css';
import Cesium from 'cesium/Cesium';
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZmVkNGM5Yy1jM2ZmLTQ0NzUtYTFhOC04MmFmODA2MGU2ZmEiLCJpZCI6NTA3NSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU0MjMzNzUyN30.-NA29yKDQomcNzRBgQF4pAs7HPV7jEEClsR6P82g8zc"
import { getTileServiceProvider} from './constants/cesium';

export default class CesiumUtil{
    /**
     * Cesium 对象
     */
    static Cesium = Cesium;


    /**
     *
     * @param {String} containerId 容器domID
     * @param {Object} options viewer options
     */
    constructor(containerId, options = {}) {
        this.viewer = this.initViewer(containerId, options);

        // const scene = viewer.scene;         // 场景
        // const canvas = viewer.canvas;       // canvas
        // const clock = viewer.clock;         // 时钟
        // const camera = viewer.scene.camera; // 相机
        // const entities = viewer.entities;   //
    }

    /**
     * 初始化viewer
     * @param {String} containerId 器domID
     * @param {Object} options viewer options
     * @return {*}
     */
    initViewer(containerId, options = {}){
        const viewer = new Cesium.Viewer(containerId, Object.assign({
            animation : true,//是否创建动画小器件，左下角仪表
            timeline : true,//是否显示时间轴
            baseLayerPicker : false,//是否显示图层选择器
            fullscreenButton : true,//是否显示全屏按钮
            geocoder : false,//是否显示geocoder小器件，右上角查询按钮
            homeButton : false,//是否显示Home按钮
            infoBox : false,//是否显示信息框
            sceneModePicker : true,//是否显示3D/2D选择器
            selectionIndicator : false,//是否显示选取指示器组件
            navigationHelpButton : false,//是否显示右上角的帮助按钮
            scene3DOnly : false,//如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
            clock : new Cesium.Clock(),//用于控制当前时间的时钟对象
            selectedImageryProviderViewModel : undefined,//当前图像图层的显示模型，仅baseLayerPicker设为true有意义
            imageryProviderViewModels : Cesium.createDefaultImageryProviderViewModels(),//可供BaseLayerPicker选择的图像图层ProviderViewModel数组
            selectedTerrainProviderViewModel : undefined,//当前地形图层的显示模型，仅baseLayerPicker设为true有意义
            terrainProviderViewModels : Cesium.createDefaultTerrainProviderViewModels(),//可供BaseLayerPicker选择的地形图层ProviderViewModel数组
            terrainProvider : new Cesium.EllipsoidTerrainProvider(),//地形图层提供者，仅baseLayerPicker设为false有意义
            skyBox : new Cesium.SkyBox({
                sources : {
                    positiveX : 'Cesium-1.7.1/Skybox/px.jpg',
                    negativeX : 'Cesium-1.7.1/Skybox/mx.jpg',
                    positiveY : 'Cesium-1.7.1/Skybox/py.jpg',
                    negativeY : 'Cesium-1.7.1/Skybox/my.jpg',
                    positiveZ : 'Cesium-1.7.1/Skybox/pz.jpg',
                    negativeZ : 'Cesium-1.7.1/Skybox/mz.jpg'
                }
            }),//用于渲染星空的SkyBox对象
            fullscreenElement : document.body,//全屏时渲染的HTML元素,
            useDefaultRenderLoop : true,//如果需要控制渲染循环，则设为true
            targetFrameRate : undefined,//使用默认render loop时的帧率
            showRenderLoopErrors : false,//如果设为true，将在一个HTML面板中显示错误信息
            automaticallyTrackDataSourceClocks : true,//自动追踪最近添加的数据源的时钟设置
            contextOptions : undefined,//传递给Scene对象的上下文参数（scene.options）
            sceneMode : Cesium.SceneMode.SCENE3D,//初始场景模式
            mapProjection : new Cesium.WebMercatorProjection(),//地图投影体系
            dataSources : new Cesium.DataSourceCollection()
            //需要进行可视化的数据源的集合
        }, options));


        /**
         * 掉entity的双击事件
         * 问题所在：双击entity，会放大视图，entity居中显示，且鼠标左键失去移动功能，鼠标滚轮失去作用
         */
        viewer.screenSpaceEventHandler.setInputAction(function(){},Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );

        return viewer;
    }

    /**
     * 添加地图切片
     * @param {String} tileType
     */
    addMapTile(tileType){
        this.viewer.scene.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
                url : getTileServiceProvider(tileType),
                maximumLevel : 5
            })
        )
    }
}
