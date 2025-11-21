import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    lives: number;
    isAlive: boolean;
    maxLives: number;
    private targetRotation: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, lives: number = 3) {
        super(scene, x, y, "player");

        this.maxLives = lives;
        this.lives = lives;
        this.isAlive = true;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setAllowGravity(false);
    }

    aimAt(targetX: number, targetY: number) {
        // Calcula o ângulo alvo
        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );

        this.targetRotation = angle + Math.PI / 2;
    }

    updateRotation(delta: number) {
        // Rotação suave com interpolação
        const rotationSpeed = 5; // Velocidade de rotação (quanto maior, mais rápido)
        const deltaSeconds = delta / 1000;

        // Calcula a diferença entre rotação atual e alvo
        let diff = this.targetRotation - this.rotation;

        // Normaliza para -PI a PI (caminho mais curto)
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        // Interpola suavemente
        this.rotation += diff * rotationSpeed * deltaSeconds;
    }

    takeDamage(amount: number = 1) {
        this.lives -= amount;

        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3,
        });

        if (this.lives <= 0) {
            this.die();
        }
    }

    die() {
        this.isAlive = false;

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0,
            duration: 500,
            onComplete: () => {
                this.setActive(false);
                this.setVisible(false);
            },
        });
    }

    reset() {
        this.lives = this.maxLives;
        this.isAlive = true;
        this.setAlpha(1);
        this.setScale(1);
        this.setActive(true);
        this.setVisible(true);
        this.rotation = 0;
        this.targetRotation = 0;
    }

    getLives(): number {
        return this.lives;
    }

    public resetAim() {
        this.targetRotation = 0;
    }
}
