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


var shaderProgram;
var terrainShaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    var terrainfs = getShader(gl, "terrain-fs");
    var terrainvs = getShader(gl, "terrain-vs");

    shaderProgram = gl.createProgram();
    terrainShaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    gl.attachShader(terrainShaderProgram, terrainvs);
    gl.attachShader(terrainShaderProgram, terrainfs);

    gl.linkProgram(shaderProgram);
    gl.linkProgram(terrainShaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    //gl.useProgram(shaderProgram);
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
    mat4.set(mvMatrix, copy);
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
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(currentShader.nMatrixUniform, false, normalMatrix);
}




function degToRad(degrees) {
    return degrees * Math.PI / 180;
}





var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexNormalBuffer;
var cubeVertexIndexBuffer;

function initBuffers() {
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




var right = vec3.create([1, 0, 0]);
var up = vec3.create([0, 1, 0]);
var front = vec3.create([0, 0, 1]);

function rotateXInDegrees(rot){

    var temp = mat4.create();

    mat4.identity(temp);

    mat4.rotate(temp, rot, [1,0,0]);

    right = mat4.multiplyVec3(temp, right);
    up = mat4.multiplyVec3(temp, up);
    front = mat4.multiplyVec3(temp, front);
    
    //vec3.normalize(right);
    //vec3.normalize(up);
    //vec3.normalize(front);
}

function rotateYInDegrees(rot) {

    var temp = mat4.create();

    mat4.identity(temp);

    mat4.rotate(temp, rot, [0, 1, 0]);

    right = mat4.multiplyVec3(temp, right);
    up = mat4.multiplyVec3(temp, up);
    front = mat4.multiplyVec3(temp, front);

    //vec3.normalize(right);
    //vec3.normalize(up);
    //vec3.normalize(front);
}

function rotateZInDegrees(rot) {

    var temp = mat4.create();

    mat4.identity(temp);

    mat4.rotate(temp, rot, [0, 0, 1]);

    right = mat4.multiplyVec3(temp, right);
    up = mat4.multiplyVec3(temp, up);
    front = mat4.multiplyVec3(temp, front);

    //vec3.normalize(right);
    //vec3.normalize(up);
    //vec3.normalize(front);
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(.4, .4, .4, 0.2);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 500.0, pMatrix);

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

   // mat4.rotate(mvMatrix, 0, [1, 0, 0]);
    //mat4.rotate(mvMatrix, -3.7, [0, 1, 0]);
    //mat4.rotate(mvMatrix, -0, [0, 0, 1]);

    
    /*
     mat4.rotate(mvMatrix, -mycamerarot.x, [1, 0, 0]);
    mat4.rotate(mvMatrix, -mycamerarot.y, [0, 1, 0]);
    mat4.rotate(mvMatrix, -mycamerarot.z, [0, 0, 1]);
    */
    //mat4.translate(mvMatrix, [-mycamerapos.x, -mycamerapos.y, -mycamerapos.z]);
    //mat4.translate(mvMatrix, [0, -24, 0]);
    


    var mvm2 = mat4.create([right[0], right[1], right[2], mycamerapos.x + 30 * right[2],
                  up[0], up[1], up[2], mycamerapos.y + 30 * up[2],
                  front[0], front[1], front[2], mycamerapos.z + 30 * front[2] ,
                 0, 0, 0, 1]);

    mat4.transpose(mvm2, mvm2);


    mat4.invert(mvm2, mvm2);

    mat4.multiply(mvMatrix, mvMatrix, mvm2);


    var eyematrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, eyematrix);
    mat3.transpose(eyematrix);
   

    gl.uniformMatrix3fv(currentShader.eyeMatrixUniform, false, eyematrix);
    
    

    
    
    
  
    

                mvPushMatrix();

    
               

                //mat4.translate(mvMatrix, [mycamerapos.x - Math.cos(1.57 - mycamerarot.y) * 30, mycamerapos.y  + Math.cos(1.57 - mycamerarot.x) * 30, mycamerapos.z - Math.sin(1.57 - mycamerarot.y) * 30]);
             
                //mat4.translate(mvMatrix, [mycamerapos.x - Math.cos(1.57 - 3.7) * 30, mycamerapos.y + Math.cos(1.57 - 0) * 30, mycamerapos.z - Math.sin(1.57 - 3.7) * 30]);

               
                
                //var q3 = quat4.create([0, 0, 1, mycamerarot.z]);
                
                //var q2 = quat4.create([1, 0, 0, mycamerarot.x]);
                //var q1 = quat4.create([0, 1, 0, mycamerarot.y]);
               
                
                
                //quat4.multiply(q1, q2);
                //quat4.multiply(q1, q3);

                //var matrixq = quat4.toMat4(q1);

    //mat4.multiply(mvMatrix, matrixq);

                var rotx = mat4.create();
    
                rotx[0] = 1;
                rotx[1] = 0;
                rotx[2] = 0;
                rotx[3] = 0;
                rotx[4] = 0;
                rotx[5] = Math.cos(mycamerarot.x);
                rotx[6] = -Math.sin(mycamerarot.x);
                rotx[7] = 0;
                rotx[8] = 0;
                rotx[9] = Math.sin(mycamerarot.x);
                rotx[10] = Math.cos(mycamerarot.x);
                rotx[11] = 0;
                rotx[12] = 0;
                rotx[13] = 0;
                rotx[14] = 0;
                rotx[15] = 1;

                var roty = mat4.create();

                roty[0] = Math.cos(mycamerarot.y);
                roty[1] = 0;
                roty[2] = -Math.sin(mycamerarot.y);
                roty[3] = 0;
                roty[4] = 0;
                roty[5] = 1;
                roty[6] = 0;
                roty[7] = 0;
                roty[8] = Math.sin(mycamerarot.y);
                roty[9] = 0;
                roty[10] = Math.cos(mycamerarot.y);
                roty[11] = 0;
                roty[12] = 0;
                roty[13] = 0;
                roty[14] = 0;
                roty[15] = 1;


                var rotz = mat4.create();

                rotz[0] = Math.cos(mycamerarot.z);
                rotz[1] = -Math.sin(mycamerarot.z);
                rotz[2] = 0;
                rotz[3] = 0;
                rotz[4] = Math.sin(mycamerarot.z);
                rotz[5] = Math.cos(mycamerarot.z);
                rotz[6] = 0;
                rotz[7] = 0;
                rotz[8] = 0;
                rotz[9] = 0;
                rotz[10] = 1;
                rotz[11] = 0;
                rotz[12] = 0;
                rotz[13] = 0;
                rotz[14] = 0;
                rotz[15] = 1;


                var cosy = Math.cos(mycamerarot.y);
                var siny = Math.sin(mycamerarot.y);
                var cosx = Math.cos(mycamerarot.x);
                var sinx = Math.sin(mycamerarot.x);
                var cosz = Math.cos(mycamerarot.z);
                var sinz = Math.sin(mycamerarot.z);
    //heading = y, att = z, bank = x


                var rota = mat4.create();
                rota[0] = cosy * cosz;
                rota[1] = cosy * sinz;
                rota[2] = -siny;
                rota[3] = 0;
                rota[4] = sinx * siny * cosz - cosx * sinz;
                rota[5] = sinx * siny * sinz + cosx * cosz;
                rota[6] = cosy * sinx;
                rota[7] = 0;
                rota[8] = cosx * siny * cosz + sinx * sinz;
                rota[9] = cosx * siny * sinz - sinx * cosz;
                rota[10] = cosy * cosx;
                rota[11] = 0;
                rota[12] = 0;
                rota[13] = 0;
                rota[14] = 0;
                rota[15] = 1;
    /*
                var rota = mat4.create();
                rota[0] = cosy * cosz;
                rota[1] = -cosy * sinz * cosx + siny * sinx;
                rota[2] = cosy * sinz * sinx + siny * cosx;
                rota[3] = 0;
                rota[4] = sinz;
                rota[5] = cosz * cosx;
                rota[6] = -cosz * sinx;
                rota[7] = 0;
                rota[8] = -siny * cosz;
                rota[9] = siny * sinz * cosx + cosy * sinx;
                rota[10] = -siny * sinz * sinx + cosy * cosx;
                rota[11] = 0;
                rota[12] = 0;
                rota[13] = 0;
                rota[14] = 0;
                rota[15] = 1;

                */

    /*                var rota = mat4.create();
                rota[0] = cosy * cosz;
                rota[1] = sinx * siny * cosz - cosx * sinz;
                rota[2] = cosx * siny * cosz + sinx * sinz;
                rota[3] = 0;
                rota[4] = cosy * sinz;
                rota[5] = sinx * siny * sinz + cosx * cosz;
                rota[6] = cosx * siny * sinz - sinx * cosz;
                rota[7] = 0;
                rota[8] = -siny;
                rota[9] = sinx * cosy;
                rota[10] = cosx * cosy;
                rota[11] = 0;
                rota[12] = 0;
                rota[13] = 0;
                rota[14] = 0;
                rota[15] = 1;
                */

                var yvar = vec3.create();
                yvar[0] = 0;
                yvar[1] = 1;
                yvar[2] = 0;



   
                
                //mat4.rotate(mvMatrix, mycamerarot.y - 3.14, [0, 1, 0]);
                
                var xvar = vec3.create();
                xvar[0] = 1;
                xvar[1] = 0;
                xvar[2] = 0;

                var zvar = vec3.create();
                zvar[0] = 0;
                zvar[1] = 0;
                zvar[2] = 1;

                
    //mat4.rotate(mvMatrix, mycamerarot.z, [0, 0, 1]);
                //mat4.translate(mvMatrix, [mycamerapos.x, mycamerapos.y, mycamerapos.z]);



                var mvm = mat4.create([right[0], right[1], -right[2], mycamerapos.x,
                    up[0], up[1], -up[2], mycamerapos.y,
                     front[0], front[1], -front[2], mycamerapos.z,
                    0, 0, 0, 1]);

                mat4.transpose(mvm, mvm);
               

                var position = vec3.create(mvMatrix[3], mvMatrix[7], mvMatrix[11]);

                mat4.multiply(mvMatrix, mvMatrix, mvm);

                //mvMatrix[3] = position[0];
                //mvMatrix[7] = position[1];
                //mvMatrix[11] = position[2];
                
              //mvMatrix
                /*
                mat4.rotate(mvMatrix, -mycamerarot.x, [1, 0, 0]);
               
                mat4.rotate(mvMatrix, mycamerarot.y - 3.14, [0, 1, 0]);
                mat4.rotate(mvMatrix, mycamerarot.z, [zvar[0], zvar[1], zvar[2]]);
                */
                console.log(right[0] + "   " + right[1] + "   " + right[2]  + "   " + up[0] + "   " + up[1] + "   " + up[2]  + "   " +  front[0] + "   " + front[1] + "   " + front[2]);
                

    /*  mat4.rotate(mvMatrix, mycamerarot.y - 3.14, [yvar[0], yvar[1], yvar[2]]);
                mat4.rotate(mvMatrix, mycamerarot.z, [zvar[0], zvar[1], zvar[2]]);
                mat4.rotate(mvMatrix, -mycamerarot.x, [xvar[0], xvar[1], xvar[2]]);

                */
               
                
                
                //mat4.multiply(rotx, roty);

                //mat4.multiply(rotx, rotz);

                
