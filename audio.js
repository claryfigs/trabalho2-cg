var AudioGerenciador = {

    trilhaMenu: new Audio("músicas/musica_menu.mp3"),
    trilhaJogo: new Audio("músicas/musica_jogo.mp3"),
    fxVitoria:  new Audio("músicas/som_vitoria.mp3"),

    init() {
        this.trilhaMenu.loop = true;  
        this.trilhaJogo.loop = true;  
        this.fxVitoria.loop = false;  


        this.trilhaMenu.volume = 0.5;
        this.trilhaJogo.volume = 0.3; 
        this.fxVitoria.volume = 0.8;
    },

    tocarMenu() {
        this.pararTudo();
        this.trilhaMenu.play().catch(e => console.log("Aguardando interação para tocar áudio..."));
    },

    tocarJogo() {
        this.pararTudo();
        this.trilhaJogo.currentTime = 0;
        this.trilhaJogo.play();
    },

    tocarVitoria() {
        this.pararTudo();
        this.fxVitoria.currentTime = 0;
        this.fxVitoria.play();
    },

    pararTudo() {
        this.trilhaMenu.pause();
        this.trilhaMenu.currentTime = 0;

        this.trilhaJogo.pause();
        this.trilhaJogo.currentTime = 0;

        this.fxVitoria.pause();
        this.fxVitoria.currentTime = 0;
    }
};