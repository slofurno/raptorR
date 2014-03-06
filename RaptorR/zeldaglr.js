var gl; // A global variable for the WebGL context


function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var polyShaderProgram;
var shaderProgram;
var terrainShaderProgram;
var laserShaderProgram;
var squareShaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    var terrainfs = getShader(gl, "terrain-fs");
    var terrainvs = getShader(gl, "terrain-vs");

    var polyfs = getShader(gl, "poly-fs");
    var polyvs = getShader(gl, "poly-vs");

    var laserfs = getShader(gl, "laser-fs");
    var laservs = getShader(gl, "laser-vs");

    var squarefs = getShader(gl, "square-fs");
    var squarevs = getShader(gl, "square-vs");


    shaderProgram = gl.createProgram();
    terrainShaderProgram = gl.createProgram();
    polyShaderProgram = gl.createProgram();
    laserShaderProgram = gl.createProgram();
    squareShaderProgram = gl.createProgram();

    gl.attachShader(squareShaderProgram, squarevs);
    gl.attachShader(squareShaderProgram, squarefs);

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);


    gl.attachShader(terrainShaderProgram, terrainvs);
    gl.attachShader(terrainShaderProgram, terrainfs);


    gl.attachShader(polyShaderProgram, polyvs);
    gl.attachShader(polyShaderProgram, polyfs);

    gl.attachShader(laserShaderProgram, laservs);
    gl.attachShader(laserShaderProgram, laserfs);

    gl.linkProgram(squareShaderProgram);
    gl.linkProgram(shaderProgram);
    gl.linkProgram(terrainShaderProgram);
    gl.linkProgram(polyShaderProgram);
    gl.linkProgram(laserShaderProgram);

    if (!gl.getProgramParameter(laserShaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    //gl.useProgram(shaderProgram);



    setShader(squareShaderProgram);

    currentShader.vertexPositionAttribute = gl.getAttribLocation(currentShader, "aVertexPosition");
    gl.enableVertexAttribArray(currentShader.vertexPositionAttribute);

    currentShader.vertexColorAttribute = gl.getAttribLocation(currentShader, "aVertexColor");
    gl.enableVertexAttribArray(currentShader.vertexColorAttribute);

    currentShader.pMatrixUniform = gl.getUniformLocation(currentShader, "uPMatrix");
    currentShader.mvMatrixUniform = gl.getUniformLocation(currentShader, "uMVMatrix");




    setShader(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.eyeMatrixUniform = gl.getUniformLocation(shaderProgram, "uEyeMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
    shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");

    //gl.useProgram(terrainShaderProgram);
    setShader(terrainShaderProgram);

    terrainShaderProgram.vertexPositionAttribute = gl.getAttribLocation(terrainShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(terrainShaderProgram.vertexPositionAttribute);

    terrainShaderProgram.vertexNormalAttribute = gl.getAttribLocation(terrainShaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(terrainShaderProgram.vertexNormalAttribute);

    terrainShaderProgram.textureCoordAttribute = gl.getAttribLocation(terrainShaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(terrainShaderProgram.textureCoordAttribute);

    terrainShaderProgram.pMatrixUniform = gl.getUniformLocation(terrainShaderProgram, "uPMatrix");
    terrainShaderProgram.mvMatrixUniform = gl.getUniformLocation(terrainShaderProgram, "uMVMatrix");

    terrainShaderProgram.nMatrixUniform = gl.getUniformLocation(terrainShaderProgram, "uNMatrix");

    terrainShaderProgram.lightingDirectionUniform = gl.getUniformLocation(terrainShaderProgram, "uLightingDirection");
    terrainShaderProgram.directionalColorUniform = gl.getUniformLocation(terrainShaderProgram, "uDirectionalColor");

    terrainShaderProgram.samplerUniform = gl.getUniformLocation(terrainShaderProgram, "uSampler");


    setShader(polyShaderProgram);

    polyShaderProgram.vertexPositionAttribute = gl.getAttribLocation(polyShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(polyShaderProgram.vertexPositionAttribute);

    polyShaderProgram.previousVertexPositionAttribute = gl.getAttribLocation(polyShaderProgram, "aPreviousVertexPosition");
    gl.enableVertexAttribArray(polyShaderProgram.previousVertexPositionAttribute);

    polyShaderProgram.nextVertexPositionAttribute = gl.getAttribLocation(polyShaderProgram, "aNextVertexPosition");
    gl.enableVertexAttribArray(polyShaderProgram.nextVertexPositionAttribute);



    polyShaderProgram.pMatrixUniform = gl.getUniformLocation(polyShaderProgram, "uPMatrix");
    polyShaderProgram.mvMatrixUniform = gl.getUniformLocation(polyShaderProgram, "uMVMatrix");
    polyShaderProgram.nMatrixUniform = gl.getUniformLocation(polyShaderProgram, "uNMatrix");
    polyShaderProgram.eyeMatrixUniform = gl.getUniformLocation(polyShaderProgram, "uEyeMatrix");

    polyShaderProgram.CameraPos = gl.getUniformLocation(polyShaderProgram, "uCameraPos");





    setShader(laserShaderProgram);

    laserShaderProgram.vertexPositionAttribute = gl.getAttribLocation(laserShaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(laserShaderProgram.vertexPositionAttribute);


    laserShaderProgram.pMatrixUniform = gl.getUniformLocation(laserShaderProgram, "uPMatrix");
    laserShaderProgram.mvMatrixUniform = gl.getUniformLocation(laserShaderProgram, "uMVMatrix");
    laserShaderProgram.nMatrixUniform = gl.getUniformLocation(laserShaderProgram, "uNMatrix");

    laserShaderProgram.directionUniform = gl.getUniformLocation(laserShaderProgram, "uDirection");


    laserShaderProgram.CameraPos = gl.getUniformLocation(laserShaderProgram, "uCameraPos");



}




function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}


var desertTexture;
var crateTexture;

function initTextures() {


    crateTexture = gl.createTexture();
    crateTexture.image = new Image();
    crateTexture.image.onload = function () {
        handleLoadedTexture(crateTexture);
    }
    crateTexture.image.src = "img/bz111.png";

    desertTexture = gl.createTexture();
    desertTexture.image = new Image();
    desertTexture.image.onload = function () {

        handleLoadedTexture(desertTexture);
    }

    desertTexture.image.src = "img/desert.png";

}


var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    //mat4.set(mvMatrix, copy);

    mat4.copy(copy, mvMatrix);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

var currentShader;

function setShader(program) {

    gl.useProgram(program);
    currentShader = program;
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(currentShader.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(currentShader.mvMatrixUniform, false, mvMatrix);

    var normalMatrix = mat3.create();
    //mat4.toInverseMat3(mvMatrix, normalMatrix);

    var tempmat = mat4.create();

    mat4.invert(tempmat, mvMatrix)



    mat3.fromMat4(normalMatrix, tempmat);

    mat3.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix3fv(currentShader.nMatrixUniform, false, normalMatrix);
}




function degToRad(degrees) {
    return degrees * Math.PI / 180;
}





var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexNormalBuffer;
var cubeVertexIndexBuffer;
var squareVertexPositionBuffer;
var squareVertexColorBuffer;

function initBuffers() {


    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
         4.0, 0.0, 4.0,
        -4.0, 0.0, 4.0,
         4.0, 0.0, -4.0,
        -4.0, 0.0, - 4.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;

    squareVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    colors = []
    for (var i = 0; i < 4; i++) {
        colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareVertexColorBuffer.itemSize = 4;
    squareVertexColorBuffer.numItems = 4;

    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    vertices = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,
     //8 9 10 8 10 11
    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
    var vertexNormals = [
    // Front face
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Back face
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    // Top face
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    // Bottom face
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,

    // Right face
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // Left face
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    cubeVertexNormalBuffer.itemSize = 3;
    cubeVertexNormalBuffer.numItems = 24;

    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    var textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    ];


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    cubeVertexTextureCoordBuffer.numItems = 24;



    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
    0, 1, 2, 0, 2, 3,    // Front face
    4, 5, 6, 4, 6, 7,    // Back face
    8, 9, 10, 8, 10, 11,  // Top face
    12, 13, 14, 12, 14, 15, // Bottom face
    16, 17, 18, 16, 18, 19, // Right face
    20, 21, 22, 20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;

}


var xRot = 0;
var yRot = 0;
var zRot = 0;

var pitch = 0;
var pitchRate = 0;

var yaw = 0;
var yawRate = 0;

var xPos = 0;
var yPos = 5;
var zPos = 8;

var moonRotationMatrix = mat4.create();
mat4.identity(moonRotationMatrix);
var newRotationMatrix = mat4.create();
mat4.identity(newRotationMatrix);


var velo = vec3.create();


var right = vec3.fromValues(1, 0, 0);
var up = vec3.fromValues(0, 1, 0);
var front = vec3.fromValues(0, 0, 1);

function rotateXInDegrees(rot) {
    /*
    var temp = mat4.create();

    mat4.identity(temp);

    mat4.rotate(temp, temp, rot, [1,0,0]);



    vec3.transformMat4(right, right, temp);
    vec3.transformMat4(up, up, temp);
    vec3.transformMat4(front, front, temp);
    */


    var temp2 = mat4.fromValues(right[0], right[1], right[2], 0,
              up[0], up[1], up[2], 0,
              front[0], front[1], front[2], 0,
             0, 0, 0, 1);


    mat4.rotate(temp2, temp2, rot, [right[0], up[0], front[0]]);


    right[0] = temp2[0];
    right[1] = temp2[1];
    right[2] = temp2[2];
    up[0] = temp2[4];
    up[1] = temp2[5];
    up[2] = temp2[6];
    front[0] = temp2[8];
    front[1] = temp2[9];
    front[2] = temp2[10];




    //vec3.normalize(right);
    //vec3.normalize(up);
    //vec3.normalize(front);
}

function rotateYInDegrees(rot) {
    /*
    var temp = mat4.create();

    mat4.identity(temp);

    mat4.rotate(temp, temp, rot, [0, 1, 0]);
 

    vec3.transformMat4(right, right, temp);
    vec3.transformMat4(up, up, temp);
    vec3.transformMat4(front, front, temp);
    */

    var temp2 = mat4.fromValues(right[0], right[1], right[2], 0,
              up[0], up[1], up[2], 0,
              front[0], front[1], front[2], 0,
             0, 0, 0, 1);


    mat4.rotate(temp2, temp2, rot, [right[1], up[1], front[1]]);


    right[0] = temp2[0];
    right[1] = temp2[1];
    right[2] = temp2[2];
    up[0] = temp2[4];
    up[1] = temp2[5];
    up[2] = temp2[6];
    front[0] = temp2[8];
    front[1] = temp2[9];
    front[2] = temp2[10];



    //vec3.normalize(right);
    //vec3.normalize(up);
    //vec3.normalize(front);
}

function rotateZInDegrees(rot) {
    /*
    var temp = mat4.create();

    mat4.identity(temp);

    mat4.rotate(temp, temp, rot, [0, 0, 1]);

    vec3.transformMat4(right, right, temp);
    vec3.transformMat4(up, up, temp);
    vec3.transformMat4(front, front, temp);
    */


    var temp2 = mat4.fromValues(right[0], right[1], right[2], 0,
              up[0], up[1], up[2], 0,
              front[0], front[1], front[2], 0,
             0, 0, 0, 1);


    mat4.rotate(temp2, temp2, rot, [right[2], up[2], front[2]]);


    right[0] = temp2[0];
    right[1] = temp2[1];
    right[2] = temp2[2];
    up[0] = temp2[4];
    up[1] = temp2[5];
    up[2] = temp2[6];
    front[0] = temp2[8];
    front[1] = temp2[9];
    front[2] = temp2[10];




    /*
    right = mat4.multiplyVec3(temp, right);
    up = mat4.multiplyVec3(temp, up);
    front = mat4.multiplyVec3(temp, front);
    */

    //vec3.normalize(right);
    //vec3.normalize(up);
    //vec3.normalize(front);
}



function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(.4, .4, .4, 0.2);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix, 1.2, gl.viewportWidth / gl.viewportHeight, 2.0, 900.0);

    //gl.useProgram(shaderProgram);
    setShader(shaderProgram);


    gl.uniform3f(
        shaderProgram.ambientColorUniform,
        parseFloat(document.getElementById("ambientR").value),
        parseFloat(document.getElementById("ambientG").value),
        parseFloat(document.getElementById("ambientB").value)
    );



    gl.uniform3f(
        shaderProgram.pointLightingColorUniform,
        1,
        1,
        1
    );





    mat4.identity(mvMatrix);

    /*
    var mvm2 = mat4.fromValues(right[0], right[1], right[2], mycamerapos.x + 30 * right[2],
                  up[0], up[1], up[2], mycamerapos.y + 30 * up[2],
                  front[0], front[1], front[2], mycamerapos.z + 30 * front[2] ,
                 0, 0, 0, 1);

    mat4.transpose(mvm2, mvm2);


    mat4.invert(mvm2, mvm2);

    mat4.multiply(mvMatrix, mvMatrix, mvm2);
    */


    //recent mat4.lookAt(mvMatrix, vec3.fromValues(testEntity.position[0] + 50 * testEntity.orientation[8] + 10 * testEntity.orientation[4], testEntity.position[1] + 50 * testEntity.orientation[9] + 10 * testEntity.orientation[5], testEntity.position[2] + 50 * testEntity.orientation[10] + 10 * testEntity.orientation[6]), vec3.fromValues(testEntity.position[0] - 50 * testEntity.orientation[8] + 1 * testEntity.orientation[4], testEntity.position[1] - 50 * testEntity.orientation[9] + 1 * testEntity.orientation[5], testEntity.position[2] - 50 * testEntity.orientation[10] + 1 * testEntity.orientation[6]), vec3.fromValues(testEntity.orientation[4], testEntity.orientation[5], testEntity.orientation[6]));

    //mat4.lookAt(mvMatrix, vec3.fromValues(testEntity.position[0] + 35 * testEntity.orientation[8] + 1 * testEntity.orientation[4], testEntity.position[1] + 35 * testEntity.orientation[9] + 1 * testEntity.orientation[5], testEntity.position[2] + 35 * testEntity.orientation[10] + 1 * testEntity.orientation[6]), vec3.fromValues(testEntity.position[0] - 15 * testEntity.orientation[8] + 1 * testEntity.orientation[4], testEntity.position[1] - 15 * testEntity.orientation[9] + 1 * testEntity.orientation[5], testEntity.position[2] - 15 * testEntity.orientation[10] + 1 * testEntity.orientation[6]), vec3.fromValues(testEntity.orientation[4], testEntity.orientation[5], testEntity.orientation[6]));

    mycamerapos.x = testEntity.position[0];
    mycamerapos.y = testEntity.position[1]+200;
    mycamerapos.z = testEntity.position[2];


    mat4.lookAt(mvMatrix, vec3.fromValues(mycamerapos.x, mycamerapos.y, mycamerapos.z), vec3.fromValues(mycamerapos.x, mycamerapos.y-200, mycamerapos.z), vec3.fromValues(0,0,1));


    //mat4.lookAt(mvMatrix, vec3.fromValues(mycamerapos.x + 50 * right[2] + 10 * right[1], mycamerapos.y + 50 * up[2] + 10 * up[1], mycamerapos.z + 50 * front[2] + 10 * front[1]), vec3.fromValues(mycamerapos.x - 50 * right[2] + 1 * right[1], mycamerapos.y - 50 * up[2] + 1 * up[1], mycamerapos.z - 50 * front[2] + 1 * front[1]), vec3.fromValues(right[1], up[1], front[1]));

    var obj = testEntity.position;
    var objor = testEntity.orientation;

    //mat4.lookAt(mvMatrix, vec3.fromValues(obj[0] + 50 * right[2] + 10 * right[1], obj[1] + 50 * up[2] + 10 * up[1], obj[2] + 50 * front[2] + 10 * front[1]), vec3.fromValues(obj[0] - 50 * right[2] + 1 * right[1], obj[1] - 50 * up[2] + 1 * up[1], obj[2] - 50 * front[2] + 1 * front[1]), vec3.fromValues(right[1], up[1], front[1]));

    var eyematrix = mat3.create();


    var tempmat = mat4.create();

    mat4.invert(tempmat, mvMatrix);

    mat3.fromMat4(eyematrix, tempmat);
    mat3.transpose(eyematrix, eyematrix);


    gl.uniformMatrix3fv(currentShader.eyeMatrixUniform, false, eyematrix);









    




    //mat4.translate(mvMatrix, [mycamerapos.x - Math.cos(1.57 - mycamerarot.y) * 30, mycamerapos.y  + Math.cos(1.57 - mycamerarot.x) * 30, mycamerapos.z - Math.sin(1.57 - mycamerarot.y) * 30]);

    //mat4.translate(mvMatrix, [mycamerapos.x - Math.cos(1.57 - 3.7) * 30, mycamerapos.y + Math.cos(1.57 - 0) * 30, mycamerapos.z - Math.sin(1.57 - 3.7) * 30]);









    /*
    mvPushMatrix();



    var mvm = mat4.create();


    mvm = testEntity.updateMatrix();

    //mat4.transpose(mvm, mvm);

    mat4.multiply(mvMatrix, mvMatrix, mvm);







    setMatrixUniforms();

    testmesh.draw();

    mvPopMatrix();


    */

    modelSystem.drawAll();



    //gl.useProgram(terrainShaderProgram);
    setShader(terrainShaderProgram);

    mvPushMatrix();







    testterrain.draw();



    setShader(polyShaderProgram);



    gl.uniformMatrix3fv(currentShader.eyeMatrixUniform, false, eyematrix);
    gl.enable(gl.BLEND);

    gl.uniform3f(
           currentShader.CameraPos,
           //mycamerapos.x + 50 * right[2] + 10 * right[1], mycamerapos.y + 50 * up[2] + 10 * up[1], mycamerapos.z + 50 * front[2] + 10 * front[1]
           mycamerapos.x, mycamerapos.y, mycamerapos.z

       );





    polytrail.draw();
    polytrail2.draw()

    gl.disable(gl.BLEND);


    bulletmanager.draw();

    mvPopMatrix();
    /*
    mvPushMatrix();
    
    setShader(squareShaderProgram);

    gl.uniform3f(
       currentShader.CameraPos,
       //mycamerapos.x + 50 * right[2] + 10 * right[1], mycamerapos.y + 50 * up[2] + 10 * up[1], mycamerapos.z + 50 * front[2] + 10 * front[1]
       mycamerapos.x, mycamerapos.y, mycamerapos.z

   );
    //mat4.lookAt(mvMatrix, vec3.fromValues(mycamerapos.x, mycamerapos.y, mycamerapos.z), vec3.fromValues(mycamerapos.x, mycamerapos.y - 200, mycamerapos.z), vec3.fromValues(0, 0, 1));
    mat4.translate(mvMatrix, mvMatrix, [-testEntity.position[0] + testEntity.x, testEntity.position[2] - testEntity.y, 50]);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(currentShader.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.vertexAttribPointer(currentShader.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

    mvPopMatrix();
    */
    
    //vec3 toPoint = normalize(vec3(vPosition[0], vPosition[1], vPosition[2]));
}


var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        xRot += (90 * elapsed) / 1000.0;
        yRot += (90 * elapsed) / 1000.0;
        zRot += (90 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}

var posx = 0;

function tick() {
    requestAnimFrame(tick);

    updatePads();

    //console.log("axis 0" + controller.axes[0] + "  " + controller.axes[1] + "  " + controller.axes[2] + "  " + controller.axes[3] + "  " + controller.axes[4] + "  " + controller.axes[5] + "  ");
    polytrail.addNode(5);
    polytrail.addNode(5);
    polytrail2.addNode(-5);
    polytrail2.addNode(-5);
    drawScene();
    moveCamera(mycamerapos, mycamerarot, mykeyboard);

    testEntity.update();
    testEntitytwo.update();
    testEntity.getData(posx);
    console.log("vel + " + posx);

    //console.log(mycamerapos.x + "  " + mycamerapos.z);
    //animate();
}

var bulletmanager;


function webGLStart() {
    var canvas = document.getElementById("pscanvas");
    mykeyboard = new KeyboardState();
    addEventListener("gamepadconnected", function () { });
    initGL(canvas);

    testEntity = new Entity(mykeyboard);

    testEntitytwo = new Entity(mykeyboard);
    testEntitytwo.position = vec3.fromValues(5, 40, 0);
    testmesh = new Mesh();

    //loadFile(testmesh);

    loadFile(testmesh, "bz111.obj");

    


    testterrain = new terrainMesh(128, 128);
    testterrain.generateMesh();
    testterrain.bindMesh();

    polytrail = new polyTrail();

    polytrail.bindbuffers();

    polytrail2 = new polyTrail();

    polytrail2.bindbuffers();

    bulletmanager = new bulletManager();
    bulletmanager.init();


    initShaders();

    initBuffers();
    initTextures();



    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    $(document).keyup(function (e) {

        mykeyboard.setkeyup(e.which);

    });



    $(document).keydown(function (e) {
        e.preventDefault();
        mykeyboard.setkeydown(e.which);

        var keyid = e.which;


    });

    modelSystem.createInstance("bz111.obj", testEntity);
    modelSystem.createInstance("bz111.obj", testEntitytwo);

    tick();
}

var mykeyboard;


var mycamerapos = { x: 0, y: 24, z: 0 };


var mycamerarot = { x: Math.PI, y: Math.PI / 2, z: Math.PI / 2 };

var mycameraaccel = vec3.create();
var mycameravel = vec3.create();


function moveCamera(CameraPos, CameraRot, keyboard) {


    var stepsize = 1;


    newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);




    if (keyboard.isKeyDown(65)) {

        // CameraPos.z += stepsize * Math.sin(3.14 - CameraRot.y);
        //CameraPos.x += stepsize * Math.cos(3.14 - CameraRot.y);



        rotateYInDegrees(-.02);
        //testEntity.rotateY(-.02);
        //CameraRot.y += .02;
    }

    if (keyboard.isKeyDown(68)) {

        //CameraPos.z -= stepsize * Math.sin(3.14 - CameraRot.y);
        //CameraPos.x -= stepsize * Math.cos(3.14 - CameraRot.y);



        rotateYInDegrees(.02);
        //testEntity.rotateY(.02);
        //CameraRot.y -= .02;
    }

    if (keyboard.isKeyDown(83)) {

        CameraPos.x += stepsize * right[2];
        CameraPos.y += stepsize * up[2];
        CameraPos.z += stepsize * front[2];

        //testEntity.update(stepsize);

    }

    if (keyboard.isKeyDown(87)) {

        //CameraPos.z -= stepsize * Math.sin(1.57 - CameraRot.y);
        //CameraPos.x -= stepsize * Math.cos(1.57 - CameraRot.y);

        CameraPos.x -= stepsize * right[2];
        CameraPos.y -= stepsize * up[2];
        CameraPos.z -= stepsize * front[2];

        //testEntity.update(-stepsize);

    }


    if (keyboard.isKeyDown(73)) {

        rotateXInDegrees(.02);
        //testEntity.rotateX(.02);
        //CameraRot.x += .02;
    }
    if (keyboard.isKeyDown(75)) {

        rotateXInDegrees(-.02);
        //testEntity.rotateX(-.02);
        //CameraRot.x -= .02;
    }
    if (keyboard.isKeyDown(74)) {

        rotateZInDegrees(-.02);
        //testEntity.rotateZ(-.02);
        //CameraRot.z -= .02;


    }
    if (keyboard.isKeyDown(76)) {

        rotateZInDegrees(.02);
        // testEntity.rotateZ(.02);
        //CameraRot.z += .02;

    }

    //console.log("xrot : " + CameraRot.x + "    yrot : " + CameraRot.y + "zrot : " + CameraRot.z);

}

var controllers = [];

//controllers[0] = new GamePadState();



function connecthandler(e) {
    addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
    controllers[gamepad.index] = gamepad;
}

var firefoxpad = new GamePadState();

function scangamepads() {

    var gamepads;

    if (navigator.webkitGetGamepads) {
        gamepads = navigator.webkitGetGamepads();
    }
    

    if (navigator.getGamepads) {
        var gp = navigator.getGamepads()[0];
        //gamepads = navigator.getGamepads();
        console.log(gp.mapping);
        var gamepads = [firefoxpad];
        gamepads[0].axes[0] = gp.axes[0];
        gamepads[0].axes[1] = gp.axes[1];
        gamepads[0].axes[2] = gp.axes[3];
        gamepads[0].axes[3] = gp.axes[4];

        gamepads[0].buttons[7] = Math.abs(gp.axes[2]);

    }

   

    if (gamepads.length > 0) {

        controllers[0] = gamepads[0];
    }



}

function updatePads() {
    
        scangamepads();
    
   
    var controller = controllers[0];
        
    //console.log(controller.buttons.toString());

        /*
    for (var i = 0; i < controller.axes.length; i++) {
        var a = axes[i];
        console.log("axis " + i + "  " + a);
    }
    */
    
}

function GamePadState() {

   
    this.axes=[0,0,0,0];
    this.buttons=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    this.id="";
    this.index = 0;
    this.timestamp = 0;
    

}

GamePadState.prototype.update = function () {


};


function KeyboardState() {

    var self = this;

    this.KEYSTATE = new Array(110);

    for (var i = 0; i < 100; i++) {

        this.KEYSTATE[i] = 0;

    }

    self.upkey = false;
    self.downkey = false;
    self.rightkey = false;
    self.changed = false;

    self.akey = false;
    self.skey = false;
    self.dkey = false;
    self.wkey = false;

    self.ikey = false;
    self.kkey = false;
    self.jkey = false;
    self.lkey = false;



}

KeyboardState.prototype.setkeydown = function (keynum) {



    if ((keynum < 30) || (keynum > 99)) {

    }
    else {


        if (this.KEYSTATE[keynum] == 0) {
            this.KEYSTATE[keynum] = 1;

        }

    }


};

KeyboardState.prototype.setkeyup = function (keynum) {

    if ((keynum < 30) || (keynum > 99)) {

    }
    else {


        this.KEYSTATE[keynum] = 0;


    }


};

KeyboardState.prototype.isKeyDown = function (keynum) {

    if (this.KEYSTATE[keynum] > 0) {

        return true;

    }

    return false;



}

function Random(min, max) {
    return Math.random() * (max - min) + min;
}


var testterrain;

var terrainVertexPositionBuffer;
var terrainVertexTextureCoordBuffer;
var terrainVertexNormalBuffer;
var terrainVertexIndexBuffer;

function terrainMesh(height, width) {
    this.heightvalues = [];
    this.vertexarray = [];
    this.vertexindex = [];
    this.vertexnormals = [];
    this.textureCoords = [];
    this.height = height;
    this.width = width;
    this.triwidth = 40;


}

terrainMesh.prototype.draw = function () {

    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexPositionBuffer);
    gl.vertexAttribPointer(terrainShaderProgram.vertexPositionAttribute, terrainVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexNormalBuffer);
    gl.vertexAttribPointer(terrainShaderProgram.vertexNormalAttribute, terrainVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexTextureCoordBuffer);
    gl.vertexAttribPointer(terrainShaderProgram.textureCoordAttribute, terrainVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, desertTexture);
    gl.uniform1i(terrainShaderProgram.samplerUniform, 0);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, terrainVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

};

terrainMesh.prototype.bindMesh = function () {
    terrainVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexPositionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexarray), gl.STATIC_DRAW);
    terrainVertexPositionBuffer.itemSize = 3;
    terrainVertexPositionBuffer.numItems = this.vertexarray.length / 3;

    terrainVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexNormalBuffer);


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexnormals), gl.STATIC_DRAW);
    terrainVertexNormalBuffer.itemSize = 3;
    terrainVertexNormalBuffer.numItems = this.vertexnormals.length / 3;

    terrainVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainVertexIndexBuffer);


    terrainVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), gl.STATIC_DRAW);
    terrainVertexTextureCoordBuffer.itemSize = 2;
    terrainVertexTextureCoordBuffer.numItems = this.textureCoords.length / 2;


    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vertexindex), gl.STATIC_DRAW);
    terrainVertexIndexBuffer.itemSize = 1;
    terrainVertexIndexBuffer.numItems = this.vertexindex.length;


};

