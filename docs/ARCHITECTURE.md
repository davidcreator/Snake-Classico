# 🏗️ Arquitetura do Sistema e Design de Software

Este documento descreve a arquitetura técnica, os padrões de projeto e o fluxo de dados das duas implementações do projeto **Snake Clássico**: a versão **Vanilla JavaScript Corrigida** e a versão de **Produção em React + Phaser 3**.

---

## 1. Visão Geral da Arquitetura

O projeto adota uma evolução em duas camadas para atender tanto a fins didáticos quanto a requisitos de produção comercial de jogos 2D:

```
                  ┌───────────────────────────────────────────┐
                  │           Interface do Usuário            │
                  │   (React 18 + Tailwind CSS + Lucide)     │
                  └─────────────────────┬─────────────────────┘
                                        │
                                 EventBus (Phaser)
                                        │
                  ┌─────────────────────▼─────────────────────┐
                  │          Motor do Jogo (Phaser 3)        │
                  │  - Loop de Animação / Ticks               │
                  │  - Sistema de Partículas & Efeitos Visual │
                  │  - Sintetizador Web Audio API             │
                  └───────────────────────────────────────────┘
```

---

## 2. Padrões de Projeto Aplicados

### A. Barramento de Eventos (EventBus / Observer Pattern)
Para desacoplar a lógica de renderização e física de jogo (Phaser) da interface e overlays reativos (React), utilizamos um barramento de eventos centralizado baseado em `Phaser.Events.EventEmitter`.

* **Comandos React ➔ Phaser**: Pressionar pausa no HUD ou acionar botões no D-Pad touch emite eventos como `'control-direction'` e `'control-pause'`.
* **Atualizações Phaser ➔ React**: Mudanças de pontuação, nível atingido, velocidade e encerramento de partida (*Game Over*) emitem eventos como `'game-update'` e `'game-over'`.

### B. Fila de Entrada por Sub-tick (Input Queue / Command Pattern)
Tanto no jogo Vanilla quanto na versão Phaser 3, os comandos direcionais do jogador não alteram imediatamente o vetor de movimento atual. Em vez disso, os comandos são validados e enfileirados em uma estrutura FIFO (`inputQueue`) com capacidade máxima de 2 itens.
* **Benefício**: Elimina completamente a perda de comandos (*input dropping*) em viradas rápidas (ex: CIMA ➔ ESQUERDA em intervalo menor do que 1 tick) e impede colisões involuntárias de 180° contra o próprio corpo.

### C. Síntese de Áudio Procedural (Web Audio API)
A classe `SoundEngine` encapsula a API nativa de áudio do navegador, criando osciladores (`sine`, `sawtooth`, `triangle`) e nós de ganho dinâmicos para produzir efeitos sonoros no estilo retro/chiptune.
* **Benefício**: Zero latência, sem consumo de banda com downloads de arquivos de áudio externos e imune a erros de carregamento de assets.

---

## 3. Estrutura de Diretórios e Módulos

```
snake-classico/
├── Snake Classico/                 # Versão Didática Vanilla JS (Corrigida)
│   ├── index.html                  # Interface HTML5 e Canvas
│   ├── css/styles.css              # Estilização com temas retro
│   └── js/script.js                # Lógica completa com Web Audio e Fila de Inputs
│
├── snake-react-phaser/             # Arquitetura de Produção (React 18 + Phaser 3)
│   ├── src/
│   │   ├── components/             # Componentes de UI em React
│   │   │   ├── GameCanvas.jsx      # Lifecycle wrapper para o Canvas do Phaser
│   │   │   ├── HUD.jsx             # Barra de status superior reativa
│   │   │   ├── MainMenu.jsx        # Menu principal com seleção de modos
│   │   │   ├── GameOverOverlay.jsx # Modal de Game Over com efeitos de confete
│   │   │   └── MobileControls.jsx  # Controles Virtuais Touch (D-Pad)
│   │   │
│   │   ├── game/                   # Núcleo da Engine do Jogo
│   │   │   ├── EventBus.js         # Event Emitter singleton
│   │   │   ├── SoundEngine.js      # Sintetizador procedural de áudio
│   │   │   └── scenes/
│   │   │       └── GameScene.js    # Cena principal Phaser 3 (Grid, Partículas, Colisões)
│   │   │
│   │   ├── App.jsx                 # Controlador principal de estado React
│   │   ├── index.css               # Importações do Tailwind CSS v4
│   │   └── main.jsx                # Ponto de entrada React DOM
│   │
│   ├── package.json
│   └── vite.config.js              # Configuração do Bundler com suporte a Hosts e HMR
│
└── docs/                           # Documentação Técnica e Guias do Projeto
    ├── ARCHITECTURE.md
    ├── GAME_MODES_AND_MECHANICS.md
    ├── CONTRIBUTING_AND_SETUP.md
    └── AUDIT_AND_BUGFIXES.md
```

---

## 4. Ciclo de Vida da Cena Phaser (`GameScene`)

1. **`init(data)`**: Recebe os parâmetros do modo de jogo selecionado (`classic`, `speed`, `obstacles`, `portal`, `survival`, `rainbow`) e tipo de controle (`keyboard`, `gamepad`, `touch`).
2. **`create()`**:
   * Desenha a grade de fundo.
   * Cria os emissores de partículas (`foodEmitter`).
   * Instancia a cobra e gera os alimentos/obstáculos iniciais.
   * Registra os listeners de teclado, gamepad e `EventBus`.
3. **`update(time)`**:
   * Lê as entradas ativas (Teclado/Gamepad).
   * Executa a etapa de física e lógica (`step()`) a cada intervalo fixo (`moveInterval`).
   * Renderiza os gráficos atualizados no objeto `Graphics`.
