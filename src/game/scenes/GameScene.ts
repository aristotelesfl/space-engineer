import Phaser from "phaser";
import { spawnEnemy } from "../../core/usecases/enemy/spawnEnemy";
import { Enemy } from "../../core/entities/Enemy";
import { Player } from "../../core/entities/Player";

export default class GameScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.TileSprite; // O fundo com rolagem.
    private enemiesGroup!: Phaser.GameObjects.Group; // Um grupo para gerir todos os inimigos.
    private playerEntity!: Player; // A nossa classe lógica do jogador.
    private playerSprite!: Phaser.GameObjects.Sprite; // O objeto visual do jogador no ecrã.
    private bulletsGroup!: Phaser.GameObjects.Group; // Um grupo para gerir todas as balas (object pooling).
    private bulletSpeed: number = 500; // Velocidade das balas em pixels/segundo.

    constructor(
        public speed: number,
        public spawnRate: number,
        public gates: string[]
    ) {
        super("GameScene");
    }

    // O método preload() é onde carregamos todos os recursos (imagens, sons) antes do jogo começar.
    preload() {
        this.load.image("player", "assets/player.png");
        this.load.image("enemy", "assets/enemy.png");
        this.load.image("bullet", "assets/bullet.png");
        this.load.image("background", "assets/background.png");
    }

    // O método create() é executado uma vez, no início, para configurar a cena.
    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // Cria a entidade lógica do jogador.
        this.playerEntity = new Player(
            crypto.randomUUID(),
            3,
            screenWidth / 2,
            screenHeight - 100
        );

        // Adiciona o fundo e o sprite do jogador ao ecrã.
        this.background = this.add
            .tileSprite(0, 0, screenWidth, screenHeight, "background")
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.playerSprite = this.add.sprite(
            this.playerEntity.getPosition().x,
            this.playerEntity.getPosition().y,
            "player"
        );

        // Inicializa os grupos que vão guardar os inimigos e as balas.
        this.enemiesGroup = this.add.group();
        this.bulletsGroup = this.physics.add.group({
            defaultKey: "bullet",
            maxSize: 30, // Limita o número de balas no ecrã para otimizar a performance.
        });

        // Cria um temporizador para gerar novos inimigos a cada 'spawnRate' milissegundos.
        this.time.addEvent({
            delay: this.spawnRate,
            callback: () => {
                this.spawnEnemyOnScreen(screenWidth);
            },
            loop: true,
        });

        this.physics.add.collider(
            this.bulletsGroup,
            this.enemiesGroup,
            (bullet, enemy) => {
                const bulletSprite = bullet as Phaser.GameObjects.Sprite;
                const enemySprite = enemy as Phaser.GameObjects.Sprite;

                // Desativa explicitamente o corpo físico dos objetos.
                (bulletSprite.body as Phaser.Physics.Arcade.Body).enable =
                    false;
                (enemySprite.body as Phaser.Physics.Arcade.Body).enable = false;

                // Esconde a bala e o inimigo.
                bulletSprite.setActive(false);
                bulletSprite.setVisible(false);

                enemySprite.setActive(false);
                enemySprite.setVisible(false);
            },
            undefined,
            this
        );
    }

    // Esta função pública é chamada pelo nosso código React para iniciar a ação de tiro.
    public shoot(): void {
        if (!this.playerSprite) {
            return;
        }

        const bullet = this.bulletsGroup.get(
            this.playerSprite.x,
            this.playerSprite.y - 30
        ) as Phaser.GameObjects.Sprite;

        if (bullet) {
            const body = bullet.body as Phaser.Physics.Arcade.Body;
            body.enable = true;

            // Ativa a bala e a torna visível.
            bullet.setActive(true);
            bullet.setVisible(true);

            // Reposiciona o corpo físico no local correto para o disparo.
            body.reset(this.playerSprite.x, this.playerSprite.y - 30);

            // Define a velocidade da bala para que ela se mova para cima.
            body.velocity.y = -this.bulletSpeed;
        }
    }

    // O método update() é o "coração" do jogo, executado a cada frame.
    update() {
        // Faz o fundo mover-se para criar a ilusão de rolagem.
        this.background.tilePositionY -= this.speed;
        this.updateEnemyPosition();

        // Verifica todas as balas no grupo.
        this.bulletsGroup.getChildren().forEach((child) => {
            const bullet = child as Phaser.GameObjects.Sprite;
            if (bullet.y < 0 && bullet.active) {
                (bullet.body as Phaser.Physics.Arcade.Body).enable = false;
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });
    }

    // Move cada inimigo ativo na direção do jogador.
    private updateEnemyPosition(): void {
        this.enemiesGroup.getChildren().forEach((enemySprite) => {
            if (enemySprite.active) {
                const sprite = enemySprite as Phaser.GameObjects.Sprite;
                const entity: Enemy = sprite.getData("entity");
                entity.moveToward(this.playerEntity.getPosition());
                sprite.setPosition(entity.x, entity.y);
            }
        });
    }

    // Cria uma nova entidade e sprite de inimigo e a adiciona à cena.
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
}
