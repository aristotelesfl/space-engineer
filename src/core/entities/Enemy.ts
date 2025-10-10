import Phaser from "phaser";
import GameScene from "../../game/scenes/GameScene";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    word: string;
    wordText: Phaser.GameObjects.Text;
    speed: number;
    isActive: boolean;
    currentLetterIndex: number;
    private spriteMaxLeft: string = "enemy-max-left";
    private spriteLeft: string = "enemy-left";
    private spriteCenter: string = "enemy";
    private spriteRight: string = "enemy-right";
    private spriteMaxRight: string = "enemy-max-right";

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        word: string,
        speed: number
    ) {
        super(scene, x, y, "enemy");

        this.word = word.toUpperCase();
        this.speed = speed;
        this.isActive = false;
        this.currentLetterIndex = 0;

        // Adiciona o sprite ao jogo
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configura física
        this.setCollideWorldBounds(false);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);

        // Cria o texto da palavra acima do inimigo
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

        // Calcula o ângulo em direção ao jogador
        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );

        // Define a velocidade na direção do jogador
        body.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );

        // Não rotaciona mais - vamos usar sprites direcionais
        // this.rotation = angle + Math.PI / 2;
    }

    updateSpriteDirection(playerX: number) {
        const threshold = 100;

        if (this.x < playerX - threshold * 2) {
            // Inimigo está à esquerda do jogador
            this.setTexture(this.spriteMaxRight); // Olha para direita
        } else if (this.x < playerX - threshold) {
            this.setTexture(this.spriteRight); // Olha para direita
        } else if (this.x > playerX + threshold * 2) {
            this.setTexture(this.spriteMaxLeft); // Olha para esquerda
        } else if (this.x > playerX + threshold) {
            // Inimigo está à direita do jogador
            this.setTexture(this.spriteLeft); // Olha para esquerda
        } else {
            // Inimigo está alinhado com o jogador
            this.setTexture(this.spriteCenter);
        }
    }

    updateWordDisplay() {
        // Atualiza a cor das letras (verde para digitadas, branco para restantes)
        let displayText = "";
        for (let i = 0; i < this.word.length; i++) {
            if (i < this.currentLetterIndex) {
                displayText += `[color=#00ff00]${this.word[i]}[/color]`;
            } else {
                displayText += this.word[i];
            }
        }

        // Versão simplificada sem BBCode (Phaser não suporta nativamente)
        const typedPart = this.word.substring(0, this.currentLetterIndex);
        const remainingPart = this.word.substring(this.currentLetterIndex);

        this.wordText.setText(typedPart + remainingPart);
        this.wordText.setColor(
            this.currentLetterIndex > 0 ? "#00ff00" : "#ffffff"
        );
    }

    checkLetter(letter: string): boolean {
        if (!this.isActive) return false;

        if (letter === this.word[this.currentLetterIndex]) {
            this.currentLetterIndex++;
            this.updateWordDisplay();

            if (this.currentLetterIndex >= this.word.length) {
                // Palavra completa!
                return true;
            }
        }

        return false;
    }

    isCompleted(): boolean {
        return this.currentLetterIndex >= this.word.length;
    }

    getNextLetter(): string {
        return this.word[this.currentLetterIndex] || "";
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        // Atualiza posição do texto para seguir o inimigo
        if (this.wordText) {
            this.wordText.setPosition(this.x, this.y - 40);
        }

        // Remove se sair da tela
        if (this.y > (this.scene as GameScene).scale.height + 50) {
            this.destroy();
        }
    }

    destroy(fromScene?: boolean) {
        if (this.wordText) {
            this.wordText.destroy();
        }
        super.destroy(fromScene);
    }
}
