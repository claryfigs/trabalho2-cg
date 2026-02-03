var teximg = [];
var texSrc = ["gato.jpg", "cachorro.png"];
var loadTexs = 0;
var gl;
var prog;
var camPos = [0, 0, 2];
var angle = 0;

window.addEventListener("keydown", function(e) {
    var speed = 0.1;
    if(e.key == "w") camPos[2] -= speed; // Frente
    if(e.key == "s") camPos[2] += speed; // Trás
    if(e.key == "a") camPos[0] -= speed; // Esquerda
    if(e.key == "d") camPos[0] += speed; // Direita
});

function getGL(canvas)
{
    var gl = canvas.getContext("webgl");
    if(gl) return gl;
    
    gl = canvas.getContext("experimental-webgl");
    if(gl) return gl;
    
    alert("Contexto WebGL inexistente! Troque de navegador!");
    return false;
}

function createShader(gl, shaderType, shaderSrc)
{
	var shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSrc);
	gl.compileShader(shader);
	
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		return shader;
	
	alert("Erro de compilação: " + gl.getShaderInfoLog(shader));
	
	gl.deleteShader(shader);
}

function createProgram(gl, vtxShader, fragShader)
{
	var prog = gl.createProgram();
	gl.attachShader(prog, vtxShader);
	gl.attachShader(prog, fragShader);
	gl.linkProgram(prog);
	
	if(gl.getProgramParameter(prog, gl.LINK_STATUS))
		return prog;

    alert("Erro de linkagem: " + gl.getProgramInfoLog(prog));
	
	gl.deleteProgram(prog);	
}

function init()
{
    for(i = 0; i < texSrc.length; i++)
    {
        teximg[i] = new Image();
        teximg[i].src = texSrc[i];
        teximg[i].onload = function()
        {
            loadTexs++;
    	    loadTextures();
        }
    }
}

function loadTextures()
{
    if(loadTexs == texSrc.length)
    {
       initGL();
       configScene();
       draw();
    }
}
    
function initGL()
{
	var canvas = document.getElementById("glcanvas1");
	
	gl = getGL(canvas);
	if(gl)
	{
        //Inicializa shaders
 		var vtxShSrc = document.getElementById("vertex-shader").text;
		var fragShSrc = document.getElementById("frag-shader").text;

        var vtxShader = createShader(gl, gl.VERTEX_SHADER, vtxShSrc);
        var fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShSrc);
        prog = createProgram(gl, vtxShader, fragShader);	
        
        gl.useProgram(prog);

        //Inicializa área de desenho: viewport e cor de limpeza; limpa a tela
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.enable( gl.BLEND );
		gl.enable(gl.DEPTH_TEST); //Z-buffer
        gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    }
}    

