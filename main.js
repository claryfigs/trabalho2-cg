var gl, prog;

// Variáveis de Câmera 3D
var camPos = [0, 5, 15];
var yaw = -90; 
var pitch = 0;
var camFront = [0, 0, -1];
var angle = 0;

// Dados dos Objetos e Buffers
var dadosRato, dadosPiso, dadosQueijo; // Adicionado dadosQueijo
var bufRato, bufPiso, bufQueijo;       // Adicionado bufQueijo
var texTijolo;

// --- ENTRADA DE DADOS ---
window.addEventListener("mousedown", () => {
    const canvas = document.getElementById("glcanvas1");
    if(canvas) canvas.requestPointerLock();
});

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
        // Carrega os arquivos OBJ
        dadosRato = await carregarOBJ("rato.obj");
        dadosPiso = await carregarOBJ("piso.obj");
        dadosQueijo = await carregarOBJ("queijo.obj"); // Carregando o queijo
        
        if (dadosRato && dadosPiso) {
            initGL();
            configScene();
            // Carrega a textura do Tijolo
            texTijolo = carregarTextura("Tijolo.jpg"); 
            draw();
        }
    } catch (e) { 
        console.error("Erro ao inicializar cena:", e); 
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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

function configScene() {
    // Buffer do Rato
    bufRato = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRato);
    gl.bufferData(gl.ARRAY_BUFFER, dadosRato, gl.STATIC_DRAW);

    // Buffer do Piso
    bufPiso = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPiso);
    gl.bufferData(gl.ARRAY_BUFFER, dadosPiso, gl.STATIC_DRAW);

    //Buffer do queijo
    bufQueijo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufQueijo);
    gl.bufferData(gl.ARRAY_BUFFER, dadosQueijo, gl.STATIC_DRAW);
}

function carregarTextura(url) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Cor temporária (azul) enquanto a imagem carrega
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    var img = new Image();
    img.crossOrigin = "anonymous"; // Vital para evitar que a textura fique preta por erro de segurança
    img.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

        // Ajuste para aceitar qualquer tamanho de imagem (NPOT)
        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    img.src = url;
    return tex;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

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

    var uTransf = gl.getUniformLocation(prog, "transf");
    var uModel = gl.getUniformLocation(prog, "u_model");
    var uUseTexture = gl.getUniformLocation(prog, "u_useTexture");
    
    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [5.0, 5.0, 10.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), camPos);

    // --- DESENHANDO O RATO (GIRANDO E SEM TEXTURA) ---
    gl.uniform1f(uUseTexture, 0.0); 
    var mModelRato = m4ComputeModelMatrix([0, 0, -5], 0, angle, 0, [0.08, 0.08, 0.08]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelRato));
    gl.uniformMatrix4fv(uModel, false, mModelRato);
    bindGeometria(bufRato);
    gl.drawArrays(gl.TRIANGLES, 0, dadosRato.length / 8);

    // --- DESENHANDO O PISO (ESTÁTICO E COM TEXTURA) ---
    gl.uniform1f(uUseTexture, 1.0); 
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texTijolo);
    gl.uniform1i(gl.getUniformLocation(prog, "u_sampler"), 0);

    var mModelPiso = m4ComputeModelMatrix([0, -1, -5], 0, 0, 0, [1.0, 1.0, 1.0]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelPiso));
    gl.uniformMatrix4fv(uModel, false, mModelPiso);
    bindGeometria(bufPiso);
    gl.drawArrays(gl.TRIANGLES, 0, dadosPiso.length / 8);

    // --- DESENHANDO O QUEIJO (GIRANDO) ---
    gl.uniform1f(uUseTexture, 0.0); // Sem textura, como o rato
    // Posicionado em [3, 0, -5] para ficar ao lado do rato
    var mModelQueijo = m4ComputeModelMatrix([3, 0, -5], 0, angle, 0, [1, 1, 1]); 
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelQueijo));
    gl.uniformMatrix4fv(uModel, false, mModelQueijo);
    bindGeometria(bufQueijo);
    gl.drawArrays(gl.TRIANGLES, 0, dadosQueijo.length / 8);

    // --- DESENHANDO O PISO ---
    // (seu código original do piso aqui)

    angle += 1; 
    requestAnimationFrame(draw);

}

// Funções de utilidade padrão
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
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
    return p;
}