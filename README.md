#  Caça ao queijo 

##  Visão Geral

Este projeto é uma aplicação gráfica 3D interativa desenvolvida como avaliação final da disciplina de Computação Gráfica. O objetivo central é a implementação de um **motor gráfico (Game Engine) baseado na web**, capaz de renderizar cenas tridimensionais, importar modelos complexos e gerenciar física básica.

Diferente de projetos que utilizam bibliotecas facilitadoras (como Three.js), este sistema foi construído utilizando **WebGL puro (Raw WebGL)** e **JavaScript Vanilla**. Toda a matemática matricial (álgebra linear), o processamento de arquivos `.obj`, o gerenciamento de shaders GLSL e a câmera em primeira pessoa foram implementados do zero, evidenciando o domínio completo do pipeline gráfico programável.

---

##  Arquitetura do Sistema

A estrutura do código foi modularizada para separar responsabilidades entre renderização, lógica de jogo e matemática:

- **`main.js`** O ponto de entrada da aplicação. Configura o contexto WebGL, compila os *shaders* (Vertex e Fragment), gerencia o loop de animação (`requestAnimationFrame`) e controla o estado global (Menu vs. Gameplay). Implementa a lógica de iluminação dinâmica (alternância entre luz ambiente e lanterna).

- **`matrizes.js`** O "motor matemático". Uma biblioteca de álgebra linear implementada manualmente para operar matrizes 4x4. Contém funções cruciais para o 3D, como `m4Perspective` (projeção), `m4LookAt` (câmera), `m4Multiply` (transformações compostas) e operações de rotação/escala/translação.

- **`leitor.js`** Um parser robusto de arquivos Wavefront (.obj). Lê o texto bruto dos modelos 3D, interpreta vértices (`v`), coordenadas de textura (`vt`) e normais (`vn`), e constrói os buffers necessários para a GPU. Inclui um algoritmo para calcular normais automaticamente via produto vetorial caso o arquivo original não as possua.

- **`.js`** Gerencia a cena e os objetos do jogo. Define a posição, escala e rotação de cada entidade (paredes, queijos, móveis). Responsável pelo carregamento de texturas e pela chamada de desenho (`gl.drawArrays`) de cada objeto, enviando as matrizes de modelo e cor para o shader.

- **`colisao.js`** Sistema de detecção de colisões utilizando AABB (*Axis-Aligned Bounding Boxes*). Calcula os limites (min/max) de cada objeto e impede que a câmera atravesse paredes ou móveis, além de detectar a coleta dos queijos.

- **`controles.js`** Processa a entrada do usuário (Mouse e Teclado). Converte os movimentos do mouse em rotação de câmera (Yaw/Pitch) e as teclas WASD em vetores de translação, atualizando a posição do observador no mundo.

---

##  Fluxo de Execução (Pipeline)

1. **Inicialização (`initApp`)**:
   - O sistema inicializa o contexto WebGL e compila os shaders GLSL.
   - Carrega assincronamente os modelos `.obj` e texturas `.jpg`.
   - Gera as *Bounding Boxes* para o sistema de colisão.

2. **Game Loop (`draw`)**:
   - **Update**: Calcula a nova posição da câmera baseada nos inputs e verifica colisões.
   - **Math**: Recalcula as matrizes de Projeção e Visualização (`View Matrix`).
   - **Shading**: Envia para a GPU a posição da luz (Lanterna ou Teto) e a posição da câmera para cálculos especulares.
   - **Render**: Limpa o buffer de cor/profundidade e desenha cada objeto da lista com suas respectivas transformações.

---

##  Principais Funções Implementadas

### 1. `carregarOBJ(url, inverter)` (em *leitor.js*)
**Descrição:** Realiza o parsing manual de arquivos 3D. Lê linha por linha o formato Wavefront, triangulariza as faces e organiza os dados em um *Float32Array* entrelaçado (interleaved) contendo Posição, Normal e Textura.

**Destaque Técnico:** Calcula automaticamente as normais de superfície usando produto vetorial se o modelo não tiver essa informação, garantindo que a iluminação funcione corretamente.

### 2. `m4LookAt(eye, target, up)` (em *matrizes.js*)
**Descrição:** Constrói a matriz de visualização que simula uma câmera. Define o sistema de coordenadas do observador calculando os vetores *Forward*, *Right* e *Up* ortogonais entre si.

### 3. `Cenario.desenhar(gl, prog, mVP)` (em *cenario.js*)
**Descrição:** Itera sobre todos os objetos ativos. Para cada objeto:
1. Verifica se usa textura ou cor sólida.
2. Calcula a Matriz de Modelo (`Model Matrix`) combinando Translação, Rotação e Escala.
3. Multiplica pela matriz View-Projection (`mVP`).
4. Envia os uniformes para o shader e executa o `gl.drawArrays`.

### 4. `alternarLuz()` (em *main.js*)
**Descrição:** Permite ao jogador alternar dinamicamente o tipo de iluminação no shader.
- **Modo Teto:** Luz pontual fixa no topo da sala (iluminação global).
- **Modo Lanterna:** Luz pontual acoplada à posição da câmera (`ratoPos`), criando um efeito de exploração e terror.

---

##  Conceitos de Computação Gráfica Aplicados

- **Pipeline Gráfico Programável:** Uso de Vertex Shaders e Fragment Shaders customizados.
- **Transformações Geométricas:** Manipulação de matrizes 4x4 (Model, View, Projection).
- **Rasterização e Z-Buffer:** Controle de profundidade (`gl.enable(gl.DEPTH_TEST)`) e corte de faces traseiras (`gl.CULL_FACE`).
- **Mapeamento de Textura:** Aplicação de coordenadas UV em malhas 3D.
- **Iluminação Phong/Blinn:** Cálculo de luz difusa e especular nos shaders.
- **Colisão Espacial:** Detecção de interseção AABB (Axis-Aligned Bounding Box).

---

##  Como Executar o Projeto

 **Atenção:** Devido às políticas de segurança dos navegadores (CORS), este projeto não funciona abrindo o arquivo `index.html` diretamente. É necessário um servidor HTTP local para carregar as texturas e modelos.

### Opção 1: Usando VS Code (Recomendado)
1. Instale a extensão **Live Server**.
2. Clique com o botão direito no arquivo `index.html`.
3. Selecione **"Open with Live Server"**.

### Opção 2: Usando Python
Abra o terminal na pasta do projeto e execute:
```bash
# Python 3.x
python -m http.server
```
##🎮 Controles
W, A, S, D: Movimentam o rato.

Mouse: Controla a direção do olhar (Câmera).

F: Alterna a lanterna/luz.

Objetivo: Colete todos os 5 queijos espalhados pelo cenário!    

🎥 Demonstração
(Insira aqui um link para o vídeo ou GIF do projeto rodando)

👨 Equipe
Hildebrando Israel - hildebrando.sales@aluno.uece.br

Samuel Cristhian - samuel.cristhian@aluno.uece.br

Clara Figueiredo - clara.figueiredo@aluno.uece.br