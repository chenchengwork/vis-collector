/**
 * Created by ccentry on 2018/10/15.
 */

/**
 * 圆锥
 * radius:底面半径
 * height:圆锥高度
 * meshDensity:网格密度
 * */
var coneGeo = function(radius, height, segment){
    //锥顶
    var top = [0, height, 0];
    //锥底，锥底半径radius
    //根据segment来切割锥底圆
    var sliceNum = segment || 3;
    var rad = Math.PI*2/sliceNum;
    var bottom = [];
    for(var i=0; i<sliceNum; i++){
        bottom[i*3] = radius*Math.cos(rad*i);
        bottom[i*3 + 1] = 0;
        bottom[i*3 + 2] = radius*Math.sin(rad*i);
    }
    //圆锥的顶点
    this.vertices = [];
    //顶点法向
    this.normals = [];
    //锥顶
    for(var i=0; i<sliceNum; i++){
        this.vertices[i*3] = top[0];
        this.vertices[i*3+1] = top[1];
        this.vertices[i*3+2] = top[2];
    }
    //锥面圆环
    for(var i=0; i<bottom.length; i++){
        this.vertices[3*sliceNum+i] = bottom[i];
    }
    //锥底圆环
    for(var i=0; i<bottom.length; i++){
        this.vertices[2*3*sliceNum+i] = bottom[i];
    }
    //锥底圆心
    this.vertices.push(0, 0, 0);
    //圆锥面索引
    this.faces = [];
    for(var i=sliceNum; i<2*sliceNum-1; i++){
        //圆锥侧面
        this.faces.push(i, i-sliceNum, i+1);
        //圆锥底面
        this.faces.push(3*sliceNum, sliceNum+i, sliceNum+i+1);
    }
    //补侧面
    this.faces.push(2*sliceNum-1, sliceNum-1, sliceNum);
    //补底面
    this.faces.push(3*sliceNum, 3*sliceNum-1, 2*sliceNum);
    //计算所有顶点法向
    this.computeNormal4EachVertex();
};

/**
 * 圆柱
 * radius:底面半径
 * height:圆柱高度
 * meshDensity:网格密度
 * */
var cylinderGeo = function(radius, height, segment){
    radius = radius || 1;
    height = height || 1;
    //根据网格密度来切割圆柱体底圆
    var sliceNum = segment || 3;
    //底面圆弧度
    var rad = Math.PI*2/sliceNum;
    //底面圆环顶点
    var bottomVertices = [];
    //顶面顶点
    var topVertices = [];
    //切割底面圆和底面圆
    for(var i=0; i<sliceNum; i++){
        bottomVertices[3*i] = radius * Math.cos(rad * i);
        bottomVertices[3*i+1] = 0;
        bottomVertices[3*i+2] = radius * Math.sin(rad * i);

        topVertices[3*i] = radius * Math.cos(rad * i);
        topVertices[3*i+1] = height;
        topVertices[3*i+2] = radius * Math.sin(rad * i);
    }
    //圆柱的顶点
    this.vertices = [];
    for(var i=0; i<bottomVertices.length; i++){
        //底面圆
        this.vertices[i] = bottomVertices[i];
        //顶面圆
        this.vertices[bottomVertices.length + i] = topVertices[i];
        //柱底圈
        this.vertices[2*bottomVertices.length + i] = bottomVertices[i];
        //柱顶圈
        this.vertices[3*bottomVertices.length + i] = topVertices[i];
    }
    //底面圆心;
    this.vertices.push(0, 0, 0);
    //顶面圆心
    this.vertices.push(0, height, 0);
    //圆柱的面
    this.faces = [];
    for(var i=0; i<sliceNum-1; i++){
        //底面圆
        this.faces.push(4*sliceNum, i, i+1);
        //顶面圆
        this.faces.push(4*sliceNum+1, sliceNum+i+1, sliceNum+i);
        //柱身
        this.faces.push(2*sliceNum+i, 3*sliceNum+i, 2*sliceNum+i+1);
        this.faces.push(3*sliceNum+i, 3*sliceNum+i+1, 2*sliceNum+i+1);
    }
    //补底面圆
    this.faces.push(4*sliceNum, sliceNum-1, 0);
    //补顶面圆
    this.faces.push(4*sliceNum+1, sliceNum, 2*sliceNum-1);
    //补柱身
    this.faces.push(3*sliceNum-1, 4*sliceNum-1, 2*sliceNum);
    this.faces.push(4*sliceNum-1, 3*sliceNum, 2*sliceNum);
    //顶点法向
    this.normals = [];
    //计算所有顶点法向
    this.computeNormal4EachVertex();
};

/**
 * 球体
 * radius:球体半径
 * meshDensity:网格密度
 * */
