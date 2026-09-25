# 🐍 Relatório de Auditoria e Refatoração de Jogos 2D
**House Software | Diagnóstico Técnico e Soluções Arquiteturais**  
**Lead Game Developer:** Especialista em Jogos 2D com React + Phaser  
**Data:** 25 de Setembro de 2026  

---

## 1. Visão Geral do Diagnóstico

Avaliamos o repositório publico **Snake Clássico** (`https://github.com/davidcreator/Snake-Classico`). O projeto possui um ótimo valor didático, mas apresenta **falhas críticas de lógica, bugs de escopo, vazamentos de memória no loop de gamepad, desaceleração/aceleração descontrolada do loop de jogo e ausência de uma arquitetura escalável** para jogos comerciais de navegadores e dispositivos móveis.

Para solucionar os problemas de forma definitiva, realizamos duas intervenções principais:

1. **Correção Direta no Código Legado (Vanilla JS)**: Eliminamos todos os bugs bloqueantes, corrigimos a lógica de pontuação, encolhimento, colisões, filas de entrada e otimização do Gamepad API.
2. **Nova Arquitetura de Produção (React + Phaser 3)**: Criamos uma versão moderna no diretório `snake-react-phaser`, separando a camada de UI (React) da engine de jogo e renderização canvas (Phaser 3) através de um barramento de eventos (`EventBus`).

---

## 2. Detalhamento dos Bugs Identificados no Projeto Original

### 🔴 Bug 1: Acesso a Variável Não Inicializada em `generateFood()`
* **Arquivo**: `js/script.js` (Linhas 206-216)
* **Causa Raiz**: Na criação do objeto `newFood`, a propriedade `points` chamava `getColorPoints(newFood?.color)`. Contudo, no momento em que a expressão da direita do operador `=` está sendo avaliada, a variável `newFood` ainda não foi atribuída, resultando em `undefined`.
* **Impacto**: O cálculo de pontos no Modo Arco-íris (`colorfulFood`) sempre caía no valor padrão `10`, inutilizando a mecânica de comidas coloridas com pontuações variadas.
* **Solução**: Atribuição prévia da cor em constante isolada antes da montagem do objeto da comida.

---

### 🔴 Bug 2: Mecânica de Encolhimento Quebrada no Modo Sobrevivência
* **Arquivo**: `js/script.js` (Linhas 342-348)
* **Causa Raiz**: Quando a cobra comia a comida ruim (`badFood`), o código executava `snake.unshift(head)` no início do movimento (aumentando o tamanho em +1) e `snake.pop()` na condicional (reduzindo em -1).
* **Impacto**: A cobra **não encolhia**. Ela mantinha exatamente o mesmo tamanho ao comer a comida ruim, anulando a penalidade principal do Modo Sobrevivência.
* **Solução**: Inclusão do segundo `snake.pop()` quando a comida ruim é consumida, garantindo uma redução líquida de -1 segmento no corpo da cobra.

---

### 🔴 Bug 3: Aceleração Descontrolada do Loop do Jogo (`setTimeout` Stacking)
* **Arquivo**: `js/script.js` (Funções `togglePause`, `restartGame`, `startGame`)
* **Causa Raiz**: O jogo utilizava recursão assíncrona simples com `setTimeout(gameLoop, gameSpeed)`. Ao pausar/despausar rapidamente ou reiniciar a partida, novos temporizadores eram disparados sem cancelar o temporizador em andamento.
* **Impacto**: O jogo acumulava múltiplos loops concorrentes, fazendo a cobra se mover 2x, 3x ou até 10x mais rápido em poucos segundos.
* **Solução**: Rastreamento global do identificador `gameLoopTimeout` com chamadas preventivas a `clearTimeout(gameLoopTimeout)`. Na versão Phaser 3, a gestão de ticks foi migrada para o loop de cena nativo com delta time.

---