function configScene() {
    // X, Y, Z,  NX, NY, NZ,  U, V
    var v = new Float32Array([
        // Frente (Normal: 0,0,1)
        -0.5, -0.5,  0.5,  0,0,1,  0,1,   0.5, -0.5,  0.5,  0,0,1,  1,1,   0.5,  0.5,  0.5,  0,0,1,  1,0,
        -0.5, -0.5,  0.5,  0,0,1,  0,1,   0.5,  0.5,  0.5,  0,0,1,  1,0,  -0.5,  0.5,  0.5,  0,0,1,  0,0,
        // Atrás (Normal: 0,0,-1)
        -0.5, -0.5, -0.5,  0,0,-1, 0,1,   0.5,  0.5, -0.5,  0,0,-1, 1,0,   0.5, -0.5, -0.5,  0,0,-1, 1,1,
        -0.5, -0.5, -0.5,  0,0,-1, 0,1,  -0.5,  0.5, -0.5,  0,0,-1, 0,0,   0.5,  0.5, -0.5,  0,0,-1, 1,0,
        // Topo (Normal: 0,1,0)
        -0.5,  0.5, -0.5,  0,1,0,  0,1,  -0.5,  0.5,  0.5,  0,1,0,  0,0,   0.5,  0.5,  0.5,  0,1,0,  1,0,
        -0.5,  0.5, -0.5,  0,1,0,  0,1,   0.5,  0.5,  0.5,  0,1,0,  1,0,   0.5,  0.5, -0.5,  0,1,0,  1,1,
        // Baixo (Normal: 0,-1,0)
        -0.5, -0.5, -0.5,  0,-1,0, 0,1,   0.5, -0.5,  0.5,  0,-1,0, 1,0,  -0.5, -0.5,  0.5,  0,-1,0, 0,0,
        -0.5, -0.5, -0.5,  0,-1,0, 0,1,   0.5, -0.5, -0.5,  0,-1,0, 1,1,   0.5, -0.5,  0.5,  0,-1,0, 1,0,
        // Direita (Normal: 1,0,0)
         0.5, -0.5, -0.5,  1,0,0,  0,1,   0.5,  0.5, -0.5,  1,0,0,  0,0,   0.5,  0.5,  0.5,  1,0,0,  1,0,
         0.5, -0.5, -0.5,  1,0,0,  0,1,   0.5,  0.5,  0.5,  1,0,0,  1,0,   0.5, -0.5,  0.5,  1,0,0,  1,1,
        // Esquerda (Normal: -1,0,0)
        -0.5, -0.5, -0.5, -1,0,0,  0,1,  -0.5, -0.5,  0.5, -1,0,0,  1,1,  -0.5,  0.5,  0.5, -1,0,0,  1,0,
        -0.5, -0.5, -0.5, -1,0,0,  0,1,  -0.5,  0.5,  0.5, -1,0,0,  1,0,  -0.5,  0.5, -0.5, -1,0,0,  0,0
    ]);

    var bufPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPtr);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);

    var stride = 8 * 4;
    gl.vertexAttribPointer(gl.getAttribLocation(prog, "position"), 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(prog, "position"));

    gl.vertexAttribPointer(gl.getAttribLocation(prog, "normal"), 3, gl.FLOAT, false, stride, 3 * 4);
    gl.enableVertexAttribArray(gl.getAttribLocation(prog, "normal"));

    gl.vertexAttribPointer(gl.getAttribLocation(prog, "texCoord"), 2, gl.FLOAT, false, stride, 6 * 4);
    gl.enableVertexAttribArray(gl.getAttribLocation(prog, "texCoord"));

    // --- Submeter texturas (Tex0 e Tex1) ---
    function setupTex(id, img) {
        var tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    }
    setupTex(0, teximg[0]);
    setupTex(1, teximg[1]);
}         

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // 1. Matrizes
    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var mView = m4LookAt(camPos, [0,0,0], [0,1,0]);
    var mModel = m4ComputeModelMatrix([0, 0, 0], angle, angle * 0.5, 0, [1, 1, 1]);
    
    var mVP = m4Multiply(mProj, mView);
    var mFinal = m4Multiply(mVP, mModel);

    // 2. Uniformes do Shader
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, "transf"), false, mFinal);
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, "u_model"), false, mModel);
    
    // Luz fixa no mundo (Ex: uma lâmpada no teto)
    gl.uniform3fv(gl.getUniformLocation(prog, "u_lightPos"), [0.0, 0.0, 5.0]);
    gl.uniform3fv(gl.getUniformLocation(prog, "u_viewPos"), camPos);
    // Dentro da função draw(), logo após enviar u_viewPos
    var useTexPtr = gl.getUniformLocation(prog, "u_useTexture");
    gl.uniform1f(useTexPtr, 1.0); // 1.0 para ver o gato/cachorro

    var texPtr = gl.getUniformLocation(prog, "tex");
    for(var i = 0; i < 6; i++) {
        gl.uniform1i(texPtr, i % 2);
        gl.drawArrays(gl.TRIANGLES, i * 6, 6);
    }

    angle++;
    requestAnimationFrame(draw);
}