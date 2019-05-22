import React, {
    useEffect, useRef
} from 'react';

import MoveLine from './Topo/MoveLine';

export default () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        var map = null;
        const data = [
            {
                from: {
                    label: '广州',
                    locationPixel: {
                        x: 30,
                        y: 30
                    }
                },
                to: {
                    label: '衡山',
                    locationPixel: {
                        x: 100,
                        y: 100
                    }
                }
            },
            // {
            //     from: {
            //         label: '衡山',
            //         locationPixel: {
            //             x: 100,
            //             y: 100
            //         }
            //     },
            //     to: {
            //         label: '泰山',
            //         locationPixel: {
            //             x: 300,
            //             y: 50
            //         }
            //     }
            // },
            // {
            //     from: {
            //         label: '衡山',
            //         locationPixel: {
            //             x: 100,
            //             y: 100
            //         }
            //     },
            //     to: {
            //         label: '泰山',
            //         locationPixel: {
            //             x: 300,
            //             y: 200
            //         }
            //     }
            // },
        ];

        const moveLine = new MoveLine(containerRef.current, {
            markerOpts: {
                isShow: true,   // 是否显示
                radius: 2,      // marker点半径
                color: "#fff",    // marker点颜色,为空或null则默认取线条颜色
                fontColor: "red",
                fontSize: "14"
            },

            lineOpts: {
                //线条类型 solid、dashed、dotted
                lineType: 'solid',
                //线条宽度
                lineWidth: 1,
                //线条颜色
                colors: ['#F9815C', '#F8AB60', '#EDCC72', '#E2F194', '#94E08A', '#4ECDA5'],
            },

            animationMarkerOpts: {
                //移动点半径
                moveRadius: 2,
                //移动点颜色
                fillColor: '#fff',
                //移动点阴影颜色
                shadowColor: '#fff',
                //移动点阴影大小
                shadowBlur: 5,
            },
        });

        moveLine.render(data);
        // moveLine.render(data);
        moveLine.resize(data)

        // setInterval(() => moveLine.resize(), 2000)
        // setTimeout(() => moveLine.resize(), 2000)

    }, [])

    return (
        <div ref={containerRef} style={{backgroundColor: "#696969", width: "100%", height: "100%", position: "fixed"}}>
        </div>
    );
}






