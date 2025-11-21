import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { Powerup } from "./Powerup";

export class Bullet extends Phaser.GameObjects.Container {
    target: Enemy | Powerup;
    speed: number = 460;
    letter: string;
    sprite: Phaser.GameObjects.Sprite;
    letterText: Phaser.GameObjects.Text;
    hasHit: boolean = false;
    collided: boolean = false; // Nova flag para powerups
    velocityX: number = 0;
    velocityY: number = 0;
    private isDestroyed: boolean = false;
    private directionX: number = 0;
    private directionY: number = 0;
    isLastBullet: boolean = false;

    static projectileSpeedMultiplier: number = 2;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        target: Enemy | Powerup,
        letter: string
    ) {
        super(scene, x, y);

        this.target = target;
        this.letter = letter;

        this.speed = 400 * Bullet.projectileSpeedMultiplier;

        this.sprite = scene.add.sprite(0, 0, "bullet");
        this.sprite.setOrigin(0.5);

        this.letterText = scene.add.text(0, 0, letter.toUpperCase(), {
            fontSize: "14px",
            color: "#000000",
            fontStyle: "bold",
        });
        this.letterText.setOrigin(0.5);

        this.add([this.sprite, this.letterText]);

        scene.add.existing(this);

        this.shootTowards(target.x, target.y);

        console.log(
            `🚀 Projétil criado (velocidade: ${this.speed.toFixed(0)}px/s)`
        );
    }

    shootTowards(targetX: number, targetY: number) {
        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );

        this.directionX = Math.cos(angle);
        this.directionY = Math.sin(angle);

        this.velocityX = this.directionX * this.speed;
        this.velocityY = this.directionY * this.speed;

        this.sprite.setRotation(angle);
    }

    preUpdate(time: number, delta: number) {
        if (this.isDestroyed || this.hasHit || this.collided) return;

        const deltaSeconds = delta / 1000;
        this.x += this.velocityX * deltaSeconds;
        this.y += this.velocityY * deltaSeconds;

        if (this.target && this.target.active) {
            const distance = Phaser.Math.Distance.Between(
                this.x,
                this.y,
                this.target.x,
                this.target.y
            );

            if (distance < 30) {
                this.onCollision();
                return;
            }
        }

        const bounds = this.scene.scale;
        if (
            this.x < -50 ||
            this.x > bounds.width + 50 ||
            this.y < -50 ||
            this.y > bounds.height + 50
        ) {
            console.log("❌ Projétil saiu da tela");
            this.safeDestroy();
        }
    }

    private onCollision() {
        if (this.hasHit || this.collided || this.isDestroyed) return;

        this.hasHit = true;
        this.collided = true;

        console.log(`💥 Projétil colidiu!`);

        if (this.target instanceof Enemy) {
            console.log(`   🎯 Alvo: Enemy`);
            if (this.target.active) {
                this.target.onHit(
                    this.directionX,
                    this.directionY,
                    this.isLastBullet
                );
            }
        } else if (this.target instanceof Powerup) {
            console.log(`   ⭐ Alvo: Powerup`);

            // ✅ SE FOR O ÚLTIMO PROJÉTIL, DESTRÓI O POWERUP
            if (this.isLastBullet) {
                console.log(`   💥 ÚLTIMO PROJÉTIL - Destruindo powerup!`);
                this.scene.events.emit("powerupDestroyed", this.target);
            }
        }

        this.safeDestroy();
    }

    private safeDestroy() {
        if (this.isDestroyed) return;

        this.isDestroyed = true;
        console.log("🗑️ Projétil destruído");

        this.velocityX = 0;
        this.velocityY = 0;

        this.destroy(true);
    }

    destroy(fromScene?: boolean) {
        if (!this.isDestroyed) {
            this.isDestroyed = true;
        }
        super.destroy(fromScene);
    }
}
