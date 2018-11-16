import "./Measure.scss";
export default class Measure{
    constructor(map, L, options = {}) {
        this._map = map;
        this.L = L;

        this.options = Object.assign({
            circleMarker: {
                color: 'rgb(252, 249, 242)',
                radius: 2
            },
            lineStyle: {
                color: '#25A5F7',
                dashArray: '1,6'
            },
            lengthUnit: {
                display: 'km',
                decimal: 2,
                factor: null
            },
            angleUnit: {
                display: '&deg;',
                decimal: 2,
                factor: null
            }
        }, options);
    }

    /**
     * 开启测距
     * @param {Object} options 测距样式可以修改
     */
    start(options = {}) {
        this.options = Object.assign(this.options, options);

        const L = this.L;
        this._defaultCursor = this._map._container.style.cursor || 'move';
        this._allLayers = L.layerGroup();
        this._toggleMeasure(true);
    }

    /**
     * 清空测距
     */
    clear() {
        this._toggleMeasure(false);
    }

    _toggleMeasure(choice) {
        const L = this.L;

        this._clickedLatLong = null;
        this._clickedPoints = [];
        this._totalLength = 0;

        if (choice) {
            this._map.doubleClickZoom.disable();
            L.DomEvent.on(this._map._container, 'keydown', this._escape, this);
            L.DomEvent.on(this._map._container, 'dblclick', this._closePath, this);
            this._clickCount = 0;
            this._tempLine = L.featureGroup().addTo(this._allLayers);
            this._tempPoint = L.featureGroup().addTo(this._allLayers);
            this._pointLayer = L.featureGroup().addTo(this._allLayers);
            this._polylineLayer = L.featureGroup().addTo(this._allLayers);
            this._allLayers.addTo(this._map);
            this._map._container.style.cursor = 'crosshair';
            this._map.on('click', this._clicked, this);
            this._map.on('mousemove', this._moving, this);
        } else {
            this._map.doubleClickZoom.enable();
            L.DomEvent.off(this._map._container, 'keydown', this._escape, this);
            L.DomEvent.off(this._map._container, 'dblclick', this._closePath, this);
            if (!this._allLayers) return false;
            this._map.removeLayer(this._allLayers);
            this._allLayers = L.layerGroup();
            this._map._container.style.cursor = this._defaultCursor;
            this._map.off('click', this._clicked, this);
            this._map.off('mousemove', this._moving, this);
        }
    }

    _clicked(e) {
        const L = this.L;

        this._clickedLatLong = e.latlng;
        this._clickedPoints.push(this._clickedLatLong);
        L.circleMarker(this._clickedLatLong, this.options.circleMarker).addTo(this._pointLayer);
        if(this._clickCount > 0 && !e.latlng.equals(this._clickedPoints[this._clickedPoints.length - 2])){
            if (this._movingLatLong){
                L.polyline([this._clickedPoints[this._clickCount-1], this._movingLatLong], this.options.lineStyle).addTo(this._polylineLayer);
            }
            var text;
            this._totalLength += this._result.Distance;
            /*if (this._clickCount > 1){
                text = '<b>' + 'Bearing:' + '</b>&nbsp;' + this._result.Bearing.toFixed(this.options.angleUnit.decimal) + '&nbsp;' + this.options.angleUnit.display + '<br><b>' + 'Distance:' + '</b>&nbsp;' + this._totalLength.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display;
            }
            else {
                text = '<b>' + 'Bearing:' + '</b>&nbsp;' + this._result.Bearing.toFixed(this.options.angleUnit.decimal) + '&nbsp;' + this.options.angleUnit.display + '<br><b>' + 'Distance:' + '</b>&nbsp;' + this._result.Distance.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display;
            }*/
            text = '<b>' + '距离:' + '</b>&nbsp;' + this._totalLength.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display;
            L.circleMarker(this._clickedLatLong, this.options.circleMarker).bindTooltip(text, {permanent: true, className: 'result-tooltip'}).addTo(this._pointLayer).openTooltip();
        }
        this._clickCount++;
    }

