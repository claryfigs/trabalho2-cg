var teximg = [];
var texSrc = ["gato.jpg", "cachorro.png"];
var loadTexs = 0;
var gl;
var prog;
var camPos = [0, 0, 15];
var angle = 0;

var dadosParedes = null;
var dadosRato = null;
var bufParedes, bufRato;

window.addEventListener("keydown", function(e) {
    var speed = 0.5;
    if(e.key == "w") camPos[2] -= speed;
    if(e.key == "s") camPos[2] += speed;
    if(e.key == "a") camPos[0] -= speed;
    if(e.key == "d") camPos[0] += speed;
});

async function init() {
    try {
        dadosParedes = await carregarOBJ("paredes.obj");
        dadosRato = await carregarOBJ("rato.obj");

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
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.enable(gl.DEPTH_TEST);
    
    // CORREÇÃO: Inverte o Y da textura para não ficar de cabeça para baixo
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

function configScene() {
    bufParedes = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufParedes);
    gl.bufferData(gl.ARRAY_BUFFER, dadosParedes, gl.STATIC_DRAW);

    bufRato = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRato);
    gl.bufferData(gl.ARRAY_BUFFER, dadosRato, gl.STATIC_DRAW);

    function setupTex(id, img) {
        var tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + id); 
        gl.bindTexture(gl.TEXTURE_2D, tex);
        
        // CORREÇÃO: Parâmetros para imagens de qualquer tamanho (NPOT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    }
    setupTex(0, teximg[0]);
    setupTex(1, teximg[1]);
}

function bindGeometria(buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    var stride = 8 * 4; // x,y,z, nx,ny,nz, u,v
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
    var mView = m4LookAt(camPos, [0, 0, 0], [0, 1, 0]);
    var mVP = m4Multiply(mProj, mView);

    var uTransf = gl.getUniformLocation(prog, "transf");
    var uModel = gl.getUniformLocation(prog, "u_model");
    var uTex = gl.getUniformLocation(prog, "tex");
    var uUseTex = gl.getUniformLocation(prog, "u_useTexture");
    var uLightPos = gl.getUniformLocation(prog, "u_lightPos");
    var uViewPos = gl.getUniformLocation(prog, "u_viewPos");

    gl.uniform3fv(uLightPos, [5.0, 5.0, 5.0]);
    gl.uniform3fv(uViewPos, camPos);

    // --- DESENHANDO PAREDES ---
    gl.uniform1f(uUseTex, 1.0); 
    var mModelP = m4ComputeModelMatrix([0, 0, 0], 0, 0, 0, [1, 1, 1]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelP));
    gl.uniformMatrix4fv(uModel, false, mModelP);
    
    bindGeometria(bufParedes);
    gl.uniform1i(uTex, 0); // Usa a TEXTURE0 (gato), se colocar 1 vira a imagem do cachorro
    gl.drawArrays(gl.TRIANGLES, 0, dadosParedes.length / 8);

    // --- DESENHANDO RATO ---
    gl.uniform1f(uUseTex, 0.0); // Sem textura para o rato
    var mModelR = m4ComputeModelMatrix([10, 0, 0], 0, angle, 0, [0.05, 0.05, 0.05]);
    gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModelR));
    gl.uniformMatrix4fv(uModel, false, mModelR);
    
    bindGeometria(bufRato);
    gl.drawArrays(gl.TRIANGLES, 0, dadosRato.length / 8);

    angle += 1; 
    requestAnimationFrame(draw);
}

function createShader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
    }
    return s;
}

function createProgram(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs);
    gl.linkProgram(p);
    return p;
}