terrainMesh.prototype.generateMesh = function () {

    var minheight = 2000;
    var maxheight = 0;
    var averageheight = 0;
    var tempheight = 0;

    var xvar;
    var yvar;


    for (var i = 0; i < this.width * this.height; i++) {


        xvar = (i % this.height) - .5 * this.height;
        yvar = Math.floor(i / this.width) - .5 * this.height;



        //this.vertexarray.push(2 * (i % this.height), -12 * Math.cos((i % this.height) / 12) * Math.cos(Math.floor(i / this.width) / 12) + 4 * Math.cos(((i % this.height) / 22)) + Random(0,2), 2 * (Math.floor(i / this.width)));


        this.vertexarray.push(this.triwidth * (i % this.height), ((-24 * Math.cos((i % this.height) / 2) * Math.cos(Math.floor(i / this.width) / 2) + 4 * Math.cos(((i % this.height) / 4)) + Random(0, 6))), this.triwidth * (Math.floor(i / this.width)));

        //this.vertexarray.push(2 * xvar, 6 * Math.cos((xvar / 12) * (yvar / 12)) * (xvar/12 * xvar/12 * yvar/12 * yvar/12) + Random(0,2), 2 * yvar);




    }

    for (var i = 0; i < this.width * this.height; i++) {

        tempheight = this.vertexarray[3 * i + 1];

        averageheight += tempheight;

        if (tempheight > maxheight) {

            maxheight = tempheight;
        }
        if (tempheight < minheight) {

            minheight = tempheight;
        }

    }

    var currentindex = 0;

    for (var i = 0; i < this.width - 1; i++) {
        for (var j = 0; j < this.height - 1; j++) {
            /*
            this.vertexindex.push(currentindex, currentindex + 1, currentindex + 2);
            this.vertexindex.push(currentindex, currentindex + 2, currentindex + 3);

       

            this.vertexarray.push(this.heightvalues[(j * this.width + i) * 3], this.heightvalues[(j * this.width + i) * 3 + 1], this.heightvalues[(j * this.width + i) * 3 + 2]);
            this.vertexarray.push(this.heightvalues[(j * this.width + i + 1) * 3], this.heightvalues[(j * this.width + i + 1) * 3 + 1], this.heightvalues[(j * this.width + i + 1) * 3 + 2]);
            this.vertexarray.push(this.heightvalues[((j + 1) * this.width + i + 1) * 3], this.heightvalues[((j + 1) * this.width + i + 1) * 3 + 1], this.heightvalues[((j + 1) * this.width + i + 1) * 3 + 2]);
            this.vertexarray.push(this.heightvalues[((j + 1) * this.width + i) * 3], this.heightvalues[((j + 1) * this.width + i) * 3 + 1], this.heightvalues[((j + 1) * this.width + i) * 3 + 2]);


            currentindex+=4;
            */

            this.vertexindex.push(j * this.width + i, j * this.width + i + 1, (j + 1) * this.width + i + 1);
            this.vertexindex.push(j * this.width + i, (j + 1) * this.width + i + 1, (j + 1) * this.width + i);



        }

    }


    for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {

            this.textureCoords[2 * (j * this.width + i)] = (i % 2);
            this.textureCoords[(2 * (j * this.width + i)) + 1] = (j % 2);

        }

    }


    var tempnormal;
    var AB;
    var AC;

    for (var i = 0; i < this.vertexarray.length; i++) {

        this.vertexnormals[i] = 0;

    }

    for (var i = 0; i < this.vertexindex.length; i += 3) {



        AB = [this.vertexarray[3 * this.vertexindex[i + 1]] - this.vertexarray[3 * this.vertexindex[i]], this.vertexarray[3 * this.vertexindex[i + 1] + 1] - this.vertexarray[3 * this.vertexindex[i] + 1], this.vertexarray[3 * this.vertexindex[i + 1] + 2] - this.vertexarray[3 * this.vertexindex[i] + 2]];

        BC = [this.vertexarray[3 * this.vertexindex[i + 2]] - this.vertexarray[3 * this.vertexindex[i]], this.vertexarray[3 * this.vertexindex[i + 2] + 1] - this.vertexarray[3 * this.vertexindex[i] + 1], this.vertexarray[3 * this.vertexindex[i + 2] + 2] - this.vertexarray[3 * this.vertexindex[i] + 2]];


        //tempnormal = crossProduct(AB, BC);
        tempnormal = normalise(crossProduct(AB, BC));


        this.vertexnormals[3 * this.vertexindex[i]] += tempnormal[0];
        this.vertexnormals[3 * this.vertexindex[i] + 1] += tempnormal[1];
        this.vertexnormals[3 * this.vertexindex[i] + 2] += tempnormal[2];

        this.vertexnormals[3 * this.vertexindex[i + 1]] += tempnormal[0];
        this.vertexnormals[3 * this.vertexindex[i + 1] + 1] += tempnormal[1];
        this.vertexnormals[3 * this.vertexindex[i + 1] + 2] += tempnormal[2];

        this.vertexnormals[3 * this.vertexindex[i + 2]] += tempnormal[0];
        this.vertexnormals[3 * this.vertexindex[i + 2] + 1] += tempnormal[1];
        this.vertexnormals[3 * this.vertexindex[i + 2] + 2] += tempnormal[2];





    }
    //console.log(this.vertexnormals[555 * 3] + ",  " + this.vertexnormals[555 * 3+1] + ",  " + this.vertexnormals[555 * 3+2]);
    console.log("normal length: " + this.vertexnormals.length / 3 + ", vertex length: " + this.vertexarray.length / 3 + ", index length : " + this.vertexindex.length / 3 + ", terrain : " + this.textureCoords.length / 2);

    console.log("average height: " + averageheight + ", min height: " + minheight + ", max height: " + maxheight);



    for (var i = 0; i < this.vertexarray.length - 2; i += 3) {

        tempnormal = normalise([this.vertexnormals[i], this.vertexnormals[i + 1], this.vertexnormals[i + 2]]);

        this.vertexnormals[i] = tempnormal[0];
        this.vertexnormals[i + 1] = tempnormal[1];
        this.vertexnormals[i + 2] = tempnormal[2];

        //console.log(this.vertexnormals[i] + "   " + this.vertexnormals[i+1] + "   " + this.vertexnormals[i+2]);
    }


};