//mat4.multiply(mvMatrix, rotx);

                
                


                /*
                gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
                gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, crateTexture);
                gl.uniform1i(shaderProgram.samplerUniform, 0);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
                setMatrixUniforms();
                gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
                */

                
                


                setMatrixUniforms();
                
                testmesh.draw();

                mvPopMatrix();

    
    

    

    //gl.useProgram(terrainShaderProgram);
    setShader(terrainShaderProgram);

    mvPushMatrix();
    




  

    testterrain.draw();

    mvPopMatrix();


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


function tick() {
    requestAnimFrame(tick);
    drawScene();
    moveCamera(mycamerapos, mycamerarot, mykeyboard);

    //animate();
}


function webGLStart() {
    var canvas = document.getElementById("pscanvas");
    mykeyboard = new KeyboardState();

    initGL(canvas);


    testmesh = new Mesh();

    //loadFile(testmesh);

    loadFile();

    testterrain = new terrainMesh(128, 128);
    testterrain.generateMesh();
    testterrain.bindMesh();



    initShaders();

    initBuffers();
    initTextures();

  

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);


    $(document).keyup(function (e) {

        mykeyboard.setkeyup(e.which);

    });



    $(document).keydown(function (e) {

        mykeyboard.setkeydown(e.which);

        var keyid = e.which;


    });



    tick();
}

