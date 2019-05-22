import { addUiMarkerToMap, reactToDOM } from '../mapUtil';

export default class BLN{

    constructor(mapboxgl, map, options = {}){
        this.initParams = {mapboxgl, map, options};
        this.marker = null;
    }

    remove = () => this.marker && this.marker.remove();

    render = (resource, params = {}) => {
        const { mapboxgl, map } = this.initParams;

        const { ui, data } = params;

        const Widget = ({data}) => {
            const { position, name, type } = data;

            const bar_color = `linear-gradient(0deg, ${ui.bar.color} 0%, rgba(241, 247, 241, 0.3) 80%)`;

            return (
                <div style={{
                    position: "relative",
                    transform:"rotateX(70deg)",
                }}>
                    <div
                        className="breathe"
                        style={{
                            position: "absolute",
                            width: ui.breathe.width,
                            height: ui.breathe.height,
                            top: ui.bar.height - ui.breathe.height
                        }}
                    />

                    <img
                        src={ui.bar.barImg}
                        style={{
                            position: "absolute",
                            width: ui.bar.width,
                            height: ui.bar.height,
                            top: 15,
                            left: Math.abs(ui.bar.width - ui.breathe.width) / 2
                        }}
                    />

                    { /*language=SCSS*/ }
                    <style jsx>{`
                        // 呼吸灯样式
                        $bln_color: ${ui.breathe.color};    // 呼吸灯颜色

                        @keyframes breathe_frame {
                            0% {
                                opacity: 0.6;
                                box-shadow: 0 1px 2px $bln_color, 0 1px 1px $bln_color inset;
                            }

                            100% {
                                opacity: 1;
                                border: 1px solid $bln_color;
                                box-shadow: 0 1px 45px $bln_color, 0 1px 10px $bln_color inset;
                            }
                        }

                        .breathe {
                            border: 10px solid $bln_color;
                            border-radius: 50%;
                            text-align: center;
                            overflow: hidden;
                            animation-timing-function: ease-in-out;
                            animation-name: breathe_frame;
                            animation-duration: 1500ms;
                            animation-iteration-count: infinite;
                            animation-direction: alternate;
                        }

                         // 三角柱
                        .bar{
                            // background: linear-gradient(0deg, $bar_color 0%, rgba(241, 247, 241, 0.3) 80%);
                            background: ${bar_color};
                            border-radius: 5px;
                            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
                            filter:blur(0.5px);
                        }
                    `}</style>
                </div>
            )
        };

        return this.marker = addUiMarkerToMap(mapboxgl, map, {
            reactToDom: reactToDOM(Widget, {data}),
            position: data.position
        },{
            offset: [-ui.breathe.width / 2, -ui.bar.height * (92/270)]
        });
    }
}
