importScripts('resource/three.min.js');
importScripts('resource/ThreeFont.js');

class ThreeUtil {

    /**
     * 获取text网格
     * @param {String} text
     * @param {Object} opts
     * @param {Object} opts.geometry
     * @param {Object} opts.material
     * @return {Mesh}
     */
    static mkTextMesh(text, opts = {}){
        let { geometry, material } = opts;
        geometry = geometry || {};
        material = material || {};

        const textGeometry = new THREE.TextGeometry(text, Object.assign({
            "font" : new THREE.Font(ThreeFont),
            "size" : 10,
            "height" : 1,
            "bevelEnabled" : true,
            "bevelSize": 2
        }, geometry));

        const textMesh = new THREE.Mesh(textGeometry,new THREE.MultiMaterial( [
            new THREE.MeshPhongMaterial( Object.assign({ color: 0x2E8B57, shading: THREE.FlatShading }, material) ),
        ]));

        return textMesh.toJSON();
    }
}
