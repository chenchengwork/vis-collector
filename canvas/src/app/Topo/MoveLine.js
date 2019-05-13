/**
 * @author https://github.com/chengquan223
 * @Date 2017-02-27
 * */
class MyCanvas {
    constructor(){
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;' + 'left:0;' + 'top:0;' + 'z-index:' + 9999 + ';';

        this.canvas = canvas;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';

        // this.canvas.style.left = window.innerWidth / 2 + 'px';
        // this.canvas.style.top = window.innerHeight / 2 + 'px';

        this.adjustRatio(canvas.getContext("2d"))

        document.querySelector("body").appendChild(canvas);
    }


    adjustRatio = function (ctx) {
        var backingStore = ctx.backingStorePixelRatio || ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
        var pixelRatio = (window.devicePixelRatio || 1) / backingStore;
        var canvasWidth = ctx.canvas.width;
        var canvasHeight = ctx.canvas.height;
        ctx.canvas.width = canvasWidth * pixelRatio;
        ctx.canvas.height = canvasHeight * pixelRatio;
        ctx.canvas.style.width = canvasWidth + 'px';
        ctx.canvas.style.height = canvasHeight + 'px';
        // console.log(ctx.canvas.height, canvasHeight);
        ctx.scale(pixelRatio, pixelRatio);
    }
}


var global = typeof window === 'undefined' ? {} : window;

var requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    return global.setTimeout(callback, 1000 / 60);
};


class Marker{

    constructor(opts) {
        this.city = opts.city;
        this.color = opts.color;
        this.locationPixel = opts.locationPixel;

        this.opts = Object.assign({
            //marker点颜色,为空或null则默认取线条颜色
            markerColor: '#fff',
            //marker点半径
            markerRadius: 3,
        }, opts)
    }

    draw(context){
        const pixel = this.locationPixel;
        const {markerColor, markerRadius} = this.opts;

        context.save();
        context.beginPath();
        context.fillStyle = markerColor || this.color;
        context.arc(pixel.x, pixel.y, markerRadius, 0, Math.PI * 2, true);
        context.closePath();
        context.fill();

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '12px Microsoft YaHei';
        context.fillStyle = this.color;
        context.fillText(this.city, pixel.x, pixel.y - 10);
        context.restore();
    }
}


