var Controles = {
    // Estado interno
    yaw: -90,
    pitch: 0,
    teclas: { w: false, s: false, a: false, d: false },
    velocidade: 0.4,
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
                if (Math.abs(e.movementX) > 300 || Math.abs(e.movementY) > 300) return; 

                this.yaw += e.movementX * this.sensibilidade;
                this.pitch -= e.movementY * this.sensibilidade;

                if (this.pitch > 89) this.pitch = 89;
                if (this.pitch < -89) this.pitch = -89;
            }
        });

        // Teclado (Pressionar)
        window.addEventListener("keydown", (e) => { 
            var k = e.key.toLowerCase();

            // --- NOVO: Tecla F para Alternar Luz ---
            if (k === 'f') {
                // Chama a função global definida no main.js
                if (typeof alternarLuz === "function") {
                    alternarLuz();
                }
            }
            // ---------------------------------------

            if (this.teclas[k] !== undefined) this.teclas[k] = true; 
        });
        
        // Teclado (Soltar)
        window.addEventListener("keyup", (e) => { 
            var k = e.key.toLowerCase();
            if (this.teclas[k] !== undefined) this.teclas[k] = false; 
        });
    },

    // Calcula onde o rato estaria no próximo frame
    simularProximaPosicao(posAtual) {
        var novaPos = [posAtual[0], posAtual[1], posAtual[2]];
        
        var radYaw = this.yaw * Math.PI / 180;
        
        var frenteX = Math.cos(radYaw);
        var frenteZ = Math.sin(radYaw);
        var direitaX = Math.cos(radYaw + Math.PI/2);
        var direitaZ = Math.sin(radYaw + Math.PI/2);

        if (this.teclas.w) { novaPos[0] += frenteX * this.velocidade; novaPos[2] += frenteZ * this.velocidade; }
        if (this.teclas.s) { novaPos[0] -= frenteX * this.velocidade; novaPos[2] -= frenteZ * this.velocidade; }
        if (this.teclas.d) { novaPos[0] += direitaX * this.velocidade; novaPos[2] += direitaZ * this.velocidade; }
        if (this.teclas.a) { novaPos[0] -= direitaX * this.velocidade; novaPos[2] -= direitaZ * this.velocidade; }
        
        return novaPos;
    },

    // Retorna dados para a câmera (LookAt)
    getCameraInfo(posRato) {
        var olhosPos = [posRato[0], posRato[1] + 0.9, posRato[2]];

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