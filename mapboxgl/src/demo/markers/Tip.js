import { addUiMarkerToMap, reactToDOM } from '../mapUtil';

export default class Tip{

    /**
     * @param mapboxgl
     * @param map
     * @param {Object} options
     * @param {Array} options.position
     */
    constructor(mapboxgl, map, options = {}){
        this.initParams = {mapboxgl, map, options};
        this.marker = null;
    }

    remove = () => this.marker && this.marker.remove();

    render = () => {
        const { mapboxgl, map, options } = this.initParams;
        const { position, data } = options;

        const Tip = ({data}) => {
            // const { name, type } = data;
            return (
                <div
                    className="tip"
                >
                    {data.map((item) => (
                        <div key={item.name}>
                            <span style={{color: "#fff"}}>{item.name}: {item.value}{item.unit}</span>
                        </div>
                    ))}

                    { /*language=SCSS*/ }
                    <style jsx>{`
                        .tip{
                            padding: 3px;
                            position: relative;
                            background: rgba(0, 0, 0, 0.7);
                            border-radius: 5px;
                        }
                    `}</style>
                </div>
            )
        };

        return this.marker = addUiMarkerToMap(mapboxgl, map, {
            reactToDom: reactToDOM(Tip, {data}),
            position: position
        },{
            offset: [80/ 2, 0]
        });
    }
}
