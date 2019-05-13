import React, {
    useEffect
} from 'react';

import MoveLine from './Topo/MoveLine';

export default () => {

    useEffect(() => {
        var map = null;
        const data = [
            {
                from: {
                    city: '广州',
                    lnglat: [113.270793, 23.135308],
                    locationPixel: {
                        x: 30,
                        y: 30
                    }
                },
                to: {
                    city: '衡山',
                    lnglat: [112.612787, 27.317599],
                    locationPixel: {
                        x: 100,
                        y: 100
                    }
                }
            },
        ];

        const moveLine = new MoveLine(map, {
            canvasW: window.innerWidth,
            canvasH: window.innerHeight,
            //marker点半径
            markerRadius: 2,
            //marker点颜色,为空或null则默认取线条颜色
            markerColor: null,
            //线条类型 solid、dashed、dotted
            lineType: 'solid',
            //线条宽度
            lineWidth: 1,
            //线条颜色
            colors: ['#F9815C', '#F8AB60', '#EDCC72', '#E2F194', '#94E08A', '#4ECDA5'],
            //移动点半径
            moveRadius: 2,
            //移动点颜色
            fillColor: '#fff',
            //移动点阴影颜色
            shadowColor: '#fff',
            //移动点阴影大小
            shadowBlur: 5,
            data: data
        });

    }, [])

    return (
        <div style={{backgroundColor: "#696969", width: "100%", height: "100%", position: "fixed"}}>

        </div>
    );
}






