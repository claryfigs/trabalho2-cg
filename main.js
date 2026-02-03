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
    // Coordenadas: X, Y, Z, U, V
    var v = new Float32Array([
        // Frente (Gato)
        -0.5, -0.5,  0.5, 0,1,   0.5, -0.5,  0.5, 1,1,   0.5,  0.5,  0.5, 1,0,
        -0.5, -0.5,  0.5, 0,1,   0.5,  0.5,  0.5, 1,0,  -0.5,  0.5,  0.5, 0,0,
        // Atrás (Cachorro)
        -0.5, -0.5, -0.5, 0,1,   0.5,  0.5, -0.5, 1,0,   0.5, -0.5, -0.5, 1,1,
        -0.5, -0.5, -0.5, 0,1,  -0.5,  0.5, -0.5, 0,0,   0.5,  0.5, -0.5, 1,0,
        // Topo (Gato)
        -0.5,  0.5, -0.5, 0,1,  -0.5,  0.5,  0.5, 0,0,   0.5,  0.5,  0.5, 1,0,
        -0.5,  0.5, -0.5, 0,1,   0.5,  0.5,  0.5, 1,0,   0.5,  0.5, -0.5, 1,1,
        // Baixo (Cachorro)
        -0.5, -0.5, -0.5, 0,1,   0.5, -0.5,  0.5, 1,0,  -0.5, -0.5,  0.5, 0,0,
        -0.5, -0.5, -0.5, 0,1,   0.5, -0.5, -0.5, 1,1,   0.5, -0.5,  0.5, 1,0,
        // Direita (Gato)
         0.5, -0.5, -0.5, 0,1,   0.5,  0.5, -0.5, 0,0,   0.5,  0.5,  0.5, 1,0,
         0.5, -0.5, -0.5, 0,1,   0.5,  0.5,  0.5, 1,0,   0.5, -0.5,  0.5, 1,1,
        // Esquerda (Cachorro)
        -0.5, -0.5, -0.5, 0,1,  -0.5, -0.5,  0.5, 1,1,  -0.5,  0.5,  0.5, 1,0,
        -0.5, -0.5, -0.5, 0,1,  -0.5,  0.5,  0.5, 1,0,  -0.5,  0.5, -0.5, 0,0
    ]);

    var bufPtr = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPtr);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);

    var posPtr = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posPtr);
    // 3 valores (X,Y,Z), pulando 5*4 bytes por bloco
    gl.vertexAttribPointer(posPtr, 3, gl.FLOAT, false, 5 * 4, 0);

    var texPtr = gl.getAttribLocation(prog, "texCoord");
    gl.enableVertexAttribArray(texPtr);
    // 2 valores (U,V), começando após os 3 primeiros floats (3*4 bytes)
    gl.vertexAttribPointer(texPtr, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
        //submeter textura para gpu
        var tex0 = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[0]);
        
        var tex1 = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tex1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, teximg[1]);
}                

// webgl.js

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //Z-buffer
    gl.enable(gl.DEPTH_TEST); //Z-buffer

    // 1. Matrizes
    var mProj = m4Perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 100);
    var mView = m4LookAt(camPos, [0,0,0], [0,1,0]);
    var mModel = m4ComputeModelMatrix([0, 0, 0], angle, angle * 0.5, 0, [1, 1, 1]); 
    
    // 2. Multiplicação na ordem correta: Projeção * View * Model
    var mVP = m4Multiply(mProj, mView);
    var matFinal = m4Multiply(mVP, mModel);

    // 3. Enviar matriz para o Shader
    var transfPtr = gl.getUniformLocation(prog, "transf");
    gl.uniformMatrix4fv(transfPtr, false, matFinal);

    var texPtr = gl.getUniformLocation(prog, "tex"); 

    for(var i = 0; i < 6; i++) {
        // Agora o texPtr existe e pode ser usado
        gl.uniform1i(texPtr, i % 2); 
        gl.drawArrays(gl.TRIANGLES, i * 6, 6); 
    }

    angle++;
    requestAnimationFrame(draw);
}