function crossProduct(A, B) {

    var temp = [A[1] * B[2] - A[2] * B[1], A[0] * B[2] - A[2] * B[0], A[0] * B[1] - A[1] * B[0]];

    return temp;


}

function normalise(A) {

    var temp = Math.sqrt(A[0] * A[0] + A[1] * A[1] + A[2] * A[2]);

    temp = 1 / temp;

    var g = [A[0] * temp, A[1] * temp, A[2] * temp];

    return g;

}

var modelSystem = new ModelSystem();

function ModelSystem() {

    this.modelarray = {};

}



ModelSystem.prototype.add = function (mesh, filename) {



    this.modelarray[filename] = mesh;

};

ModelSystem.prototype.createInstance = function (filename, entity) {

    if (this.modelarray[filename] != null) {

        //var instance = new Model(this.modelarray[filename], entity);
        this.modelarray[filename].addInstance(entity);

        //return instance;
    }

};

ModelSystem.prototype.drawAll = function () {

    for (models in this.modelarray) {
        


        this.modelarray[models].drawInstances();

    }

};

function Model(mesh) {

    this.mesh = mesh;
    this.matrix = mat4.create();
    this.entity = entity;


}


function loadFile(mesh, filename) {


    modelSystem.add(mesh, filename);
    var filedata;

    var modelfile = "models/" + filename;

    jQuery.get(modelfile, function (data) {



        mesh.buildmesh(data);
        mesh.bindbuffers();
        

    }, 'text');


}



