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
import { ProgressHUD } from "../managers/ProgressHUD";

export default class GameScene extends Phaser.Scene {
    // Parâmetros do nível
    private enemySpeed: number;
    private enemyLimit: number;
    private wordList: string[];
    private spawnInterval: number;
    private levelTitle: string = "";
    private levelQuestion: string = "";
    private progressHUD?: ProgressHUD;

    // Estado do jogo
    private player!: Player;
    private enemies: Enemy[] = [];
    private bullets: Bullet[] = [];
    private currentTarget: Enemy | Powerup | null = null;
    private typedWord: string = "";
    private score: number = 0;
    private gameOver: boolean = false;
    private levelComplete: boolean = false;

    // Background
    private background!: Phaser.GameObjects.TileSprite;

    // Managers
    private audioManager!: AudioManager;
    private hudManager!: HUDManager;
    private powerupManager?: PowerupManager;
    private screenManager!: ScreenManager;
    private inputManager!: InputManager;
    private responseTextManager?: ResponseTextManager;

    // Spawn control
    private spawnTimer!: Phaser.Time.TimerEvent;

    constructor(
        enemySpeed: number,
        enemyLimit: number,
        wordList: string[],
        spawnInterval: number,
        sceneKey: string = "GameScene",
        responseText?: string,
        correctWords?: string[]
    ) {
        super({ key: sceneKey });

        this.enemySpeed = enemySpeed;
        this.enemyLimit = enemyLimit;
        this.wordList = wordList;
        this.spawnInterval = spawnInterval;

        // Inicializa managers opcionais
        if (responseText && correctWords && correctWords.length > 0) {
            this.responseTextManager = new ResponseTextManager(
                responseText,
                correctWords
            );
        }

        console.log(`🎮 GameScene criada com parâmetros:`);
        console.log(`   - Velocidade: ${enemySpeed}`);
        console.log(`   - Limite: ${enemyLimit} inimigos`);
        console.log(`   - Palavras: ${wordList.length} disponíveis`);
        console.log(`   - Spawn: ${spawnInterval}ms`);
        if (responseText) {
            console.log(`   - Response: "${responseText}"`);
            console.log(`   - Correct Words: [${correctWords?.join(", ")}]`);
        }
    }

