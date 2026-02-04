var Controles = {
    // Estado interno (Coisas que só o controle precisa saber)
    yaw: -90,
    pitch: 0,
    teclas: { w: false, s: false, a: false, d: false },
    velocidade: 0.2,
    sensibilidade: 0.15,

    // Inicializa os ouvintes de eventos
    init(canvasId) {
        var canvas = document.getElementById(canvasId);
        
        // Mouse Click (Travar ponteiro)
        canvas.addEventListener("mousedown", () => { 
            canvas.requestPointerLock(); 
        });

        // Mouse Move
        document.addEventListener("mousemove", (e) => {
            if (document.pointerLockElement === canvas) {
                // Filtro de movimento brusco
                if (Math.abs(e.movementX) > 300 || Math.abs(e.movementY) > 300) return; 

                this.yaw += e.movementX * this.sensibilidade;
                this.pitch -= e.movementY * this.sensibilidade;

                // Trava de Gimbal (Pescoço)
                if (this.pitch > 89) this.pitch = 89;
                if (this.pitch < -89) this.pitch = -89;
            }
        });

        // Teclado (Down/Up)
        window.addEventListener("keydown", (e) => { 
            var k = e.key.toLowerCase();
            if (this.teclas[k] !== undefined) this.teclas[k] = true; 
        });
        
        window.addEventListener("keyup", (e) => { 
            var k = e.key.toLowerCase();
            if (this.teclas[k] !== undefined) this.teclas[k] = false; 
        });
    },

    // Função que recebe a posição atual e devolve a NOVA posição baseada nas teclas
    atualizarPosicao(posAtual) {
        var radYaw = this.yaw * Math.PI / 180;
        
        // Vetores de direção (no plano XZ, pois não voamos)
        var frenteX = Math.cos(radYaw);
        var frenteZ = Math.sin(radYaw);
        var direitaX = Math.cos(radYaw + Math.PI/2);
        var direitaZ = Math.sin(radYaw + Math.PI/2);

        // Clona a posição para não modificar a original diretamente se não quiser
        // Mas como arrays são referência, vamos modificar direto:
        if (this.teclas.w) { posAtual[0] += frenteX * this.velocidade; posAtual[2] += frenteZ * this.velocidade; }
        if (this.teclas.s) { posAtual[0] -= frenteX * this.velocidade; posAtual[2] -= frenteZ * this.velocidade; }
        if (this.teclas.d) { posAtual[0] += direitaX * this.velocidade; posAtual[2] += direitaZ * this.velocidade; }
        if (this.teclas.a) { posAtual[0] -= direitaX * this.velocidade; posAtual[2] -= direitaZ * this.velocidade; }
        
        return posAtual;
    },

    // Retorna para onde a câmera deve olhar (Target) e onde ela está (Eye)
    getCameraInfo(posRato) {
        // Altura dos olhos
        var olhosPos = [posRato[0], posRato[1] + 0.9, posRato[2]];

        // Cálculo do vetor Frente 3D (agora inclui Pitch para olhar pra cima/baixo)
        var radYaw = this.yaw * Math.PI / 180;
        var radPitch = this.pitch * Math.PI / 180;

        var front = [];
        front[0] = Math.cos(radYaw) * Math.cos(radPitch);
        front[1] = Math.sin(radPitch);
        front[2] = Math.sin(radYaw) * Math.cos(radPitch);

        var target = [
            olhosPos[0] + front[0],
            olhosPos[1] + front[1],
            olhosPos[2] + front[2]
        ];

        return { eye: olhosPos, target: target };
    }
};