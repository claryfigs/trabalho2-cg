var gl, prog;

// --- MUDANÇA 1: Variáveis do Jogador (Rato) ---
// Em vez de camPos, agora temos a posição do Rato no mundo
var ratoPos = [0, 0, 5]; // Começa um pouco afastado em Z
var ratoYaw = -90;       // Rotação do corpo (Esquerda/Direita)
var ratoPitch = 0;       // Rotação da cabeça (Cima/Baixo)

var teclas = {
    w: false,
    s: false,
    a: false,
    d: false
};

var cameraFront = [0, 0, -1]; 


var dadosRato, dadosPiso, dadosQueijo, dadosPlantas; 
var bufRato, bufPiso, bufQueijo, bufPlantas;       
var texTijolo;

// --- ENTRADA DE DADOS ---
window.addEventListener("mousedown", () => {
    const canvas = document.getElementById("glcanvas1");
    if(canvas) canvas.requestPointerLock();
});

window.addEventListener("mousemove", (e) => {
    // Só roda se o mouse estiver travado no canvas
    if (document.pointerLockElement === document.getElementById("glcanvas1")) {
        
        // CORREÇÃO 1: Evita saltos bruscos
        // Se o mouse moveu mais de 300 pixels num frame, é erro de leitura do navegador. Ignora.
        if (Math.abs(e.movementX) > 300 || Math.abs(e.movementY) > 300) {
            return; 
        }

        var sensitivity = 0.15;
        ratoYaw += e.movementX * sensitivity;
        ratoPitch -= e.movementY * sensitivity;

        // Trava para não olhar para dentro do próprio corpo (Gimbal Lock)
        if (ratoPitch > 89) ratoPitch = 89;
        if (ratoPitch < -89) ratoPitch = -89;
    }
});

// --- NOVO: Teclado apenas liga/desliga as 'chaves' ---
window.addEventListener("keydown", (e) => {
    if(e.key.toLowerCase() == "w") teclas.w = true;
    if(e.key.toLowerCase() == "s") teclas.s = true;
    if(e.key.toLowerCase() == "a") teclas.a = true;
    if(e.key.toLowerCase() == "d") teclas.d = true;
});

window.addEventListener("keyup", (e) => {
    if(e.key.toLowerCase() == "w") teclas.w = false;
    if(e.key.toLowerCase() == "s") teclas.s = false;
    if(e.key.toLowerCase() == "a") teclas.a = false;
    if(e.key.toLowerCase() == "d") teclas.d = false;
});

// --- NOVO: Função dedicada a calcular o movimento ---
function processarMovimento() {
    var speed = 0.2; // Velocidade

    // 1. Calcula vetor FRENTE (baseado no Yaw)
    var radYaw = ratoYaw * Math.PI / 180;
    var frenteX = Math.cos(radYaw);
    var frenteZ = Math.sin(radYaw);

    // 2. Calcula vetor DIREITA (Frente rotacionado 90 graus)
    // Direita é cos(yaw + 90º) e sin(yaw + 90º)
    var radRight = (ratoYaw + 90) * Math.PI / 180;
    var direitaX = Math.cos(radRight);
    var direitaZ = Math.sin(radRight);

    // 3. Aplica movimentos (Soma vetorial acontece aqui!)
    if (teclas.w) {
        ratoPos[0] += frenteX * speed;
        ratoPos[2] += frenteZ * speed;
    }
    if (teclas.s) {
        ratoPos[0] -= frenteX * speed;
        ratoPos[2] -= frenteZ * speed;
    }
    if (teclas.d) {
        ratoPos[0] += direitaX * speed;
        ratoPos[2] += direitaZ * speed;
    }
    if (teclas.a) {
        ratoPos[0] -= direitaX * speed;
        ratoPos[2] -= direitaZ * speed;
    }
}

