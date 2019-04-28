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
    const GeoTIFFCustom = require('./geotiff/main');
    let windy = null;

    const draw = (GeoTIFF, url, opts = {}, opts1= {}) => new Promise((resolve, reject) =>{

        fetch(url)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => GeoTIFF.fromArrayBuffer(arrayBuffer))
            .then((tif) => tif.getImage())
            .then((image) => {
                // console.log("image.getBoundingBox", image.getBoundingBox());
                let [minLng, minLat, maxLng, maxLat] = image.getBoundingBox();
                image.readRasters({
                    // interleave: true
                }).then((imageData) => {
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

                    resolve({windData, bounds: [[minLat, minLng], [maxLat, maxLng]]})
                })
            })
    });

    draw(
        GeoTIFF,
        "/asserts/data/windy_tif/u_v_gdal.tif",
        {colorScale: ["rgb(180,0,35)"]},
        {color: "rgb(180,0,35)"},
    ).then(({windData, bounds}) => {
        console.log("windData gdal->", windData)
        windy = mapUtil.addWindyLayer(windData, {
            colorScale: ["rgb(180,0,35)"],
            frameRate: 60
        }).addTo(mapUtil.map);

        mapUtil.addRectangle(bounds, {color: "rgb(180,0,35)", weight: 1});
    });



    draw(
        GeoTIFFCustom,
        "/asserts/data/windy_tif/u_v_geotrellis.tif",
        // "/asserts/data/windy_tif/u_5_x.tif",
        // "/asserts/data/windy_tif/u_5_mask_x.tif",
        {colorScale: ["rgb(36,104, 180)"]},
        {color: "rgb(36,104, 180)"},
    ).then(({windData, bounds}) => {
        console.log("windData geotrellis->", windData)
        windy = mapUtil.addWindyLayer(windData, {
            colorScale: ["rgb(36,104, 180)"],
            frameRate: 60
        }).addTo(mapUtil.map);

        mapUtil.addRectangle(bounds, {color: "rgb(36,104, 180)", weight: 1});
    });



    // fetch("/asserts/data/windy_tif/uv_gdal.json")
    //     .then((resp) => resp.json())
    //     .then((windData) => {
    //         console.log('windData json ->', windData);
    //         const windy = mapUtil.addWindyLayer(windData, {
    //             colorScale: ["rgb(36,104, 180)"],
    //             frameRate: 60
    //         }).addTo(mapUtil.map);
    //     })


    function createAndDownloadFile(fileName, content) {
        var aTag = document.createElement('a');
        var blob = new Blob([content]);
        aTag.download = fileName;
        aTag.href = URL.createObjectURL(blob);
        aTag.click();
        URL.revokeObjectURL(blob);
    }
};