    init(data: any) {
        // Reseta o estado
        this.resetGameState();

        if (data) {
            this.levelTitle = data.levelTitle || "";
            this.levelQuestion = data.levelQuestion || "";

            // Recebe responseText e correctWords via data
            if (data.responseText && data.correctWords) {
                this.responseTextManager = new ResponseTextManager(
                    data.responseText,
                    data.correctWords
                );
            }

            console.log(
                `📋 Dados recebidos: "${this.levelTitle}" - "${this.levelQuestion}"`
            );
        }
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

    preload() {
        this.load.image("player", "assets/player.png");
        this.load.image("enemy", "assets/enemy.png");
        this.load.image("enemy-left", "assets/enemy-left.png");
        this.load.image("enemy-right", "assets/enemy-right.png");
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("background", "assets/background.png");
        this.load.image("bottomHudLayer", "assets/bottomHudLayer.png");
        this.load.image("topHudLayer", "assets/topHudLayer.png");
        this.load.image("powerup", "assets/powerup.png");

        AudioManager.preload(this);
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.background = this.add.tileSprite(
            0,
            0,
            width,
            height,
            "background"
        );
        this.background.setOrigin(0, 0);

        // Audio
        this.audioManager = new AudioManager(this);
        this.audioManager.init();
        this.audioManager.playBGM();

        // Player
        this.player = new Player(this, width / 2, height - 150);

        // HUD
        this.hudManager = new HUDManager(this);
        this.hudManager.create(
            this.levelQuestion,
            this.responseTextManager?.getCurrentText() || this.levelTitle,
            this.player
        );

        if (this.responseTextManager) {
            this.powerupManager = new PowerupManager(
                this,
                this.responseTextManager.getCorrectWords(),
                (word) => this.onPowerupWordCollected(word)
            );

            // ✅ CONFIGURAÇÃO
            this.powerupManager.setSpawnChance(0.7); // 70%
            this.powerupManager.setMaxPowerups(3); // Máx 3 simultâneos
            this.powerupManager.setSpeed(80); // Velocidade
            this.powerupManager.startSpawner(this.spawnInterval);

            console.log(`⭐ PowerupManager configurado`);
        }

        // ✅ EVENT LISTENER PARA DESTRUIÇÃO DE POWERUP
        this.events.on("powerupDestroyed", this.onPowerupDestroyed, this);
        this.events.on("powerupCollected", this.onPowerupCollected, this);

        // Screen Manager
        this.screenManager = new ScreenManager(this);

        // Input Manager
        this.inputManager = new InputManager(
            this,
            (letter) => this.handleLetterInput(letter),
            () => this.returnToMenu()
        );
        this.inputManager.setup();

        // 🆕 DEBUG: TECLA P PARA FORÇAR SPAWN
        this.input.keyboard?.on("keydown-P", () => {
            if (this.powerupManager && this.player) {
                this.powerupManager.forceSpawn(this.player);
                console.log("🔨 [TECLA P] Spawn de powerup forçado!");
            } else {
                console.warn("⚠️ PowerupManager ou Player não existe!");
            }
        });

        // Spawn de inimigos
        this.startEnemySpawner();

        console.log("✅ GameScene iniciada!");
    }

    private onPowerupCollected(powerup: Powerup) {
        console.log(
            `⭐ Evento powerupCollected recebido para: "${powerup.originalWord}"`
        );

        // Se o powerup coletado for o target atual, reseta o target e typedWord
        if (this.currentTarget === powerup) {
            console.log(
                `   🔁 Current target era o powerup coletado — resetando target.`
            );
            this.currentTarget = null;
            this.typedWord = "";

            // Resetar a mira do player para evitar que ele continue girando para o ponto antigo
            if (
                this.player &&
                typeof (this.player as any).resetAim === "function"
            ) {
                (this.player as any).resetAim();
            }
        }
    }

    private onPowerupDestroyed(powerup: Powerup) {
        console.log(
            `💥 onPowerupDestroyed chamado para: "${powerup.originalWord}"`
        );

        if (this.powerupManager) {
            // Remove o powerup da lista e destrói
            this.powerupManager.destroyPowerup(powerup);

            // Flash vermelho indicando destruição (sem coleta)
            this.cameras.main.flash(100, 255, 100, 0, false);

            console.log(`   ❌ Powerup destruído sem coleta`);
        }
    }

    private handleLetterInput(letter: string) {
        if (this.gameOver || this.levelComplete) return;

        if (!this.currentTarget) {
            this.findNewTarget(letter);
            return;
        }

        if (this.currentTarget.checkLetter(letter)) {
            this.typedWord += letter;
            this.currentTarget.removeFirstLetter();
            this.shootBullet(letter);

            if (this.currentTarget.isCompleted()) {
                console.log("✅ Palavra completada!");
                this.typedWord = "";

                if (this.currentTarget instanceof Enemy) {
                    this.currentTarget.setTargeted(false);
                }

                this.currentTarget = null;
            }
        } else {
            this.showWrongLetterFeedback();
        }
    }

    private findNewTarget(letter: string) {
        // ✅ Busca inimigos que correspondem à letra
        const matchingEnemies = this.enemies.filter(
            (enemy) => enemy.isActive && enemy.checkLetter(letter)
        );

        // ✅ Busca powerups que correspondem à letra
        const matchingPowerups = this.powerupManager
            ? this.powerupManager
                  .getPowerups()
                  .filter(
                      (powerup) =>
                          powerup.isActive &&
                          !powerup.collected &&
                          powerup.checkLetter(letter)
                  )
            : [];

        // ✅ Combina todos os alvos possíveis
        const allMatches = [...matchingEnemies, ...matchingPowerups];

        if (allMatches.length === 0) {
            this.showWrongLetterFeedback();
            return;
        }

        // ✅ Escolhe o mais próximo do player
        let closest = allMatches[0];
        let minDistance = closest.getDistanceToPoint(
            this.player.x,
            this.player.y
        );

        for (let i = 1; i < allMatches.length; i++) {
            const distance = allMatches[i].getDistanceToPoint(
                this.player.x,
                this.player.y
            );
            if (distance < minDistance) {
                minDistance = distance;
                closest = allMatches[i];
            }
        }

        this.currentTarget = closest;

        // ✅ Marca inimigo como alvo (powerups não precisam)
        if (this.currentTarget instanceof Enemy) {
            this.currentTarget.setTargeted(true);
        }

        this.typedWord = letter;
        this.currentTarget.removeFirstLetter();
        this.shootBullet(letter);

        // ✅ Verifica se completou a palavra
        if (this.currentTarget.isCompleted()) {
            console.log("✅ Palavra completada!");
            this.typedWord = "";

            if (this.currentTarget instanceof Enemy) {
                this.currentTarget.setTargeted(false);
            }

            this.currentTarget = null;
        }
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

        if (this.currentTarget.word.length === 0) {
            bullet.isLastBullet = true;
        }

        this.bullets.push(bullet);
        this.audioManager.playShoot();
    }

    private showWrongLetterFeedback() {
        this.cameras.main.flash(100, 255, 0, 0, false);
    }

    private startEnemySpawner() {
        this.spawnTimer = this.time.addEvent({
            delay: this.spawnInterval,
            callback: () => this.spawnEnemy(),
            loop: true,
        });

        this.time.delayedCall(500, () => this.spawnEnemy());
        this.time.delayedCall(1500, () => this.spawnEnemy());
    }

    private spawnEnemy() {
        if (this.enemies.length >= this.enemyLimit) return;

        const { width } = this.scale;
        const word = Phaser.Utils.Array.GetRandom(this.wordList);
        const x = Phaser.Math.Between(50, width - 50);
        const y = -50;

        const enemy = new Enemy(this, x, y, word, this.enemySpeed);
        enemy.startMoving(this.player.x, this.player.y);

        this.enemies.push(enemy);
    }

    public onEnemyReadyToDestroy(enemy: Enemy) {
        this.createExplosionEffect(enemy.x, enemy.y);
        this.audioManager.playEnemyDeath();
        this.addScore(enemy.originalWord.length * 10);

        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }

        enemy.destroy();
    }

