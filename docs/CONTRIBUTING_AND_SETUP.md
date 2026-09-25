# 🛠️ Guia do Desenvolvedor e Configuração do Ambiente

Este documento traz as instruções para executar, testar e contribuir para o repositório **Snake Clássico**.

---

## 1. Pré-requisitos do Sistema

* **Node.js**: Versão 18.0.0 ou superior (Recomendado v20.x).
* **NPM**: Versão 9.x ou superior.
* **Navegador**: Qualquer navegador moderno com suporte a HTML5 Canvas, WebGL e Web Audio API (Chrome, Edge, Firefox, Safari, Brave).

---

## 2. Passo a Passo de Instalação e Execução

### Clonar o Repositório
```bash
git clone https://github.com/davidcreator/Snake-Classico.git
cd Snake-Classico
```

---

### Opção A: Executar a Versão Vanilla JS (Didática)
Não necessita de etapa de build ou pacotes Node.js:
1. Abra o arquivo `Snake Classico/index.html` em qualquer navegador web.
2. Ou utilize a extensão **Live Server** do VS Code para recarregamento automático.

---

### Opção B: Executar a Versão React + Phaser 3 (Produção)
1. Navegue para o diretório da aplicação React:
   ```bash
   cd snake-react-phaser
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:5173` no navegador.

---

## 3. Scripts Disponíveis no `snake-react-phaser`

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Vite com recarregamento rápido (HMR) e suporte a hosts |
| `npm run build` | Compila os minificados para produção no diretório `dist/` |
| `npm run preview` | Executa o build compilado localmente para testes de produção |

---

## 4. Padrões de Código e Guia de Contribuição

Ao enviar Pull Requests para o repositório, siga as boas práticas estabelecidas pela house software:

1. **Clean Code e Nomenclatura**:
   * Utilize `camelCase` para variáveis e funções (`generateFood`, `isPositionOccupied`).
   * Utilize `PascalCase` para componentes React e classes Phaser (`GameCanvas`, `GameScene`).
2. **Desacoplamento por Eventos**:
   * Nunca faça mutação direta no Canvas do Phaser a partir de um componente React. Utilize sempre o `EventBus.emit()` e `EventBus.on()`.
3. **Gestão de Memória no Phaser**:
   * Certifique-se de remover todos os ouvintes do `EventBus` e limpar temporizadores no evento `shutdown` da cena Phaser para evitar vazamentos de memória.
