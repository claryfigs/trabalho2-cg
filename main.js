var teximg = [];
var texSrc = ["gato.jpg", "cachorro.png"];
var loadTexs = 0;
var gl;
var prog;
var camPos = [0, 0, 5]; // Afastei um pouco a câmera para ver ambos
var angle = 0;

// Dados brutos e Buffers
var dadosParedes = null;
var dadosRato = null;
var bufParedes, bufRato;

// --- EVENTOS DE TECLADO ---
window.addEventListener("keydown", function(e) {
    var speed = 0.1;
    if(e.key == "w") camPos[2] -= speed;
    if(e.key == "s") camPos[2] += speed;
    if(e.key == "a") camPos[0] -= speed;
    if(e.key == "d") camPos[0] += speed;
});

// --- INICIALIZAÇÃO ASSÍNCRONA ---
async function init() {
    try {
        // 1. Carrega os arquivos OBJ (usando o seu leitor.js)
        dadosParedes = await carregarOBJ("paredes.obj");
        dadosRato = await carregarOBJ("rato.obj");

        // 2. Carrega as texturas
        for(let i = 0; i < texSrc.length; i++) {
            teximg[i] = new Image();
            teximg[i].src = texSrc[i];
            teximg[i].onload = function() {
                loadTexs++;
                verificarCarga();
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
    gl.clearColor(0.1, 0.1, 0.1, 1); // Fundo levemente cinza
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
}

function configScene() {
    // Criação do Buffer das Paredes
    bufParedes = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufParedes);
    gl.bufferData(gl.ARRAY_BUFFER, dadosParedes, gl.STATIC_DRAW);

    // Criação do Buffer do Rato
    bufRato = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRato);
    gl.bufferData(gl.ARRAY_BUFFER, dadosRato, gl.STATIC_DRAW);

    // Configuração das Texturas
    function setupTex(id, img) {
        var tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    }
    setupTex(0, teximg[0]);
    setupTex(1, teximg[1]);
}

// Função auxiliar para conectar os atributos ao buffer atual
function bindGeometria(buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    var stride = 8 * 4;
    var locPos = gl.getAttribLocation(prog, "position");
    var locNorm = gl.getAttribLocation(prog, "normal");
    var locTex = gl.getAttribLocation(prog, "texCoord");

    gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locNorm, 3, gl.FLOAT, false, stride, 3 * 4);
    gl.enableVertexAttribArray(locNorm);
    gl.vertexAttribPointer(locTex, 2, gl.FLOAT, false, stride, 6 * 4);
    gl.enableVertexAttribArray(locTex);
}

// --- RENDERIZAÇÃO ---
function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var mView = m4LookAt(camPos, [0,0,0], [0,1,0]);
    var mVP = m4Multiply(mProj, mView);

    var uTransf = gl.getUniformLocation(prog, "transf");
    var uModel = gl.getUniformLocation(prog, "u_model");
    var uTex = gl.getUniformLocation(prog, "tex");

    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [5.0, 5.0, 5.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), camPos);
    gl.uniform1f(gl.getUniformLocation(prog, "u_useTexture"), 1.0);

    // 1. DESENHAR PAREDES
    var mModelP = m4ComputeModelMatrix([0, 0, 0], 0, 0, 0, [1, 1, 1]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelP));
    gl.uniformMatrix4fv(uModel, false, mModelP);
    
    bindGeometria(bufParedes);
    gl.uniform1i(uTex, 0); // Usa a textura do Gato nas paredes
    gl.drawArrays(gl.TRIANGLES, 0, dadosParedes.length / 8);

    // 2. DESENHAR RATO
    // Posicionado à direita e rotacionando
    var mModelR = m4ComputeModelMatrix([1.5, 0, 0], 0, angle, 0, [0.4, 0.4, 0.4]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelR));
    gl.uniformMatrix4fv(uModel, false, mModelR);
    
    bindGeometria(bufRato);
    gl.uniform1i(uTex, 1); // Usa a textura do Cachorro no rato
    gl.drawArrays(gl.TRIANGLES, 0, dadosRato.length / 8);

    angle += 0.02;
    requestAnimationFrame(draw);
}

// Funções auxiliares de Shader (mantidas simplificadas)
function createShader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
}

function createProgram(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.linkProgram(p);
    return p;
}