### 🔴 Bug 4: Perda de Comandos e Colisão Involuntária em 180 Graus (Input Drop)
* **Arquivo**: `js/script.js` (Função `changeDirection`)
* **Causa Raiz**: A flag booleana `changingDirection` bloqueava novas teclas até o final do quadro. Caso o jogador pressionasse duas setas em sequência rápida (ex: BAIXO depois ESQUERDA), o segundo comando era sumariamente ignorado.
* **Impacto**: O controle parecia "duro" e lento para jogadores ágeis, levando a mortes injustas.
* **Solução**: Implementação de uma **Fila de Entrada (Input Queue)** com capacidade de armazenar até 2 comandos por tick do jogo.

---

### 🔴 Bug 5: Vazamento de Performance e Ciclos no Gamepad API
* **Arquivo**: `js/script.js` (Função `gamepadLoop`)
* **Causa Raiz**: O loop `requestAnimationFrame(gamepadLoop)` era executado continuamente, mesmo quando o jogo estava pausado, no menu principal ou quando a opção Teclado estava selecionada.
* **Impacto**: Consumo desnecessário de CPU/GPU e possíveis travamentos em navegadores móbiles e notebooks.
* **Solução**: Controle de ciclo de vida para `gamepadLoop` iniciando/encerrando a animação de acordo com a seleção ativa de controles e estado do jogo.

---

### 🔴 Bug 6: Geração Injusta de Obstáculos ao Subir de Nível
* **Arquivo**: `js/script.js` (Função `generateObstacles`)
* **Causa Raiz**: A regeneração de obstáculos no meio da partida limpava e recriava blocos aleatórios sem checar a trajetória futura da cobra, podendo gerar paredes diretamente na frente da cabeça do jogador ou trancá-lo em uma caixa sem saída.
* **Solução**: Algoritmo não-destrutivo que adiciona novos obstáculos mantendo um raio de segurança dinâmico em relação à cabeça e trajetória da cobra.

---

### 🔴 Bug 7: Ausência de Feedback Sonoro (Audio SFX)
* **Impacto**: A experiência de jogo era silenciosa, diminuindo o engajamento e a imersão do jogador.
* **Solução**: Integração de um sintetizador chiptune via **Web Audio API** no projeto Vanilla e no projeto React + Phaser 3, sem dependência de arquivos de áudio externos que pudessem falhar no carregamento.

---

## 3. Comparativo de Arquiteturas: Vanilla JS vs. React + Phaser 3

| Atributo | Projeto Original (Vanilla Fix) | Nova Arquitetura (React + Phaser 3) |
| :--- | :--- | :--- |
| **Gerenciamento de Estado** | Variáveis globais mutáveis | React State + Phaser EventBus |
| **Renderização** | Imperativa Canvas 2D manual | Engine Phaser 3 com WebGL / Canvas híbrido |
| **Efeitos Visuais** | Desenhos estáticos de retângulos | Emissores de partículas, gradientes, câmera shake |
| **Inpu System** | Event Listeners diretos | Fila de inputs por sub-tick + suporte a Touch / D-Pad |
| **Responsividade** | Canvas fixo de 600x600px | Escalonamento nativo com `Phaser.Scale.FIT` e Tailwind CSS |
| **Manutenibilidade** | Arquivo monolítico de ~700 linhas | Componentes modularizados em JSX e Cenas Phaser |

---

## 4. Como Executar e Testar os Projetos

### Versão Corrigida (Vanilla JS)
Abra a pasta `snake-classico/Snake Classico/index.html` diretamente no navegador.

### Versão de Produção (React + Phaser 3)
Inicie o servidor de desenvolvimento na pasta `snake-react-phaser`:
```bash
cd snake-react-phaser
npm install
npm run dev
```
Acesse a aplicação no navegador em `http://localhost:5173`.

---

## 5. Conclusão e Próximos Passos
O projeto **Snake Clássico** agora está 100% corrigido e otimizado na sua versão Vanilla, e conta com uma arquitetura moderna e escalável em **React + Phaser 3**, pronta para servir de base para novos jogos da house software.