// --- INICIALIZAÇÃO ---
async function init() {
    try {
        dadosRato = await carregarOBJ("rato.obj", false);
        dadosPiso = await carregarOBJ("piso.obj", false);
        dadosQueijo = await carregarOBJ("queijo.obj", true);
        dadosPlantas = await carregarOBJ("plantas.obj", false); 
        
        if (dadosRato && dadosPiso) {
            initGL();
            configScene();
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
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

function configScene() {
    bufRato = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRato);
    gl.bufferData(gl.ARRAY_BUFFER, dadosRato, gl.STATIC_DRAW);

    bufPiso = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPiso);
    gl.bufferData(gl.ARRAY_BUFFER, dadosPiso, gl.STATIC_DRAW);

    bufQueijo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufQueijo);
    gl.bufferData(gl.ARRAY_BUFFER, dadosQueijo, gl.STATIC_DRAW);

    bufPlantas = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPlantas);
    gl.bufferData(gl.ARRAY_BUFFER, dadosPlantas, gl.STATIC_DRAW);
}

function isPowerOf2(value) { return (value & (value - 1)) == 0; }

function carregarTextura(url) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    var img = new Image();
    img.crossOrigin = "anonymous"; 
    img.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
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
    processarMovimento(); 

    
    // 1. Calcula onde a câmera está olhando (Front Vector)
    var radYaw = ratoYaw * Math.PI / 180;
    var radPitch = ratoPitch * Math.PI / 180;
    
    cameraFront[0] = Math.cos(radYaw) * Math.cos(radPitch);
    cameraFront[1] = Math.sin(radPitch);
    cameraFront[2] = Math.sin(radYaw) * Math.cos(radPitch);

    // 2. Define a posição da câmera (Posição do Rato + Altura dos Olhos)
    // O rato está no chão (Y=0), os olhos ficam em Y=0.5 (por exemplo)
    var olhosPos = [ratoPos[0], ratoPos[1] + 0.9, ratoPos[2]];
    
    // 3. O Alvo é a posição dos olhos + o vetor frente
    var target = [
        olhosPos[0] + cameraFront[0],
        olhosPos[1] + cameraFront[1],
        olhosPos[2] + cameraFront[2]
    ];

    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 70);
    var mView = m4LookAt(olhosPos, target, [0, 1, 0]);
    var mVP = m4Multiply(mProj, mView);

    var uTransf = gl.getUniformLocation(prog, "transf");
    var uModel = gl.getUniformLocation(prog, "u_model");
    var uUseTexture = gl.getUniformLocation(prog, "u_useTexture");
    var uBaseColor = gl.getUniformLocation(prog, "u_baseColor");
    
    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [5.0, 5.0, 10.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), olhosPos);

    // --- DESENHANDO O PISO ---
    gl.uniform1f(uUseTexture, 1.0); 
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texTijolo);
    gl.uniform1i(gl.getUniformLocation(prog, "tex"), 0);

    // Piso grande para podermos andar bastante
    var mModelPiso = m4ComputeModelMatrix([0, -1, 0], 0, 0, 0, [2.5, 1.0, 2.5]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelPiso));
    gl.uniformMatrix4fv(uModel, false, mModelPiso);
    bindGeometria(bufPiso);
    gl.drawArrays(gl.TRIANGLES, 0, dadosPiso.length / 8);

    // --- DESENHANDO O QUEIJO ---
    // Coloquei ele um pouco mais longe para você ter que andar até ele
    gl.uniform1f(uUseTexture, 0.0); 
    gl.uniform3fv(uBaseColor, [1.0, 0.8, 0.0]); 

    // Gira o queijo devagarzinho
    var anguloQueijo = performance.now() / 20; 
    var mModelQueijo = m4ComputeModelMatrix([5, 0, -10], 0, anguloQueijo, 0, [1, 1, 1]); 
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelQueijo));
    gl.uniformMatrix4fv(uModel, false, mModelQueijo);
    bindGeometria(bufQueijo);
    gl.drawArrays(gl.TRIANGLES, 0, dadosQueijo.length / 8);

        // --- DESENHANDO plantas ---
    gl.uniform1f(uUseTexture, 0.0); 
    gl.uniform3fv(uBaseColor, [0.0, 1.0, 0.0]);

    var mModelPlantas = m4ComputeModelMatrix([10, 0, -10], 0, 0, 0, [10, 10, 10]); 
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelPlantas));
    gl.uniformMatrix4fv(uModel, false, mModelPlantas);
    bindGeometria(bufPlantas);
    gl.drawArrays(gl.TRIANGLES, 0, dadosPlantas.length / 8); 


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
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
    return p;
}