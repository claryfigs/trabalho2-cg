var Colisao = {
    // Definimos o tamanho do corpo do jogador (uma caixa de 0.6 x 1.8 x 0.6)
    tamanhoRato: { w: 0.6, h: 1.8, d: 0.6 },

    // Limites do mundo
    limitesMundo: { xMin: -20, xMax: 20, zMin: -20, zMax: 20 },

    verificar(novaPos, listaObjetos) {
        
        // 1. Paredes do Mundo (Simples)
        if (novaPos[0] < this.limitesMundo.xMin || novaPos[0] > this.limitesMundo.xMax ||
            novaPos[2] < this.limitesMundo.zMin || novaPos[2] > this.limitesMundo.zMax) {
            return { colidiu: true, tipo: 'parede' };
        }

        // 2. Cria a AABB do Rato na posição futura
        // O Rato está centrado no X e Z, mas o pé está no Y (Y vai de 0 a 1.8)
        let boxRato = {
            min: [
                novaPos[0] - this.tamanhoRato.w / 2, 
                novaPos[1], 
                novaPos[2] - this.tamanhoRato.d / 2
            ],
            max: [
                novaPos[0] + this.tamanhoRato.w / 2, 
                novaPos[1] + this.tamanhoRato.h, 
                novaPos[2] + this.tamanhoRato.d / 2
            ]
        };

        // 3. Testa contra todos os objetos
        for (let nome in listaObjetos) {
            let obj = listaObjetos[nome];
            
            // Pula objetos inativos, sem box calculada, ou o próprio piso
            if (nome === 'piso' || !obj.ativo || !obj.boxLocal) continue;

            // --- CÁLCULO DA AABB DO OBJETO NO MUNDO ---
            // Formula: WorldMin = Pos + (LocalMin * Scale)
            // Formula: WorldMax = Pos + (LocalMax * Scale)
            
            // Nota: Se a escala for negativa, precisaria trocar min/max, 
            // mas assumimos escala positiva aqui.
            let worldMin = [
                obj.pos[0] + (obj.boxLocal.min[0] * obj.scale[0]),
                obj.pos[1] + (obj.boxLocal.min[1] * obj.scale[1]),
                obj.pos[2] + (obj.boxLocal.min[2] * obj.scale[2])
            ];

            let worldMax = [
                obj.pos[0] + (obj.boxLocal.max[0] * obj.scale[0]),
                obj.pos[1] + (obj.boxLocal.max[1] * obj.scale[1]),
                obj.pos[2] + (obj.boxLocal.max[2] * obj.scale[2])
            ];

            // --- TESTE DE INTERSEÇÃO AABB ---
            // Para colidir, TEM QUE colidir em X E colidir em Y E colidir em Z
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