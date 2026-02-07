function m4Multiply(a, b) {
    var out = new Float32Array(16);
    for (var i = 0; i < 4; i++) { // linha
        for (var j = 0; j < 4; j++) { // coluna
            out[i + j * 4] = 
                a[i + 0 * 4] * b[0 + j * 4] +
                a[i + 1 * 4] * b[1 + j * 4] +
                a[i + 2 * 4] * b[2 + j * 4] +
                a[i + 3 * 4] * b[3 + j * 4];
        }
    }
    return out;
}


function m4Translation(tx, ty, tz) {
    return new Float32Array([
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        tx, ty, tz, 1
    ]);
}


function m4Scale(sx, sy, sz) {
    return new Float32Array([
        sx, 0,  0,  0,
        0,  sy, 0,  0,
        0,  0,  sz, 0,
        0,  0,  0,  1
    ]);
}


function m4RotationZ(angleInDegrees) {
    var rad = angleInDegrees * Math.PI / 180;
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    return new Float32Array([
        c, s, 0, 0,
       -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

function m4RotationY(angleInDegrees) {
    var rad = angleInDegrees * Math.PI / 180;
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    return new Float32Array([
        c, 0, -s, 0,
        0, 1,  0, 0,
        s, 0,  c, 0,
        0, 0,  0, 1
    ]);
}

function m4RotationX(angleInDegrees) {
    var rad = angleInDegrees * Math.PI / 180;
    var c = Math.cos(rad);
    var s = Math.sin(rad);
    return new Float32Array([
        1, 0, 0, 0,
        0, c, s, 0,
        0,-s, c, 0,
        0, 0, 0, 1
    ]);
}

function m4ComputeModelMatrix(translation, rx, ry, rz, scale) {
    var matTra = m4Translation(translation[0], translation[1], translation[2]);
    var matEsc = m4Scale(scale[0], scale[1], scale[2]);
    var mX = m4RotationX(rx);
    var mY = m4RotationY(ry);
    var mZ = m4RotationZ(rz);

    var matRot = m4Multiply(mY, m4Multiply(mX, mZ));

    var matTemp = m4Multiply(matRot, matEsc);
    var matFinal = m4Multiply(matTra, matTemp);

    return matFinal;
}

function m4Perspective(fovEmGraus, aspect, near, far) {

    var fovEmRadianos = fovEmGraus * Math.PI / 180;
    var metadeFov = fovEmRadianos / 2;
    var f = 1.0 / Math.tan(metadeFov);
    var rangeInv = 1.0 / (near - far);
    return new Float32Array([
        // Coluna 1: Escala X (Considera o Aspect Ratio para não esticar a imagem)
        f / aspect,   0,            0,                          0,

        // Coluna 2: Escala Y (Baseada apenas no FOV)
        0,            f,            0,                          0,

        // Coluna 3: Escala Z e Translação Z
        0,            0,            (near + far) * rangeInv,   -1,

        // Coluna 4: Constante de Profundidade
        0,            0,            near * far * rangeInv * 2,  0
    ]);
}

function subtrairVetores(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function normalizar(v) {
    var len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    if (len > 0.00001) {
        return [v[0] / len, v[1] / len, v[2] / len];
    }
    return [0, 0, 0];
}
function produtoVetorial(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}
function produtoEscalar(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function m4LookAt(eye, target, up) {
    // Eixo Z (Frente da Câmera)
    var zAxis = normalizar(subtrairVetores(eye, target));
    // Eixo X (Direita da Câmera)
    var xAxis = normalizar(produtoVetorial(up, zAxis));
    // Recalculamos o Y para garantir que ele seja perpendicular a X e Z
    var yAxis = produtoVetorial(zAxis, xAxis);
    // A matriz de visão é composta por Rotação (Inversa) e Translação (Inversa)
    var tx = -produtoEscalar(xAxis, eye);
    var ty = -produtoEscalar(yAxis, eye);
    var tz = -produtoEscalar(zAxis, eye);

    return new Float32Array([
        // Coluna 1 (Eixo X)
        xAxis[0], yAxis[0], zAxis[0], 0,
        // Coluna 2 (Eixo Y)
        xAxis[1], yAxis[1], zAxis[1], 0,
        // Coluna 3 (Eixo Z)
        xAxis[2], yAxis[2], zAxis[2], 0,
        // Coluna 4 (Translação)
        tx,       ty,       tz,       1
    ]);
}

function m4RotationMatrix(rx, ry, rz) {
    var mX = m4RotationX(rx);
    var mY = m4RotationY(ry);
    var mZ = m4RotationZ(rz);
    return m4Multiply(mY, m4Multiply(mX, mZ));
}

function m4MultiplyPoint(m, v) { //função usada para calcular colisao
    var x = v[0], y = v[1], z = v[2], w = v[3] || 1;
    return [
        m[0] * x + m[4] * y + m[8] * z + m[12] * w,
        m[1] * x + m[5] * y + m[9] * z + m[13] * w,
        m[2] * x + m[6] * y + m[10] * z + m[14] * w
    ];
}