function Mesh() {

    var self = this;

    this.vertices = [];
    this.normals = [];
    this.uvs = [];

    this.instances = [];

    this.meshvertbuffer;
    this.normalbuffer;
    this.uvbuffer;

    this.ready = false;
}

Mesh.prototype.addInstance = function (Model) {

    this.instances.push(Model);

};

Mesh.prototype.buildmesh = function (data) {



    var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
    var face_pattern = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/;

    var vertices = [];
    var verticesCount = 0;
    var normals = [];
    var uvs = [];
    var smoothnormals = [];

    var tempnorm;

    var numvertex = 0;
    var numnorm = 0;
    var numuv = 0;
    var numface = 0;

    var lines = data.split('\n');

    for (var i = 0; i < lines.length; i++) {

        var line = lines[i];
        line = line.trim();
        var result;

        if (line.length === 0 || line.charAt(0) === '#') {

            continue;
        }
        else if ((result = vertex_pattern.exec(line)) !== null) {
            vertices.push(4 * parseFloat(result[1]), 4 * parseFloat(result[2]) - 2, 4 * parseFloat(result[3]));

        }
        else if ((result = normal_pattern.exec(line)) !== null) {
            normals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));

        }
        else if ((result = uv_pattern.exec(line)) !== null) {

            uvs.push(parseFloat(result[1]), parseFloat(result[2]));

        }
        else if ((result = face_pattern.exec(line)) !== null) {

            if (smoothnormals.length < 2) {
                for (var i = 0; i < vertices.length; i++) {

                    smoothnormals[i] = 0;

                }

            }

            this.vertices.push(vertices[3 * (parseInt(result[2]) - 1)], vertices[3 * (parseInt(result[2]) - 1) + 1], vertices[3 * (parseInt(result[2]) - 1) + 2],

                vertices[3 * (result[6] - 1)], vertices[3 * (result[6] - 1) + 1], vertices[3 * (result[6] - 1) + 2],

                vertices[3 * (result[10] - 1)], vertices[3 * (result[10] - 1) + 1], vertices[3 * (result[10] - 1) + 2]);


            this.uvs.push(uvs[2 * (result[3] - 1)], uvs[2 * (result[3] - 1) + 1],
                uvs[2 * (result[7] - 1)], uvs[2 * (result[7] - 1) + 1],
                uvs[2 * (result[11] - 1)], uvs[2 * (result[11] - 1) + 1]);


            smoothnormals[3 * (parseInt(result[2]) - 1)] += normals[3 * (result[4] - 1)];
            smoothnormals[3 * (parseInt(result[2]) - 1) + 1] += normals[3 * (result[4] - 1) + 1];
            smoothnormals[3 * (parseInt(result[2]) - 1) + 2] += normals[3 * (result[4] - 1) + 2];

            smoothnormals[3 * (result[6] - 1)] += normals[3 * (result[8] - 1)];
            smoothnormals[3 * (result[6] - 1) + 1] += normals[3 * (result[8] - 1) + 1];
            smoothnormals[3 * (result[6] - 1) + 2] += normals[3 * (result[8] - 1) + 2];

            smoothnormals[3 * (result[10] - 1)] += normals[3 * (result[12] - 1)];
            smoothnormals[3 * (result[10] - 1) + 1] += normals[3 * (result[12] - 1) + 1];
            smoothnormals[3 * (result[10] - 1) + 2] += normals[3 * (result[12] - 1) + 2];

            /*

            this.normals.push(normals[3 * (result[4] - 1)], normals[3 * (result[4] - 1) + 1], normals[3 * (result[4] - 1) + 2],
                normals[3 * (result[8] - 1)], normals[3 * (result[8] - 1) + 1], normals[3 * (result[8] - 1) + 2],
                normals[3 * (result[12] - 1)], normals[3 * (result[12] - 1) + 1], normals[3 * (result[12] - 1) + 2]);
                */

            this.normals.push(3 * (parseInt(result[2]) - 1), 3 * (parseInt(result[2]) - 1) + 1, 3 * (parseInt(result[2]) - 1) + 2,
                3 * (result[6] - 1), 3 * (result[6] - 1) + 1, 3 * (result[6] - 1) + 2,
                3 * (result[10] - 1), 3 * (result[10] - 1) + 1, 3 * (result[10] - 1) + 2);





        }

    }

    var tempnormal;

    for (var i = 0; i < smoothnormals.length - 2; i += 3) {

        tempnormal = normalise([smoothnormals[i], smoothnormals[i + 1], smoothnormals[i + 2]]);

        smoothnormals[i] = tempnormal[0];
        smoothnormals[i + 1] = tempnormal[1];
        smoothnormals[i + 2] = tempnormal[2];

        //console.log(this.vertexnormals[i] + "   " + this.vertexnormals[i+1] + "   " + this.vertexnormals[i+2]);
    }

    for (var i = 0; i < this.normals.length; i++) {

        this.normals[i] = smoothnormals[this.normals[i]];

    }


};