    _moving(e) {
        const L = this.L;

        if (this._clickedLatLong){
            this._movingLatLong = e.latlng;
            if (this._tempLine){
                this._map.removeLayer(this._tempLine);
                this._map.removeLayer(this._tempPoint);
            }
            var text;
            this._addedLength = 0;
            this._tempLine = L.featureGroup();
            this._tempPoint = L.featureGroup();
            this._tempLine.addTo(this._map);
            this._tempPoint.addTo(this._map);
            this._calculateBearingAndDistance();
            this._addedLength = this._result.Distance + this._totalLength;
            L.polyline([this._clickedLatLong, this._movingLatLong], this.options.lineStyle).addTo(this._tempLine);
            // if (this._clickCount > 1){
            //     text = '<b>' + 'Bearing:' + '</b>&nbsp;' + this._result.Bearing.toFixed(this.options.angleUnit.decimal) + '&nbsp;' + this.options.angleUnit.display + '<br><b>' + 'Distance:' + '</b>&nbsp;' + this._addedLength.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display + '<br><div class="plus-length">(+' + this._result.Distance.toFixed(this.options.lengthUnit.decimal) + ')</div>';
            // }
            // else {
            //     text = '<b>' + 'Bearing:' + '</b>&nbsp;' + this._result.Bearing.toFixed(this.options.angleUnit.decimal) + '&nbsp;' + this.options.angleUnit.display + '<br><b>' + 'Distance:' + '</b>&nbsp;' + this._result.Distance.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display;
            // }

            if (this._clickCount > 1){
                text = '<b>' + '距离:' + '</b>&nbsp;' + this._addedLength.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display + '<br><div class="plus-length">(+' + this._result.Distance.toFixed(this.options.lengthUnit.decimal) + ')</div>';
            }
            else {
                text = '<b>' + '距离:' + '</b>&nbsp;' + this._result.Distance.toFixed(this.options.lengthUnit.decimal) + '&nbsp;' +  this.options.lengthUnit.display;
            }

            L.circleMarker(this._movingLatLong, this.options.circleMarker).bindTooltip(text, {sticky: true, offset: L.point(0, -40) ,className: 'moving-tooltip'}).addTo(this._tempPoint).openTooltip();
        }
    }

    _escape(e) {
        if (e.keyCode === 27){
            if (this._clickCount > 0){
                this._closePath();
            }
            else {
                this._toggleMeasure(false);
            }
        }
    }

    _calculateBearingAndDistance() {
        var f1 = this._clickedLatLong.lat, l1 = this._clickedLatLong.lng, f2 = this._movingLatLong.lat, l2 = this._movingLatLong.lng;
        var toRadian = Math.PI / 180;
        // haversine formula
        // bearing
        var y = Math.sin((l2-l1)*toRadian) * Math.cos(f2*toRadian);
        var x = Math.cos(f1*toRadian)*Math.sin(f2*toRadian) - Math.sin(f1*toRadian)*Math.cos(f2*toRadian)*Math.cos((l2-l1)*toRadian);
        var brng = Math.atan2(y, x)*((this.options.angleUnit.factor ? this.options.angleUnit.factor/2 : 180)/Math.PI);
        brng += brng < 0 ? (this.options.angleUnit.factor ? this.options.angleUnit.factor : 360) : 0;
        // distance
        var R = this.options.lengthUnit.factor ? 6371 * this.options.lengthUnit.factor : 6371; // kilometres
        var deltaF = (f2 - f1)*toRadian;
        var deltaL = (l2 - l1)*toRadian;
        var a = Math.sin(deltaF/2) * Math.sin(deltaF/2) + Math.cos(f1*toRadian) * Math.cos(f2*toRadian) * Math.sin(deltaL/2) * Math.sin(deltaL/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var distance = R * c;
        this._result = {
            Bearing: brng,
            Distance: distance
        };
    }

    _closePath() {
        this._map.removeLayer(this._tempLine);
        this._map.removeLayer(this._tempPoint);
        this._toggleMeasure(true);
    }
}

