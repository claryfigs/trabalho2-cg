var gl, prog;

// --- MUDANÇA 1: Variáveis do Jogador (Rato) ---
// Em vez de camPos, agora temos a posição do Rato no mundo
var ratoPos = [0, 0, 5]; // Começa um pouco afastado em Z
var ratoYaw = -90;       // Rotação do corpo (Esquerda/Direita)
var ratoPitch = 0;       // Rotação da cabeça (Cima/Baixo)

// Variáveis auxiliares para cálculo de direção
var cameraFront = [0, 0, -1]; 

// Dados dos Objetos e Buffers
var dadosRato, dadosPiso, dadosQueijo; 
var bufRato, bufPiso, bufQueijo;       
var texTijolo;

// --- ENTRADA DE DADOS ---
window.addEventListener("mousedown", () => {
    const canvas = document.getElementById("glcanvas1");
    if(canvas) canvas.requestPointerLock();
});

window.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement === document.getElementById("glcanvas1")) {
        var sensitivity = 0.15; // Sensibilidade do mouse
        ratoYaw += e.movementX * sensitivity;
        ratoPitch -= e.movementY * sensitivity;

        // Trava para não quebrar o pescoço (olhar muito pra cima ou baixo)
        if (ratoPitch > 89) ratoPitch = 89;
        if (ratoPitch < -89) ratoPitch = -89;
    }
});

window.addEventListener("keydown", (e) => {
    var speed = 1; // Velocidade de movimento do rato

    // --- MUDANÇA 2: Cálculo da direção de movimento ---
    // Precisamos saber para onde é "Frente" baseado APENAS no Yaw (chão horizontal)
    // Se usarmos o Pitch aqui, o rato voaria ao olhar para cima
    var radYaw = ratoYaw * Math.PI / 180;
    
    var frenteX = Math.cos(radYaw);
    var frenteZ = Math.sin(radYaw);

    // W = Anda na direção da frente
    if(e.key == "w") { 
        ratoPos[0] += frenteX * speed; 
        ratoPos[2] += frenteZ * speed; 
    }
    // S = Anda na direção oposta
    if(e.key == "s") { 
        ratoPos[0] -= frenteX * speed; 
        ratoPos[2] -= frenteZ * speed; 
    }
    
    // Dica: Futuramente aqui entra a verificação de colisão!
});

// --- INICIALIZAÇÃO ---
async function init() {
    try {
        dadosRato = await carregarOBJ("rato.obj", false);
        dadosPiso = await carregarOBJ("piso.obj", false);
        dadosQueijo = await carregarOBJ("queijo.obj", true); 
        
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
}

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

function isPowerOf2(value) { return (value & (value - 1)) == 0; }

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

    // --- MUDANÇA 3: Atualiza a Câmera baseada no Rato ---
    
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

    // --- DESENHO DA CENA ---

    // NOTA: Comentei o desenho do RATO.
    // Como estamos em 1ª pessoa, não desenhamos o próprio corpo para não bloquear a visão.
    /*
    gl.uniform1f(uUseTexture, 0.0); 
    gl.uniform3fv(uBaseColor, [0.4, 0.2, 0.1]); 
    var mModelRato = m4ComputeModelMatrix(ratoPos, 0, -ratoYaw, 0, [0.08, 0.08, 0.08]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelRato));
    gl.uniformMatrix4fv(uModel, false, mModelRato);
    bindGeometria(bufRato);
    gl.drawArrays(gl.TRIANGLES, 0, dadosRato.length / 8);
    */

    // --- DESENHANDO O PISO ---
    gl.uniform1f(uUseTexture, 1.0); 
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texTijolo);
    gl.uniform1i(gl.getUniformLocation(prog, "u_sampler"), 0);

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

    requestAnimationFrame(draw);
}

// Funções padrão (createShader, createProgram...) mantidas iguais
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