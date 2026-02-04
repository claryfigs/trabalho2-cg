var gl, prog;
var ratoPos = [0, 0, 5]; // Posição inicial

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

    // --- LÓGICA DE MOVIMENTO COM COLISÃO ---

    // 1. Perguntamos ao Controle: "Onde o rato QUER ir?"
    // (Nota: Certifique-se que seu controles.js tem a função 'simularProximaPosicao')
    var proximaPos = Controles.simularProximaPosicao(ratoPos);

    // 2. Perguntamos à Colisão: "Ele PODE ir pra lá?"
    var resultado = Colisao.verificar(proximaPos, Cenario.objetos);

    // 3. Decidimos o que fazer
    if (!resultado.colidiu) {
        // Caminho livre! Atualiza a posição oficial.
        ratoPos = proximaPos;
    } 
    else {
        // BATEU EM ALGO!
        
        if (resultado.tipo === 'objeto' && resultado.nome === 'queijo') {
            // Se bateu no queijo, a gente "come" ele
            console.log("NHAC! Queijo comido.");
            
            // Desativa o queijo no cenário (ele para de ser desenhado e de colidir)
            Cenario.objetos.queijo.ativo = false;
            
            // Permite andar para onde estava o queijo
            ratoPos = proximaPos;
        }
        // Se for 'parede' ou 'plantas', não fazemos nada. 
        // O ratoPos mantém o valor antigo, dando o efeito de "travar".
    }

    // --- FIM DA LÓGICA DE MOVIMENTO ---


    // 4. Atualiza a Câmera baseada na posição (nova ou velha)
    var cam = Controles.getCameraInfo(ratoPos);
    
    // Ajustei o Far Plane para 100 para ver mais longe
    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var mView = m4LookAt(cam.eye, cam.target, [0, 1, 0]);
    var mVP = m4Multiply(mProj, mView);

    // Atualiza luz e posição da câmera no shader
    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [5.0, 5.0, 10.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), cam.eye);

    // 5. Manda desenhar tudo
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