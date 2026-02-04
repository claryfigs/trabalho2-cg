var gl, prog;
var ratoPos = [0, 0, 5]; // Posição inicial

var queijosColetados = 0;
var totalQueijos = 5;

async function init() {
    var canvas = document.getElementById("glcanvas1");
    gl = canvas.getContext("webgl");
    
    // Shader e GL Setup
    prog = createProgram(gl, 
        createShader(gl, gl.VERTEX_SHADER, document.getElementById("vertex-shader").text),
        createShader(gl, gl.FRAGMENT_SHADER, document.getElementById("frag-shader").text)
    );    
    gl.useProgram(prog);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    // 1. Inicia Controles (Mouse/Teclado)
    Controles.init("glcanvas1");

    // 2. Inicia Cenário (Carrega OBJs e Texturas)
    if (await Cenario.init(gl)) {
        draw();
    }
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 1. Lógica de Movimento
    var proximaPos = Controles.simularProximaPosicao(ratoPos);
    var resultado = Colisao.verificar(proximaPos, Cenario.objetos);

    if (!resultado.colidiu) {
        ratoPos = proximaPos;
    } 
    else {
        // Se bateu em um objeto E o nome dele começa com "queijo"
        if (resultado.tipo === 'objeto' && resultado.nome.startsWith('queijo')) {
            
            console.log("Pegou: " + resultado.nome);
            
            // Remove ESSE queijo específico (queijo1, queijo2, etc)
            Cenario.objetos[resultado.nome].ativo = false;
            
            // Atualiza Pontuação
            queijosColetados++;
            document.getElementById("contador").innerText = queijosColetados;

            // Verifica Vitória
            if (queijosColetados >= totalQueijos) {
                document.getElementById("ui-vitoria").style.display = "block";
            }
            
            // Permite andar (efeito de passar por cima)
            ratoPos = proximaPos;
        }
    }

    // 2. Câmera
    var cam = Controles.getCameraInfo(ratoPos);
    
    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var mView = m4LookAt(cam.eye, cam.target, [0, 1, 0]);
    var mVP = m4Multiply(mProj, mView);

    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [5.0, 5.0, 10.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), cam.eye);

    // 3. Desenha
    Cenario.desenhar(gl, prog, mVP);

    requestAnimationFrame(draw);
}

// Helpers
function createShader(gl, type, src) { 
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
}
function createProgram(gl, vs, fs) { 
    var p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p); return p; 
}