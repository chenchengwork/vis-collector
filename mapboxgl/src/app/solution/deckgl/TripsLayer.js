/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {PolygonLayer} from 'deck.gl';
import {TripsLayer} from '@deck.gl/experimental-layers';

// Set your mapbox token here
// const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const MAPBOX_TOKEN = "pk.eyJ1IjoiY2hlbmNoZW5nMTIiLCJhIjoiY2poN2JjcmJuMDY1cjJ3cDl0OG0xeWxzdyJ9.Jyy5bvJDCvtjPXSPZMazTg";

// Source data CSV
const DATA_URL = {
    BUILDINGS:
        'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json', // eslint-disable-line
    TRIPS:
        'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json' // eslint-disable-line
};

const LIGHT_SETTINGS = {
    lightsPosition: [-74.05, 40.7, 8000, -73.5, 41, 5000],
    ambientRatio: 0.05,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [2.0, 0.0, 0.0, 0.0],
    numberOfLights: 2
};

export const INITIAL_VIEW_STATE = {
    longitude: -74,
    latitude: 40.72,
    zoom: 13,
    maxZoom: 16,
    pitch: 45,
    bearing: 0
};

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: 0
        };
    }

    componentDidMount() {
        this._animate();
    }

    componentWillUnmount() {
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
        }
    }

    _animate() {
        const {
            loopLength = 1800, // unit corresponds to the timestamp in source data
            animationSpeed = 30 // unit time per second
        } = this.props;
        const timestamp = Date.now() / 1000;
        const loopTime = loopLength / animationSpeed;

        this.setState({
            time: ((timestamp % loopTime) / loopTime) * loopLength
        });
        this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
    }

    _renderLayers() {
        const {buildings = DATA_URL.BUILDINGS, trips = DATA_URL.TRIPS, trailLength = 180} = this.props;

        return [
            new TripsLayer({
                id: 'trips',
                data: trips,
                getPath: d => d.segments,
                getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
                opacity: 0.3,
                strokeWidth: 2,
                trailLength,
                currentTime: this.state.time
            }),
            new PolygonLayer({
                id: 'buildings',
                data: buildings,
                extruded: true,
                wireframe: false,
                fp64: true,
                opacity: 0.5,
                getPolygon: f => f.polygon,
                getElevation: f => f.height,
                getFillColor: [74, 80, 87],
                lightSettings: LIGHT_SETTINGS
            })
        ];
    }

    render() {
        const {viewState, controller = true, baseMap = true} = this.props;

        const mapStyle = {
            "version": 8,
            "sprite": "http://localhost:4000/asserts/mapbox/sprite/sprite",    // 加载图标来源
            // "glyphs": "http://localhost:4000/asserts/mapbox/font/{fontstack}/{range}.pbf", // 加载字体
            sources: {
                "osm-tile_e3153e21-9e81-402a-c011-5312369292d8":{
                    "type":"raster",
                    "tiles":[
                        "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
                    ],
                    "tileSize":256
                }
            },
            layers: [
                {
                    "id":"osm-tile_e3153e21-9e81-402a-c011-5312369292d8",
                    "type":"raster",
                    "source":"osm-tile_e3153e21-9e81-402a-c011-5312369292d8"
                }
            ]
        };

        return (
            <DeckGL
                layers={this._renderLayers()}
                initialViewState={INITIAL_VIEW_STATE}
                viewState={viewState}
                controller={controller}
            >
                {baseMap && (
                    <StaticMap
                        reuseMaps
                        // mapStyle="mapbox://styles/mapbox/dark-v9"
                        mapStyle={mapStyle}
                        preventStyleDiffing={true}
                        mapboxApiAccessToken={MAPBOX_TOKEN}
                    />
                )}
            </DeckGL>
        );
    }
}
