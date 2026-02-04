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

function m4LookAt(eye, target, up) {
    //  Calcula os eixos da câmera (Z, X, Y)
    // Zc = normalize(eye - target)
    var z0 = eye[0] - target[0];
    var z1 = eye[1] - target[1];
    var z2 = eye[2] - target[2];
    var lenZ = Math.sqrt(z0*z0 + z1*z1 + z2*z2);
    z0 /= lenZ; z1 /= lenZ; z2 /= lenZ;

    // Xc = normalize(cross(up, Zc))
    var x0 = up[1] * z2 - up[2] * z1;
    var x1 = up[2] * z0 - up[0] * z2;
    var x2 = up[0] * z1 - up[1] * z0;
    var lenX = Math.sqrt(x0*x0 + x1*x1 + x2*x2);
    x0 /= lenX; x1 /= lenX; x2 /= lenX;

    // Yc = cross(Zc, Xc)
    var y0 = z1 * x2 - z2 * x1;
    var y1 = z2 * x0 - z0 * x2;
    var y2 = z0 * x1 - z1 * x0;

    // Cria a matriz de translação inversa e a matriz de rotação da câmera
    // No final, retornamos R * T
    return new Float32Array([
        x0, y0, z0, 0,
        x1, y1, z1, 0,
        x2, y2, z2, 0,
        -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
        -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
        -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]),
        1
    ]);
}

function m4RotationMatrix(rx, ry, rz) {
    var mX = m4RotationX(rx);
    var mY = m4RotationY(ry);
    var mZ = m4RotationZ(rz);
    return m4Multiply(mY, m4Multiply(mX, mZ));
}