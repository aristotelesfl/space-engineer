import Phaser from "phaser";
import GameScene from "../../game/scenes/GameScene";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    word: string;
    originalWord: string;
    wordText: Phaser.GameObjects.Text;
    speed: number;
    isActive: boolean;
    isTargeted: boolean;
    isStunned: boolean = false;
    private spriteLeft: string = "enemy-left";
    private spriteCenter: string = "enemy";
    private spriteRight: string = "enemy-right";
    private targetIndicator!: Phaser.GameObjects.Graphics;
    private originalVelocityX: number = 0;
    private originalVelocityY: number = 0;
    private stunDuration: number = 300;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        word: string,
        speed: number
    ) {
        super(scene, x, y, "enemy");

        this.word = word.toLowerCase();
        this.originalWord = word.toLowerCase();
        this.speed = speed;
        this.isActive = false;
        this.isTargeted = false;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(false);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);

        // Indicador de alvo
        this.targetIndicator = scene.add.graphics();
        this.targetIndicator.lineStyle(3, 0xff0000, 1);
        this.targetIndicator.strokeCircle(0, 0, 35);
        this.targetIndicator.setVisible(false);

        // Texto da palavra
        this.wordText = scene.add.text(0, 0, this.word, {
            fontSize: "20px",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 5, y: 5 },
        });
        this.wordText.setOrigin(0.5, 1);
        this.updateWordDisplay();
    }

    startMoving(targetX: number, targetY: number) {
        this.isActive = true;
        const body = this.body as Phaser.Physics.Arcade.Body;

        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );

        const velocityX = Math.cos(angle) * this.speed;
        const velocityY = Math.sin(angle) * this.speed;

        body.setVelocity(velocityX, velocityY);

        this.originalVelocityX = velocityX;
        this.originalVelocityY = velocityY;
    }

    setTargeted(targeted: boolean) {
        this.isTargeted = targeted;
        this.targetIndicator.setVisible(targeted);
        this.updateWordDisplay();
    }

    updateSpriteDirection(playerX: number) {
        const threshold = 30;

        if (this.x < playerX - threshold) {
            this.setTexture(this.spriteRight);
        } else if (this.x > playerX + threshold) {
            this.setTexture(this.spriteLeft);
        } else {
            this.setTexture(this.spriteCenter);
        }
    }

    updateWordDisplay() {
        this.wordText.setText(this.word);

        if (this.isTargeted) {
            this.wordText.setStyle({
                fontSize: "20px",
                color: "#ffff00",
                backgroundColor: "#660000",
                padding: { x: 5, y: 5 },
            });
        } else {
            this.wordText.setStyle({
                fontSize: "20px",
                color: "#ffffff",
                backgroundColor: "#000000",
                padding: { x: 5, y: 5 },
            });
        }
    }

    checkLetter(letter: string): boolean {
        if (!this.isActive || this.word.length === 0) return false;
        return letter === this.word[0];
    }

    removeFirstLetter() {
        if (this.word.length > 0) {
            this.word = this.word.substring(1);
            this.updateWordDisplay();
            console.log(`✂️ Letra removida. Palavra restante: "${this.word}"`);
        }
    }

    // Método chamado quando o projétil atinge a nave
    onHit(
        directionX: number,
        directionY: number,
        isLastBullet: boolean = false
    ) {
        // Proteção: ignora hits durante destruição
        if (!this.active) {
            console.log(`⚠️ Hit ignorado (nave inativa)`);
            return;
        }

        console.log(
            `🎯 Nave atingida!${
                isLastBullet ? " (ÚLTIMO HIT!)" : ""
            } Palavra atual: "${this.word}"`
        );

        // 1. KNOCKBACK: Move 1px na direção oposta
        const knockbackDistance = 1;
        this.x -= directionX * knockbackDistance;
        this.y -= directionY * knockbackDistance;

        console.log(`👊 Knockback aplicado`);

        // 2. STUN: Congela movimento por 300ms
        this.applyStun();

        // 3. Efeito visual de impacto (flash branco)
        this.setTint(0xffffff);

        this.scene.time.delayedCall(50, () => {
            if (this.active) {
                this.clearTint();
            }
        });

        // 4. VERIFICA SE É O ÚLTIMO PROJÉTIL
        if (isLastBullet) {
            console.log(`💥 ÚLTIMO PROJÉTIL ACERTOU! Iniciando destruição...`);
            this.startDestructionSequence();
        }
    }

    // Inicia a sequência de destruição (explosão)
    private startDestructionSequence() {
        // Remove o círculo vermelho de alvo
        this.setTargeted(false);

        // Para o movimento completamente
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);

        // Notifica a cena que esta nave deve ser destruída
        (this.scene as GameScene).onEnemyReadyToDestroy(this);
    }

    private applyStun() {
        if (this.isStunned) {
            // Se já está em stun, apenas reseta o timer
            console.log(`🥶 Stun resetado`);
        } else {
            this.isStunned = true;
            console.log(`🥶 Stun aplicado (${this.stunDuration}ms)`);
        }

        const body = this.body as Phaser.Physics.Arcade.Body;

        // Guarda velocidades atuais
        if (body.velocity.x !== 0 || body.velocity.y !== 0) {
            this.originalVelocityX = body.velocity.x;
            this.originalVelocityY = body.velocity.y;
        }

        // Congela movimento
        body.setVelocity(0, 0);

        // Agenda o fim do stun
        this.scene.time.delayedCall(this.stunDuration, () => {
            this.removeStun();
        });
    }

    private removeStun() {
        if (!this.active || this.isCompleted()) return;

        this.isStunned = false;
        const body = this.body as Phaser.Physics.Arcade.Body;

        console.log(`✅ Stun removido - movimento retomado`);

        // Restaura velocidades originais
        body.setVelocity(this.originalVelocityX, this.originalVelocityY);
    }

    isCompleted(): boolean {
        return this.word.length === 0;
    }

    getNextLetter(): string {
        return this.word.length > 0 ? this.word[0] : "";
    }

    getDistanceToPoint(x: number, y: number): number {
        return Phaser.Math.Distance.Between(this.x, this.y, x, y);
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        if (this.wordText) {
            this.wordText.setPosition(this.x, this.y - 40);
        }

        if (this.targetIndicator) {
            this.targetIndicator.setPosition(this.x, this.y);
        }

        if (this.y > (this.scene as GameScene).scale.height + 50) {
            this.destroy();
        }
    }

    destroy(fromScene?: boolean) {
        if (this.wordText) {
            this.wordText.destroy();
        }
        if (this.targetIndicator) {
            this.targetIndicator.destroy();
        }
        super.destroy(fromScene);
    }
}
