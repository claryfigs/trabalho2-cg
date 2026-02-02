var gl;
var program;
var positionBuffer;

var camPos = [0, 0, 0]; // Começa no centro
var camYaw = 0;
var keys = {};

function getGL(canvas) {
    return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
}

function createShader(gl, type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Erro no Shader:", gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function createProgram(gl, vtx, frag) {
    var p = gl.createProgram();
    gl.attachShader(p, vtx);
    gl.attachShader(p, frag);
    gl.linkProgram(p);
    return p;
}

function getWallVertices() {
    // Definindo os 36 vértices (6 faces * 2 triângulos * 3 vértices)
    // Baseado nas dimensões do seu OBJ: 2x2x0.1
    return new Float32Array([
        // Frente
        -1,-1, 0.05,  1,-1, 0.05,  1, 1, 0.05,  -1,-1, 0.05,  1, 1, 0.05, -1, 1, 0.05,
        // Tras
        -1,-1,-0.05, -1, 1,-0.05,  1, 1,-0.05,  -1,-1,-0.05,  1, 1,-0.05,  1,-1,-0.05,
        // Topo
        -1, 1, 0.05,  1, 1, 0.05,  1, 1,-0.05,  -1, 1, 0.05,  1, 1,-0.05, -1, 1,-0.05,
        // Base
        -1,-1, 0.05, -1,-1,-0.05,  1,-1,-0.05,  -1,-1, 0.05,  1,-1,-0.05,  1,-1, 0.05,
        // Direita
         1,-1, 0.05,  1,-1,-0.05,  1, 1,-0.05,   1,-1, 0.05,  1, 1,-0.05,  1, 1, 0.05,
        // Esquerda
        -1,-1, 0.05, -1, 1, 0.05, -1, 1,-0.05,  -1,-1, 0.05, -1, 1,-0.05, -1,-1,-0.05
    ]);
}

function init() {
    var canvas = document.getElementById("glcanvas1");
    gl = getGL(canvas);
    if (!gl) return;

    var vShader = createShader(gl, gl.VERTEX_SHADER, document.getElementById("vertex-shader").text);
    var fShader = createShader(gl, gl.FRAGMENT_SHADER, document.getElementById("frag-shader").text);
    program = createProgram(gl, vShader, fShader);
    
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, getWallVertices(), gl.STATIC_DRAW);

    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

    gl.enable(gl.DEPTH_TEST);
    requestAnimationFrame(render);
}

function render() {
    updateCamera();

    // Cor de fundo levemente azulada para saber se o WebGL está rodando
    gl.clearColor(0.2, 0.3, 0.4, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    var uProj = gl.getUniformLocation(program, "uProjectionMatrix");
    var uView = gl.getUniformLocation(program, "uViewMatrix");
    var uModel = gl.getUniformLocation(program, "uModelMatrix");
    var uColor = gl.getUniformLocation(program, "uColor");

    var projMatrix = mat4.create();
    mat4.perspective(projMatrix, 45 * Math.PI / 180, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
    gl.uniformMatrix4fv(uProj, false, projMatrix);

    var viewMatrix = mat4.create();
    var lookAtPoint = [
        camPos[0] + Math.sin(camYaw), 
        camPos[1], 
        camPos[2] - Math.cos(camYaw)
    ];
    mat4.lookAt(viewMatrix, camPos, lookAtPoint, [0, 1, 0]);
    gl.uniformMatrix4fv(uView, false, viewMatrix);

    var aPos = gl.getAttribLocation(program, "aPosition"); // Verifique se o nome no shader é aPosition ou position
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    // --- DESENHAR A SALA ---
    // Chão
    draw(uModel, uColor, [0, -2, -5], [Math.PI/2, 0, 0], [5, 5, 1], [0.3, 0.3, 0.3, 1]);
    // Teto
    draw(uModel, uColor, [0, 2, -5], [Math.PI/2, 0, 0], [5, 5, 1], [0.6, 0.6, 0.6, 1]);
    // Paredes
    draw(uModel, uColor, [0, 0, -10], [0, 0, 0], [5, 2, 1], [0.8, 0.1, 0.1, 1]); // Fundo
    draw(uModel, uColor, [-5, 0, -5], [0, Math.PI/2, 0], [5, 2, 1], [0.1, 0.8, 0.1, 1]); // Esq
    draw(uModel, uColor, [5, 0, -5], [0, Math.PI/2, 0], [5, 2, 1], [0.1, 0.1, 0.8, 1]); // Dir

    requestAnimationFrame(render);
}

function draw(uM, uC, p, r, s, col) {
    var m = mat4.create();
    mat4.translate(m, m, p);
    mat4.rotateX(m, m, r[0]);
    mat4.rotateY(m, m, r[1]);
    mat4.scale(m, m, s);
    gl.uniformMatrix4fv(uM, false, m);
    gl.uniform4fv(uC, col);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}

function updateCamera() {
    var spd = 0.1;
    if(keys['arrowleft']) camYaw -= 0.05;
    if(keys['arrowright']) camYaw += 0.05;
    if(keys['w']) { camPos[0] += Math.sin(camYaw)*spd; camPos[2] -= Math.cos(camYaw)*spd; }
    if(keys['s']) { camPos[0] -= Math.sin(camYaw)*spd; camPos[2] += Math.cos(camYaw)*spd; }
}