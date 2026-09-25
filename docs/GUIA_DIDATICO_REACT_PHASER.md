# 🎓 Guia Didático: Desenvolvimento de Jogos 2D com React + Phaser 3

> **Bem-vindo estudante de gamedev!** Este guia foi criado especialmente para você que está aprendendo a desenvolver jogos modernos para navegadores e celulares utilizando **React** e **Phaser 3**.

---

## 📖 Sumário
1. [Por que unir React e Phaser?](#1-por-que-unir-react-e-phaser)
2. [O Conceito Fundamental: Divisão de Responsabilidades](#2-o-conceito-fundamental-divisão-de-responsabilidades)
3. [A Regra de Ouro da Performance](#3-a-regra-de-ouro-da-performance)
4. [O Padrão EventBus (Ponte entre React e Phaser)](#4-o-padrão-eventbus-ponte-entre-react-e-phaser)
5. [Anatomia do Código Passo a Passo](#5-anatomia-do-código-passo-a-passo)
6. [Estudo de Caso Prático: O Jogo Snake](#6-estudo-de-caso-prático-o-jogo-snake)
7. [Principais Erros de Iniciantes (e como evitá-los)](#7-principais-erros-de-iniciantes-e-como-evitá-los)
8. [Desafios Práticos de Aprendizado](#8-desafios-práticos-de-aprendizado)

---

## 1. Por que unir React e Phaser?

Quando começamos a criar jogos para a web, nos deparamos com dois mundos diferentes:

| Tecnologia | Para que serve no Jogo? | Exemplos de uso |
| :--- | :--- | :--- |
| **React** | **Interface de Usuário (UI / DOM)** | Menus, botões, modais, placar de líderes, loja de itens, HUD de vida e pontos. |
| **Phaser 3** | **Motor de Jogo (Canvas 2D / WebGL)** | Movimentação de personagens, física, partículas, colisões, sons, gráficos e loop de animação. |

### Por que não usar apenas React?
O React é incrível para criar interfaces web, mas **não foi feito para rodar um loop de física a 60 quadros por segundo (60 FPS)**. Se você tentar mover um personagem atualizando o estado do React (`useState`) a cada frame, o jogo ficará lento e travado.

### Por que não usar apenas Phaser?
O Phaser é um motor de jogos 2D sensacional, mas criar formulários, telas de menu complexas, botões responsivos e listas com rolagem puramente dentro do Canvas do Phaser exige muito código manual e trabalhoso.

**Solução Perfeita:** Usar o **React para a interface (UI)** em cima da tela e o **Phaser para o jogo (Canvas)** no fundo!

---

## 2. O Conceito Fundamental: Divisão de Responsabilidades

Imagine o seu jogo como um estúdio de cinema:

* **O Phaser é o Palco e os Atores**: É onde a ação acontece, as luzes brilham, a física funciona e os atores se movimentam.
* **O React é o Painel de Controle da Direção**: É onde ficam os botões de Pausar, o Placar de Pontos do público e a Tela de Game Over.

```
+-------------------------------------------------------------+
|                      APLICAÇÃO REACT                        |
|                                                             |
|  +-------------------------------------------------------+  |
|  |                HUD / PLACAR (React)                   |  |
|  |  Pontos: 150  |  Nível: 2  | [⏸️ Pausar]              |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  |                                                       |  |
|  |                 CANVAS DO PHASER 3                    |  |
|  |                                                       |  |
|  |           🐍  . . .             🍎                    |  |
|  |                                                       |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
```

---

## 3. A Regra de Ouro da Performance

> ⚠️ **REGRA DE OURO:** NUNCA atualize o estado do React (`useState`) dentro da função `update()` do Phaser a cada frame!

* **O que acontece se você fizer isso?** O React vai tentar re-renderizar o componente 60 vezes por segundo, travando o navegador do jogador.
* **Como fazer do jeito certo?** O Phaser guarda a posição das coisas na sua própria memória. Ele só avisa o React quando algo **importante** acontece (ex: o jogador ganhou 10 pontos ou perdeu a partida).

---

## 4. O Padrão EventBus (Ponte entre React e Phaser)

Para que o React e o Phaser conversem sem se acoplarem bagunçadamente, usamos um **Barramento de Eventos (EventBus)**. Funciona como um "Rádio Walkie-Talkie":

```
[ Canvas do Phaser ] ────( Emite evento: 'game-over' )────> [ EventBus ] ────( Atualiza estado )────> [ Overlay React ]
```

### Criando o EventBus (`EventBus.js`):
```javascript
import Phaser from 'phaser';

// Criamos uma instância do transmissor de eventos do Phaser
export const EventBus = new Phaser.Events.EventEmitter();
```

### Exemplo 1: O Phaser avisa o React que o jogador pontuou
Dentro da sua cena do Phaser (`GameScene.js`):
```javascript
// Quando a cobra come a comida
this.score += 10;

// O Phaser avisa o mundo exterior que os pontos mudaram!
EventBus.emit('game-update', { score: this.score });
```

No seu componente React (`HUD.jsx`):
```jsx
useEffect(() => {
    // Escutando a mensagem do Phaser
    const escutarPontos = (dados) => {
        setPontos(dados.score);
    };

    EventBus.on('game-update', escutarPontos);

    // Limpeza ao fechar a tela (MUITO IMPORTANTE!)
    return () => {
        EventBus.off('game-update', escutarPontos);
    };
}, []);
```

---

## 5. Anatomia do Código Passo a Passo

### Passo 1: Como montar o Canvas do Phaser dentro do React (`GameCanvas.jsx`)

Usamos o `useRef` para segurar uma referência do elemento HTML `div` e o `useEffect` para iniciar o Phaser assim que a tela carregar:

```jsx
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../game/scenes/GameScene';

export function GameCanvas({ modo }) {
    const conteinerRef = useRef(null);
    const jogoRef = useRef(null);

    useEffect(() => {
        // Configurações iniciais do Phaser
        const config = {
            type: Phaser.AUTO, // Escolhe WebGL ou Canvas automaticamente
            width: 600,
            height: 600,
            parent: conteinerRef.current, // Onde o canvas será inserido
            backgroundColor: '#0a0a0a',
            scene: [GameScene]
        };

        // Instancia o jogo
        const jogo = new Phaser.Game(config);
        jogoRef.current = jogo;

        // Inicia a cena passando parâmetros
        jogo.scene.start('GameScene', { modo });

        // Destrói o jogo adequadamente quando o componente for desmontado
        return () => {
            if (jogoRef.current) {
                jogoRef.current.destroy(true);
            }
        };
    }, [modo]);

    return <div ref={conteinerRef} className="game-container" />;
}
```

---

### Passo 2: A Estrutura de uma Cena Phaser (`GameScene.js`)

Toda cena do Phaser possui 4 fases principais no seu ciclo de vida:

```javascript
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    // 1. INIT: Recebe dados e inicializa variáveis
    init(data) {
        this.modo = data.modo || 'classic';
        this.score = 0;
    }

    // 2. PRELOAD: Carrega imagens, sons e recursos
    preload() {
        // Ex: this.load.image('maca', 'assets/maca.png');
    }

    // 3. CREATE: Constrói os objetos na tela no início da partida
    create() {
        this.cobra = [{ x: 10, y: 10 }];
        this.direcao = { x: 1, y: 0 };
        
        // Configura o teclado
        this.teclas = this.input.keyboard.createCursorKeys();
    }

    // 4. UPDATE: Executa continuamente a cada frame (Game Loop)
    update(time, delta) {
        // Aqui checamos os comandos e atualizamos a posição dos objetos
    }
}
```

---

## 6. Estudo de Caso Prático: O Jogo Snake

No nosso projeto **Snake Clássico PRO**, aplicamos conceitos avançados de gamedev que você pode estudar e replicar:

### Concept A: Fila de Comandos (Input Queue)
Para evitar que a cobra trave ou colida em si mesma ao apertar duas setas muito rápido:
```javascript
// Em vez de mudar a direção na hora, guardamos numa fila:
if (this.inputQueue.length < 2) {
    this.inputQueue.push(novaDirecao);
}

// Dentro do loop de movimento, tiramos o primeiro comando da fila:
if (this.inputQueue.length > 0) {
    const proximaDirecao = this.inputQueue.shift();
    // Impede virada instantânea de 180 graus
    if (proximaDirecao.x !== -this.direcao.x) {
        this.direcao = proximaDirecao;
    }
}
```

### Concept B: Síntese de Som Sem Arquivos Externos (Web Audio API)
Podemos criar sons retrô diretamente por código, sem precisar carregar arquivos `.mp3`!

```javascript
function tocarSomComer() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const ganho = audioCtx.createGain();

    osc.connect(ganho);
    ganho.connect(audioCtx.destination);

    // Frequência subindo rapidamente (som de "nham!")
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}
```

---

## 7. Principais Erros de Iniciantes (e como evitá-los)

| ❌ Erro Comum | 💥 O que acontece? | ✅ Como corrigir da forma certa? |
| :--- | :--- | :--- |
| **Colocar `useState` no loop do jogo** | Jogo fica extremamente lento e travado | Use `EventBus.emit()` apenas em momentos marcantes (pontuou, mudou de nível, game over). |
| **Esquecer de limpar o EventBus (`off`)** | Eventos duplicam e a pontuação sobe 2x, 3x mais rápido | Sempre retorne uma função de limpeza no `useEffect` do React removendo os listeners. |
| **Criar múltiplos `setTimeout` sem limpar** | A cobra começa a andar em super-velocidade | Use o próprio `update()` do Phaser com medição de tempo (`time - lastMoveTime`). |
| **Não destruir a instância do Phaser no unmount** | Múltiplos canvas se acumulam na página consumindo memória | Execute `game.destroy(true)` na função de limpeza do `useEffect`. |

---

## 8. Desafios Práticos de Aprendizado 🚀

Quer testar seus conhecimentos e evoluir no projeto? Tente implementar os desafios abaixo no código do projeto:

### 🟢 Nível 1: Iniciante
1. **Modificador de Tamanho**: Mude a cor da cabeça da cobra para dourado quando ela atingir 100 pontos.
2. **Nova Fruta Bônus**: Crie uma fruta especial que pisca e dura apenas 5 segundos na tela.

### 🟡 Nível 2: Intermediário
1. **Item Imunidade**: Adicione um power-up de "Escudo" que permite a cobra atravessar um obstáculo sem morrer.
2. **Efeito Sonoro de Nível**: Crie uma melodia de 3 notas usando a `Web Audio API` quando o jogador subir de nível.

### 🔴 Nível 3: Avançado
1. **Modo Imã**: Crie um power-up que atrai as comidas próximas na direção da cabeça da cobra.
2. **Placar Global**: Conecte o formulário de Game Over a uma API/Firebase para salvar o nome do jogador e mostrar um ranking online em React.

---

**Bons estudos e divirta-se criando jogos incríveis com React + Phaser 3! 🚀🐍**
