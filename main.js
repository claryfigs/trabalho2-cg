var teximg = [];
var texSrc = ["gato.jpg", "cachorro.png"];
var loadTexs = 0;
var gl, prog;

// Seus métodos de Câmera 3D
var camPos = [0, 5, 15];
var yaw = -90; 
var pitch = 0;
var camFront = [0, 0, -1];
var angle = 0;

// Buffers para os modelos
var dadosParedes = null, dadosRato = null;
var bufParedes, bufRato, bufCubo;

// --- INPUTS (Seus métodos) ---
window.addEventListener("mousedown", () => document.getElementById("glcanvas1").requestPointerLock());

window.addEventListener("mousemove", (e) => {
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

window.addEventListener("keydown", (e) => {
    var speed = 0.5;
    if(e.key == "w") { camPos[0] += camFront[0] * speed; camPos[1] += camFront[1] * speed; camPos[2] += camFront[2] * speed; }
    if(e.key == "s") { camPos[0] -= camFront[0] * speed; camPos[1] -= camFront[1] * speed; camPos[2] -= camFront[2] * speed; }
});

// --- INICIALIZAÇÃO ---
async function init() {
    try {
        dadosParedes = await carregarOBJ("paredes.obj");
        dadosRato = await carregarOBJ("rato.obj");

        for(let i = 0; i < texSrc.length; i++) {
            teximg[i] = new Image();
            teximg[i].src = texSrc[i];
            teximg[i].onload = () => { loadTexs++; verificarCarga(); };
        }
    } catch (e) { console.error("Erro:", e); }
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
    
    prog = createProgram(gl, 
        createShader(gl, gl.VERTEX_SHADER, document.getElementById("vertex-shader").text),
        createShader(gl, gl.FRAGMENT_SHADER, document.getElementById("frag-shader").text)
    );    
    
    gl.useProgram(prog);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

function configScene() {
    // 1. Dados do seu Cubo Manual (36 vértices)
    var verticesCubo = new Float32Array([
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

    // Criando o Buffer do Cubo
    bufCubo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufCubo);
    gl.bufferData(gl.ARRAY_BUFFER, verticesCubo, gl.STATIC_DRAW);

    // 2. Buffers dos OBJs (Paredes e Rato)
    bufParedes = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufParedes);
    gl.bufferData(gl.ARRAY_BUFFER, dadosParedes, gl.STATIC_DRAW);

    bufRato = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRato);
    gl.bufferData(gl.ARRAY_BUFFER, dadosRato, gl.STATIC_DRAW);

    setupTex(0, teximg[0]);
    setupTex(1, teximg[1]);
}

function setupTex(id, img) {
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + id); 
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
}

// Método para ligar a geometria (Seu Stride de 8)
function bindGeometria(buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    var stride = 8 * 4;
    var locPos = gl.getAttribLocation(prog, "position");
    var locNorm = gl.getAttribLocation(prog, "normal");
    var locTex = gl.getAttribLocation(prog, "texCoord");

    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(locNorm);
    gl.vertexAttribPointer(locNorm, 3, gl.FLOAT, false, stride, 3 * 4);
    gl.enableVertexAttribArray(locTex);
    gl.vertexAttribPointer(locTex, 2, gl.FLOAT, false, stride, 6 * 4);
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var target = [camPos[0] + camFront[0], camPos[1] + camFront[1], camPos[2] + camFront[2]];
    var mView = m4LookAt(camPos, target, [0, 1, 0]);
    var mVP = m4Multiply(mProj, mView);

    // Uniforms
    var uTransf = gl.getUniformLocation(prog, "transf");
    var uModel = gl.getUniformLocation(prog, "u_model");
    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [5.0, 5.0, 10.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), camPos);

// --- 1. DESENHANDO O CUBO (Longe e Grande) ---
    // Posicionamos o cubo em Z = -20 (longe)
    gl.uniform1f(gl.getUniformLocation(prog, "u_useTexture"), 1.0); 
    var mModelCubo = m4ComputeModelMatrix([0, 0, -20], angle, angle * 0.5, 0, [5, 5, 5]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelCubo));
    gl.uniformMatrix4fv(uModel, false, mModelCubo);
    
    // Como o cubo não veio do OBJ, usamos o bind para o buffer do cubo
    bindGeometria(bufCubo); 
    gl.uniform1i(gl.getUniformLocation(prog, "tex"), 0); // Textura do gato
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // --- 2. DESENHANDO O RATO (Bem posicionado na frente) ---
    // Colocamos o rato em [0, -1, -5] (um pouco abaixo e na frente da câmera)
    gl.uniform1f(gl.getUniformLocation(prog, "u_useTexture"), 0.0); 
    var mModelRato = m4ComputeModelMatrix([0, -1, -5], 0, angle, 0, [0.08, 0.08, 0.08]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelRato));
    gl.uniformMatrix4fv(uModel, false, mModelRato);
    
    bindGeometria(bufRato);
    gl.drawArrays(gl.TRIANGLES, 0, dadosRato.length / 8);

    angle += 1; 
    requestAnimationFrame(draw);
}

function createShader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
}
function createProgram(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.linkProgram(p);
    return p;
}