Mesh.prototype.bindbuffers = function () {

    console.log("vert length : " + this.vertices.length);

    this.meshvertbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshvertbuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    this.meshvertbuffer.itemSize = 3;
    this.meshvertbuffer.numItems = this.vertices.length / 3;




    this.normalbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
    this.normalbuffer.itemSize = 3;
    this.normalbuffer.numItems = this.normals.length / 3;



    this.uvbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvbuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
    this.uvbuffer.itemSize = 2;
    this.uvbuffer.numItems = this.uvs.length / 2;


    this.ready = true;



};

Mesh.prototype.draw = function () {

    if (this.ready) {



        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshvertbuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.meshvertbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.normalbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvbuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.uvbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, crateTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);



        

        gl.drawArrays(gl.TRIANGLES, 0, Math.floor(this.vertices.length / 3 + .5));

        


        



        /*

        gl.bindBuffer(gl.ARRAY_BUFFER, meshvertbuffer);
        gl.vertexAttribPointer(terrainShaderProgram.vertexPositionAttribute, meshvertbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.vertexAttribPointer(terrainShaderProgram.vertexNormalAttribute, this.normalbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvbuffer);
        gl.vertexAttribPointer(terrainShaderProgram.textureCoordAttribute, this.uvbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, crateTexture);
        gl.uniform1i(terrainShaderProgram.samplerUniform, 0);

        gl.drawArrays(gl.TRIANGLES, 0, Math.floor(this.vertices.length / 3 + .5));

        */

    }
};

