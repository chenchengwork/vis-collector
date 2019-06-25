import React, { useRef, useEffect } from 'react';
import DrawGL from './DrawGL';

const Drawing  = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const drawGL = new DrawGL({
            glOptions: {
                canvas: canvasRef.current,

            }
        });

        drawGL.start({
            // canvas: canvasRef.current
            webgl1: true
        });

    }, [])

    return (
        <div style={{position: "fixed", width: "100%", height: "100%"}}>
        <canvas ref={canvasRef} style={{width: "100%", height: "100%"}} />
        </div>
    )
};

export default Drawing;