    private onPowerupWordCollected(word: string) {
        if (!this.responseTextManager) return;

        console.log(`🎯 onPowerupWordCollected: "${word}"`);

        const wasAdded = this.responseTextManager.addCollectedWord(word);

        if (wasAdded) {
            console.log(`✅ Palavra "${word}" adicionada!`);

            // Atualiza HUD
            this.hudManager.updateResponseText(
                this.responseTextManager.getCurrentText()
            );

            // Efeitos
            this.audioManager.playShoot();
            this.cameras.main.flash(200, 0, 255, 0, false); // Flash verde

            // Pontos
            this.addScore(200);

            // Log
            const progress = this.responseTextManager.getProgressPercentage();
            const remaining = this.responseTextManager.getRemainingWords();

            console.log(`📈 Progresso: ${progress}%`);
            console.log(`📝 Restantes: [${remaining.join(", ")}]`);

            // Verifica conclusão
            this.checkLevelComplete();
        } else {
            console.log(`⚠️ Palavra não adicionada (duplicada)`);
            this.cameras.main.flash(150, 255, 255, 0, false); // Flash amarelo
        }
    }

    private checkLevelComplete() {
        if (!this.responseTextManager) return;

        // Verifica se todas as palavras necessárias foram coletadas
        if (this.responseTextManager.isComplete()) {
            console.log(`🎉 TODAS AS PALAVRAS COLETADAS!`);
            console.log(
                `✅ Palavras coletadas: [${this.responseTextManager
                    .getCollectedWords()
                    .join(", ")}]`
            );

            this.onLevelComplete();
        }
    }

    private onLevelComplete() {
        if (this.levelComplete) return;

        this.levelComplete = true;
        console.log(`🏆 onLevelComplete acionado`);

        // Para spawns
        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }
        if (this.powerupManager) {
            this.powerupManager.cleanup();
        }

        // Bônus de conclusão
        this.addScore(500);

        // Determina o próximo nível
        const currentSceneKey = this.scene.key;
        const nextLevelKey = LevelProgression.getNextLevel(currentSceneKey);
        const isLastLevel = LevelProgression.isLastLevel(currentSceneKey);

