// leitor.js atualizado

// Adicionamos o parâmetro 'inverterNormais' (padrão é false)
async function carregarOBJ(url, inverterNormais = false) {
    const response = await fetch(url);
    const text = await response.text();

    const positions = [];
    const texCoords = [];
    const normals = [];
    const verticesFinal = [];

    const lines = text.split('\n');
    let temNormaisNoArquivo = false;

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#') || line === '') continue;
        
        const parts = line.split(/\s+/);
        const type = parts[0];

        if (type === 'v') {
            positions.push(parts.slice(1).map(Number));
        } else if (type === 'vt') {
            texCoords.push(parts.slice(1).map(Number));
        } else if (type === 'vn') {
            normals.push(parts.slice(1).map(Number));
            temNormaisNoArquivo = true;
        } else if (type === 'f') {
            const indices = [];
            for (let i = 1; i < parts.length; i++) indices.push(parts[i]);
            
            const numTriangulos = indices.length - 2;
            for(let t = 0; t < numTriangulos; t++) {
                processarVertice(indices[0], positions, texCoords, normals, verticesFinal);
                processarVertice(indices[t+1], positions, texCoords, normals, verticesFinal);
                processarVertice(indices[t+2], positions, texCoords, normals, verticesFinal);
            }
        }
    }

    if (!temNormaisNoArquivo) {
        console.warn(`Calculando normais para ${url} (Inverter: ${inverterNormais})`);
        // Passamos a flag para a função de cálculo
        calcularNormaisAutomaticas(verticesFinal, inverterNormais);
    }

    return new Float32Array(verticesFinal);
}

// Mantém a processarVertice igual...
function processarVertice(specString, positions, texCoords, normals, verticesFinal) {
    const specs = specString.split('/');
    const vIdx = parseInt(specs[0]) - 1;
    verticesFinal.push(...positions[vIdx]);

    if (specs.length > 2 && specs[2] !== "" && normals.length > 0) {
        const vnIdx = parseInt(specs[2]) - 1;
        verticesFinal.push(...normals[vnIdx]);
    } else {
        verticesFinal.push(0, 0, 0); 
    }

    if (specs.length > 1 && specs[1] !== "" && texCoords.length > 0) {
        const vtIdx = parseInt(specs[1]) - 1;
        verticesFinal.push(texCoords[vtIdx][0], texCoords[vtIdx][1]);
    } else {
        verticesFinal.push(0, 0);
    }
}

// Atualizada para receber a flag e inverter a matemática
function calcularNormaisAutomaticas(buffer, inverter) {
    const stride = 8;
    for (let i = 0; i < buffer.length; i += stride * 3) {
        const ax = buffer[i], ay = buffer[i+1], az = buffer[i+2];
        const bx = buffer[i+stride], by = buffer[i+stride+1], bz = buffer[i+stride+2];
        const cx = buffer[i+stride*2], cy = buffer[i+stride*2+1], cz = buffer[i+stride*2+2];

        const ux = bx - ax, uy = by - ay, uz = bz - az;
        const vx = cx - ax, vy = cy - ay, vz = cz - az;

        let nx = uy * vz - uz * vy;
        let ny = uz * vx - ux * vz;
        let nz = ux * vy - uy * vx;

        // AQUI ESTÁ A MÁGICA
        if (inverter) {
            nx = -nx;
            ny = -ny;
            nz = -nz;
        }

        const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
        if (len > 0.00001) {
            nx /= len; ny /= len; nz /= len;
        }

        buffer[i+3] = nx; buffer[i+4] = ny; buffer[i+5] = nz;
        buffer[i+stride+3] = nx; buffer[i+stride+4] = ny; buffer[i+stride+5] = nz;
        buffer[i+stride*2+3] = nx; buffer[i+stride*2+4] = ny; buffer[i+stride*2+5] = nz;
    }
}