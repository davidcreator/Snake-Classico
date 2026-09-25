import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { soundEngine } from '../SoundEngine';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.gameMode = data.mode || 'classic';
        this.controlType = data.controlType || 'keyboard';
        
        this.gridSize = 24;
        this.gridWidth = 25; // 25 * 24 = 600px
        this.gridHeight = 25; // 25 * 24 = 600px

        this.snake = [];
        this.dir = { x: 1, y: 0 };
        this.inputQueue = [];
        
        this.food = null;
        this.badFood = null;
        this.obstacles = [];
        
        this.score = 0;
        this.level = 1;
        this.speedLevel = 1;
        this.moveInterval = 140; // ms per tick
        this.lastMoveTime = 0;
        
        this.isGameOver = false;
        this.isPaused = false;
        
        this.gamepadIndex = null;
        this.lastGamepadTime = 0;
    }

    create() {
        // Render grid lines background
        this.drawBackgroundGrid();

        // Particles texture / Graphics
        this.createParticleGraphics();

        // Particle Emitter for food effects
        this.foodEmitter = this.add.particles(0, 0, 'flare', {
            speed: { min: 40, max: 120 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 350,
            emitting: false
        });

        // Initialize Snake
        this.initSnake();

        // Mode specific setup
        if (this.gameMode === 'obstacles') {
            this.generateObstacles();
        }

        // Generate initial food
        this.generateFood();

        if (this.gameMode === 'survival') {
            this.generateBadFood();
        }

        // Keyboard Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            esc: Phaser.Input.Keyboard.KeyCodes.ESC
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });

        // Touch / EventBus directional commands
        this.boundDirectionListener = (dir) => this.handleDirectionCommand(dir);
        this.boundPauseListener = () => this.togglePause();
        
        EventBus.on('control-direction', this.boundDirectionListener);
        EventBus.on('control-pause', this.boundPauseListener);

        // Notify React
        EventBus.emit('game-update', {
            score: this.score,
            level: this.level,
            speed: this.speedLevel,
            mode: this.gameMode
        });

        // Sound init
        soundEngine.init();

        this.events.on('shutdown', () => {
            EventBus.off('control-direction', this.boundDirectionListener);
            EventBus.off('control-pause', this.boundPauseListener);
        });
    }

    drawBackgroundGrid() {
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0c16, 1);
        bg.fillRect(0, 0, 600, 600);

        bg.lineStyle(1, 0x1e293b, 0.4);
        for (let x = 0; x <= 600; x += this.gridSize) {
            bg.lineBetween(x, 0, x, 600);
        }
        for (let y = 0; y <= 600; y += this.gridSize) {
            bg.lineBetween(0, y, 600, y);
        }
    }

    createParticleGraphics() {
        if (!this.textures.exists('flare')) {
            const gfx = this.make.graphics({ x: 0, y: 0, add: false });
            gfx.fillStyle(0xffffff, 1);
            gfx.fillCircle(8, 8, 8);
            gfx.generateTexture('flare', 16, 16);
        }
    }

    initSnake() {
        const startX = 12;
        const startY = 12;
        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        this.dir = { x: 1, y: 0 };
    }

    handleDirectionCommand(dirName) {
        if (this.isPaused || this.isGameOver) return;
        if (this.inputQueue.length >= 2) return;

        let newDir = null;
        if (dirName === 'LEFT') newDir = { x: -1, y: 0 };
        else if (dirName === 'RIGHT') newDir = { x: 1, y: 0 };
        else if (dirName === 'UP') newDir = { x: 0, y: -1 };
        else if (dirName === 'DOWN') newDir = { x: 0, y: 1 };

        if (newDir) {
            this.inputQueue.push(newDir);
        }
    }

    pollInputs() {
        if (this.cursors.left.isDown || this.wasd.left.isDown) this.handleDirectionCommand('LEFT');
        else if (this.cursors.right.isDown || this.wasd.right.isDown) this.handleDirectionCommand('RIGHT');
        else if (this.cursors.up.isDown || this.wasd.up.isDown) this.handleDirectionCommand('UP');
        else if (this.cursors.down.isDown || this.wasd.down.isDown) this.handleDirectionCommand('DOWN');

        // Gamepad handling
        if (this.controlType === 'gamepad') {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            const pad = gamepads[0];
            if (pad && pad.connected) {
                const now = this.time.now;
                if (now - this.lastGamepadTime > 160) {
                    if (pad.buttons[14]?.pressed || pad.axes[0] < -0.5) {
                        this.handleDirectionCommand('LEFT');
                        this.lastGamepadTime = now;
                    } else if (pad.buttons[15]?.pressed || pad.axes[0] > 0.5) {
                        this.handleDirectionCommand('RIGHT');
                        this.lastGamepadTime = now;
                    } else if (pad.buttons[12]?.pressed || pad.axes[1] < -0.5) {
                        this.handleDirectionCommand('UP');
                        this.lastGamepadTime = now;
                    } else if (pad.buttons[13]?.pressed || pad.axes[1] > 0.5) {
                        this.handleDirectionCommand('DOWN');
                        this.lastGamepadTime = now;
                    }
                    if (pad.buttons[9]?.pressed || pad.buttons[8]?.pressed) {
                        this.togglePause();
                        this.lastGamepadTime = now;
                    }
                }
            }
        }
    }

    update(time) {
        if (this.isGameOver || this.isPaused) return;

        this.pollInputs();

        if (time - this.lastMoveTime >= this.moveInterval) {
            this.lastMoveTime = time;
            this.step();
        }

        this.renderGraphics();
    }

    step() {
        // Process queued direction
        if (this.inputQueue.length > 0) {
            const nextDir = this.inputQueue.shift();
            // Prevent 180 degree instant turn
            if (nextDir.x !== -this.dir.x || nextDir.y !== -this.dir.y) {
                this.dir = nextDir;
            }
        }

        const head = {
            x: this.snake[0].x + this.dir.x,
            y: this.snake[0].y + this.dir.y
        };

        // Portal wall-wrapping
        if (this.gameMode === 'portal') {
            if (head.x < 0) head.x = this.gridWidth - 1;
            if (head.x >= this.gridWidth) head.x = 0;
            if (head.y < 0) head.y = this.gridHeight - 1;
            if (head.y >= this.gridHeight) head.y = 0;
        } else {
            // Standard wall collision
            if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
                this.triggerGameOver('Colisão com a parede!');
                return;
            }
        }

        // Self collision check
        for (let i = 0; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.triggerGameOver('A cobra colidiu consigo mesma!');
                return;
            }
        }

        // Obstacle collision check
        if (this.obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
            this.triggerGameOver('Colisão com obstáculo!');
            return;
        }

        this.snake.unshift(head);

        // Check Food Collision
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            soundEngine.playEat();
            this.score += this.food.points;

            // Particle effect on food position
            const px = head.x * this.gridSize + this.gridSize / 2;
            const py = head.y * this.gridSize + this.gridSize / 2;
            this.foodEmitter.explode(15, px, py);

            this.generateFood();

            // Level Progression
            const newLevel = Math.floor(this.score / 100) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                soundEngine.playLevelUp();
                
                if (this.gameMode === 'speed') {
                    this.moveInterval = Math.max(50, 140 - (this.level - 1) * 12);
                    this.speedLevel = this.level;
                } else {
                    this.speedLevel = this.level;
                }

                if (this.gameMode === 'obstacles') {
                    this.generateObstacles();
                }
            }

            EventBus.emit('game-update', {
                score: this.score,
                level: this.level,
                speed: this.speedLevel,
                mode: this.gameMode
            });
        }
        // Check Bad Food Collision
        else if (this.badFood && head.x === this.badFood.x && head.y === this.badFood.y) {
            soundEngine.playBadEat();
            this.score = Math.max(0, this.score - 15);
            this.cameras.main.shake(150, 0.01);

            // Penalty: Shrink snake body
            this.snake.pop(); // Standard pop
            if (this.snake.length > 1) {
                this.snake.pop(); // Extra pop for shrinking
            }

            this.generateBadFood();

            EventBus.emit('game-update', {
                score: this.score,
                level: this.level,
                speed: this.speedLevel,
                mode: this.gameMode
            });
        }
        else {
            this.snake.pop(); // Normal move without eating
        }

        // Random chance to spawn bad food in survival mode
        if (this.gameMode === 'survival' && Math.random() < 0.03 && !this.badFood) {
            this.generateBadFood();
        }
    }

    generateFood() {
        const colorful = this.gameMode === 'rainbow';
        const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899, 0x06b6d4];
        const pointsMap = [10, 15, 20, 25, 30, 35, 40];

        let color = 0x10b981; // Green default
        let points = 10;

        if (colorful) {
            const idx = Math.floor(Math.random() * colors.length);
            color = colors[idx];
            points = pointsMap[idx];
        }

        let foodPos = null;
        let attempts = 0;
        while (!foodPos && attempts < 500) {
            attempts++;
            const rx = Math.floor(Math.random() * this.gridWidth);
            const ry = Math.floor(Math.random() * this.gridHeight);

            if (!this.isTileOccupied(rx, ry)) {
                foodPos = { x: rx, y: ry, color, points };
            }
        }
        this.food = foodPos;
    }

    generateBadFood() {
        let badPos = null;
        let attempts = 0;
        while (!badPos && attempts < 500) {
            attempts++;
            const rx = Math.floor(Math.random() * this.gridWidth);
            const ry = Math.floor(Math.random() * this.gridHeight);

            if (!this.isTileOccupied(rx, ry)) {
                badPos = { x: rx, y: ry };
            }
        }
        this.badFood = badPos;
    }

    generateObstacles() {
        const targetCount = 6 + (this.level * 2);
        let attempts = 0;
        while (this.obstacles.length < targetCount && attempts < 1000) {
            attempts++;
            const rx = Math.floor(Math.random() * this.gridWidth);
            const ry = Math.floor(Math.random() * this.gridHeight);

            const head = this.snake[0] || { x: 12, y: 12 };
            const dist = Math.abs(rx - head.x) + Math.abs(ry - head.y);

            if (!this.isTileOccupied(rx, ry) && dist > 4) {
                this.obstacles.push({ x: rx, y: ry });
            }
        }
    }

    isTileOccupied(x, y) {
        if (this.snake.some(s => s.x === x && s.y === y)) return true;
        if (this.food && this.food.x === x && this.food.y === y) return true;
        if (this.badFood && this.badFood.x === x && this.badFood.y === y) return true;
        if (this.obstacles.some(o => o.x === x && o.y === y)) return true;
        return false;
    }

    togglePause() {
        if (this.isGameOver) return;
        this.isPaused = !this.isPaused;
        soundEngine.playClick();
        EventBus.emit('pause-changed', this.isPaused);
    }

    triggerGameOver(reason) {
        this.isGameOver = true;
        soundEngine.playGameOver();
        this.cameras.main.shake(300, 0.02);

        EventBus.emit('game-over', {
            score: this.score,
            level: this.level,
            mode: this.gameMode,
            reason: reason
        });
    }

    renderGraphics() {
        if (!this.gfx) {
            this.gfx = this.add.graphics();
        }
        this.gfx.clear();

        const gs = this.gridSize;

        // Render Obstacles
        this.obstacles.forEach(obs => {
            this.gfx.fillStyle(0x334155, 1);
            this.gfx.fillRoundedRect(obs.x * gs + 2, obs.y * gs + 2, gs - 4, gs - 4, 4);
            this.gfx.lineStyle(2, 0x64748b, 1);
            this.gfx.strokeRoundedRect(obs.x * gs + 2, obs.y * gs + 2, gs - 4, gs - 4, 4);
        });

        // Render Food
        if (this.food) {
            const time = this.time.now;
            const pulse = Math.sin(time * 0.008) * 2;
            const radius = (gs / 2 - 2) + pulse / 2;

            this.gfx.fillStyle(this.food.color, 1);
            this.gfx.fillCircle(this.food.x * gs + gs / 2, this.food.y * gs + gs / 2, radius);

            this.gfx.fillStyle(0xffffff, 0.4);
            this.gfx.fillCircle(this.food.x * gs + gs / 2 - 2, this.food.y * gs + gs / 2 - 2, radius * 0.35);
        }

        // Render Bad Food
        if (this.badFood) {
            const time = this.time.now;
            const jitter = Math.sin(time * 0.02) * 1.5;
            const bx = this.badFood.x * gs + 2 + jitter;
            const by = this.badFood.y * gs + 2 + jitter;

            this.gfx.fillStyle(0x991b1b, 1);
            this.gfx.fillRect(bx, by, gs - 4, gs - 4);

            this.gfx.lineStyle(2, 0xf87171, 1);
            this.gfx.lineBetween(bx + 4, by + 4, bx + gs - 8, by + gs - 8);
            this.gfx.lineBetween(bx + gs - 8, by + 4, bx + 4, by + gs - 8);
        }

        // Render Snake
        this.snake.forEach((seg, idx) => {
            const sx = seg.x * gs;
            const sy = seg.y * gs;

            if (idx === 0) {
                // Head
                this.gfx.fillStyle(0x10b981, 1);
                this.gfx.fillRoundedRect(sx + 1, sy + 1, gs - 2, gs - 2, 6);

                // Eyes based on direction
                this.gfx.fillStyle(0xffffff, 1);
                let eye1X = sx + 6, eye1Y = sy + 6;
                let eye2X = sx + 14, eye2Y = sy + 6;

                if (this.dir.x === 1) { eye1X = sx + 14; eye1Y = sy + 5; eye2X = sx + 14; eye2Y = sy + 13; }
                else if (this.dir.x === -1) { eye1X = sx + 4; eye1Y = sy + 5; eye2X = sx + 4; eye2Y = sy + 13; }
                else if (this.dir.y === 1) { eye1X = sx + 5; eye1Y = sy + 14; eye2X = sx + 13; eye2Y = sy + 14; }
                else if (this.dir.y === -1) { eye1X = sx + 5; eye1Y = sy + 4; eye2X = sx + 13; eye2Y = sy + 4; }

                this.gfx.fillCircle(eye1X, eye1Y, 2.5);
                this.gfx.fillCircle(eye2X, eye2Y, 2.5);

                this.gfx.fillStyle(0x000000, 1);
                this.gfx.fillCircle(eye1X, eye1Y, 1);
                this.gfx.fillCircle(eye2X, eye2Y, 1);
            } else {
                // Body
                const alpha = Math.max(0.4, 1 - (idx * 0.025));
                this.gfx.fillStyle(0x059669, alpha);
                this.gfx.fillRoundedRect(sx + 2, sy + 2, gs - 4, gs - 4, 4);
                this.gfx.lineStyle(1, 0x047857, alpha);
                this.gfx.strokeRoundedRect(sx + 2, sy + 2, gs - 4, gs - 4, 4);
            }
        });
    }
}
