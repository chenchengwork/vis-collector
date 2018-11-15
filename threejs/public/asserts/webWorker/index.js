importScripts('ThreeUtil.js');

onmessage = function(message){
    var data = {
        textMeshJSON: ThreeUtil.mkTextMesh("ssdhiw")
    };

    postMessage(data);
};
