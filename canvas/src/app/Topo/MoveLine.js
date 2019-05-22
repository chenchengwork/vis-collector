const global = typeof window === 'undefined' ? {} : window;

const requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    return global.setTimeout(callback, 1000 / 60);
};

const cancelAnimationFrame = global.cancelAnimationFrame || global.mozCancelAnimationFrame || global.webkitCancelAnimationFrame || ((id) => global.clearTimeout(id))

class Marker{

    constructor(item, markerOpts) {
        this.item = item;
        this.opts = Object.assign({
            color: '#fff',  //marker点颜色,为空或null则默认取线条颜色
            radius: 3,  //marker点半径
            fontColor: "red",
            fontSize: 14
        }, markerOpts)
    }

    getLocationPixel = () => this.item.locationPixel;

    draw(context){
        const {locationPixel, label} = this.item;
        const { color,radius, fontColor, fontSize } = this.opts;

        // 绘制端点
        context.save();
        context.beginPath();
        context.fillStyle = color;
        context.arc(locationPixel.x, locationPixel.y, radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();

        // 绘制端点处的文字
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = `${fontSize || 12}px Microsoft YaHei`;
        context.fillStyle = fontColor || color;
        context.fillText(label, locationPixel.x, locationPixel.y - 10);
        context.restore();
    }
}

class MarkLine{
    constructor(opts, lineOpts, animationMarkerOpts) {
        this.from = opts.from;
        this.to = opts.to;
        this.id = opts.id;
        this.step = 0;

        this.lineOpts = Object.assign({
            //线条类型 solid、dashed、dotted
            lineType: 'solid',
            //线条宽度
            lineWidth: 1,
            //线条颜色
            colors: ['#F9815C', '#F8AB60', '#EDCC72', '#E2F194', '#94E08A', '#4ECDA5'],
        }, lineOpts)

        this.animationMarkerOpts = Object.assign({
            //移动点颜色
            fillColor: '#fff',
            //移动点阴影颜色
            shadowColor: '#fff',
            //移动点阴影大小
            shadowBlur: 5,
            //移动点半径
            moveRadius: 2,
        }, animationMarkerOpts)
    }

    getPointList(from, to) {
        let points = [[from.x, from.y], [to.x, to.y]];
        const ex = points[1][0];
        const ey = points[1][1];
        points[3] = [ex, ey];
        points[1] = this.getOffsetPoint(points[0], points[3]);
        points[2] = this.getOffsetPoint(points[3], points[0]);
        points = this.smoothSpline(points, false);

        //修正最后一点在插值产生的偏移
        points[points.length - 1] = [ex, ey];
        return points;
    };

    getOffsetPoint(start, end) {
        const distance = this.getDistance(start, end) / 3; //除以3？
        let angle, dX, dY;
        const mp = [start[0], start[1]];
        const deltaAngle = -0.2; //偏移0.2弧度

        if (start[0] != end[0] && start[1] != end[1]) {
            //斜率存在
            const k = (end[1] - start[1]) / (end[0] - start[0]);
            angle = Math.atan(k);
        } else if (start[0] == end[0]) {
            //垂直线
            angle = (start[1] <= end[1] ? 1 : -1) * Math.PI / 2;
        } else {
            //水平线
            angle = 0;
        }
        if (start[0] <= end[0]) {
            angle -= deltaAngle;
            dX = Math.round(Math.cos(angle) * distance);
            dY = Math.round(Math.sin(angle) * distance);
            mp[0] += dX;
            mp[1] += dY;
        } else {
            angle += deltaAngle;
            dX = Math.round(Math.cos(angle) * distance);
            dY = Math.round(Math.sin(angle) * distance);
            mp[0] -= dX;
            mp[1] -= dY;
        }
        return mp;
    };

