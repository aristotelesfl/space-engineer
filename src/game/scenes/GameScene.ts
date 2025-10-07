import Phaser from "phaser";
import { spawnEnemy } from "../../core/usecases/enemy/spawnEnemy";
import { Enemy } from "../../core/entities/Enemy";
import { Player } from "../../core/entities/Player";
import GameObject = Phaser.GameObjects.GameObject;

export default class GameScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.TileSprite;
    private enemiesGroup!: Phaser.GameObjects.Group;
    private playerEntity!: Player;

    constructor(
        public speed: number,
        public spawnRate: number,
        public gates: string[]
    ) {
        super("GameScene");
    }

    preload() {
        this.load.image("player", "assets/player.png");
        this.load.image("enemy", "assets/enemy.png");
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("background", "assets/background.png");
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        this.playerEntity = new Player(
            crypto.randomUUID(),
            3,
            screenWidth / 2,
            screenHeight - 100
        );

        this.background = this.add
            .tileSprite(0, 0, screenWidth, screenHeight, "background")
            .setOrigin(0, 0)
            .setScrollFactor(0);

        const playerSprite = this.add.sprite(
            this.playerEntity.getPosition().x,
            this.playerEntity.getPosition().y,
            "player"
        );

        this.enemiesGroup = this.add.group();

        this.time.addEvent({
            delay: this.spawnRate,
            callback: () => {
                this.spawnEnemyOnScreen(screenWidth);
            },
            loop: true,
        });
    }

    update() {
        this.background.tilePositionY -= this.speed;

        this.updateEnemyPosition();
        this.checkEnemyCollision();
    }

    private updateEnemyPosition(): void {
        this.enemiesGroup.getChildren().forEach((enemySprite) => {
            const sprite = enemySprite as Phaser.GameObjects.Sprite;
            const entity: Enemy = sprite.getData("entity");
            entity.moveToward(this.playerEntity.getPosition());
            sprite.setPosition(entity.x, entity.y);
        });
    }

    private spawnEnemyOnScreen(screenWidth: number): void {
        const enemyEntity = spawnEnemy(
            screenWidth,
            this.playerEntity.getPosition(),
            this.speed,
            this.gates[Math.floor(Math.random() * this.gates.length)]
        );
        const enemySprite = this.physics.add.sprite(
            enemyEntity.x,
            enemyEntity.y,
            "enemy"
        );
        enemySprite.setData("entity", enemyEntity);
        this.enemiesGroup.add(enemySprite);
    }

    private checkEnemyCollision(): void {
        const player = this.playerEntity;

        if (!player.isAlive()){
            return;
        }

        const player_position = player.getPosition();
        // const enemies_to_destroy: Phaser.GameObjects.Sprite[] = [];

        // Itera sobre todos os inimigos ativos no grupo
        this.enemiesGroup.getChildren().forEach((enemySprite) => {
            const sprite = enemySprite as Phaser.GameObjects.Sprite;
            const enemy: Enemy = sprite.getData("entity");

            // Verifica se o inimigo alcançou o jogador(atingiu coordenadas muito próximas às dele)
            if (Math.abs(enemy.x - player_position.x) < 1 && Math.abs(enemy.y - player_position.y) < 1 ) {

                // se o inimigo ainda está na tela
                // verificação evita a chamada mútipla da função
                if (!sprite.scene){
                    return;
                }

                player.takeDamage();
                console.log(`Colisão detectada! Vidas restantes: ${player.getLives()}`);

                this.enemiesGroup.remove(sprite, true, true);

                if (!player.isAlive()){
                    console.log('GAME OVER!');
                    this.scene.pause();
                }
            }
        });
    }

}
