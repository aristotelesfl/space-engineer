import Phaser from "phaser";
import { spawnEnemy } from "../../core/usecases/enemy/spawnEnemy";
import { Enemy } from "../../core/entities/Enemy";
import { Player } from "../../core/entities/Player";

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
        this.load.image("enemy", "assets/enemy.png");
        this.load.image("bullet", "assets/bullet.png");
    }

    create() {
        const { width, height } = this.scale;
        this.playerEntity = new Player(
            crypto.randomUUID(),
            3,
            width / 2,
            height - 100
        );

        this.background = this.add
            .tileSprite(0, 0, width, height, "background")
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
                this.spawnEnemyOnScreen(width);
            },
            loop: true,
        });
    }

    update() {
        this.background.tilePositionY -= this.speed;

        this.updateEnemyPosition();
    }

    private updateEnemyPosition(): void {
        this.enemiesGroup.getChildren().forEach((enemySprite) => {
            const sprite = enemySprite as Phaser.GameObjects.Sprite;
            const entity: Enemy = sprite.getData("entity");
            entity.moveToward(this.playerEntity.getPosition());
            sprite.setPosition(entity.x, entity.y);
        });
    }

    private spawnEnemyOnScreen(width: number): void {
        const enemyEntity = spawnEnemy(
            width,
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
}
