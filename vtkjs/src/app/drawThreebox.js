import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from 'mapbox-gl';

import Threebox from './Threebox/Threebox';
import * as THREE from 'three';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hlbmNoZW5nMTIiLCJhIjoiY2poN2JjcmJuMDY1cjJ3cDl0OG0xeWxzdyJ9.Jyy5bvJDCvtjPXSPZMazTg';
var origin = [-122.4340, 37.7353, 1000];

export default () => {

    var map = new mapboxgl.Map({
        container: 'map',
        center: origin,
        zoom: 15.95,
        pitch: 60,
        heading: 41,
        hash: true,

        style: 'mapbox://styles/mapbox/light-v9',
        // style: {
        //     "version": 8,
        //     "sources": {},
        //     "layers": []
        // },
    });

    map.on('style.load', function () {
        map.addLayer({
            id: 'custom_layer',
            type: 'custom',
            onAdd: function (map, mbxContext) {
                this.threebox = new Threebox(map, mbxContext);
                this.threebox.setupDefaultLights();
                // initialize geometry and material of our cube object
                const geometry = new THREE.BoxGeometry(2000, 2000, 2000);
                const redMaterial = new THREE.MeshPhongMaterial({
                    color: 0x660000,
                    side: THREE.DoubleSide
                });
                const cube = new THREE.Mesh(geometry, redMaterial);
                this.threebox.addAtCoordinate(cube, origin);
            },

            render: function (gl, matrix) {
                console.log(1212)
                this.threebox.update(true);
            }
        });
    });
}
