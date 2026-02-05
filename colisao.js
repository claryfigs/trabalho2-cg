var Colisao = {
    tamanhoRato: { w: 0.6, h: 1.8, d: 0.6 },

verificar(novaPos, listaObjetos) {
    // 1. Caixa do Rato (AABB fixa)
    let boxRato = {
        min: [ novaPos[0] - 0.3, novaPos[1], novaPos[2] - 0.3 ],
        max: [ novaPos[0] + 0.3, novaPos[1] + 1.8, novaPos[2] + 0.3 ]
    };

    for (let nome in listaObjetos) {
        let obj = listaObjetos[nome];
        if (nome === 'piso' || !obj.ativo || !obj.boxLocal) continue;

        // 2. Criar os 8 cantos da caixa LOCAL (já com escala)
        let min = [obj.boxLocal.min[0] * obj.scale[0], obj.boxLocal.min[1] * obj.scale[1], obj.boxLocal.min[2] * obj.scale[2]];
        let max = [obj.boxLocal.max[0] * obj.scale[0], obj.boxLocal.max[1] * obj.scale[1], obj.boxLocal.max[2] * obj.scale[2]];

        let cantos = [
            [min[0], min[1], min[2]], [max[0], min[1], min[2]],
            [min[0], max[1], min[2]], [max[0], max[1], min[2]],
            [min[0], min[1], max[2]], [max[0], min[1], max[2]],
            [min[0], max[1], max[2]], [max[0], max[1], max[2]]
        ];

        // 3. Obter matriz de rotação usando sua função do arquivo
        let mRot = m4RotationMatrix(obj.rot[0], obj.rot[1], obj.rot[2]);

        // 4. Transformar cantos e calcular nova AABB global
        let worldMin = [Infinity, Infinity, Infinity];
        let worldMax = [-Infinity, -Infinity, -Infinity];

        for (let i = 0; i < cantos.length; i++) {
            // Gira o ponto
            let pRot = m4MultiplyPoint(mRot, cantos[i]); //rotação da colisão
            
            // Move para a posição do objeto no mundo
            let x = pRot[0] + obj.pos[0];
            let y = pRot[1] + obj.pos[1];
            let z = pRot[2] + obj.pos[2];

            // Atualiza os limites da caixa de colisão
            worldMin[0] = Math.min(worldMin[0], x); worldMax[0] = Math.max(worldMax[0], x);
            worldMin[1] = Math.min(worldMin[1], y); worldMax[1] = Math.max(worldMax[1], y);
            worldMin[2] = Math.min(worldMin[2], z); worldMax[2] = Math.max(worldMax[2], z);
        }

        // 5. Teste AABB simples
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