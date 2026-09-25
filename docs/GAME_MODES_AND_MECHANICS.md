# 🎮 Modos de Jogo e Mecânicas Detalhadas

Este documento especifica a matemática de pontuação, algoritmos de geração e mecânicas dos **6 modos de jogo** disponíveis no **Snake Clássico**.

---

## 1. Regras Gerais da Grade e Movimentação

* **Tamanho do Campo**: 600px × 600px.
* **Tamanho do Bloco (Grid Size)**: 24px (Grade de 25 × 25 células).
* **Movimento Mínimo**: 1 célula por tick de jogo.
* **Tamanho Inicial da Cobra**: 3 segmentos (Cabeça + 2 blocos de corpo).
* **Posição Inicial**: Célula central `(12, 12)`, movendo-se para a direita (`dx = 1, dy = 0`).

---

## 2. Modos de Jogo Especificados

### 🎯 1. Modo Clássico (`classic`)
* **Descrição**: A experiência tradicional do jogo da cobrinha.
* **Velocidade**: Fixa em 140ms por tick.
* **Paredes**: Fatais (colisão com as bordas causa Game Over).
* **Comida**: Vermelha/Verde (vale 10 pontos).
* **Progressão**: Nível aumenta a cada 100 pontos.

### ⚡ 2. Modo Velocidade (`speed`)
* **Descrição**: Desafio de reflexos onde a velocidade do jogo acelera a cada nível.
* **Fórmula de Intervalo de Tick**:
  $$\text{moveInterval} = \max(50, 140 - (\text{level} - 1) \times 12) \text{ ms}$$
* **Velocidade Exibida**: Equivalente ao nível atual ($1\times, 2\times, 3\times, \dots$).

### 🧱 3. Modo Obstáculos (`obstacles`)
* **Descrição**: Blocos de rocha intransponíveis surgem no mapa.
* **Quantidade de Obstáculos**:
  $$\text{numObstacles} = 6 + (\text{level} \times 2)$$
* **Algoritmo de Spawning Seguro**:
  1. Seleciona célula aleatória `(rx, ry)`.
  2. Garante distância Manhattan $D > 4$ em relação à cabeça da cobra:
     $$D = |rx - \text{head.x}| + |ry - \text{head.y}|$$
  3. Verifica se a célula não está ocupada pela cobra ou comida.

### 🌀 4. Modo Portal (`portal`)
* **Descrição**: As paredes do mapa deixam de ser mortais e funcionam como portais.
* **Mecânica de Wraparound**:
  * Se `head.x < 0` $\rightarrow$ `head.x = 24`
  * Se `head.x > 24` $\rightarrow$ `head.x = 0`
  * Se `head.y < 0` $\rightarrow$ `head.y = 24`
  * Se `head.y > 24` $\rightarrow$ `head.y = 0`

### 💀 5. Modo Sobrevivência (`survival`)
* **Descrição**: Comidas estragadas/venenosas surgem aleatoriamente no campo.
* **Comida Ruim (`badFood`)**:
  * **Cor**: Vinho/Vermelho escuro com marcação em 'X'.
  * **Efeito ao Comer**:
    * Perda de -15 pontos ($\text{score} = \max(0, \text{score} - 15)$).
    * Efeito visual de *Camera Shake* por 150ms.
    * **Encolhimento da Cobra**: O corpo da cobra reduz em 1 segmento líquido.
* **Condição de Morte por Encolhimento**: Se a cobra for reduzida a um tamanho menor ou igual a 1 segmento, ocorre Game Over.

### 🌈 6. Modo Arco-íris (`rainbow`)
* **Descrição**: Comidas com cores e pontuações variadas surgem aleatoriamente.
* **Tabela de Cores e Pontos**:

| Cor | Hex | Pontos Gerados | Efeito Visual |
| :--- | :--- | :--- | :--- |
| **Verde** | `#10B981` | +10 | Brilho padrão |
| **Azul** | `#3B82F6` | +15 | Brilho azul |
| **Laranja** | `#F59E0B` | +20 | Partículas amarelas |
| **Roxo** | `#8B5CF6` | +25 | Partículas roxas |
| **Rosa** | `#EC4899` | +30 | Partículas rosa |
| **Ciano** | `#06B6D4` | +40 | Partículas ciano estendidas |

---

## 3. Esquemas de Controles e Mapeamento

1. **Teclado**:
   * Mover: Setas Direcionais ou Teclas `W`, `A`, `S`, `D`.
   * Pausar: Tecla `ESC`.
2. **Gamepad / Controle USB**:
   * Mover: D-Pad ou Analógico Esquerdo (`axes[0]` e `axes[1]`, com *deadzone* de 0.5).
   * Pausar: Botões `Start` (9) ou `Select` (8).
3. **Touch / Mobile**:
   * D-Pad Virtual na tela ativado automaticamente no modo `Touch`.
