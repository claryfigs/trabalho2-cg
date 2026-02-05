var Colisao = {
    tamanhoRato: { w: 0.6, h: 1.8, d: 0.6 },

    verificar(novaPos, listaObjetos) {
        
        // 1. Caixa do Rato
        let boxRato = {
            min: [ novaPos[0] - 0.3, novaPos[1], novaPos[2] - 0.3 ],
            max: [ novaPos[0] + 0.3, novaPos[1] + 1.8, novaPos[2] + 0.3 ]
        };

        // 2. Testa Objetos
        for (let nome in listaObjetos) {
            let obj = listaObjetos[nome];
            
            if (nome === 'piso' || !obj.ativo || !obj.boxLocal) continue;

            // --- TAMANHO ORIGINAL (COM ESCALA) ---
            let minX = obj.boxLocal.min[0] * obj.scale[0];
            let maxX = obj.boxLocal.max[0] * obj.scale[0];
            let minZ = obj.boxLocal.min[2] * obj.scale[2];
            let maxZ = obj.boxLocal.max[2] * obj.scale[2];
            
            // Altura (Y) geralmente não gira
            let minY = obj.boxLocal.min[1] * obj.scale[1];
            let maxY = obj.boxLocal.max[1] * obj.scale[1];

            // --- A MÁGICA DA ROTAÇÃO ---
            // Verifica a rotação no eixo Y (rot[1])
            let rotY = Math.abs(obj.rot[1] || 0) % 360;
            
            // Consideramos "girado" se estiver perto de 90 ou 270 graus
            let estaGirado = (rotY > 80 && rotY < 100) || (rotY > 260 && rotY < 280);

            let finalMinX, finalMaxX, finalMinZ, finalMaxZ;

            if (estaGirado) {
                // SE GIROU: O X vira Z, e o Z vira X
                // (Trocamos a largura pela profundidade)
                finalMinX = minZ; 
                finalMaxX = maxZ;
                finalMinZ = minX; 
                finalMaxZ = maxX;
            } else {
                // SE NÃO GIROU: Mantém normal
                finalMinX = minX; 
                finalMaxX = maxX;
                finalMinZ = minZ; 
                finalMaxZ = maxZ;
            }

            // --- CAIXA NO MUNDO ---
            let worldMin = [ obj.pos[0] + finalMinX, obj.pos[1] + minY, obj.pos[2] + finalMinZ ];
            let worldMax = [ obj.pos[0] + finalMaxX, obj.pos[1] + maxY, obj.pos[2] + finalMaxZ ];

            // Correção: Se ao girar o Min ficou maior que o Max, desinverte
            if (worldMin[0] > worldMax[0]) [worldMin[0], worldMax[0]] = [worldMax[0], worldMin[0]];
            if (worldMin[2] > worldMax[2]) [worldMin[2], worldMax[2]] = [worldMax[2], worldMin[2]];

            // --- TESTE AABB ---
            let colideX = (boxRato.min[0] <= worldMax[0] && boxRato.max[0] >= worldMin[0]);
            let colideY = (boxRato.min[1] <= worldMax[1] && boxRato.max[1] >= worldMin[1]);
            let colideZ = (boxRato.min[2] <= worldMax[2] && boxRato.max[2] >= worldMin[2]);

            if (colideX && colideY && colideZ) {
                return { colidiu: true, tipo: 'objeto', nome: nome };
            }
        }

        return { colidiu: false };
    }
};