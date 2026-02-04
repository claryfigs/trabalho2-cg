var teximg = [];
var texSrc = ["gato.jpg", "cachorro.png"];
var loadTexs = 0;
var gl;
var prog;
var camPos = [0, 0, 15];
var angle = 0;

var dadosParedes = null;
var dadosRato = null;
var bufParedes, bufRato;

window.addEventListener("keydown", function(e) {
    var speed = 0.5;
    if(e.key == "w") camPos[2] -= speed;
    if(e.key == "s") camPos[2] += speed;
    if(e.key == "a") camPos[0] -= speed;
    if(e.key == "d") camPos[0] += speed;
});

async function init() {
    try {
        dadosParedes = await carregarOBJ("paredes.obj");
        dadosRato = await carregarOBJ("rato.obj");

        for(let i = 0; i < texSrc.length; i++) {
            teximg[i] = new Image();
            teximg[i].src = texSrc[i];
            teximg[i].onload = function() {
                loadTexs++;
                verificarCarga();

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
    } catch (e) {
        console.error("Erro no carregamento:", e);
    }
}

function verificarCarga() {
    if(loadTexs == texSrc.length && dadosParedes && dadosRato) {
        initGL();
        configScene();
        draw();
    }
}

function initGL() {
    var canvas = document.getElementById("glcanvas1");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    
    var vtxShader = createShader(gl, gl.VERTEX_SHADER, document.getElementById("vertex-shader").text);
    var fragShader = createShader(gl, gl.FRAGMENT_SHADER, document.getElementById("frag-shader").text);
    prog = createProgram(gl, vtxShader, fragShader);    
    
    gl.useProgram(prog);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.enable(gl.DEPTH_TEST);
    
    // CORREÇÃO: Inverte o Y da textura para não ficar de cabeça para baixo
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

function configScene() {
    bufParedes = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufParedes);
    gl.bufferData(gl.ARRAY_BUFFER, dadosParedes, gl.STATIC_DRAW);

    bufRato = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRato);
    gl.bufferData(gl.ARRAY_BUFFER, dadosRato, gl.STATIC_DRAW);

    function setupTex(id, img) {
        var tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + id); 
        gl.bindTexture(gl.TEXTURE_2D, tex);
        
        // CORREÇÃO: Parâmetros para imagens de qualquer tamanho (NPOT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
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

function bindGeometria(buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    var stride = 8 * 4; // x,y,z, nx,ny,nz, u,v
    var locPos = gl.getAttribLocation(prog, "position");
    var locNorm = gl.getAttribLocation(prog, "normal");
    var locTex = gl.getAttribLocation(prog, "texCoord");

    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, stride, 0);
    
    gl.enableVertexAttribArray(locNorm);
    gl.vertexAttribPointer(locNorm, 3, gl.FLOAT, false, stride, 3 * 4);
    
    gl.enableVertexAttribArray(locTex);
    gl.vertexAttribPointer(locTex, 2, gl.FLOAT, false, stride, 6 * 4);
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
    var mView = m4LookAt(camPos, [0, 0, 0], [0, 1, 0]);
    var mVP = m4Multiply(mProj, mView);

    var uTransf = gl.getUniformLocation(prog, "transf");
    var uModel = gl.getUniformLocation(prog, "u_model");
    var uTex = gl.getUniformLocation(prog, "tex");
    var uUseTex = gl.getUniformLocation(prog, "u_useTexture");
    var uLightPos = gl.getUniformLocation(prog, "u_lightPos");
    var uViewPos = gl.getUniformLocation(prog, "u_viewPos");

    gl.uniform3fv(uLightPos, [5.0, 5.0, 5.0]);
    gl.uniform3fv(uViewPos, camPos);

    // --- DESENHANDO PAREDES ---
    gl.uniform1f(uUseTex, 1.0); 
    var mModelP = m4ComputeModelMatrix([0, 0, 0], 0, 0, 0, [1, 1, 1]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelP));
    gl.uniformMatrix4fv(uModel, false, mModelP);
    
    bindGeometria(bufParedes);
    gl.uniform1i(uTex, 0); // Usa a TEXTURE0 (gato), se colocar 1 vira a imagem do cachorro
    gl.drawArrays(gl.TRIANGLES, 0, dadosParedes.length / 8);

    // --- DESENHANDO RATO ---
    gl.uniform1f(uUseTex, 0.0); // Sem textura para o rato
    var mModelR = m4ComputeModelMatrix([10, 0, 0], 0, angle, 0, [0.05, 0.05, 0.05]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelR));
    gl.uniformMatrix4fv(uModel, false, mModelR);
    
    bindGeometria(bufRato);
    gl.drawArrays(gl.TRIANGLES, 0, dadosRato.length / 8);
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

    angle += 1; 
    requestAnimationFrame(draw);
}

function createShader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
    }
    return s;
}

function createProgram(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.linkProgram(p);
    return p;
}