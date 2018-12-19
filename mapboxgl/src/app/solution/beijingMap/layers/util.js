import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";

/**
 * 生成marker
 * @param dom
 * @param markerOpts
 * @return {{domRef: *, marker: mapboxgl.Marker}}
 */
export const mkMarker = (dom, markerOpts = {}) => {
    let { component: VisComponent, props } = dom;
    props = props || {};

    const el = document.createElement('div');
    let domRef = null;
    ReactDOM.render(<VisComponent ref={(ref) => domRef = ref} {...props}/>, el);

    const marker = new mapboxgl.Marker({
        ...markerOpts,
        element: el,
    });

    return {marker, domRef};
};
