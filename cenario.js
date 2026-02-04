var Cenario = {
    // Lista de objetos que compõem o mundo
    objetos: {
        piso: { 
            url: "piso.obj", 
            buffer: null, count: 0,
            pos: [0, -1, 0], scale: [2.5, 1.0, 2.5], rot: [0, 0, 0],
            cor: [1, 1, 1], tex: "Tijolo.jpg", usaTextura: true 
        },
        queijo: { 
            url: "queijo.obj", 
            buffer: null, count: 0,
            pos: [5, 0, -10], scale: [1, 1, 1], rot: [0, 0, 0],
            cor: [1.0, 0.8, 0.0], usaTextura: false 
        },
        plantas: { 
            url: "plantas.obj", 
            buffer: null, count: 0,
            pos: [10, 0, -10], scale: [10, 10, 10], rot: [0, 0, 0],
            cor: [0.0, 1.0, 0.0], usaTextura: false 
        }
        // Quer adicionar uma mesa? É só criar um novo item aqui!
    },

    texTijolo: null, // Armazena a textura carregada

    // --- INICIALIZAÇÃO ---
    async init(gl) {
        try {
            // Carrega Textura
            this.texTijolo = this.carregarTextura(gl, "Tijolo.jpg");

            // Carrega todos os modelos da lista 'objetos'
            for (let chave in this.objetos) {
                let obj = this.objetos[chave];
                let dados = await carregarOBJ(obj.url, chave === 'queijo'); // Queijo inverte normais?
                
                if (dados) {
                    obj.buffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, dados, gl.STATIC_DRAW);
                    obj.count = dados.length / 8; // Salva contagem de vértices
                }
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    // --- RENDERIZAÇÃO ---
    desenhar(gl, prog, mVP) {
        // Pega localizações dos uniforms uma vez só
        var uTransf = gl.getUniformLocation(prog, "transf");
        var uModel = gl.getUniformLocation(prog, "u_model");
        var uUseTexture = gl.getUniformLocation(prog, "u_useTexture");
        var uBaseColor = gl.getUniformLocation(prog, "u_baseColor");
        var uTex = gl.getUniformLocation(prog, "tex");

        // Animação do queijo (lógica interna do cenário)
        this.objetos.queijo.rot[1] += 1.0; 

        // Loop genérico para desenhar tudo que existe
        for (let chave in this.objetos) {
            let obj = this.objetos[chave];
            if (!obj.buffer) continue;

            // 1. Configura Material (Textura ou Cor)
            if (obj.usaTextura) {
                gl.uniform1f(uUseTexture, 1.0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texTijolo); // Aqui simplifiquei, se tiver várias texturas precisa de lógica extra
                gl.uniform1i(uTex, 0);
            } else {
                gl.uniform1f(uUseTexture, 0.0);
                gl.uniform3fv(uBaseColor, obj.cor);
            }

            // 2. Calcula Matriz de Modelo
            var mModel = m4ComputeModelMatrix(
                obj.pos, 
                obj.rot[0], obj.rot[1], obj.rot[2], 
                obj.scale
            );

            // 3. Envia Matrizes
            gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModel));
            gl.uniformMatrix4fv(uModel, false, mModel);

            // 4. Desenha
            this.bindGeometria(gl, prog, obj.buffer);
            gl.drawArrays(gl.TRIANGLES, 0, obj.count);
        }
    },

    // Trouxe o bindGeometria para dentro, pois é detalhe de implementação
    bindGeometria(gl, prog, buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        var stride = 8 * 4;
        
        var locPos = gl.getAttribLocation(prog, "position");
        var locNorm = gl.getAttribLocation(prog, "normal");
        var locTex = gl.getAttribLocation(prog, "texCoord");
        
        gl.enableVertexAttribArray(locPos);
        gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(locNorm);
        gl.vertexAttribPointer(locNorm, 3, gl.FLOAT, false, stride, 3 * 4);
        gl.enableVertexAttribArray(locTex);
        gl.vertexAttribPointer(locTex, 2, gl.FLOAT, false, stride, 6 * 4);
    },

    carregarTextura(gl, url) {
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,255,255]));
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            if (isPowerOf2(img.width) && isPowerOf2(img.height)) gl.generateMipmap(gl.TEXTURE_2D);
            else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };
        img.src = url;
        return tex;
    }
};

// Helper simples
function isPowerOf2(value) { return (value & (value - 1)) == 0; }