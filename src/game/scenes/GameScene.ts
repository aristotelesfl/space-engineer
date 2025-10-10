import Phaser from "phaser";
import { Enemy } from "../../core/entities/Enemy";
import Player from "../../core/entities/Player";

export default class GameScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.TileSprite;
    private player!: Player;
    private enemies!: Phaser.Physics.Arcade.Group;
    private activeEnemy: Enemy | null = null;

    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;

    private spawnTimer!: Phaser.Time.TimerEvent;
    private spawnRate: number = 2000; // ms
    private enemySpeed: number = 50;

    // Lista de palavras para os inimigos
    private words: string[] = ["AND", "OR", "NOR", "XOR", "NAND", "XNOR"];

    constructor() {
        super("GameScene");
    }

    preload() {
        // Placeholder - você deve ter suas próprias imagens
        this.load.image("player", "assets/player.png");
        this.load.image("enemy", "assets/enemy.png");
        this.load.image("enemy-left", "assets/enemy-left.png");
        this.load.image("enemy-max-left", "assets/enemy-extra-left.png");
        this.load.image("enemy-max-right", "assets/enemy-extra-right.png");
        this.load.image("enemy-right", "assets/enemy-right.png");
        this.load.image("background", "assets/background.png");
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.background = this.add
            .tileSprite(0, 0, width, height, "background")
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // Player
        this.player = new Player(this, width / 2, height - 100, 3);

        // Grupo de inimigos
        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true,
        });

        // Colisão entre player e inimigos
        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerEnemyCollision,
            undefined,
            this
        );

        // UI
        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "24px",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 10, y: 5 },
        });

        this.livesText = this.add.text(
            16,
            50,
            `Lives: ${this.player.getLives()}`,
            {
                fontSize: "24px",
                color: "#ffffff",
                backgroundColor: "#000000",
                padding: { x: 10, y: 5 },
            }
        );

        // Input de teclado
        this.input.keyboard?.on("keydown", this.handleKeyPress, this);

        // Timer para spawn de inimigos
        this.spawnTimer = this.time.addEvent({
            delay: this.spawnRate,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });

        // Spawna alguns inimigos iniciais
        this.time.delayedCall(500, () => this.spawnEnemy());
    }

    update(time: number, delta: number) {
        // Anima o background
        this.background.tilePositionY -= 1;

        // Atualiza UI
        this.livesText.setText(`Lives: ${this.player.getLives()}`);

        // Atualiza direção dos sprites dos inimigos
        const enemyList = this.enemies.getChildren() as Enemy[];
        for (const enemy of enemyList) {
            if (enemy.active) {
                enemy.updateSpriteDirection(this.player.x);
            }
        }
    }

    private spawnEnemy() {
        const { width } = this.scale;

        // Posição aleatória no topo da tela
        const x = Phaser.Math.Between(50, width - 50);
        const y = -50;

        // Palavra aleatória
        const word = Phaser.Utils.Array.GetRandom(this.words);

        // Cria o inimigo
        const enemy = new Enemy(this, x, y, word, this.enemySpeed);
        this.enemies.add(enemy);

        // Move em direção ao jogador
        enemy.startMoving(this.player.x, this.player.y);
    }

    private handleKeyPress(event: KeyboardEvent) {
        if (!this.player.isAlive) return;

        const key = event.key.toLowerCase();

        // Se não há inimigo ativo, procura um que comece com a letra
        if (!this.activeEnemy || this.activeEnemy.isCompleted()) {
            this.activeEnemy = this.findEnemyStartingWith(key);
            if (!this.activeEnemy) return;
        }

        // Verifica se a letra está correta
        const isCorrect = this.activeEnemy.checkLetter(key);

        if (this.activeEnemy.isCompleted()) {
            // Inimigo destruído!
            this.destroyEnemy(this.activeEnemy);
            this.activeEnemy = null;

            // Som de sucesso (você pode adicionar)
            // this.sound.play("destroy");
        }
    }

    private findEnemyStartingWith(letter: string): Enemy | null {
        const enemyList = this.enemies.getChildren() as Enemy[];

        for (const enemy of enemyList) {
            if (enemy.active && enemy.getNextLetter() === letter) {
                return enemy;
            }
        }

        return null;
    }

    private destroyEnemy(enemy: Enemy) {
        // Adiciona pontos
        this.score += enemy.word.length * 10;
        this.scoreText.setText(`Score: ${this.score}`);

        // Efeito visual
        this.tweens.add({
            targets: enemy,
            scale: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                enemy.destroy();
            },
        });
    }

    private handlePlayerEnemyCollision(
        playerObj:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile
            | Phaser.Physics.Arcade.Body
            | Phaser.Physics.Arcade.StaticBody,
        enemyObj:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Tilemaps.Tile
            | Phaser.Physics.Arcade.Body
            | Phaser.Physics.Arcade.StaticBody
    ) {
        // Extrai o gameObject do Body se necessário
        const player = (playerObj as any).gameObject
            ? ((playerObj as any).gameObject as Player)
            : (playerObj as Player);
        const enemy = (enemyObj as any).gameObject
            ? ((enemyObj as any).gameObject as Enemy)
            : (enemyObj as Enemy);

        if (!enemy.active) return;

        // Player toma dano
        player.takeDamage(1);

        // Remove o inimigo
        enemy.destroy();

        // Se era o inimigo ativo, limpa
        if (this.activeEnemy === enemy) {
            this.activeEnemy = null;
        }

        // Game over
        if (!this.player.isAlive) {
            this.gameOver();
        }
    }

    private gameOver() {
        // Para o spawn
        this.spawnTimer.destroy();

        // Destrói todos os inimigos
        this.enemies.clear(true, true);

        // Mensagem de game over
        const { width, height } = this.scale;
        const gameOverText = this.add.text(width / 2, height / 2, "GAME OVER", {
            fontSize: "64px",
            color: "#ff0000",
            backgroundColor: "#000000",
            padding: { x: 20, y: 10 },
        });
        gameOverText.setOrigin(0.5);

        const finalScoreText = this.add.text(
            width / 2,
            height / 2 + 80,
            `Final Score: ${this.score}`,
            {
                fontSize: "32px",
                color: "#ffffff",
                backgroundColor: "#000000",
                padding: { x: 20, y: 10 },
            }
        );
        finalScoreText.setOrigin(0.5);

        const restartText = this.add.text(
            width / 2,
            height / 2 + 140,
            "Press SPACE to restart",
            {
                fontSize: "24px",
                color: "#ffffff",
                backgroundColor: "#000000",
                padding: { x: 20, y: 10 },
            }
        );
        restartText.setOrigin(0.5);

        // Restart com espaço
        this.input.keyboard?.once("keydown-SPACE", () => {
            this.scene.restart();
        });
    }
}
