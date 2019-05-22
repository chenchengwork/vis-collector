import { addUiMarkerToMap, reactToDOM } from '../mapUtil';

export default class Arrow{
    /**
     *
     * @param mapboxgl
     * @param map
     * @param {Object} options
     * @param {Array} options.leftArrowNames
     * @param {String} options.name
     * @param {Array} options.position
     */
    constructor(mapboxgl, map, options = {}){
        this.initParams = {mapboxgl, map, options};
        this.marker = null;
    }

    remove = () => this.marker && this.marker.remove();

    render = () => {
        const { mapboxgl, map, options } = this.initParams;
        const { name, position, value, leftArrowNames } = options;

        const { containerClassName, containerStyle, contentStyle, markerParams } = getTextParams(name, leftArrowNames);

        const Text = ({name}) => (<div
            className={containerClassName}
            style={containerStyle}
        >
            <span style={contentStyle}>({value}){name}</span>

            { /*language=SCSS*/ }
            <style jsx>{`
                .left-arrow{
                    background: linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
                    clip-path: polygon(30% 0%, 100% 0%, 100% 100%, 30% 100%, 0% 50%);
                }

                .right-arrow{
                    background: linear-gradient(270deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
                    clip-path: polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%);
                }
            `}</style>
        </div>);

        return this.marker = addUiMarkerToMap(mapboxgl, map, {
            reactToDom: reactToDOM(Text, {name}),
            position
        }, markerParams);
    }
}

const getTextParams = (name, leftArrowNames) => {
    const width = 65;
    const height = 15;
    const fontSize = 10;
    const isLeftArrow = leftArrowNames.indexOf(name) !== -1;
    let containerClassName = "right-arrow";

    const containerStyle = {
        width,
        height,
        position: "relative",
        display: "flex",
        alignItems: "center",
        flexFlow: "row-reverse"
    };

    const contentStyle = {
        color: "rgba(255,255,255, 0.8)",
        fontSize: 10,
        fontWeight: 800,
        float: "right",
        marginRight: "35%",
    }

    const markerParams = {
        offset: [-width / 2, 0]     // right
    }

    if(isLeftArrow){
        containerClassName = "left-arrow"

        delete containerStyle.flexFlow;
        contentStyle.float = "left";

        contentStyle.marginLeft = contentStyle.marginRight;
        delete contentStyle.marginRight;

        markerParams.offset[0] = -markerParams.offset[0]
    }

    return { containerClassName, containerStyle, contentStyle, markerParams }
}