// class MarkLine{
//     constructor(opts) {
//         this.from = opts.from;
//         this.to = opts.to;
//         this.id = opts.id;
//         this.step = 0;
//
//         this.opts = {
//             //线条类型 solid、dashed、dotted
//             lineType: 'solid',
//             //线条宽度
//             lineWidth: 1,
//             //线条颜色
//             colors: ['#F9815C', '#F8AB60', '#EDCC72', '#E2F194', '#94E08A', '#4ECDA5'],
//             //移动点颜色
//             fillColor: '#fff',
//             //移动点阴影颜色
//             shadowColor: '#fff',
//             //移动点阴影大小
//             shadowBlur: 5
//         }
//     }
//
//     getPointList(from, to) {
//         var points = [[from.x, from.y], [to.x, to.y]];
//         var ex = points[1][0];
//         var ey = points[1][1];
//         points[3] = [ex, ey];
//         points[1] = this.getOffsetPoint(points[0], points[3]);
//         points[2] = this.getOffsetPoint(points[3], points[0]);
//         points = this.smoothSpline(points, false);
//         //修正最后一点在插值产生的偏移
//         points[points.length - 1] = [ex, ey];
//         return points;
//     };
//
//     getOffsetPoint(start, end) {
//         var distance = this.getDistance(start, end) / 3; //除以3？
//         var angle, dX, dY;
//         var mp = [start[0], start[1]];
//         var deltaAngle = -0.2; //偏移0.2弧度
//         if (start[0] != end[0] && start[1] != end[1]) {
//             //斜率存在
//             var k = (end[1] - start[1]) / (end[0] - start[0]);
//             angle = Math.atan(k);
//         } else if (start[0] == end[0]) {
//             //垂直线
//             angle = (start[1] <= end[1] ? 1 : -1) * Math.PI / 2;
//         } else {
//             //水平线
//             angle = 0;
//         }
//         if (start[0] <= end[0]) {
//             angle -= deltaAngle;
//             dX = Math.round(Math.cos(angle) * distance);
//             dY = Math.round(Math.sin(angle) * distance);
//             mp[0] += dX;
//             mp[1] += dY;
//         } else {
//             angle += deltaAngle;
//             dX = Math.round(Math.cos(angle) * distance);
//             dY = Math.round(Math.sin(angle) * distance);
//             mp[0] -= dX;
//             mp[1] -= dY;
//         }
//         return mp;
//     };
//
//     smoothSpline(points, isLoop) {
//         var len = points.length;
//         var ret = [];
//         var distance = 0;
//         for (var i = 1; i < len; i++) {
//             distance += this.getDistance(points[i - 1], points[i]);
//         }
//         var segs = distance / 2;
//         segs = segs < len ? len : segs;
//         for (var i = 0; i < segs; i++) {
//             var pos = i / (segs - 1) * (isLoop ? len : len - 1);
//             var idx = Math.floor(pos);
//             var w = pos - idx;
//             var p0;
//             var p1 = points[idx % len];
//             var p2;
//             var p3;
//             if (!isLoop) {
//                 p0 = points[idx === 0 ? idx : idx - 1];
//                 p2 = points[idx > len - 2 ? len - 1 : idx + 1];
//                 p3 = points[idx > len - 3 ? len - 1 : idx + 2];
//             } else {
//                 p0 = points[(idx - 1 + len) % len];
//                 p2 = points[(idx + 1) % len];
//                 p3 = points[(idx + 2) % len];
//             }
//             var w2 = w * w;
//             var w3 = w * w2;
//
//             ret.push([this.interpolate(p0[0], p1[0], p2[0], p3[0], w, w2, w3), this.interpolate(p0[1], p1[1], p2[1], p3[1], w, w2, w3)]);
//         }
//         return ret;
//     };
//
//     interpolate(p0, p1, p2, p3, t, t2, t3) {
//         var v0 = (p2 - p0) * 0.5;
//         var v1 = (p3 - p1) * 0.5;
//         return (2 * (p1 - p2) + v0 + v1) * t3 + (-3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
//     };
//
//     getDistance(p1, p2) {
//         return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
//     };
//
//     drawMarker(context) {
//         this.from.draw(context);
//         this.to.draw(context);
//     };
//
//     drawLinePath(context) {
//         var pointList = [];
//         // var pointList = this.path = this.getPointList(map.pointToPixel(this.from.location), map.pointToPixel(this.to.location));
//
//         if(this.from.locationPixel && this.to.locationPixel){
//             pointList = this.path = this.getPointList(this.from.locationPixel, this.to.locationPixel);
//         }
//
//         var len = pointList.length;
//         context.save();
//         context.beginPath();
//         // context.lineWidth = options.lineWidth;
//         // context.strokeStyle = options.colors[this.id];
//
//         context.lineWidth = this.opts.lineWidth;
//         context.strokeStyle = this.opts.colors[this.id];
//
//         // if (!options.lineType || options.lineType == 'solid') {
//         if (!this.opts.lineType || this.opts.lineType == 'solid') {
//             context.moveTo(pointList[0][0], pointList[0][1]);
//             for (var i = 0; i < len; i++) {
//                 context.lineTo(pointList[i][0], pointList[i][1]);
//             }
//         // } else if (options.lineType == 'dashed' || options.lineType == 'dotted') {
//         } else if (this.opts.lineType == 'dashed' || this.opts.lineType == 'dotted') {
//             for (var i = 1; i < len; i += 2) {
//                 context.moveTo(pointList[i - 1][0], pointList[i - 1][1]);
//                 context.lineTo(pointList[i][0], pointList[i][1]);
//             }
//         }
//         context.stroke();
//         context.restore();
//         this.step = 0; //缩放地图时重新绘制动画
//     };
//
//     drawMoveCircle(context) {
//         // console.log('this.opts', this.opts)
//         var pointList = this.path = this.getPointList(this.from.locationPixel, this.to.locationPixel)
//
//         context.save();
//         // context.fillStyle = options.fillColor;
//         // context.shadowColor = options.shadowColor;
//         // context.shadowBlur = options.shadowBlur;
//
//         context.fillStyle = this.opts.fillColor;
//         context.shadowColor = this.opts.shadowColor;
//         context.shadowBlur = this.opts.shadowBlur;
//
//         context.beginPath();
//         context.arc(pointList[this.step][0], pointList[this.step][1], this.opts.moveRadius, 0, Math.PI * 2, true);
//         context.fill();
//         context.closePath();
//         context.restore();
//         this.step += 1;
//         if (this.step >= pointList.length) {
//             this.step = 0;
//         }
//     };
// }


