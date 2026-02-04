var Cenario = {
    objetos: {
        piso: { 
            url: "piso.obj", buffer: null, count: 0, ativo: true,
            pos: [0, -1, 0], scale: [2.5, 1.0, 2.5], rot: [0, 0, 0],
            cor: [1, 1, 1], tex: "Tijolo.jpg", usaTextura: true,
            boxLocal: null // Vai guardar {min: [x,y,z], max: [x,y,z]}
        },
        queijo: { 
            url: "queijo.obj", buffer: null, count: 0, ativo: true,
            pos: [5, 0, -10], scale: [1, 1, 1], rot: [0, 0, 0],
            cor: [1.0, 0.8, 0.0], usaTextura: false,
            boxLocal: null
        },
        plantas: { 
            url: "plantas.obj", buffer: null, count: 0, ativo: true,
            pos: [10, 0, -10], scale: [10, 10, 10], rot: [0, 0, 0],
            cor: [0.0, 1.0, 0.0], usaTextura: false,
            boxLocal: null
        }
    },

    texTijolo: null,

    async init(gl) {
        try {
            this.texTijolo = this.carregarTextura(gl, "Tijolo.jpg");

            for (let chave in this.objetos) {
                let obj = this.objetos[chave];
                let dados = await carregarOBJ(obj.url, chave === 'queijo');
                
                if (dados) {
                    obj.buffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, dados, gl.STATIC_DRAW);
                    obj.count = dados.length / 8;
                    
                    // --- NOVO: Calculamos a caixa AABB local (sem escala/rotação) ---
                    obj.boxLocal = this.calcularAABB(dados);
                }
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    // --- FUNÇÃO NOVA: Descobre o tamanho do objeto bruto ---
    calcularAABB(dados) {
        let min = [Infinity, Infinity, Infinity];
        let max = [-Infinity, -Infinity, -Infinity];
        
        // O stride é 8 (x, y, z, nx, ny, nz, u, v). Pulamos de 8 em 8.
        for (let i = 0; i < dados.length; i += 8) {
            let x = dados[i];
            let y = dados[i+1];
            let z = dados[i+2];

            if (x < min[0]) min[0] = x;
            if (y < min[1]) min[1] = y;
            if (z < min[2]) min[2] = z;

            if (x > max[0]) max[0] = x;
            if (y > max[1]) max[1] = y;
            if (z > max[2]) max[2] = z;
        }
        return { min: min, max: max };
    },

    desenhar(gl, prog, mVP) {
        var uTransf = gl.getUniformLocation(prog, "transf");
        var uModel = gl.getUniformLocation(prog, "u_model");
        var uUseTexture = gl.getUniformLocation(prog, "u_useTexture");
        var uBaseColor = gl.getUniformLocation(prog, "u_baseColor");
        var uTex = gl.getUniformLocation(prog, "tex");

        // Gira o queijo
        if(this.objetos.queijo.ativo) this.objetos.queijo.rot[1] += 1.0; 

        for (let chave in this.objetos) {
            let obj = this.objetos[chave];
            if (!obj.buffer || !obj.ativo) continue;

            if (obj.usaTextura) {
                gl.uniform1f(uUseTexture, 1.0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texTijolo);
                gl.uniform1i(uTex, 0);
            } else {
                gl.uniform1f(uUseTexture, 0.0);
                gl.uniform3fv(uBaseColor, obj.cor);
            }

            var mModel = m4ComputeModelMatrix(obj.pos, obj.rot[0], obj.rot[1], obj.rot[2], obj.scale);
            
            gl.uniformMatrix4fv(uTransf, false, m4Multiply(mVP, mModel));
            gl.uniformMatrix4fv(uModel, false, mModel);

            this.bindGeometria(gl, prog, obj.buffer);
            gl.drawArrays(gl.TRIANGLES, 0, obj.count);
        }
    },

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
    
    carregarTextura(gl, url) { /* ... (seu código de textura igual) ... */ 
        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,255,255]));
        var img = new Image(); img.crossOrigin = "anonymous";
        img.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            if ((img.width & (img.width - 1)) == 0) gl.generateMipmap(gl.TEXTURE_2D);
            else { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); }
        }; img.src = url; return tex;
    }
};