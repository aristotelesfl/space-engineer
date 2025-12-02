import Phaser from "phaser";
import { LevelProgression } from "../managers/LevelProgression";
import { Enemy } from "../../core/entities/Enemy";
import Player from "../../core/entities/Player";
import { Bullet } from "../../core/entities/Bullet";
import { Powerup } from "../../core/entities/Powerup";
import { AudioManager } from "../managers/AudioManager";
import { HUDManager } from "../managers/HUDManager";
import { PowerupManager } from "../managers/PowerupManager";
import { ScreenManager } from "../managers/ScreenManager";
import { InputManager } from "../managers/InputManager";
import { ResponseTextManager } from "../managers/ResponseTextManager";

export default class GameScene extends Phaser.Scene {
    // Parâmetros do nível
    private enemySpeed: number;
    private enemyLimit: number;
    private wordList: string[];
    private spawnInterval: number;
    private question?: string;

    // Managers
    private audioManager!: AudioManager;
    private hudManager!: HUDManager;
    private powerupManager?: PowerupManager;
    private screenManager!: ScreenManager;
    private inputManager!: InputManager;
    private responseTextManager?: ResponseTextManager;

    // Estado do jogo
    private player!: Player;
    private enemies: Enemy[] = [];
    private bullets: Bullet[] = [];
    private currentTarget: Enemy | Powerup | null = null;
    private typedWord: string = "";
    private score: number = 0;
    private gameOver: boolean = false;
    private levelComplete: boolean = false;

    // Auxiliares
    private background!: Phaser.GameObjects.TileSprite;
    private spawnTimer?: Phaser.Time.TimerEvent;

    constructor(
        enemySpeed: number,
        enemyLimit: number,
        wordList: string[],
        question: string,
        spawnInterval: number,
        sceneKey: string = "GameScene",
        responseText?: string,
        correctWords?: string[]
    ) {
        super({ key: sceneKey });
        this.enemySpeed = enemySpeed;
        this.enemyLimit = enemyLimit;
        this.wordList = wordList;
        this.question = question;
        this.spawnInterval = spawnInterval;

        if (responseText && correctWords?.length) {
            this.responseTextManager = new ResponseTextManager(
                responseText,
                correctWords
            );
        }
    }

    init(data: any) {
        this.resetGameState();
        if (data?.responseText && data?.correctWords) {
            this.responseTextManager = new ResponseTextManager(
                data.responseText,
                data.correctWords
            );
        }
    }

    preload() {
        // Carregamento dos Sprites
        this.load.image("player", "assets/player.png");
        this.load.image("enemy", "assets/enemy.png");
        this.load.image("enemy-left", "assets/enemy-left.png");
        this.load.image("enemy-right", "assets/enemy-right.png");
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("background", "assets/background.png");

        // HUD e UI
        this.load.image("bottomHudLayer", "assets/bottomHudLayer.png");
        this.load.image("topHudLayer", "assets/topHudLayer.png");
        this.load.image("powerup", "assets/powerup.png");

        // Carregamento de Áudio (via Manager)
        AudioManager.preload(this);
    }

    create() {
        const { width, height } = this.scale;

        // 1. Setup Visual Básico
        this.background = this.add
            .tileSprite(0, 0, width, height, "background")
            .setOrigin(0, 0);
        this.player = new Player(this, width / 2, height - 150);

        // 2. Setup Managers
        this.audioManager = new AudioManager(this);
        this.audioManager.init();
        this.audioManager.playBGM();

        this.screenManager = new ScreenManager(this);

        this.hudManager = new HUDManager(this);
        this.hudManager.create(
            this.question || "",
            this.responseTextManager?.getCurrentText() || "",
            this.player
        );

        // 3. Setup Funcionalidades Específicas
        if (this.responseTextManager) {
            this.setupPowerupSystem();
        }

        this.inputManager = new InputManager(
            this,
            (letter) => this.handleLetterInput(letter),
            () => this.returnToMenu() // ESC handler durante gameplay
        );
        this.inputManager.setup();

        this.startEnemySpawner();

        console.log("✅ GameScene Inicializada");
    }

    private setupPowerupSystem() {
        if (!this.responseTextManager) return;

        this.powerupManager = new PowerupManager(
            this,
            this.responseTextManager.getCorrectWords(),
            (word) => this.onPowerupWordCollected(word)
        );
        this.powerupManager.setSpawnChance(0.7);
        this.powerupManager.startSpawner(this.spawnInterval);

        // Eventos
        this.events.on("powerupDestroyed", this.onPowerupDestroyed, this);
        this.events.on("powerupCollected", this.onPowerupCollected, this);
    }

