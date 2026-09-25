# 🐍 Snake Clássico PRO — Projeto Didático & Arquitetura Comercial 2D

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Phaser 3](https://img.shields.io/badge/Phaser-3.80-FF0000?logo=phaser&logoColor=white)](https://phaser.io)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Bem-vindo ao **Snake Clássico PRO**! Este repositório é uma solução completa desenvolvida para transformar um projeto educacional de jogo da cobrinha em uma **plataforma comercial de jogos 2D completa**, combinando uma versão **Vanilla JS totalmente corrigida** e uma versão em **React 18 + Phaser 3**.

---

## 🌟 O que há de novo nesta versão?

1. **🛠️ 100% Livre de Bugs**: Todos os problemas de física, colisão, pontuação e loop de jogo do projeto original foram auditados e corrigidos.
2. **🎮 6 Modos de Jogo**: Clássico, Velocidade, Obstáculos, Portal, Sobrevivência e Arco-íris.
3. **🕹️ Suporte Multi-Controle**: Teclado (WASD/Setas), Gamepad/Controle USB e **D-Pad Virtual Touch** para celulares e tablets.
4. **🔊 Áudio Procedural (Web Audio API)**: Sintetizador chiptune integrado sem dependência de arquivos de áudio externos.
5. **⚡ Nova Arquitetura em React + Phaser 3**: Separação clara entre a UI reativa e a engine de jogos 2D através de um barramento de eventos (`EventBus`).
6. **🏆 Sistema de Recordes Persistente**: Salvamento automático de High Scores com efeitos de confete (`canvas-confetti`).

---

## 📚 Documentação Técnica (Pasta `docs/`)

Para detalhes arquiteturais avançados e guias do desenvolvedor, consulte a documentação dedicada na pasta [`docs/`](./docs/):

* 🏗️ [**docs/ARCHITECTURE.md**](./docs/ARCHITECTURE.md) — Design do sistema, integração React-Phaser via EventBus e ciclo de vida.
* 🎮 [**docs/GAME_MODES_AND_MECHANICS.md**](./docs/GAME_MODES_AND_MECHANICS.md) — Matemática de pontuação, regras dos 6 modos de jogo e spawner seguro.
* 🛠️ [**docs/CONTRIBUTING_AND_SETUP.md**](./docs/CONTRIBUTING_AND_SETUP.md) — Guia de instalação, comandos e boas práticas para desenvolvedores.
* 🕵️ [**docs/AUDIT_AND_BUGFIXES.md**](./docs/AUDIT_AND_BUGFIXES.md) — Diagnóstico completo dos 7 bugs corrigidos no projeto legado.

---

## 🎮 Os 6 Modos de Jogo

| Modo | Ícone | Descrição das Mecânicas |
| :--- | :---: | :--- |
| **Clássico** | 🎯 | O tradicional jogo da cobra com velocidade constante e paredes fatais. |
| **Velocidade** | ⚡ | Aceleração progressiva a cada nível atingido. |
| **Obstáculos** | 🧱 | Blocos de rocha intransponíveis surgem no mapa de forma não-bloqueante. |
| **Portal** | 🌀 | A cobra atravessa as bordas do mapa e reaparece do lado oposto. |
| **Sobrevivência** | 💀 | Comida estragada surge no mapa. Ao comer, a cobra encolhe e perde pontos. |
| **Arco-íris** | 🌈 | Comidas coloridas concedem pontuações bônus variadas (de +10 a +40 pontos). |

---

## 🚀 Como Executar o Projeto

### 1. Versão Didática Corrigida (Vanilla JS)
Abra diretamente o arquivo `Snake Classico/index.html` em qualquer navegador moderno. Não requer Node.js nem compilação.

---

### 2. Versão Profissional (React + Phaser 3)
Entre na pasta `snake-react-phaser` para executar a versão moderna:

```bash
# Entrar na pasta do projeto React + Phaser 3
cd snake-react-phaser

# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse no navegador: `http://localhost:5173`.

---

## 🏛️ Estrutura do Repositório

```
Snake-Classico/
├── Snake Classico/                 # Versão Didática Vanilla JS (100% Corrigida)
│   ├── index.html
│   ├── css/styles.css
│   └── js/script.js
│
├── snake-react-phaser/             # Versão de Produção Comercial (React + Phaser 3)
│   ├── src/
│   │   ├── components/             # Interface React (HUD, Menu, Game Over, Touch)
│   │   ├── game/                   # Engine Phaser 3 (GameScene, EventBus, SoundEngine)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── docs/                           # Documentação Completa do Projeto
    ├── ARCHITECTURE.md
    ├── GAME_MODES_AND_MECHANICS.md
    ├── CONTRIBUTING_AND_SETUP.md
    └── AUDIT_AND_BUGFIXES.md
```

---

## 🤝 Como Contribuir

Fique à vontade para abrir *Issues* ou enviar *Pull Requests*! Consulte nosso [Guia de Contribuição](./docs/CONTRIBUTING_AND_SETUP.md) antes de enviar suas alterações.

---

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

**Desenvolvido com 💚 por David Creator!**
