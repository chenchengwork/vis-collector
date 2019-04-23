import React from 'react';
import BaseMap from '../../components/BaseMap';
import * as testUtil from './testMapUtil';

const TestWindy = () => {
    const handleMapLoaded = (mapUtil) => {
        // 绘制台风到地图
        // let typhoonData = testUtil.testDrawTyphoon(mapUtil);

        // 绘制风环形流场
        /*
            风场header中必须的字段包括:
            parameterCategory,
            parameterNumber,
            lo1,
            la1,
            dx,
            dy,
            nx,
            ny,
            refTime,
            forecastTime
        */

        // 绘制风场
        // testUtil.drawWindyByJson(mapUtil);
        // testUtil.drawWindyBySplitJson(mapUtil);
        // testUtil.drawWindyByImg(mapUtil);


        // testUtil.drawWindyByTif(mapUtil);
        testUtil.drawWindyByTifLayer(mapUtil);
        // mapUtil.addWindyTile()


        // testUtil.setWMSLayer();

        // 鼠标相关的操作
        // testUtil.testMouse();

        // 移动的marker
        // testUtil.testMoveMarker(L, mapUtil)

        // 地理编码和逆编码
        // testUtil.testGeoCoder(mapUtil);
    };


    return (
        <BaseMap
            onMapLoaded={handleMapLoaded}
        >TestWindy</BaseMap>
    )
};

export default TestWindy;


const drawWindyByTif = (mapUtil) => {
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