export default function MoveLine(map, userOptions) {
    var self = this;

    //默认参数
    var options = Object.assign({
        //marker点半径
        markerRadius: 3,
        //marker点颜色,为空或null则默认取线条颜色
        markerColor: '#fff',
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
        shadowBlur: 5
    }, userOptions);

    //全局变量
    var baseLayer = null,
        animationLayer = null,
        width = userOptions.canvasW,
        height = userOptions.canvasH,
        animationFlag = true,
        markLines = [];

    function MarkLine(opts) {
        this.from = opts.from;
        this.to = opts.to;
        this.id = opts.id;
        this.step = 0;
    }

    MarkLine.prototype.getPointList = function (from, to) {
        var points = [[from.x, from.y], [to.x, to.y]];
        var ex = points[1][0];
        var ey = points[1][1];
        points[3] = [ex, ey];
        points[1] = this.getOffsetPoint(points[0], points[3]);
        points[2] = this.getOffsetPoint(points[3], points[0]);
        points = this.smoothSpline(points, false);
        //修正最后一点在插值产生的偏移
        points[points.length - 1] = [ex, ey];
        return points;
    };

    MarkLine.prototype.getOffsetPoint = function (start, end) {
        var distance = this.getDistance(start, end) / 3; //除以3？
        var angle, dX, dY;
        var mp = [start[0], start[1]];
        var deltaAngle = -0.2; //偏移0.2弧度
        if (start[0] != end[0] && start[1] != end[1]) {
            //斜率存在
            var k = (end[1] - start[1]) / (end[0] - start[0]);
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

    MarkLine.prototype.smoothSpline = function (points, isLoop) {
        var len = points.length;
        var ret = [];
        var distance = 0;
        for (var i = 1; i < len; i++) {
            distance += this.getDistance(points[i - 1], points[i]);
        }
        var segs = distance / 2;
        segs = segs < len ? len : segs;
        for (var i = 0; i < segs; i++) {
            var pos = i / (segs - 1) * (isLoop ? len : len - 1);
            var idx = Math.floor(pos);
            var w = pos - idx;
            var p0;
            var p1 = points[idx % len];
            var p2;
            var p3;
            if (!isLoop) {
                p0 = points[idx === 0 ? idx : idx - 1];
                p2 = points[idx > len - 2 ? len - 1 : idx + 1];
                p3 = points[idx > len - 3 ? len - 1 : idx + 2];
            } else {
                p0 = points[(idx - 1 + len) % len];
                p2 = points[(idx + 1) % len];
                p3 = points[(idx + 2) % len];
            }
            var w2 = w * w;
            var w3 = w * w2;

            ret.push([this.interpolate(p0[0], p1[0], p2[0], p3[0], w, w2, w3), this.interpolate(p0[1], p1[1], p2[1], p3[1], w, w2, w3)]);
        }
        return ret;
    };

    MarkLine.prototype.interpolate = function (p0, p1, p2, p3, t, t2, t3) {
        var v0 = (p2 - p0) * 0.5;
        var v1 = (p3 - p1) * 0.5;
        return (2 * (p1 - p2) + v0 + v1) * t3 + (-3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
    };

    MarkLine.prototype.getDistance = function (p1, p2) {
        return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
    };

    MarkLine.prototype.drawMarker = function (context) {
        this.from.draw(context);
        this.to.draw(context);
    };

    MarkLine.prototype.drawLinePath = function (context) {
        var pointList = [];
        // var pointList = this.path = this.getPointList(map.pointToPixel(this.from.location), map.pointToPixel(this.to.location));

        if(this.from.locationPixel && this.to.locationPixel){
            pointList = this.path = this.getPointList(this.from.locationPixel, this.to.locationPixel);
        }

        var len = pointList.length;
        context.save();
        context.beginPath();
        context.lineWidth = options.lineWidth;
        context.strokeStyle = options.colors[this.id];

        if (!options.lineType || options.lineType == 'solid') {
            context.moveTo(pointList[0][0], pointList[0][1]);
            for (var i = 0; i < len; i++) {
                context.lineTo(pointList[i][0], pointList[i][1]);
            }
        } else if (options.lineType == 'dashed' || options.lineType == 'dotted') {
            for (var i = 1; i < len; i += 2) {
                context.moveTo(pointList[i - 1][0], pointList[i - 1][1]);
                context.lineTo(pointList[i][0], pointList[i][1]);
            }
        }
        context.stroke();
        context.restore();
        this.step = 0; //缩放地图时重新绘制动画
    };

    MarkLine.prototype.drawMoveCircle = function (context) {
        var pointList = []
        // var pointList = this.path || this.getPointList(map.pointToPixel(this.from.location), map.pointToPixel(this.to.location));

        if(this.from.locationPixel && this.to.locationPixel){
            pointList = this.path = this.getPointList(this.from.locationPixel, this.to.locationPixel);
        }

        context.save();
        context.fillStyle = options.fillColor;
        context.shadowColor = options.shadowColor;
        context.shadowBlur = options.shadowBlur;
        context.beginPath();
        context.arc(pointList[this.step][0], pointList[this.step][1], options.moveRadius, 0, Math.PI * 2, true);
        context.fill();
        context.closePath();
        context.restore();
        this.step += 1;
        if (this.step >= pointList.length) {
            this.step = 0;
        }
    };

    //底层canvas渲染，标注，线条
    var brush = function brush() {

        var baseCtx = baseLayer.canvas.getContext('2d');
        if (!baseCtx) {
            return;
        }

        addMarkLine();

        baseCtx.clearRect(0, 0, width, height);

        markLines.forEach(function (line) {
            line.drawMarker(baseCtx);
            line.drawLinePath(baseCtx);
        });
    };

    //上层canvas渲染，动画效果
    var render = function render() {
        var animationCtx = animationLayer.canvas.getContext('2d');
        if (!animationCtx) {
            return;
        }

        if (!animationFlag) {
            animationCtx.clearRect(0, 0, width, height);
            return;
        }

        animationCtx.fillStyle = 'rgba(0,0,0,.93)';
        var prev = animationCtx.globalCompositeOperation;
        animationCtx.globalCompositeOperation = 'destination-in';
        animationCtx.fillRect(0, 0, width, height);
        animationCtx.globalCompositeOperation = prev;

        for (var i = 0; i < markLines.length; i++) {
            var markLine = markLines[i];
            markLine.drawMoveCircle(animationCtx); //移动圆点
        }
    };

    var addMarkLine = function addMarkLine() {
        markLines = [];
        var dataset = options.data;
        dataset.forEach(function (line, i) {
            markLines.push(new MarkLine({
                id: i,
                from: new Marker({
                    city: line.from.city,
                    color: options.colors[i],
                    locationPixel: line.from.locationPixel,
                }),
                to: new Marker({
                    city: line.to.city,
                    color: options.colors[i],
                    locationPixel: line.to.locationPixel,
                })
            }));
        });
    };

    //初始化
    var init = function init(map, options) {

        baseLayer = new MyCanvas();
        animationLayer = new MyCanvas();
        brush();
        render();



        // baseLayer = new CanvasLayer({
        //     map: map,
        //     update: brush
        // });
        // animationLayer = new CanvasLayer({
        //     map: map,
        //     update: render
        // });


        (function drawFrame() {
            requestAnimationFrame(drawFrame);
            render();
        })();
    };

    init(map, options);

    self.options = options;
};

MoveLine.prototype.update = function (resetOpts) {
    for (var key in resetOpts) {
        this.options[key] = resetOpts[key];
    }
};