Mesh.prototype.drawInstances = function () {

    

    if (this.ready) {
        


        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshvertbuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.meshvertbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.normalbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvbuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.uvbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, crateTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);



        for (var instance in this.instances) {

            console.log("222WTSDGSDGSD");

            mvPushMatrix();



            var mvm = mat4.create();


            mvm = this.instances[instance].updateMatrix();

            //mat4.transpose(mvm, mvm);

            mat4.multiply(mvMatrix, mvMatrix, mvm);







            setMatrixUniforms();

            gl.drawArrays(gl.TRIANGLES, 0, Math.floor(this.vertices.length / 3 + .5));

            mvPopMatrix();

        }






        /*

        gl.bindBuffer(gl.ARRAY_BUFFER, meshvertbuffer);
        gl.vertexAttribPointer(terrainShaderProgram.vertexPositionAttribute, meshvertbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.vertexAttribPointer(terrainShaderProgram.vertexNormalAttribute, this.normalbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvbuffer);
        gl.vertexAttribPointer(terrainShaderProgram.textureCoordAttribute, this.uvbuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, crateTexture);
        gl.uniform1i(terrainShaderProgram.samplerUniform, 0);

        gl.drawArrays(gl.TRIANGLES, 0, Math.floor(this.vertices.length / 3 + .5));

        */

    }
};


