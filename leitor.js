async function carregarOBJ(url) {
    const response = await fetch(url);
    const text = await response.text();

    const positions = [];
    const texCoords = [];
    const normals = [];
    const verticesFinal = [];

    const lines = text.split('\n');

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#') || line === '') continue; // Pula comentários e linhas vazias
        
        const parts = line.split(/\s+/);
        const type = parts[0];

        if (type === 'v') {
            positions.push(parts.slice(1).map(Number));
        } else if (type === 'vt') {
            texCoords.push(parts.slice(1).map(Number));
        } else if (type === 'vn') {
            normals.push(parts.slice(1).map(Number));
        } else if (type === 'f') {
            for (let i = 1; i < parts.length; i++) {
                // O formato da face pode ser: v, v/vt, v/vt/vn ou v//vn
                const specs = parts[i].split('/');
                
                // 1. Posição (Sempre existe)
                const vIdx = parseInt(specs[0]) - 1;
                verticesFinal.push(...positions[vIdx]);

                // 2. Normal (NX, NY, NZ) - Se não existir, põe 0,0,1 como padrão
                if (specs.length > 2 && specs[2] !== "" && normals.length > 0) {
                    const vnIdx = parseInt(specs[2]) - 1;
                    verticesFinal.push(...normals[vnIdx]);
                } else {
                    verticesFinal.push(0, 0, 1); 
                }

                // 3. UV (U, V) - Se não existir, põe 0,0 como padrão
                if (specs.length > 1 && specs[1] !== "" && texCoords.length > 0) {
                    const vtIdx = parseInt(specs[1]) - 1;
                    verticesFinal.push(texCoords[vtIdx][0], texCoords[vtIdx][1]);
                } else {
                    verticesFinal.push(0, 0);
                }
            }
        }
    }

    return new Float32Array(verticesFinal);
}