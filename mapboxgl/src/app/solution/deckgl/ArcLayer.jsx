import 'mapbox-gl/dist/mapbox-gl.css';
import React, {Component} from 'react';
import {StaticMap} from 'react-map-gl';
import DeckGL, {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {scaleQuantile} from 'd3-scale';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hlbmNoZW5nMTIiLCJhIjoiY2poN2JjcmJuMDY1cjJ3cDl0OG0xeWxzdyJ9.Jyy5bvJDCvtjPXSPZMazTg';

// Source data GeoJSON
const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/arc/counties.json'; // eslint-disable-line

export const inFlowColors = [
    [255, 255, 204],
    [199, 233, 180],
    [127, 205, 187],
    [65, 182, 196],
    [29, 145, 192],
    [34, 94, 168],
    [12, 44, 132]
];

export const outFlowColors = [
    [255, 255, 178],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [177, 0, 38]
];

export const INITIAL_VIEW_STATE = {
    longitude: -100,
    latitude: 40.7,
    zoom: 3,
    maxZoom: 15,
    pitch: 30,
    bearing: 30
};

/* eslint-disable react/no-deprecated */
class DrawArcLayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredCounty: null,
            selectedCounty: null
        };
        this._onHoverCounty = this._onHoverCounty.bind(this);
        this._onSelectCounty = this._onSelectCounty.bind(this);
        this._renderTooltip = this._renderTooltip.bind(this);
    }

    componentDidMount() {
        this._recalculateArcs(this.props.data);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this._recalculateArcs(nextProps.data);
        }
    }

    _onHoverCounty({x, y, object}) {
        this.setState({x, y, hoveredCounty: object});
    }

    _onSelectCounty({object}) {
        this._recalculateArcs(this.props.data, object);
    }

    _renderTooltip() {
        const {x, y, hoveredCounty} = this.state;
        return (
            hoveredCounty && (
                <div className="tooltip" style={{left: x, top: y}}>
                    {hoveredCounty.properties.name}
                </div>
            )
        );
    }

    _recalculateArcs(data, selectedCounty = this.state.selectedCounty) {
        if (!data) {
            return;
        }
        if (!selectedCounty) {
            selectedCounty = data.find(f => f.properties.name === 'Los Angeles, CA');
        }
        const {flows, centroid} = selectedCounty.properties;

        const arcs = Object.keys(flows).map(toId => {
            const f = data[toId];
            return {
                source: centroid,
                target: f.properties.centroid,
                value: flows[toId]
            };
        });

        const scale = scaleQuantile()
            .domain(arcs.map(a => Math.abs(a.value)))
            .range(inFlowColors.map((c, i) => i));

        arcs.forEach(a => {
            a.gain = Math.sign(a.value);
            a.quantile = scale(Math.abs(a.value));
        });

        if (this.props.onSelectCounty) {
            this.props.onSelectCounty(selectedCounty);
        }

        this.setState({arcs, selectedCounty});
    }

    _renderLayers() {
        const {data, strokeWidth = 2} = this.props;

        return [
            new GeoJsonLayer({
                id: 'geojson',
                data,
                stroked: false,
                filled: true,
                getFillColor: [0, 0, 0, 0],
                onHover: this._onHoverCounty,
                onClick: this._onSelectCounty,
                pickable: true
            }),
            new ArcLayer({
                id: 'arc',
                data: this.state.arcs,
                getSourcePosition: d => d.source,
                getTargetPosition: d => d.target,
                getSourceColor: d => (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
                getTargetColor: d => (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
                strokeWidth
            })
        ];
    }

    render() {
        const {viewState, controller = true, baseMap = true} = this.props;

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
                        mapStyle="mapbox://styles/mapbox/light-v9"
                        preventStyleDiffing={true}
                        mapboxApiAccessToken={MAPBOX_TOKEN}
                    />
                )}

                {this._renderTooltip}
            </DeckGL>
        );
    }
}


export default class Index extends Component{
    state = {
        loading: false,
        data: null
    };

    // componentDidMount() {
    //     console.log(require("./data/counties.json"))
    //     this.setState({loading: true}, () => {
    //         fetch(require("./data/counties.json"))
    //             .then(response => response.json())
    //             .then(({features}) => {
    //                 this.setState({data: features, loading: false});
    //             });
    //     })
    // }

    render(){
        const { loading, data } = this.state;
        return <DrawArcLayer data={require("./data/counties.json").features}/>
        return (
            <div>{loading ? "加载数据中..." : data ? <DrawArcLayer data={data}/> : null}</div>
        )
    }
}

