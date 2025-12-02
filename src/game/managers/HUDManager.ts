import Phaser from "phaser";
import Player from "../../core/entities/Player";

export class HUDManager {
    private scene: Phaser.Scene;
    private bottomHudLayer!: Phaser.GameObjects.TileSprite;
    private bottomTextLayer!: Phaser.GameObjects.Graphics;
    private topHudLayer!: Phaser.GameObjects.TileSprite;
    private topTextLayer!: Phaser.GameObjects.Graphics;
    private questionText!: Phaser.GameObjects.Text;
    private responseTextDisplay!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private livesSprites: Phaser.GameObjects.Sprite[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    create(questionText: string, responseText: string, player: Player) {
        const { width, height } = this.scene.scale;

        this.bottomHudLayer = this.scene.add.tileSprite(
            0,
            height - 100,
            width,
            100,
            "bottomHudLayer"
        );
        const tex = this.scene.textures.get("bottomHudLayer").getSourceImage();
        const originalWidth = tex.width;

        this.bottomHudLayer.setScale(width / originalWidth, 1);
        this.bottomHudLayer.setDepth(999);
        this.bottomHudLayer.setOrigin(0, 0);

        this.bottomTextLayer = this.scene.add.graphics();
        this.bottomTextLayer.fillStyle(0x111b2d, 1);
        this.bottomTextLayer.fillRoundedRect(
            20,
            height - 60,
            width - 40,
            50,
            20
        );
        this.bottomTextLayer.setDepth(1000);
        this.bottomTextLayer.setDepth(1000);

        this.topHudLayer = this.scene.add.tileSprite(
            0,
            0,
            width,
            100,
            "topHudLayer"
        );

        this.topHudLayer.setOrigin(0, 0);
        this.topHudLayer.setDepth(1000);
        this.topHudLayer.setAngle(180);
        this.topHudLayer.y += this.topHudLayer.displayHeight;
        this.topHudLayer.x += this.topHudLayer.displayWidth;
        this.topHudLayer.setScale(width / originalWidth, 1);

        this.topTextLayer = this.scene.add.graphics();
        this.topTextLayer.fillStyle(0x111b2d, 1);
        this.topTextLayer.fillRoundedRect(20, 20, width - 40, 60, 20);
        this.topTextLayer.setDepth(1000);

        this.questionText = this.scene.add.text(
            width / 2,
            40,
            questionText || "O que são requisitos funcionais?",
            {
                fontSize: "30px",
                color: "#ffffff",
                fontFamily: "monospace",
                align: "center",
                wordWrap: { width: width - 40 },
            }
        );
        this.questionText.setOrigin(0.5);
        this.questionText.setDepth(1001);

        // Response Text
        this.responseTextDisplay = this.scene.add.text(
            width / 2,
            height - 40,
            responseText || "Complete as lacunas coletando powerups.",
            {
                fontSize: "20px",
                color: "#B1A12B",
                fontFamily: "monospace",
                align: "center",
                lineSpacing: 4,
                wordWrap: { width: width - 100 },
            }
        );
        this.responseTextDisplay.setOrigin(0, 0.5);
        this.responseTextDisplay.setDepth(1001);

        // Score
        this.scoreText = this.scene.add.text(
            width - 40,
            height - 130,
            `Score: 0`,
            {
                fontSize: "18px",
                color: "#ffffff",
                fontFamily: "monospace",
                align: "left",
            }
        );
        this.scoreText.setOrigin(1, 0.5);
        this.scoreText.setDepth(1001);

        // Vidas
        this.createLivesDisplay(player, width, height);

        console.log(`❤️ HUD criado com ${player.maxLives} vidas`);
    }

    private createLivesDisplay(player: Player, width: number, height: number) {
        const maxLives = player.maxLives;
        const lifeSize = 32;
        const lifeSpacing = 10;
        const startX = 20;
        const startY = height - 100;

        for (let i = 0; i < maxLives; i++) {
            const lifeSprite = this.scene.add.sprite(
                startX + i * (lifeSize + lifeSpacing),
                startY,
                "player"
            );
            lifeSprite.setOrigin(0, 1.5);
            lifeSprite.setScale(0.6);
            lifeSprite.setDepth(1001);

            this.livesSprites.push(lifeSprite);
        }
    }

    updateResponseText(text: string) {
        if (!this.responseTextDisplay) return;

        this.responseTextDisplay.setText(text);
        console.log(`📝 HUD atualizado: "${text}"`);

        // Efeito visual de atualização
        this.scene.tweens.add({
            targets: this.responseTextDisplay,
            scale: 1.05,
            duration: 150,
            yoyo: true,
            ease: "Back.easeOut",
        });
    }

    updateScore(score: number) {
        this.scoreText.setText(`Score: ${score}`);
    }

    updateLives(currentLives: number) {
        this.livesSprites.forEach((sprite, index) => {
            if (index < currentLives) {
                sprite.setAlpha(1);
            } else {
                sprite.setAlpha(0.3);
            }
        });
    }

    destroy() {
        this.livesSprites.forEach((sprite) => sprite.destroy());
        this.livesSprites = [];
    }
}
