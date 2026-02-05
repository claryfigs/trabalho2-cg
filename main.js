var gl, prog;
var ratoPos = [0, 0, 5]; 

// Variáveis de Jogo
var queijosColetados = 0;
var totalQueijos = 5;

// Variáveis de Tempo (NOVO)
var tempoInicial = 0;
var jogoAcabou = false;

async function init() {
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

    if (await Cenario.init(gl)) {
        // --- INICIA O CRONÔMETRO AGORA ---
        tempoInicial = Date.now();
        draw();
    }
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // --- LÓGICA DO TEMPO (NOVO) ---
    if (!jogoAcabou) {
        // Calcula segundos passados: (Agora - Inicio) / 1000
        var tempoAtual = (Date.now() - tempoInicial) / 1000;
        // Atualiza na tela com 1 casa decimal (ex: 12.5)
        document.getElementById("timer").innerText = tempoAtual.toFixed(1);
    }

    // --- LÓGICA DE MOVIMENTO ---
    var proximaPos = Controles.simularProximaPosicao(ratoPos);
    var resultado = Colisao.verificar(proximaPos, Cenario.objetos);

    if (!resultado.colidiu) {
        ratoPos = proximaPos;
    } 
    else {
        if (resultado.tipo === 'objeto' && resultado.nome.startsWith('queijo')) {
            console.log("Pegou: " + resultado.nome);
            
            Cenario.objetos[resultado.nome].ativo = false;
            
            queijosColetados++;
            document.getElementById("contador").innerText = queijosColetados;

            // --- VITÓRIA ---
            if (queijosColetados >= totalQueijos) {
                jogoAcabou = true; // Para o cronômetro
                
                // Pega o tempo final para mostrar na tela de vitória
                var tempoFinal = document.getElementById("timer").innerText;
                document.getElementById("tempo-final").innerText = tempoFinal;
                
                document.getElementById("ui-vitoria").style.display = "block";
            }
            
            ratoPos = proximaPos;
        }
    }

    // --- CÂMERA E RENDER ---
    var cam = Controles.getCameraInfo(ratoPos);
    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var mView = m4LookAt(cam.eye, cam.target, [0, 1, 0]);
    var mVP = m4Multiply(mProj, mView);

    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [5.0, 5.0, 10.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), cam.eye);

    Cenario.desenhar(gl, prog, mVP);

    requestAnimationFrame(draw);
}

// Helpers (iguais)
function createShader(gl, type, src) { 
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
}
function createProgram(gl, vs, fs) { 
    var p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p); return p; 
}