    // --- Lógica de Input e Combate ---

    private handleLetterInput(letter: string) {
        if (this.gameOver || this.levelComplete) return;

        if (!this.currentTarget) {
            this.findNewTarget(letter);
        } else {
            this.processTargetInput(letter);
        }
    }

    private findNewTarget(letter: string) {
        // Busca em inimigos e powerups
        const enemies = this.enemies.filter(
            (e) => e.isActive && e.checkLetter(letter)
        );
        const powerups =
            this.powerupManager
                ?.getPowerups()
                .filter(
                    (p) => p.isActive && !p.collected && p.checkLetter(letter)
                ) || [];

        const allMatches = [...enemies, ...powerups];

        if (allMatches.length === 0) {
            this.showWrongLetterFeedback();
            return;
        }

        // Seleciona o mais próximo
        this.currentTarget = allMatches.reduce((prev, curr) => {
            const distPrev = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                prev.x,
                prev.y
            );
            const distCurr = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                curr.x,
                curr.y
            );
            return distCurr < distPrev ? curr : prev;
        });

        if (this.currentTarget instanceof Enemy)
            this.currentTarget.setTargeted(true);

        this.processTargetInput(letter);
    }

    private processTargetInput(letter: string) {
        if (!this.currentTarget) return;

        if (this.currentTarget.checkLetter(letter)) {
            this.typedWord += letter;
            this.currentTarget.removeFirstLetter();
            this.shootBullet(letter);

            if (this.currentTarget.isCompleted()) {
                this.completeTarget();
            }
        } else {
            this.showWrongLetterFeedback();
        }
    }

    private completeTarget() {
        this.typedWord = "";
        if (this.currentTarget instanceof Enemy) {
            this.currentTarget.setTargeted(false);
        }
        this.currentTarget = null;
    }

    private shootBullet(letter: string) {
        if (!this.currentTarget) return;
        const bullet = new Bullet(
            this,
            this.player.x,
            this.player.y,
            this.currentTarget,
            letter
        );
        if (this.currentTarget.word.length === 0) bullet.isLastBullet = true;
        this.bullets.push(bullet);
        this.audioManager.playShoot();
    }

    // --- Callbacks de Eventos ---

    private onPowerupWordCollected(word: string) {
        if (!this.responseTextManager) return;

        const wasAdded = this.responseTextManager.addCollectedWord(word);
        if (wasAdded) {
            this.hudManager.updateResponseText(
                this.responseTextManager.getCurrentText()
            );
            this.addScore(200);
            this.cameras.main.flash(200, 0, 255, 0, false);

            if (this.responseTextManager.isComplete()) {
                this.onLevelComplete();
            }
        }
    }

    private onPowerupCollected(powerup: Powerup) {
        // Se pegou o powerup que estava mirando, reseta a mira
        if (this.currentTarget === powerup) {
            this.completeTarget();
            (this.player as any).resetAim?.();
        }
    }

    private onPowerupDestroyed(powerup: Powerup) {
        this.powerupManager?.destroyPowerup(powerup);
        this.cameras.main.flash(100, 255, 100, 0, false);
    }

    public onEnemyReadyToDestroy(enemy: Enemy) {
        this.createExplosionEffect(enemy.x, enemy.y);
        this.audioManager.playEnemyDeath();
        this.addScore(enemy.originalWord.length * 10);

        this.enemies = this.enemies.filter((e) => e !== enemy);
        enemy.destroy();
    }

    // --- Game Loop e Estado ---

    update(time: number, delta: number) {
        if (this.gameOver || this.levelComplete) return;

        this.background.tilePositionY -= 0.25;

        // Rotação Player
        if (this.currentTarget)
            this.player.aimAt(this.currentTarget.x, this.currentTarget.y);
        this.player.updateRotation(delta);

        // Atualização Managers
        this.powerupManager?.update(this.player);

        // Atualização Entidades
        this.updateEnemies();
        this.bullets = this.bullets.filter((b) => b.active); // Limpeza automática feita pelo Phaser, só filtro a ref
        this.bullets.forEach((b) => b.preUpdate(time, delta));

        this.hudManager.updateLives(this.player.getLives());

        if (this.player.getLives() <= 0) this.triggerGameOver();
    }

    private updateEnemies() {
        this.enemies.forEach((enemy) => {
            enemy.updateSpriteDirection(this.player.x);

            // Colisão com Player
            if (
                Phaser.Math.Distance.Between(
                    enemy.x,
                    enemy.y,
                    this.player.x,
                    this.player.y
                ) < 50
            ) {
                this.onEnemyReachedPlayer(enemy);
            }

            // Colisão Inimigo x Powerup (Lógica do GameScene pois PowerupManager não conhece Inimigos)
            this.powerupManager?.getPowerups().forEach((powerup) => {
                if (
                    powerup.isActive &&
                    !powerup.collected &&
                    Phaser.Math.Distance.Between(
                        enemy.x,
                        enemy.y,
                        powerup.x,
                        powerup.y
                    ) < 40
                ) {
                    this.powerupManager?.destroyPowerup(powerup);
                }
            });
        });
    }

    // --- Finalização de Nível / Game Over ---

    private onLevelComplete() {
        if (this.levelComplete) return;
        this.levelComplete = true;
        this.cleanupGameplayResources();
        this.addScore(500);

        const nextLevelKey = LevelProgression.getNextLevel(this.scene.key);
        const isLastLevel = LevelProgression.isLastLevel(this.scene.key);

        // Usa ScreenManager para tudo
        this.time.delayedCall(500, () => {
            this.screenManager.showLevelComplete(
                this.score,
                this.responseTextManager?.getCurrentText() || "",
                this.responseTextManager?.getCollectedWords() || [],
                isLastLevel,
                () => nextLevelKey && this.transitionToScene(nextLevelKey), // Next Level
                () => this.returnToMenu() // Menu
            );
        });
    }

    private triggerGameOver() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.audioManager.stopBGM();
        this.cleanupGameplayResources();

        this.screenManager.showGameOver(
            this.score,
            () => this.restartLevel(),
            () => this.returnToMenu()
        );
    }

    // --- Navegação e Cleanup ---

    private transitionToScene(sceneKey: string) {
        this.audioManager.stopBGM();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.cleanupScene();
            this.scene.start(sceneKey);
        });
    }

    private restartLevel() {
        this.transitionToScene(this.scene.key); // Reinicia a mesma cena
    }

    private returnToMenu() {
        this.transitionToScene("MenuScene");
    }

    private cleanupGameplayResources() {
        if (this.spawnTimer) this.spawnTimer.remove();
        this.inputManager.cleanup(); // Para inputs de digitação
    }

    private cleanupScene() {
        this.cleanupGameplayResources();
        this.events.off("powerupDestroyed");
        this.events.off("powerupCollected");

        this.enemies.forEach((e) => e.destroy());
        this.bullets.forEach((b) => b.destroy());
        this.powerupManager?.cleanup();
        this.hudManager.destroy();
    }

    // --- Helpers de Criação ---

    private startEnemySpawner() {
        this.spawnTimer = this.time.addEvent({
            delay: this.spawnInterval,
            callback: () => {
                if (this.enemies.length < this.enemyLimit) {
                    const word = Phaser.Utils.Array.GetRandom(this.wordList);
                    const enemy = new Enemy(
                        this,
                        Phaser.Math.Between(50, this.scale.width - 50),
                        -50,
                        word,
                        this.enemySpeed
                    );
                    enemy.startMoving(this.player.x, this.player.y);
                    this.enemies.push(enemy);
                }
            },
            loop: true,
        });
    }

    private showWrongLetterFeedback() {
        this.cameras.main.flash(100, 255, 0, 0, false);
    }

    private createExplosionEffect(x: number, y: number) {
        const particles = this.add.particles(x, y, "enemy", {
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 600,
            tint: 0xffaa00,
            quantity: 15,
        });
        this.time.delayedCall(700, () => particles.destroy());
    }

    private addScore(points: number) {
        this.score += points;
        this.hudManager.updateScore(this.score);
    }

    private resetGameState() {
        this.gameOver = false;
        this.levelComplete = false;
        this.score = 0;
        this.typedWord = "";
        this.currentTarget = null;
        this.enemies = [];
        this.bullets = [];
    }

    private onEnemyReachedPlayer(enemy: Enemy) {
        if (this.currentTarget === enemy) this.completeTarget();
        this.enemies = this.enemies.filter((e) => e !== enemy);
        enemy.destroy();
        this.player.takeDamage(1);
    }
}