    smoothSpline(points, isLoop) {
        const len = points.length;
        const ret = [];
        let distance = 0;
        for (let i = 1; i < len; i++) {
            distance += this.getDistance(points[i - 1], points[i]);
        }

        let segs = distance / 2;
        segs = segs < len ? len : segs;
        for (let i = 0; i < segs; i++) {
            const pos = i / (segs - 1) * (isLoop ? len : len - 1);
            const idx = Math.floor(pos);
            const w = pos - idx;
            let p0;
            const p1 = points[idx % len];
            let p2;
            let p3;

            if (!isLoop) {
                p0 = points[idx === 0 ? idx : idx - 1];
                p2 = points[idx > len - 2 ? len - 1 : idx + 1];
                p3 = points[idx > len - 3 ? len - 1 : idx + 2];
            } else {
                p0 = points[(idx - 1 + len) % len];
                p2 = points[(idx + 1) % len];
                p3 = points[(idx + 2) % len];
            }
            const w2 = w * w;
            const w3 = w * w2;

            ret.push([this.interpolate(p0[0], p1[0], p2[0], p3[0], w, w2, w3), this.interpolate(p0[1], p1[1], p2[1], p3[1], w, w2, w3)]);
        }
        return ret;
    };

    interpolate(p0, p1, p2, p3, t, t2, t3) {
        const v0 = (p2 - p0) * 0.5;
        const v1 = (p3 - p1) * 0.5;
        return (2 * (p1 - p2) + v0 + v1) * t3 + (-3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
    };

    getDistance(p1, p2) {
        return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
    };

    drawMarker(context) {
        this.from.draw(context);
        this.to.draw(context);
    };

    drawLinePath(context) {
        let { lineType, lineWidth, colors} = this.lineOpts;
        colors = Array.isArray(colors) ? colors : [colors];
        const pointList = this.path = this.getPointList(this.from.getLocationPixel(), this.to.getLocationPixel());

        const len = pointList.length;
        context.save();
        context.beginPath();

        context.lineWidth = lineWidth;
        context.strokeStyle = colors[this.id];

        if (!lineType || lineType == 'solid') {
            context.moveTo(pointList[0][0], pointList[0][1]);
            for (let i = 0; i < len; i++) {
                context.lineTo(pointList[i][0], pointList[i][1]);
            }
        } else if (lineType == 'dashed' || lineType == 'dotted') {
            for (let i = 1; i < len; i += 2) {
                context.moveTo(pointList[i - 1][0], pointList[i - 1][1]);
                context.lineTo(pointList[i][0], pointList[i][1]);
            }
        }
        context.stroke();
        context.restore();
        this.step = 0;      //缩放地图时重新绘制动画
    };

    drawMoveCircle(context) {
        const {fillColor, shadowColor, shadowBlur, moveRadius} = this.animationMarkerOpts;
        // console.log({fillColor, shadowColor, shadowBlur, moveRadius})
        const pointList = this.path = this.getPointList(this.from.getLocationPixel(), this.to.getLocationPixel());

        context.save();
        context.fillStyle = fillColor;
        context.shadowColor = shadowColor;
        context.shadowBlur = shadowBlur;
        context.beginPath();
        context.arc(pointList[this.step][0], pointList[this.step][1], moveRadius, 0, Math.PI * 2, true);
        context.fill();
        context.closePath();
        context.restore();
        this.step += 1;
        if (this.step >= pointList.length) {
            this.step = 0;
        }
    };
}


export default class MoveLine{
    constructor(parentContainer, userOptions) {
        this.parentContainer = parentContainer;
        this.requestAnimationFrameId = null;
        this.options = Object.assign({}, userOptions);
        this.markLines = null;
        this.container = null;
        this.ctxs = this.mkCanvasCtx();
        this.resize();
    }

    /**
     * 调整比率
     * @param ctx
     */
    adjustRatio(ctx){
        const backingStore = ctx.backingStorePixelRatio || ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
        const pixelRatio = (window.devicePixelRatio || 1) / backingStore;
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;
        ctx.canvas.width = canvasWidth * pixelRatio;
        ctx.canvas.height = canvasHeight * pixelRatio;
        ctx.canvas.style.width = canvasWidth + 'px';
        ctx.canvas.style.height = canvasHeight + 'px';
        ctx.scale(pixelRatio, pixelRatio);
    }

