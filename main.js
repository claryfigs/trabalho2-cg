var gl, prog;
var ratoPos = [0, 0, 5]; 
var queijosColetados = 0;
var totalQueijos = 5;
var tempoInicial = 0;
var animationId = null; // Para poder parar o loop

// Função chamada pelo BODY do HTML
async function initApp() {
    // Inicializa Menu
    Menu.init();

    // Carrega WebGL em background (sem desenhar ainda)
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
    
    // NÃO chama draw() aqui. O botão Jogar fará isso.
}

// Chamada pelo Menu.js quando clica em JOGAR
function resetarJogo() {
    ratoPos = [0, 0, 5];
    Controles.yaw = -90;
    Controles.pitch = 0;
    queijosColetados = 0;
    tempoInicial = Date.now();
    
    // Reativa os queijos
    for (let chave in Cenario.objetos) {
        if (chave.startsWith('queijo')) {
            Cenario.objetos[chave].ativo = true;
        }
    }
    
    // Reseta UI
    document.getElementById("contador").innerText = "0";
    document.getElementById("timer").innerText = "0.0";
    document.getElementById("ui-vitoria").style.display = "none";

    // Inicia loop
    if (animationId) cancelAnimationFrame(animationId);
    draw();
}

function draw() {
    // Se o usuário saiu para o menu ou ranking, para de desenhar
    if (Menu.estado !== "JOGANDO") return;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- TEMPO ---
    var tempoAtual = (Date.now() - tempoInicial) / 1000;
    document.getElementById("timer").innerText = tempoAtual.toFixed(1);

    // --- MOVIMENTO ---
    var proximaPos = Controles.simularProximaPosicao(ratoPos);
    var resultado = Colisao.verificar(proximaPos, Cenario.objetos);

    if (!resultado.colidiu) {
        ratoPos = proximaPos;
    } else {
        if (resultado.tipo === 'objeto' && resultado.nome.startsWith('queijo')) {
            Cenario.objetos[resultado.nome].ativo = false;
            queijosColetados++;
            document.getElementById("contador").innerText = queijosColetados;

            // --- VITÓRIA ---
            if (queijosColetados >= totalQueijos) {
                // Pequeno delay para mostrar que pegou o último
                document.getElementById("ui-vitoria").style.display = "block";
                
                setTimeout(() => {
                    // Chama o Menu para processar o ranking
                    Menu.finalizarJogo(tempoAtual.toFixed(2));
                }, 1000); // Espera 1 segundo e troca de tela
                
                // Retorna para evitar rodar mais um frame desnecessário
                return; 
            }
            ratoPos = proximaPos;
        }
    }

    // --- CÂMERA ---
    var cam = Controles.getCameraInfo(ratoPos);
    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var mView = m4LookAt(cam.eye, cam.target, [0, 1, 0]);
    var mVP = m4Multiply(mProj, mView);

    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [5.0, 5.0, 10.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), cam.eye);

    Cenario.desenhar(gl, prog, mVP);

    animationId = requestAnimationFrame(draw);
}

// Helpers
function createShader(gl, type, src) { 
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
}
function createProgram(gl, vs, fs) { 
    var p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p); return p; 
}