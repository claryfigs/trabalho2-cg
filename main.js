var gl, prog;
var ratoPos = [0, 0, 0]; 
var queijosColetados = 0;
var totalQueijos = 5;
var tempoInicial = 0;
var animationId = null; 


var usarLanterna = true;

async function initApp() {
    AudioGerenciador.init();
    AudioGerenciador.tocarMenu(); 
    // Inicializa Menu
    Menu.init();

    // Carrega WebGL
    var canvas = document.getElementById("glcanvas1");
    gl = canvas.getContext("webgl");
    prog = createProgram(gl, 
        createShader(gl, gl.VERTEX_SHADER, document.getElementById("vertex-shader").text),
        createShader(gl, gl.FRAGMENT_SHADER, document.getElementById("frag-shader").text)
    );    
    gl.useProgram(prog);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    Controles.init("glcanvas1");
    await Cenario.init(gl);
}

function redimensionarCanvas(gl) {
    var displayWidth  = gl.canvas.clientWidth;
    var displayHeight = gl.canvas.clientHeight;
    if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {
        gl.canvas.width  = displayWidth;
        gl.canvas.height = displayHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
}

function alternarLuz() {
    usarLanterna = !usarLanterna;
    
    var uiTexto = document.getElementById("modo-luz");
    if (uiTexto) {
        if (usarLanterna) {
            uiTexto.innerText = "🔦 LANTERNA (F)";
            uiTexto.style.color = "#FFD700";
        } else {
            uiTexto.innerText = "💡 TETO (F)";
            uiTexto.style.color = "#FFFFFF";
        }
    }
}

function resetarJogo() {
    ratoPos = [60, 0, 70];
    Controles.yaw = -80;
    Controles.pitch = 0;
    queijosColetados = 0;
    tempoInicial = Date.now();
    
    usarLanterna = true;
    var uiTexto = document.getElementById("modo-luz");
    if(uiTexto) { uiTexto.innerText = "🔦 LANTERNA (F)"; uiTexto.style.color = "#FFD700"; }

    for (let chave in Cenario.objetos) {
        if (chave.startsWith('queijo')) {
            Cenario.objetos[chave].ativo = true;
        }
    }
    
    document.getElementById("contador").innerText = "0";
    document.getElementById("timer").innerText = "0.0";
    document.getElementById("ui-vitoria").style.display = "none";

    if (animationId) cancelAnimationFrame(animationId);
    draw();
}

function draw() {
    if (Menu.estado !== "JOGANDO") return;

    redimensionarCanvas(gl);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var tempoAtual = (Date.now() - tempoInicial) / 1000;
    document.getElementById("timer").innerText = tempoAtual.toFixed(1);

    var proximaPos = Controles.simularProximaPosicao(ratoPos);
    var resultado = Colisao.verificar(proximaPos, Cenario.objetos);

    if (!resultado.colidiu) {
        ratoPos = proximaPos;
    } else {
        if (resultado.tipo === 'objeto' && resultado.nome.startsWith('queijo')) {
            Cenario.objetos[resultado.nome].ativo = false;
            queijosColetados++;
            document.getElementById("contador").innerText = queijosColetados;

            if (queijosColetados >= totalQueijos) {
                document.getElementById("ui-vitoria").style.display = "block";
                setTimeout(() => {
                    Menu.finalizarJogo(tempoAtual.toFixed(2));
                }, 1000);
                return; 
            }
            ratoPos = proximaPos;
        }
    }

    var cam = Controles.getCameraInfo(ratoPos);
    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var mView = m4LookAt(cam.eye, cam.target, [0, 1, 0]);
    var mVP = m4Multiply(mProj, mView);


    var posLuz;
    if (usarLanterna) {
 
        posLuz = [ratoPos[0], ratoPos[1] + 6.0, ratoPos[2]];
    } else {
 
        posLuz = [0.0, 43.0, 0.0];
    }
    
    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), posLuz);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), cam.eye);


    Cenario.desenhar(gl, prog, mVP);

    animationId = requestAnimationFrame(draw);
}

function createShader(gl, type, src) { 
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
}
function createProgram(gl, vs, fs) { 
    var p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p); return p; 
}