var testmesh;
var testEntity;
var testEntitytwo;

var polytrail;
var polytrail2;

function polyTrail() {

    this.ready = false;
    this.meshvertbuffer;
    this.previousvertbuffer;
    this.nextvertbuffer;

    this.vertices = [];
    this.previousvertices = [];
    this.nextvertices = [];

    this.vertindex = 0;
    this.previndex = 0;
    this.nextindex = 0;

    this.length = 0;
    this.next = 1;
    this.previousposition;

    this.lastupdate = 0;


}

polyTrail.prototype.addNode = function (offset) {

    if (this.lastupdate > 1) {

        this.lastupdate = 0;
        //this.vertices.push(mycamerapos.x, mycamerapos.y, mycamerapos.z, this.next);



        mycamerapos.x = testEntity.position[0];
        mycamerapos.y = testEntity.position[1];

        mycamerapos.z = testEntity.position[2];

        right[0] = testEntity.orientation[0];
        up[0] = testEntity.orientation[1];
        front[0] = testEntity.orientation[2];

        this.vertices[4 * this.length] = mycamerapos.x + right[0] * offset;
        this.vertices[4 * this.length + 1] = mycamerapos.y + up[0] * offset;
        this.vertices[4 * this.length + 2] = mycamerapos.z + front[0] * offset;
        this.vertices[4 * this.length + 3] = this.next;


        if (this.length > 0) {
            this.previousvertices[4 * (this.length - 1)] = mycamerapos.x + right[0] * offset;

            this.previousvertices[4 * (this.length - 1) + 1] = mycamerapos.y + up[0] * offset;

            this.previousvertices[4 * (this.length - 1) + 2] = mycamerapos.z + front[0] * offset;
            this.previousvertices[4 * (this.length - 1) + 3] = this.next;

        }

        this.nextvertices[4 * (this.length + 1)] = mycamerapos.x + right[0] * offset;

        this.nextvertices[4 * (this.length + 1) + 1] = mycamerapos.y + up[0] * offset;

        this.nextvertices[4 * (this.length + 1) + 2] = mycamerapos.z + front[0] * offset;
        this.nextvertices[4 * (this.length + 1) + 3] = this.next;


        this.next *= -1;
        //this.vertices.push(mycamerapos.x, mycamerapos.y, mycamerapos.z, this.next);
        //this.next *= -1;



        this.length++;

    }
    else {
        this.lastupdate++;
    }


};

