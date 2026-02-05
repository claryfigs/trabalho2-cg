var Cenario = {
    objetos: {
        // --- CHÃO ---
        piso: { 
            url: "piso.obj", buffer: null, count: 0, ativo: true,
            pos: [0, -1, 0], scale: [3, 1.0, 3], rot: [0, 0, 0],
            cor: [1, 1, 1], 
            tex: "Tijolo.jpg", // Define qual textura usar
            usaTextura: true,
            boxLocal: null
        },

        teto: { 
            url: "teto.obj", buffer: null, count: 0, ativo: true,
            pos: [0, 74, 0],       
            scale: [3, 1.0, 3], 
            rot: [180, 0, 0],      
            cor: [1, 1, 1], 
            tex: "Teto.jpg",      
            usaTextura: true, 
            boxLocal: null
        },

        // --- PAREDES (Usando parede.obj) ---
        parede1: { 
            url: "parede.obj", buffer: null, count: 0, ativo: true,
            pos: [0, -1, -75], scale: [3, 5, 1], rot: [0, 0, 0],        
            cor: [0.7, 0.7, 0.7], usaTextura: false, boxLocal: null
        },
        parede2: { 
            url: "parede.obj", buffer: null, count: 0, ativo: true,
            pos: [0, -1, 75], scale: [3, 5, 1], rot: [0, 0, 0],           
            cor: [0.7, 0.7, 0.7], usaTextura: false, boxLocal: null
        },
        parede3: { 
            url: "parede.obj", buffer: null, count: 0, ativo: true,
            pos: [75, -1, 0], scale: [3, 5, 1], rot: [0, 90, 0],          
            cor: [0.7, 0.7, 0.7], usaTextura: false, boxLocal: null
        },
        parede4: { 
            url: "parede.obj", buffer: null, count: 0, ativo: true,
            pos: [-75, -1, 0], scale: [3, 5, 1], rot: [0, 90, 0],          
            cor: [0.7, 0.7, 0.7], usaTextura: false, boxLocal: null
        },

        // --- QUEIJOS ---
        queijo1: { url: "queijo.obj", buffer: null, count: 0, ativo: true, pos: [5, 0, -10], scale: [1, 1, 1], rot: [0, 0, 0], cor: [1.0, 0.8, 0.0], usaTextura: false, boxLocal: null },
        queijo2: { url: "queijo.obj", buffer: null, count: 0, ativo: true, pos: [-10, 0, 5], scale: [1, 1, 1], rot: [0, 45, 0], cor: [1.0, 0.8, 0.0], usaTextura: false, boxLocal: null },
        queijo3: { url: "queijo.obj", buffer: null, count: 0, ativo: true, pos: [0, 0, 15], scale: [1, 1, 1], rot: [0, 90, 0], cor: [1.0, 0.8, 0.0], usaTextura: false, boxLocal: null },
        queijo4: { url: "queijo.obj", buffer: null, count: 0, ativo: true, pos: [-15, 0, -15], scale: [1, 1, 1], rot: [0, 120, 0], cor: [1.0, 0.8, 0.0], usaTextura: false, boxLocal: null },
        queijo5: { url: "queijo.obj", buffer: null, count: 0, ativo: true, pos: [12, 0, 12], scale: [1, 1, 1], rot: [0, 180, 0], cor: [1.0, 0.8, 0.0], usaTextura: false, boxLocal: null },
        
        // comoda:  {
        //     url: "comoda.obj", buffer: null, count: 0, ativo: true,
        //     pos: [-10, -1, -70], scale: [0.2, 0.2, 0.2], rot: [0, -90, 0],
        //     cor: [1.0, 0.7, 0.8], usaTextura: false, boxLocal: null },
        plantas: { 
            url: "plantas.obj", buffer: null, count: 0, ativo: true,
            pos: [10, -1, -10], scale: [10, 10, 10], rot: [0, 0, 0],
            cor: [0.0, 0.35, 0.0], usaTextura: false,
            boxLocal: null
        },
        sofa: {
            url: "sofa.obj", buffer: null, count: 0, ativo: true,
            pos: [0, 0, 50],      
            scale: [25, 25, 25],    
            rot: [0, 180, 0],   
            cor: [0.7, 0.45, 0.5],
            usaTextura: false,
            boxLocal: null
        },

        mesa: {
            url: "mesa.obj", buffer: null, count: 0, ativo: true,
            pos: [-40, -1, -50],      
            scale: [0.3, 0.3, 0.3],    
            rot: [0, 180, 0],   
            cor: [0.1, 0.1, 0.1],
            usaTextura: false,
            boxLocal: null
        },

        prateleira: {
            url: "prateleira.obj", buffer: null, count: 0, ativo: true,
            pos: [0, -1, -70],      
            scale: [5, 5, 5],    
            rot: [0, 90, 0],   
            cor: [0.12, 0.08, 0.03],
            usaTextura: false,
            boxLocal: null
        },

        estante: {
            url: "estante.obj", buffer: null, count: 0, ativo: true,
            pos: [-50, -1, 0],      
            scale: [2, 2, 2],    
            rot: [-90, 90, 0],   
            cor: [0.12, 0.08, 0.03],
            usaTextura: false,
            boxLocal: null
        },

        livros: {
            url: "livros.obj", buffer: null, count: 0, ativo: true,
            pos: [50, -1, 0],      
            scale: [0.08, 0.08, 0.08],    
            rot: [-90, 0, 0],   
            cor: [0.12, 0.08, 0.03],
            usaTextura: false,
            boxLocal: null
        },

        rato1: {
            url: "rato.obj", buffer: null, count: 0, ativo: true,
            pos: [-30, -1.5, 20],      
            scale: [0.08, 0.08, 0.08],    
            rot: [0, 0, 0],   
            cor: [0.12, 0.08, 0.03],
            usaTextura: false,
            boxLocal: null
        },

        rato2: {
            url: "rato.obj", buffer: null, count: 0, ativo: true,
            pos: [-40, -1.5, 20],      
            scale: [0.08, 0.08, 0.08],    
            rot: [0, 0, 0],   
            cor: [0.12, 0.08, 0.03],
            usaTextura: false,
            boxLocal: null
        },
    },

    texturas: {}, 

    async init(gl) {
        try {

            this.texturas["Tijolo.jpg"] = this.carregarTextura(gl, "Tijolo.jpg");
            this.texturas["Teto.jpg"]   = this.carregarTextura(gl, "Teto.jpg");

            for (let chave in this.objetos) {
                let obj = this.objetos[chave];
                

                let deveInverter = chave.startsWith('queijo');
                
                let dados = await carregarOBJ(obj.url, deveInverter);
                
                if (dados) {
                    obj.buffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, dados, gl.STATIC_DRAW);
                    obj.count = dados.length / 8;
                    
                    // Calcula caixa de colisão
                    obj.boxLocal = this.calcularAABB(dados);
                }
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    desenhar(gl, prog, mVP) {
        var uTransf = gl.getUniformLocation(prog, "transf");
        var uModel = gl.getUniformLocation(prog, "u_model");
        var uUseTexture = gl.getUniformLocation(prog, "u_useTexture");
        var uBaseColor = gl.getUniformLocation(prog, "u_baseColor");
        var uTex = gl.getUniformLocation(prog, "tex");

        for (let chave in this.objetos) {
            let obj = this.objetos[chave];
            
            // Se o objeto não carregou ou foi desativado (queijo comido), pula
            if (!obj.buffer || !obj.ativo) continue;

            // Animação dos queijos
            if (chave.startsWith('queijo')) { obj.rot[1] += 1.0; }

            // Configuração de Material
            if (obj.usaTextura) {
                gl.uniform1f(uUseTexture, 1.0);
                gl.activeTexture(gl.TEXTURE0);
                
                // Pega a textura correta do cache. Se não achar, usa Tijolo como padrão.
                // Isso permite que 'piso' use Tijolo.jpg e 'teto' use Teto.jpg
                let nomeTextura = obj.tex || "Tijolo.jpg";
                let texturaGPU = this.texturas[nomeTextura];

                gl.bindTexture(gl.TEXTURE_2D, texturaGPU);
                gl.uniform1i(uTex, 0);
            } else {
                gl.uniform1f(uUseTexture, 0.0);
                gl.uniform3fv(uBaseColor, obj.cor);
            }

            // Matrizes de Transformação
            var mModel = m4ComputeModelMatrix(obj.pos, obj.rot[0], obj.rot[1], obj.rot[2], obj.scale);
            
            gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModel));
            gl.uniformMatrix4fv(uModel, false, mModel);

            // Desenho
            this.bindGeometria(gl, prog, obj.buffer);
            gl.drawArrays(gl.TRIANGLES, 0, obj.count);
        }
    },

    // --- FUNÇÕES UTILITÁRIAS ---

    calcularAABB(dados) {
        let min = [Infinity, Infinity, Infinity];
        let max = [-Infinity, -Infinity, -Infinity];
        // Stride 8 = x, y, z, nx, ny, nz, u, v
        for (let i = 0; i < dados.length; i += 8) {
            let x = dados[i], y = dados[i+1], z = dados[i+2];
            if (x < min[0]) min[0] = x; if (y < min[1]) min[1] = y; if (z < min[2]) min[2] = z;
            if (x > max[0]) max[0] = x; if (y > max[1]) max[1] = y; if (z > max[2]) max[2] = z;
        }
        return { min: min, max: max };
    },

    bindGeometria(gl, prog, buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        var stride = 8 * 4;
        var locPos = gl.getAttribLocation(prog, "position");
        var locNorm = gl.getAttribLocation(prog, "normal");
        var locTex = gl.getAttribLocation(prog, "texCoord");
        gl.enableVertexAttribArray(locPos); gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(locNorm); gl.vertexAttribPointer(locNorm, 3, gl.FLOAT, false, stride, 3 * 4);
        gl.enableVertexAttribArray(locTex); gl.vertexAttribPointer(locTex, 2, gl.FLOAT, false, stride, 6 * 4);
    },
    
    carregarTextura(gl, url) {
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // Pixel azul temporário
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,255,255]));
        var img = new Image(); img.crossOrigin = "anonymous";
        img.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, tex); 
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            if ((img.width & (img.width - 1)) == 0) gl.generateMipmap(gl.TEXTURE_2D);
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