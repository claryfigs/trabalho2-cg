var Menu = {
    estado: "MENU", 

    init() {
        document.getElementById("btn-jogar").addEventListener("click", () => this.mostrarObjetivo());
        
        document.getElementById("btn-comecar-missao").addEventListener("click", () => this.iniciarJogoReal());

        document.getElementById("btn-sair").addEventListener("click", () => this.sairDoJogo());
        document.getElementById("btn-voltar").addEventListener("click", () => this.voltarAoMenu());
    },

    mostrarObjetivo() {
        document.getElementById("tela-menu").style.display = "none";
        document.getElementById("tela-objetivo").style.display = "flex";
    },

    iniciarJogoReal() {
        this.estado = "JOGANDO";
        AudioGerenciador.tocarJogo();
        document.getElementById("tela-objetivo").style.display = "none";
        document.getElementById("tela-ranking").style.display = "none";
        
        document.getElementById("ui-jogo").style.display = "block";
        document.getElementById("glcanvas1").style.display = "block";

        resetarJogo(); 
    },

    finalizarJogo(tempoFinal) {
        this.estado = "RANKING";
        AudioGerenciador.tocarVitoria();
        document.getElementById("display-tempo-atual").innerText = tempoFinal;
        this.salvarRecorde(parseFloat(tempoFinal));

        document.getElementById("ui-jogo").style.display = "none";
        document.getElementById("glcanvas1").style.display = "none";
        document.getElementById("ui-vitoria").style.display = "none";
        document.getElementById("tela-ranking").style.display = "flex";

        this.renderizarRanking();
    },

    sairDoJogo() {
        alert("Obrigado por jogar! Saindo...");
        window.close();
        location.reload(); 
    },

    voltarAoMenu() {
        AudioGerenciador.tocarMenu();
        document.getElementById("tela-ranking").style.display = "none";
        document.getElementById("tela-menu").style.display = "flex";
    },

    salvarRecorde(tempo) {
        let ranking = JSON.parse(localStorage.getItem('ratoRanking')) || [];
        let nome = prompt("Novo Recorde! Digite seu nome:", "Jogador");
        if(!nome) nome = "Anônimo";
        ranking.push({ nome: nome, tempo: tempo });
        ranking.sort((a, b) => a.tempo - b.tempo);
        ranking = ranking.slice(0, 5);
        localStorage.setItem('ratoRanking', JSON.stringify(ranking));
    },

    renderizarRanking() {
        let lista = document.getElementById("lista-ranking");
        lista.innerHTML = ""; 
        let ranking = JSON.parse(localStorage.getItem('ratoRanking')) || [];

        if (ranking.length === 0) {
            lista.innerHTML = "<li>Nenhum recorde ainda. Jogue agora!</li>";
            return;
        }

        ranking.forEach((recorde, index) => {
            let li = document.createElement("li");
            li.innerText = `${index + 1}. ${recorde.nome} - ${recorde.tempo}s`;
            if(index === 0) li.style.color = "#FFD700"; 
            lista.appendChild(li);
        });
    }
};