polyTrail.prototype.bindbuffers = function () {

    var temparray = [];
    for (var i = 0; i < 40000; i++) {

        temparray[i] = 0.0;

    }

    this.meshvertbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshvertbuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(temparray), gl.DYNAMIC_DRAW);
    this.meshvertbuffer.itemSize = 4;
    this.meshvertbuffer.numitems = 10000;

    this.previousvertbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.previousvertbuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(temparray), gl.DYNAMIC_DRAW);
    this.previousvertbuffer.itemSize = 4;
    this.previousvertbuffer.numitems = 10000;


    this.nextvertbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nextvertbuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(temparray), gl.DYNAMIC_DRAW);
    this.nextvertbuffer.itemSize = 4;
    this.nextvertbuffer.numitems = 10000;

    this.nextvertices[0] = 0.0;
    this.nextvertices[1] = 0.0;
    this.nextvertices[2] = 0.0;
    this.nextvertices[3] = 0.0;
    this.nextvertices[4] = 0.0;
    this.nextvertices[5] = 0.0;
    this.nextvertices[6] = 0.0;
    this.nextvertices[7] = 0.0;

    this.ready = true;



};


polyTrail.prototype.draw = function () {

    if ((this.ready) && (this.length >= 6)) {


        gl.bindBuffer(gl.ARRAY_BUFFER, this.meshvertbuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.vertices));
        gl.vertexAttribPointer(polyShaderProgram.vertexPositionAttribute, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.previousvertbuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.previousvertices));
        gl.vertexAttribPointer(polyShaderProgram.previousVertexPositionAttribute, 4, gl.FLOAT, false, 0, 0);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.nextvertbuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.nextvertices));
        gl.vertexAttribPointer(polyShaderProgram.nextVertexPositionAttribute, 4, gl.FLOAT, false, 0, 0);

        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 1, this.length - 2);



    }
};

function bulletManager() {

    this.meshvertbuffer;
    this.bulletarray = [];

}

bulletManager.prototype.init = function () {


    var temparray = [];
    for (var i = 0; i < 16; i++) {

        temparray[i] = 0.0;

    }

    this.meshvertbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshvertbuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(temparray), gl.DYNAMIC_DRAW);
    this.meshvertbuffer.itemSize = 4;
    this.meshvertbuffer.numitems = 4;


};

bulletManager.prototype.draw = function () {

    setShader(laserShaderProgram);
    gl.enable(gl.BLEND);

    setMatrixUniforms();
    gl.uniform3f(
       currentShader.CameraPos,
       mycamerapos.x, mycamerapos.y + 200, mycamerapos.z
       //testEntity.position[0] - 35 * testEntity.velocitydirection[0] + 1 * testEntity.orientation[4], testEntity.position[1] - 35 * testEntity.velocitydirection[1] + 1 * testEntity.orientation[5], testEntity.position[2] - 35 * testEntity.velocitydirection[2] + 1 * testEntity.orientation[6]

   );




    for (var i = 0; i < this.bulletarray.length; i++) {
        this.bulletarray[i].update();
        this.bulletarray[i].draw(this.meshvertbuffer);

    }



    gl.disable(gl.BLEND);


};

bulletManager.prototype.addBullet = function (position, direction, speed) {

    this.bulletarray.push(new bullet(position, direction, speed));



};

function bullet(position, direction, speed) {




    this.position = vec3.fromValues(position[0], position[1], position[2]);
    this.previousposition = vec3.clone(this.position);


    this.direction = vec3.fromValues(-direction[0], -direction[1], -direction[2]);
    this.speed = speed;

    this.position[0] += this.direction[0] * this.speed * 1;
    this.position[1] += this.direction[1] * this.speed * 1;
    this.position[2] += this.direction[2] * this.speed * 1;


    this.vertexarray = mat4.create();

}

bullet.prototype.update = function () {


    /*
    this.position[0] += this.direction[0] * this.speed;
    this.position[1] += this.direction[1] * this.speed;
    this.position[2] += this.direction[2] * this.speed;
    */


    this.previousposition[0] += this.direction[0] * this.speed;
    this.previousposition[1] += this.direction[1] * this.speed;
    this.previousposition[2] += this.direction[2] * this.speed;


    this.position[0] += this.direction[0] * this.speed;
    this.position[1] += this.direction[1] * this.speed;
    this.position[2] += this.direction[2] * this.speed;


    var a = this.position;
    var b = this.previousposition;

    mat4.fromValues2(this.vertexarray, a[0], a[1], a[2], 1.0, a[0], a[1], a[2], -1.0, b[0], b[1], b[2], 1.0, b[0], b[1], b[2], -1.0);

    

};

bullet.prototype.draw = function (buffer) {



    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.vertexarray));
    gl.vertexAttribPointer(currentShader.vertexPositionAttribute, 4, gl.FLOAT, false, 0, 0);


    gl.uniform3f(currentShader.directionUniform, this.direction[0], this.direction[1], this.direction[2]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

};