var sphereGeo = function(radius, widthSegments, heightSegments){
    var phiStart = 0;
    var phiLength = Math.PI * 2;
    var thetaStart = 0;
    var thetaLength = Math.PI;
    var thetaEnd = thetaStart + thetaLength;
    var ix, iy;
    var index = 0;
    var grid = [];
    var vertex = {};
    var normal = {};
    //存储
    var indices = [];
    var vertices = [];
    var normals = [];
    var uvs = [];
    //生成顶点，法向，uv
    for ( iy = 0; iy <= heightSegments; iy ++ ) {
        var verticesRow = [];
        var v = iy / heightSegments;
        for ( ix = 0; ix <= widthSegments; ix ++ ) {
            var u = ix / widthSegments;
            //顶点
            vertex.x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
            vertex.y = radius * Math.cos( thetaStart + v * thetaLength );
            vertex.z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
            vertices.push( vertex.x, vertex.y, vertex.z );
            //法向
            normal.x = vertex.x; normal.y = vertex.y; normal.z = vertex.z;
            //单位化
            this.normalize([normal.x, normal.y, normal.z]);
            normals.push( normal.x, normal.y, normal.z );
            //uv
            uvs.push( u, 1 - v );
            verticesRow.push( index ++ );
        }
        grid.push( verticesRow );
    }
    //索引数组
    for ( iy = 0; iy < heightSegments; iy ++ ) {
        for ( ix = 0; ix < widthSegments; ix ++ ) {
            var a = grid[ iy ][ ix + 1 ];
            var b = grid[ iy ][ ix ];
            var c = grid[ iy + 1 ][ ix ];
            var d = grid[ iy + 1 ][ ix + 1 ];
            if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
            if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) indices.push( b, c, d );
        }
    }
    //构造geometry
    this.faces =  indices;
    this.vertices = vertices;
    this.normals = normals;
    //this.uv = uvs;
};

var cubeGeo = function(width, height, depth){
    this.vertices = [];
    this.faces = [];
    var bottom = [];
    bottom[0] = [width/2, 0, depth/2];
    bottom[1] = [-width/2, 0, depth/2];
    bottom[2] = [-width/2, 0, -depth/2];
    bottom[3] = [width/2, 0, -depth/2];
    var top = [];
    top[0] = [width/2, height, depth/2];
    top[1] = [-width/2, height, depth/2];
    top[2] = [-width/2, height, -depth/2];
    top[3] = [width/2, height, -depth/2];
    for(var i=0; i<4; i++){
        for(var j=0; j<3; j++){
            this.vertices.push(bottom[i][j]);
        }
    }
    for(var i=0; i<4; i++){
        for(var j=0; j<3; j++){
            this.vertices.push(top[i][j]);
        }
    }
    for(var i=0; i<3; i++){
        this.faces.push(i, i+4, i+1);
        this.faces.push(i+4, i+5, i+1);
    }
    //补面
    this.faces.push(3, 7, 0);
    this.faces.push(7, 4, 0);
    //补底面
    this.faces.push(0, 1, 2, 2, 3, 0);
    //补底面
    this.faces.push(4, 7, 6, 6, 5, 4);
};

var PolyhedronGeometry = function(){
    this.type = "PolyhedronGeometry";
};

PolyhedronGeometry.prototype = {
    //坐标单位话
    normalize : function(arr){
        if(arr instanceof Array){
            var sum = 0;
            for(var i=0; i<arr.length; i++){
                sum += arr[i]*arr[i];
            }
            for(var i=0; i<arr.length; i++){
                arr[i] = arr[i]/sum;
            }
        }
    },
    //计算顶点法向
    computeVertexNormal: function(face3){
        //顶点逆时针绕向
        //向量v1-v0
        var v1_0 = {};
        v1_0.x = face3[1][0] - face3[0][0];
        v1_0.y = face3[1][1] - face3[0][1];
        v1_0.z = face3[1][2] - face3[0][2];
        //向量v2-v1
        var v2_1 = {};
        v2_1.x = face3[2][0] - face3[1][0];
        v2_1.y = face3[2][1] - face3[1][1];
        v2_1.z = face3[2][2] - face3[1][2];
        //v1_0 叉乘 v2_1
        var normal = {};
        normal.x = v1_0.y * v2_1.z - v2_1.y * v1_0.z;
        normal.y = v1_0.z * v2_1.x - v2_1.z * v1_0.x;
        normal.z = v1_0.x * v2_1.y - v2_1.x * v1_0.y;
        var normalArray = [normal.x, normal.y, normal.z];
        this.normalize(normalArray);
        return normalArray;
    },
    computeNormal4EachVertex:function(){
        //遍历索引，通过hash插值构造normals数组
        var normalList = [];
        for(var i=0; i<this.faces.length; i=i+3){
            //顶点索引
            var vertex0 = this.faces[i];
            var vertex1 = this.faces[i+1];
            var vertex2 = this.faces[i+2];
            //顶点
            var v0 = [this.vertices[3*vertex0], this.vertices[3*vertex0+1], this.vertices[3*vertex0+2]];
            var v1 = [this.vertices[3*vertex1], this.vertices[3*vertex1+1], this.vertices[3*vertex1+2]];
            var v2 = [this.vertices[3*vertex2], this.vertices[3*vertex2+1], this.vertices[3*vertex2+2]];
            //取出索引指向的顶点坐标
            var face3 = [v0, v1, v2];
            var normalArray = this.computeVertexNormal(face3);
            var normal0 = {index:vertex0, normal:normalArray};
            var normal1 = {index:vertex1, normal:normalArray};
            var normal2 = {index:vertex2, normal:normalArray};
            normalList.push(normal0, normal1, normal2);
        }
        //根据index属性排序
        var sortedNormalList = [];
        var total = normalList.length;
        for(var i=0; i<total; i++){
            for(var j=0; j<normalList.length; j++){
                if(normalList[j].index === i){
                    sortedNormalList[i] = {index:normalList[j].index, normal:normalList[j].normal};
                    //删掉该normal节点
                    normalList.splice(j, 1);
                    break;
                }
            }
        }
        for(var i=0; i<sortedNormalList.length; i++){
            var normal = sortedNormalList[i].normal;
            this.normals.push(normal[0], normal[1], normal[2]);
        }
    }
};

coneGeo.prototype = new PolyhedronGeometry();
cylinderGeo.prototype = new PolyhedronGeometry();
sphereGeo.prototype = new PolyhedronGeometry();
cubeGeo.prototype = new PolyhedronGeometry();
