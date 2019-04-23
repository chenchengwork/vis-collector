import React, { useEffect, useRef, memo, createContext, useState} from 'react';
import PropTypes from 'prop-types';
import MapUtil from "./MapUtil";

/**
 * 查询组件
 * @return {*}
 * @constructor
 */
const BaseMap = memo(({children, mapOptions = {}, onMapLoaded}) => {
    const [mapUtil, setMapUtil ] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if(!mapUtil){
            const myMapUtil = new MapUtil(containerRef.current, mapOptions);
            setMapUtil(myMapUtil);
            if(onMapLoaded) onMapLoaded(myMapUtil);
        }

        // 清理资源和副作用
        return () => {
            mapUtil && mapUtil.destroy();
        }
    }, [mapUtil]);

    return (
        <div style={{position: "relative", width: "100%", height:"100%"}} >
            <div ref={containerRef} style={{position: "fixed", width: "100%", height: "100%"}}></div>

            {mapUtil ?
                <MapUtilCtx.Provider value={mapUtil}>
                    {children}
                </MapUtilCtx.Provider>
                : null
            }
        </div>
    )
});

BaseMap.propTypes = {
    mapOptions: PropTypes.object,
    onMapLoaded: PropTypes.func
};

export const MapUtilCtx = createContext({});

export default BaseMap;