        // Tela de vitória com opção de continuar
        this.time.delayedCall(500, () => {
            this.showLevelCompleteScreen(nextLevelKey, isLastLevel);
        });
    }
    private showLevelCompleteScreen(
        nextLevelKey: string | null,
        isLastLevel: boolean
    ) {
        const { width, height } = this.scale;

        const container = this.add.container(0, 0);
        container.setDepth(2000);

        // Overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
        overlay.setOrigin(0, 0);

        // Título
        const title = this.add.text(
            width / 2,
            height / 2 - 150,
            isLastLevel ? "🏆 JOGO COMPLETO!" : "NÍVEL COMPLETO!",
            {
                fontSize: "64px",
                color: isLastLevel ? "#FFD700" : "#00ff00",
                fontFamily: "Arial Black, sans-serif",
                fontStyle: "bold",
                stroke: isLastLevel ? "#8B4513" : "#006600",
                strokeThickness: 8,
                wordWrap: { width: width - 100 },
            }
        );
        title.setOrigin(0.5);

        // Palavras coletadas
        const collectedWords =
            this.responseTextManager?.getCollectedWords() || [];
        const wordsText = this.add.text(
            width / 2,
            height / 2 - 60,
            `Palavras coletadas: ${collectedWords.join(", ")}`,
            {
                fontSize: "18px",
                color: "#ffff00",
                fontFamily: "Arial, sans-serif",
                align: "center",
                wordWrap: { width: width - 100 },
            }
        );
        wordsText.setOrigin(0.5);

        // Frase completa
        const responseComplete = this.add.text(
            width / 2,
            height / 2,
            this.responseTextManager?.getCurrentText() || "",
            {
                fontSize: "20px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                align: "center",
                wordWrap: { width: width - 100 },
            }
        );
        responseComplete.setOrigin(0.5);

        // Score
        const scoreDisplay = this.add.text(
            width / 2,
            height / 2 + 80,
            `SCORE FINAL: ${this.score}`,
            {
                fontSize: "36px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
            }
        );
        scoreDisplay.setOrigin(0.5);

        // Linha separadora
        const line = this.add.graphics();
        line.lineStyle(2, 0x666666, 1);
        line.lineBetween(
            width / 2 - 200,
            height / 2 + 120,
            width / 2 + 200,
            height / 2 + 120
        );

        // Botões de ação
        let continueText: Phaser.GameObjects.Text;

        if (isLastLevel) {
            // Último nível - apenas menu
            continueText = this.add.text(
                width / 2,
                height / 2 + 160,
                "PRESSIONE ESC PARA VOLTAR AO MENU",
                {
                    fontSize: "20px",
                    color: "#ffaa66",
                    fontFamily: "Arial, sans-serif",
                }
            );
            continueText.setOrigin(0.5);

            // Input para voltar ao menu
            this.input.keyboard?.once("keydown-ESC", () => {
                this.returnToMenu();
            });
        } else {
            // Não é o último nível - próximo nível ou menu
            continueText = this.add.text(
                width / 2,
                height / 2 + 160,
                "PRESSIONE ESPAÇO PARA PRÓXIMO NÍVEL",
                {
                    fontSize: "20px",
                    color: "#66ff66",
                    fontFamily: "Arial, sans-serif",
                }
            );
            continueText.setOrigin(0.5);

            const menuText = this.add.text(
                width / 2,
                height / 2 + 200,
                "PRESSIONE ESC PARA VOLTAR AO MENU",
                {
                    fontSize: "20px",
                    color: "#ffaa66",
                    fontFamily: "Arial, sans-serif",
                }
            );
            menuText.setOrigin(0.5);

            // Input para próximo nível
            this.input.keyboard?.once("keydown-SPACE", () => {
                if (nextLevelKey) {
                    this.goToNextLevel(nextLevelKey);
                }
            });

            // Input para voltar ao menu
            this.input.keyboard?.once("keydown-ESC", () => {
                this.returnToMenu();
            });

            container.add(menuText);

            // Animação de pulso no botão de continuar
            this.tweens.add({
                targets: continueText,
                scale: 1.1,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });
        }

        container.add([
            overlay,
            title,
            wordsText,
            responseComplete,
            scoreDisplay,
            line,
            continueText,
        ]);

        // Animações de entrada
        this.animateLevelCompleteElements(
            overlay,
            title,
            wordsText,
            responseComplete,
            scoreDisplay,
            continueText
        );
    }
    private goToNextLevel(nextLevelKey: string) {
        console.log(`➡️ Avançando para: ${nextLevelKey}`);

        this.audioManager.stopBGM();
        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.cleanupScene();
            this.scene.start(nextLevelKey);
        });
    }

    // Adicione este método auxiliar para animações:

    private animateLevelCompleteElements(
        overlay: Phaser.GameObjects.Rectangle,
        title: Phaser.GameObjects.Text,
        wordsText: Phaser.GameObjects.Text,
        responseComplete: Phaser.GameObjects.Text,
        scoreDisplay: Phaser.GameObjects.Text,
        continueText: Phaser.GameObjects.Text
    ) {
        overlay.setAlpha(0);
        title.setAlpha(0).setScale(0.5);
        wordsText.setAlpha(0);
        responseComplete.setAlpha(0);
        scoreDisplay.setAlpha(0);
        continueText.setAlpha(0);

        this.tweens.add({
            targets: overlay,
            alpha: 0.85,
            duration: 300,
        });

        this.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1,
            duration: 500,
            delay: 200,
            ease: "Back.easeOut",
        });

        this.tweens.add({
            targets: wordsText,
            alpha: 1,
            duration: 400,
            delay: 400,
        });

        this.tweens.add({
            targets: responseComplete,
            alpha: 1,
            duration: 400,
            delay: 600,
        });

        this.tweens.add({
            targets: scoreDisplay,
            alpha: 1,
            duration: 400,
            delay: 800,
        });

        this.tweens.add({
            targets: continueText,
            alpha: 1,
            duration: 400,
            delay: 1000,
        });
    }

    private createExplosionEffect(x: number, y: number) {
        const particles = this.add.particles(x, y, "enemy", {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
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

    update(time: number, delta: number) {
        if (this.gameOver || this.levelComplete) return;

        // Background
        this.background.tilePositionY -= 0.25;

        // Player rotation
        if (this.currentTarget) {
            this.player.aimAt(this.currentTarget.x, this.currentTarget.y);
        }
        this.player.updateRotation(delta);

        // Enemies
        this.enemies.forEach((enemy) => {
            enemy.updateSpriteDirection(this.player.x);

            const distance = Phaser.Math.Distance.Between(
                enemy.x,
                enemy.y,
                this.player.x,
                this.player.y
            );

            if (distance < 50 && enemy.isActive) {
                this.onEnemyReachedPlayer(enemy);
            }

            this.powerupManager?.getPowerups().forEach((powerup) => {
                if (powerup.isActive && !powerup.collected) {
                    const distToPowerup = Phaser.Math.Distance.Between(
                        enemy.x,
                        enemy.y,
                        powerup.x,
                        powerup.y
                    );
                    if (distToPowerup < 40) {
                        // Inimigo alcançou o powerup
                        this.powerupManager?.destroyPowerup(powerup);
                    }
                }
            });
        });

        // 🆕 DEBUG: Mostra quantidade de powerups ativos (raramente)
        if (this.powerupManager && Math.random() < 0.005) {
            // 0.5% chance por frame
            const count = this.powerupManager.getActivePowerupCount();
            const allPowerups = this.powerupManager.getPowerups();

            console.log(`📊 Powerups ativos: ${count}`);

            if (allPowerups.length > 0) {
                allPowerups.forEach((p) => {
                    console.log(
                        `   - "${p.originalWord}" em (${p.x.toFixed(
                            0
                        )}, ${p.y.toFixed(0)})`
                    );
                });
            }
        }

        // Powerups UPDATE (CRÍTICO!)
        if (this.powerupManager) {
            this.powerupManager.update(this.player);
        }

        // Bullets
        this.bullets.forEach((bullet) => {
            bullet.preUpdate(time, delta);
        });

        this.bullets = this.bullets.filter((bullet) => bullet.active);

        // Lives
        this.hudManager.updateLives(this.player.getLives());

        // Game Over
        if (this.player.getLives() <= 0 && !this.gameOver) {
            this.triggerGameOver();
        }
    }

    private onEnemyReachedPlayer(enemy: Enemy) {
        console.log("💥 Inimigo alcançou o jogador!");

        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }

        if (this.currentTarget === enemy) {
            this.currentTarget = null;
            this.typedWord = "";
        }

        enemy.destroy();
        this.player.takeDamage(1);
    }

    private triggerGameOver() {
        this.gameOver = true;

        console.log("💀 GAME OVER");

        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }
        if (this.powerupManager) {
            this.powerupManager.cleanup();
        }

        this.audioManager.stopBGM();

        this.screenManager.showGameOver(this.score, () => this.restartLevel());
    }

    private restartLevel() {
        console.log("🔄 Reiniciando nível...");

        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.cleanupScene();
            this.scene.restart();
        });
    }

    private returnToMenu() {
        console.log("🔙 Retornando ao menu...");

        this.audioManager.stopBGM();

        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.cleanupScene();
            this.scene.start("MenuScene");
        });
    }

    private cleanupScene() {
        // Input
        this.inputManager.cleanup();

        // ✅ REMOVE EVENT LISTENERS DE POWERUP
        this.events.off("powerupDestroyed", this.onPowerupDestroyed, this);
        this.events.off("powerupCollected", this.onPowerupCollected, this);

        // Enemies
        this.enemies.forEach((enemy) => {
            if (enemy.active) {
                enemy.destroy();
            }
        });
        this.enemies = [];

        // ✅ POWERUPS (IMPORTANTE!)
        if (this.powerupManager) {
            this.powerupManager.cleanup();
            this.powerupManager = undefined;
        }

        // Bullets
        this.bullets.forEach((bullet) => {
            if (bullet.active) {
                bullet.destroy();
            }
        });
        this.bullets = [];

        // Timers
        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }

        // HUD
        this.hudManager.destroy();

        // References
        this.currentTarget = null;
        this.typedWord = "";

        console.log("🧹 Cena limpa!");
    }

    shutdown() {
        this.cleanupScene();
    }
}