    mkCanvasCtx(){
        const parentContainer = this.parentContainer;
        const containerW = parentContainer.clientWidth;
        const containerH = parentContainer.clientHeight;

        const container = document.createElement("div");
        this.container = container
        container.style.cssText = `position:relative;`;

        const baseCanvas = document.createElement("canvas");
        const baseCtx = baseCanvas.getContext("2d");
        baseCanvas.width = containerW;
        baseCanvas.height = containerH;

        const animationCanvas = document.createElement("canvas");
        animationCanvas.width = containerW;
        animationCanvas.height = containerH;
        const animationCtx = animationCanvas.getContext("2d");
        animationCanvas.style.cssText = `position:absolute;left:0;top:0;z-index:1;`;

        container.appendChild(baseCanvas);
        container.appendChild(animationCanvas);

        parentContainer.appendChild(container);

        this.adjustRatio(baseCtx)
        this.adjustRatio(animationCtx)

        return {baseCtx, animationCtx};
    }

    renderBase(baseCtx) {
        // 绘制marker和基础线条
        this.markLines.forEach(function (line) {
            line.drawMarker(baseCtx);
            line.drawLinePath(baseCtx);
        });
    }

    renderAnimation(animationCtx) {
        animationCtx.fillStyle = 'rgba(0,0,0,.93)';
        const prev = animationCtx.globalCompositeOperation;
        animationCtx.globalCompositeOperation = 'destination-in';
        animationCtx.fillRect(0, 0, animationCtx.canvas.width, animationCtx.canvas.height);
        animationCtx.globalCompositeOperation = prev;

        this.markLines.forEach((markLine) => markLine.drawMoveCircle(animationCtx))
    }

    mkMarkLine(data) {
        const markLines = [];
        const { markerOpts, lineOpts, animationMarkerOpts } = this.options;

        data.forEach((line, i) => {
            markerOpts.color = markerOpts.color || lineOpts.colors[i] || "#fff";

            markLines.push(new MarkLine({
                id: i,
                from: new Marker(line.from, markerOpts),
                to: new Marker(line.to, markerOpts)
            }, lineOpts, animationMarkerOpts));
        });

        return markLines;
    }

    render(data) {
        const { baseCtx, animationCtx } = this.ctxs;

        baseCtx.clearRect(0, 0, baseCtx.canvas.width, baseCtx.canvas.height);
        animationCtx.clearRect(0, 0, animationCtx.canvas.width, animationCtx.canvas.height);

        this.markLines = this.mkMarkLine(data);

        this.renderBase(baseCtx);

        this._startAnimation();
    }

    _startAnimation(){
        if(this.requestAnimationFrameId) cancelAnimationFrame(this.requestAnimationFrameId);

        const { animationCtx } = this.ctxs;
        if(this.requestAnimationFrameId) cancelAnimationFrame(this.requestAnimationFrameId);

        const drawFrame = () => {
            this.requestAnimationFrameId = requestAnimationFrame(drawFrame);
            this.renderAnimation(animationCtx);
        };

        drawFrame();

    }

    resize(data){
        if(this.requestAnimationFrameId) cancelAnimationFrame(this.requestAnimationFrameId);
        const { baseCtx, animationCtx } = this.ctxs;
        baseCtx.clearRect(0, 0, baseCtx.canvas.width, baseCtx.canvas.height);
        animationCtx.clearRect(0, 0, animationCtx.canvas.width, animationCtx.canvas.height);

        this.adjustRatio(baseCtx);
        // this.adjustRatio(animationCtx);
        if(data) {
            setTimeout(() => this.render(data), 10);
        }

    }

    destroy(){
        cancelAnimationFrame(this.requestAnimationFrameId)
        this.container.remove();
    }
}



