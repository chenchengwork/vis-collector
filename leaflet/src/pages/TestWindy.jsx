import React, { useState } from 'react';
import BaseMap from '../components/BaseMap';

const TestWindy = () => {
    const [ mapUtil, setMapUtil ] = useState(null);
    const [ zoom, setZoom ] = useState("");
    const handleMapLoaded = (mapUtil) => {
        const map = mapUtil.map;
        setMapUtil(mapUtil);
        setZoom(map.getZoom());
        drawWindyByTif(mapUtil);
    }

    const handleZoom = (e) => {
        const zoom = e.target.value;
        setZoom(zoom);
        mapUtil.map.setZoom(zoom);
    }

    return (
        <div style={{position: "relative"}}>
            <div>
                <input value={zoom} onChange={handleZoom}/>
                {/*<input value={1} onChange={handleZoom}/>*/}
            </div>
            <BaseMap
                onMapLoaded={handleMapLoaded}
            ></BaseMap>
        </div>
    )
};

export default TestWindy;


const drawWindyByTif = (mapUtil) => {
    const GeoTIFF = require('geotiff/src/main');
    let windy = null;

    const draw = (tiffs) => {
        tiffs.forEach(url => {

            fetch(url)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => GeoTIFF.fromArrayBuffer(arrayBuffer))
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
                        console.log(JSON.stringify([[minLat, minLng], [maxLat, maxLng]]))
                        mapUtil.setRectangle([[minLat, minLng], [maxLat, maxLng]]);
                    })
                })
        })
    };

    // draw(["/asserts/data/windy_tif/u_v.tif"])
    // draw(["/asserts/data/windy_tif/u_5_x.tif"])
    draw(["/asserts/data/windy_tif/wms.tiff"])
    // draw(["http://10.0.4.226:8070/wms?service=WMS&version=1.1.0&request=GetMap&layers=cite:climate_u-v&styles=&bbox=39.90234375000001,33.797408767572485,161.98242187500003,44.402391829093915&width=256&height=256&srs=EPSG:4326&format=img/tif&z=4"])
    // draw(["/asserts/data/windy_tif/u_5_x.tif"])

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