var mykeyboard;


var mycamerapos = { x: 0, y: 24, z: 0 };


var mycamerarot = { x: Math.PI, y: Math.PI / 2, z: Math.PI/2 };


function moveCamera(CameraPos, CameraRot, keyboard) {


    var stepsize = 1;
   

    newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);

    


    if (keyboard.isKeyDown(65)) {

       // CameraPos.z += stepsize * Math.sin(3.14 - CameraRot.y);
        //CameraPos.x += stepsize * Math.cos(3.14 - CameraRot.y);



        rotateYInDegrees(-.02);
        //CameraRot.y += .02;
    }

    if (keyboard.isKeyDown(68)) {

        //CameraPos.z -= stepsize * Math.sin(3.14 - CameraRot.y);
        //CameraPos.x -= stepsize * Math.cos(3.14 - CameraRot.y);



        rotateYInDegrees(.02);
        //CameraRot.y -= .02;
    }

    if (keyboard.isKeyDown(83)) {

        CameraPos.x += stepsize * right[2];
        CameraPos.y += stepsize * up[2];
        CameraPos.z += stepsize * front[2];

        

    }

    if (keyboard.isKeyDown(87)) {

        //CameraPos.z -= stepsize * Math.sin(1.57 - CameraRot.y);
        //CameraPos.x -= stepsize * Math.cos(1.57 - CameraRot.y);

        CameraPos.x -= stepsize * right[2];
        CameraPos.y -= stepsize * up[2];
        CameraPos.z -= stepsize * front[2];



    }


    if (keyboard.isKeyDown(73)) {

        rotateXInDegrees(.02);
        //CameraRot.x += .02;
    }
    if (keyboard.isKeyDown(75)) {

        rotateXInDegrees(-.02);
        //CameraRot.x -= .02;
    }
    if (keyboard.isKeyDown(74)) {

        rotateZInDegrees(-.02);
        //CameraRot.z -= .02;

     
    }
    if (keyboard.isKeyDown(76)) {

        rotateZInDegrees(.02);
        //CameraRot.z += .02;
    
    }

    //console.log("xrot : " + CameraRot.x + "    yrot : " + CameraRot.y + "zrot : " + CameraRot.z);

}

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
    this.vertexarray =[];
    this.vertexindex =[];
    this.vertexnormals = [];
    this.textureCoords = [];
    this.height = height;
    this.width = width;
    this.triwidth = 5;
  

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
    terrainVertexPositionBuffer.numItems = this.vertexarray.length/3;

    terrainVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexNormalBuffer);


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexnormals), gl.STATIC_DRAW);
    terrainVertexNormalBuffer.itemSize = 3;
    terrainVertexNormalBuffer.numItems = this.vertexnormals.length/3;

    terrainVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainVertexIndexBuffer);


    terrainVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), gl.STATIC_DRAW);
    terrainVertexTextureCoordBuffer.itemSize = 2;
    terrainVertexTextureCoordBuffer.numItems = this.textureCoords.length/2;


    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.vertexindex), gl.STATIC_DRAW);
    terrainVertexIndexBuffer.itemSize = 1;
    terrainVertexIndexBuffer.numItems = this.vertexindex.length;


};

