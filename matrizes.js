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

// 2. Translação 3D
function m4Translation(tx, ty, tz) {
    return new Float32Array([
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        tx, ty, tz, 1
    ]);
}

// 3. Escala 3D
function m4Scale(sx, sy, sz) {
    return new Float32Array([
        sx, 0,  0,  0,
        0,  sy, 0,  0,
        0,  0,  sz, 0,
        0,  0,  0,  1
    ]);
}

// 4. Rotação no eixo Z (a que você já testou)
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

// 5. Rotação no eixo Y (importante para girar o personagem no chão)
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

// 6. Rotação no eixo X
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
    // 1. Matrizes básicas
    var matTra = m4Translation(translation[0], translation[1], translation[2]);
    var matEsc = m4Scale(scale[0], scale[1], scale[2]);
    
    // 2. Matrizes de rotação individuais
    var mX = m4RotationX(rx);
    var mY = m4RotationY(ry);
    var mZ = m4RotationZ(rz);

    // 3. Combina as rotações: R = RY * RX * RZ (A ordem altera o resultado)
    var matRot = m4Multiply(mY, m4Multiply(mX, mZ));

    // 4. Combina tudo: T * R * S
    var matTemp = m4Multiply(matRot, matEsc);
    var matFinal = m4Multiply(matTra, matTemp);

    return matFinal;
}

function m4Perspective(fovyInDegrees, aspect, near, far) {
    var f = 1.0 / Math.tan(fovyInDegrees * Math.PI / 360);
    var rangeInv = 1 / (near - far);

    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ]);
}

function m4LookAt(cameraPos, target, up) {
    return m4Translation(-cameraPos[0], -cameraPos[1], -cameraPos[2]);
}

function m4RotationMatrix(rx, ry, rz) {
    var mX = m4RotationX(rx);
    var mY = m4RotationY(ry);
    var mZ = m4RotationZ(rz);
    return m4Multiply(mY, m4Multiply(mX, mZ));
}