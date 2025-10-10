import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    lives: number;
    isAlive: boolean;
    maxLives: number;

    constructor(scene: Phaser.Scene, x: number, y: number, lives: number = 3) {
        super(scene, x, y, "player");

        this.maxLives = lives;
        this.lives = lives;
        this.isAlive = true;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configura física
        this.setCollideWorldBounds(true);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setAllowGravity(false);
    }

    takeDamage(amount: number = 1) {
        this.lives -= amount;

        // Efeito visual de dano
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

        // Animação de morte
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
    }

    getLives(): number {
        return this.lives;
    }
}
