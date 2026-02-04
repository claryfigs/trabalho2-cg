var teximg = [];
var texSrc = ["gato.jpg", "cachorro.png"];
var loadTexs = 0;
var gl;
var prog;

// Variáveis da Câmera Móvel
var camPos = [0, 0, 5];
var yaw = -90; 
var pitch = 0;
var camFront = [0, 0, -1];
var angle = 0;


window.addEventListener("mousedown", function() {
    document.getElementById("glcanvas1").requestPointerLock();
});

window.addEventListener("mousemove", function(e) {
    if (document.pointerLockElement === document.getElementById("glcanvas1")) {
        var sensitivity = 0.2;
        yaw += e.movementX * sensitivity;
        pitch -= e.movementY * sensitivity;

        if (pitch > 89) pitch = 89;
        if (pitch < -89) pitch = -89;

        var radYaw = yaw * Math.PI / 180;
        var radPitch = pitch * Math.PI / 180;
        camFront[0] = Math.cos(radYaw) * Math.cos(radPitch);
        camFront[1] = Math.sin(radPitch);
        camFront[2] = Math.sin(radYaw) * Math.cos(radPitch);
    }
});

window.addEventListener("keydown", function(e) {
    var speed = 0.1;
    if(e.key == "w") {
        camPos[0] += camFront[0] * speed;
        camPos[1] += camFront[1] * speed;
        camPos[2] += camFront[2] * speed;
    }
    if(e.key == "s") {
        camPos[0] -= camFront[0] * speed;
        camPos[1] -= camFront[1] * speed;
        camPos[2] -= camFront[2] * speed;
    }
});

function createShader(gl, shaderType, shaderSrc) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    
    alert("Erro de compilação: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vtxShader, fragShader) {
    var prog = gl.createProgram();
    gl.attachShader(prog, vtxShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    if(gl.getProgramParameter(prog, gl.LINK_STATUS)) return prog;

    alert("Erro de linkagem: " + gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog); 
}


function init() {
    for(var i = 0; i < texSrc.length; i++) {
        teximg[i] = new Image();
        teximg[i].src = texSrc[i];
        teximg[i].onload = function() {
            loadTexs++;
            if(loadTexs == texSrc.length) {
                initGL();
                configScene();
                draw();
            }
        }
    }
}

function initGL() {
    var canvas = document.getElementById("glcanvas1");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if(!gl) return alert("WebGL erro");

    var vtxShSrc = document.getElementById("vertex-shader").text;
    var fragShSrc = document.getElementById("frag-shader").text;

    var vtxShader = createShader(gl, gl.VERTEX_SHADER, vtxShSrc);
    var fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShSrc);
    prog = createProgram(gl, vtxShader, fragShader);
    
    gl.useProgram(prog);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
}

function configScene() {
    var v = new Float32Array([
        // X, Y, Z,  NX, NY, NZ,  U, V
        -0.5, -0.5,  0.5,  0,0,1,  0,1,   0.5, -0.5,  0.5,  0,0,1,  1,1,   0.5,  0.5,  0.5,  0,0,1,  1,0,
        -0.5, -0.5,  0.5,  0,0,1,  0,1,   0.5,  0.5,  0.5,  0,0,1,  1,0,  -0.5,  0.5,  0.5,  0,0,1,  0,0,
        -0.5, -0.5, -0.5,  0,0,-1, 0,1,   0.5,  0.5, -0.5,  0,0,-1, 1,0,   0.5, -0.5, -0.5,  0,0,-1, 1,1,
        -0.5, -0.5, -0.5,  0,0,-1, 0,1,  -0.5,  0.5, -0.5,  0,0,-1, 0,0,   0.5,  0.5, -0.5,  0,0,-1, 1,0,
        -0.5,  0.5, -0.5,  0,1,0,  0,1,  -0.5,  0.5,  0.5,  0,1,0,  0,0,   0.5,  0.5,  0.5,  0,1,0,  1,0,
        -0.5,  0.5, -0.5,  0,1,0,  0,1,   0.5,  0.5,  0.5,  0,1,0,  1,0,   0.5,  0.5, -0.5,  0,1,0,  1,1,
        -0.5, -0.5, -0.5,  0,-1,0, 0,1,   0.5, -0.5,  0.5,  0,-1,0, 1,0,  -0.5, -0.5,  0.5,  0,-1,0, 0,0,
        -0.5, -0.5, -0.5,  0,-1,0, 0,1,   0.5, -0.5, -0.5,  0,-1,0, 1,1,   0.5, -0.5,  0.5,  0,-1,0, 1,0,
         0.5, -0.5, -0.5,  1,0,0,  0,1,   0.5,  0.5, -0.5,  1,0,0,  0,0,   0.5,  0.5,  0.5,  1,0,0,  1,0,
         0.5, -0.5, -0.5,  1,0,0,  0,1,   0.5,  0.5,  0.5,  1,0,0,  1,0,   0.5, -0.5,  0.5,  1,0,0,  1,1,
        -0.5, -0.5, -0.5, -1,0,0,  0,1,  -0.5, -0.5,  0.5, -1,0,0,  1,1,  -0.5,  0.5,  0.5, -1,0,0,  1,0,
        -0.5, -0.5, -0.5, -1,0,0,  0,1,  -0.5,  0.5,  0.5, -1,0,0,  1,0,  -0.5,  0.5, -0.5, -1,0,0,  0,0
    ]);

    var bufPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPtr);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);

    var stride = 8 * 4;
    var posPtr = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posPtr);
    gl.vertexAttribPointer(posPtr, 3, gl.FLOAT, false, stride, 0);

    var normPtr = gl.getAttribLocation(prog, "normal");
    gl.enableVertexAttribArray(normPtr);
    gl.vertexAttribPointer(normPtr, 3, gl.FLOAT, false, stride, 3 * 4);

    var texCPtr = gl.getAttribLocation(prog, "texCoord");
    gl.enableVertexAttribArray(texCPtr);
    gl.vertexAttribPointer(texCPtr, 2, gl.FLOAT, false, stride, 6 * 4);

    setupTex(0, teximg[0]);
    setupTex(1, teximg[1]);
}

function setupTex(id, img) {
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + id);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var target = [camPos[0] + camFront[0], camPos[1] + camFront[1], camPos[2] + camFront[2]];
    var mView = m4LookAt(camPos, target, [0, 1, 0]);
    var mModel = m4ComputeModelMatrix([0, 0, 0], angle, angle * 0.5, 0, [1, 1, 1]);
    
    var matFinal = m4Multiply(m4Multiply(mProj, mView), mModel);

    gl.uniformMatrix4fv(gl.getUniformLocation(prog, "transf"), false, matFinal);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, "u_model"), false, mModel);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [0.0, 5.0, 5.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), camPos);
    gl.uniform1f(gl.getUniformLocation(prog, "u_useTexture"), 1.0);

    var texPtr = gl.getUniformLocation(prog, "tex");
    for(var i = 0; i < 6; i++) {
        gl.uniform1i(texPtr, i % 2);
        gl.drawArrays(gl.TRIANGLES, i * 6, 6);
    }

    angle++;
    requestAnimationFrame(draw);
}