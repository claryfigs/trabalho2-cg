async function carregarOBJ(url, inverter = false) {
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
                if (inverter) {
                    // Inverte a ordem (Winding Order) para o CULL_FACE
                    processarVertice(indices[0], positions, texCoords, normals, verticesFinal);
                    processarVertice(indices[t+2], positions, texCoords, normals, verticesFinal);
                    processarVertice(indices[t+1], positions, texCoords, normals, verticesFinal);
                } else {
                    // Ordem padrão (CCW)
                    processarVertice(indices[0], positions, texCoords, normals, verticesFinal);
                    processarVertice(indices[t+1], positions, texCoords, normals, verticesFinal);
                    processarVertice(indices[t+2], positions, texCoords, normals, verticesFinal);
                }
            }
        }
    }

    // Se o arquivo não tinha normais (vn), calculamos via produto vetorial
    if (!temNormaisNoArquivo) {
        console.warn(`Calculando normais para ${url} (Inverter: ${inverter})`);
        calcularNormaisAutomaticas(verticesFinal, inverter);
    }

    return new Float32Array(verticesFinal);
}

function processarVertice(specString, positions, texCoords, normals, verticesFinal) {
    const specs = specString.split('/');
    
    // Vértice (Posição) - Obrigatório
    const vIdx = parseInt(specs[0]) - 1;
    verticesFinal.push(...positions[vIdx]);

    // Normal
    if (specs.length > 2 && specs[2] !== "" && normals.length > 0) {
        const vnIdx = parseInt(specs[2]) - 1;
        verticesFinal.push(...normals[vnIdx]);
    } else {
        // Placeholder para normal (será calculado depois se necessário)
        verticesFinal.push(0, 0, 0); 
    }

    // Coordenada de Textura (UV)
    if (specs.length > 1 && specs[1] !== "" && texCoords.length > 0) {
        const vtIdx = parseInt(specs[1]) - 1;
        verticesFinal.push(texCoords[vtIdx][0], texCoords[vtIdx][1]);
    } else {
        verticesFinal.push(0, 0);
    }
}

function calcularNormaisAutomaticas(buffer, inverter) {
    const stride = 8; // pos(3) + norm(3) + tex(2)
    for (let i = 0; i < buffer.length; i += stride * 3) {
        // Posições dos 3 vértices do triângulo
        const ax = buffer[i], ay = buffer[i+1], az = buffer[i+2];
        const bx = buffer[i+stride], by = buffer[i+stride+1], bz = buffer[i+stride+2];
        const cx = buffer[i+stride*2], cy = buffer[i+stride*2+1], cz = buffer[i+stride*2+2];

        // Vetores das arestas
        const ux = bx - ax, uy = by - ay, uz = bz - az;
        const vx = cx - ax, vy = cy - ay, vz = cz - az;

        // Produto vetorial (Normal)
        let nx = uy * vz - uz * vy;
        let ny = uz * vx - ux * vz;
        let nz = ux * vy - uy * vx;

        // if (inverter) {
        //     nx = -nx; ny = -ny; nz = -nz;
        // }

        // Normalização
        const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
        if (len > 0.00001) {
            nx /= len; ny /= len; nz /= len;
        }

        // Atribui a mesma normal para os 3 vértices do triângulo (Flat Shading)
        for (let j = 0; j < 3; j++) {
            buffer[i + (j * stride) + 3] = nx;
            buffer[i + (j * stride) + 4] = ny;
            buffer[i + (j * stride) + 5] = nz;
        }
    }
}