terrainMesh.prototype.generateMesh = function(){

    var minheight = 2000;
    var maxheight = 0;
    var averageheight = 0;
    var tempheight = 0;

    var xvar;
    var yvar;


    for (var i = 0; i < this.width * this.height; i++) {

  
        xvar = (i % this.height);
        yvar = Math.floor(i / this.width);



        //this.vertexarray.push(2 * (i % this.height), -12 * Math.cos((i % this.height) / 12) * Math.cos(Math.floor(i / this.width) / 12) + 4 * Math.cos(((i % this.height) / 22)) + Random(0,2), 2 * (Math.floor(i / this.width)));
       

        this.vertexarray.push(this.triwidth * (i % this.height), ((-24 * Math.cos((i % this.height) / 12) * Math.cos(Math.floor(i / this.width) / 12) + 4 * Math.cos(((i % this.height) / 22)) + Random(0, 2))), this.triwidth * (Math.floor(i / this.width)));

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

    for (var i = 0; i < this.width-1; i++) {
        for (var j = 0; j < this.height-1; j++) {
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

    for (var i = 0; i < this.vertexindex.length; i+=3) {

        

        AB = [this.vertexarray[3 * this.vertexindex[i + 1]] - this.vertexarray[3 * this.vertexindex[i]], this.vertexarray[3 * this.vertexindex[i + 1] + 1] - this.vertexarray[3 * this.vertexindex[i] + 1], this.vertexarray[3 * this.vertexindex[i + 1] + 2] - this.vertexarray[3 * this.vertexindex[i] + 2]];

        BC = [this.vertexarray[3 * this.vertexindex[i + 2]] - this.vertexarray[3 * this.vertexindex[i]], this.vertexarray[3 * this.vertexindex[i + 2] + 1] - this.vertexarray[3 * this.vertexindex[i] + 1], this.vertexarray[3 * this.vertexindex[i + 2] + 2] - this.vertexarray[3 * this.vertexindex[i] + 2]];

   
        //tempnormal = crossProduct(AB, BC);
        tempnormal = normalise(crossProduct(AB, BC));


        this.vertexnormals[3 * this.vertexindex[i]] += tempnormal[0];
        this.vertexnormals[3 * this.vertexindex[i]+1] += tempnormal[1];
        this.vertexnormals[3 * this.vertexindex[i] + 2] += tempnormal[2];

        this.vertexnormals[3 * this.vertexindex[i+1]] += tempnormal[0];
        this.vertexnormals[3 * this.vertexindex[i+1] + 1] += tempnormal[1];
        this.vertexnormals[3 * this.vertexindex[i+1] + 2] += tempnormal[2];

        this.vertexnormals[3 * this.vertexindex[i+2]] += tempnormal[0];
        this.vertexnormals[3 * this.vertexindex[i+2] + 1] += tempnormal[1];
        this.vertexnormals[3 * this.vertexindex[i+2] + 2] += tempnormal[2];



   

    }
    //console.log(this.vertexnormals[555 * 3] + ",  " + this.vertexnormals[555 * 3+1] + ",  " + this.vertexnormals[555 * 3+2]);
    console.log("normal length: " + this.vertexnormals.length/3 + ", vertex length: " + this.vertexarray.length/3 + ", index length : " + this.vertexindex.length/3 + ", terrain : " + this.textureCoords.length/2);

    console.log("average height: " + averageheight + ", min height: " + minheight + ", max height: " + maxheight);



    for (var i = 0; i < this.vertexarray.length-2; i+=3) {

        tempnormal = normalise([this.vertexnormals[i], this.vertexnormals[i + 1], this.vertexnormals[i + 2]]);

        this.vertexnormals[i] = tempnormal[0];
        this.vertexnormals[i+1] = tempnormal[1];
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



function loadFile() {

    var filedata;

    jQuery.get("models/bz111.obj", function (data) {


        filedata = data;
       // console.log(data)
    
        /*

        var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
        var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
        var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
        var face_pattern = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/;

        var vertices = [];
        var verticesCount = 0;
        var normals = [];
        var uvs = [];


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
                vertices.push(parseFloat(result[0]), parseFloat(result[1]), parseFloat(result[2]));

            }
            else if ((result = normal_pattern.exec(line)) !== null) {
                normals.push(parseFloat(result[0]), parseFloat(result[1]), parseFloat(result[2]));

            }
            else if ((result = uv_pattern.exec(line)) !== null) {
               
                uvs.push(parseFloat(result[1]), parseFloat(result[2]));

            }
            else if ((result = face_pattern.exec(line)) !== null) {
                
                mesh.vertices.push(vertices[3 * (result[2] - 1)], vertices[3 * (result[2] - 1) + 1], vertices[3 * (result[2] - 1) + 2],
             
                    vertices(3 * (result[6] - 1)), vertices(3 * (result[6] - 1) + 1), vertices(3 * (result[6] - 1) + 2),

                    vertices(3 * (result[10] - 1)), vertices(3 * (result[10] - 1) + 1), vertices(3 * (result[10] - 1) + 2));


                mesh.uvs.push(uvs[2 * (result[3] - 1)], uvs[2 * (result[3] - 1) + 1],
                    uvs[2 * (result[7] - 1)], uvs[2 * (result[7] - 1) + 1],
                    uvs[2 * (result[11] - 1)], uvs[2 * (result[11] - 1) + 1]);


                mesh.normals.push(normals[3 * (result[4] - 1)], normals[3 * (result[4] - 1) + 1], normals[3 * (result[4] - 1) + 2],
                    normals(3 * (result[8] - 1)), normals(3 * (result[8] - 1) + 1), normals(3 * (result[8] - 1) + 2),
                    normals(3 * (result[12] - 1)), normals(3 * (result[12] - 1) + 1), normals(3 * (result[12] - 1) + 2));

    



            }

        }

        //console.log(numvertex + "  " + numnorm + "   " + numuv + "  " + numface);
        */
        //console.log(filedata);

        //var filedata = loadFile();

        testmesh.buildmesh(filedata);
        testmesh.bindbuffers();

    }, 'text');

    
}

var meshvertbuffer;
var meshnormalbuffer;
var meshuvbuffer;

function Mesh() {

    var self = this;

    this.vertices = [];
    this.normals = [];
    this.uvs = [];


    
    this.verticesbuffer;
    this.normalbuffer;
    this.uvbuffer;

    this.ready = false;
}

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
            vertices.push(4*parseFloat(result[1]), 4*parseFloat(result[2])-2, 4*parseFloat(result[3]));

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
            smoothnormals[3 * (parseInt(result[2]) - 1) + 1] += normals[3 * (result[4] - 1)+1];
            smoothnormals[3 * (parseInt(result[2]) - 1) + 2] += normals[3 * (result[4] - 1)+2];

            smoothnormals[3 * (result[6] - 1)] += normals[3 * (result[8] - 1)];
            smoothnormals[3 * (result[6] - 1) + 1] += normals[3 * (result[8] - 1) + 1];
            smoothnormals[3 * (result[6] - 1) + 2] += normals[3 * (result[8] - 1) + 2];

            smoothnormals[3 * (result[10] - 1)] += normals[3 * (result[12] - 1)];
            smoothnormals[3 * (result[10] - 1) + 1] += normals[3 * (result[12] - 1)+1];
            smoothnormals[3 * (result[10] - 1) + 2] += normals[3 * (result[12] - 1)+2];

            /*

            this.normals.push(normals[3 * (result[4] - 1)], normals[3 * (result[4] - 1) + 1], normals[3 * (result[4] - 1) + 2],
                normals[3 * (result[8] - 1)], normals[3 * (result[8] - 1) + 1], normals[3 * (result[8] - 1) + 2],
                normals[3 * (result[12] - 1)], normals[3 * (result[12] - 1) + 1], normals[3 * (result[12] - 1) + 2]);
                */

            this.normals.push(3 * (parseInt(result[2]) - 1), 3 * (parseInt(result[2]) - 1)+1, 3 * (parseInt(result[2]) - 1)+2,
                3 * (result[6] - 1),3 * (result[6] - 1)+1,3 * (result[6] - 1)+2,
                3 * (result[10] - 1),3 * (result[10] - 1)+1,3 * (result[10] - 1)+2);





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
    
    meshvertbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, meshvertbuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    meshvertbuffer.itemSize = 3;
    meshvertbuffer.numItems = this.vertices.length / 3;

    


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

        

        



        gl.bindBuffer(gl.ARRAY_BUFFER, meshvertbuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, meshvertbuffer.itemSize, gl.FLOAT, false, 0, 0);

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


var testmesh; 

