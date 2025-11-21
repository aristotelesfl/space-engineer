import Phaser from "phaser";

export class ScreenManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    showGameOver(score: number, onRestart: () => void) {
        const { width, height } = this.scene.scale;

        const container = this.scene.add.container(0, 0);
        container.setDepth(2000);

        const overlay = this.scene.add.rectangle(
            0,
            0,
            width,
            height,
            0x000000,
            0.85
        );
        overlay.setOrigin(0, 0);

        const title = this.scene.add.text(
            width / 2,
            height / 2 - 120,
            "GAME OVER",
            {
                fontSize: "72px",
                color: "#ff3333",
                fontFamily: "Arial Black, sans-serif",
                fontStyle: "bold",
                stroke: "#660000",
                strokeThickness: 8,
            }
        );
        title.setOrigin(0.5);

        const scoreDisplay = this.scene.add.text(
            width / 2,
            height / 2 - 20,
            `SCORE FINAL: ${score}`,
            {
                fontSize: "36px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
            }
        );
        scoreDisplay.setOrigin(0.5);

        const line = this.scene.add.graphics();
        line.lineStyle(2, 0x666666, 1);
        line.lineBetween(
            width / 2 - 150,
            height / 2 + 20,
            width / 2 + 150,
            height / 2 + 20
        );

        const restartText = this.scene.add.text(
            width / 2,
            height / 2 + 60,
            "PRESSIONE ESPAÇO PARA REINICIAR",
            {
                fontSize: "20px",
                color: "#66ff66",
                fontFamily: "Arial, sans-serif",
            }
        );
        restartText.setOrigin(0.5);

        const menuText = this.scene.add.text(
            width / 2,
            height / 2 + 100,
            "PRESSIONE ESC PARA VOLTAR AO MENU",
            {
                fontSize: "20px",
                color: "#ffaa66",
                fontFamily: "Arial, sans-serif",
            }
        );
        menuText.setOrigin(0.5);

        container.add([
            overlay,
            title,
            scoreDisplay,
            line,
            restartText,
            menuText,
        ]);

        // Animações
        this.animateGameOverScreen(
            overlay,
            title,
            scoreDisplay,
            restartText,
            menuText
        );

        // Input
        this.scene.input.keyboard?.once("keydown-SPACE", onRestart);
    }

    showLevelComplete(score: number, responseText: string) {
        const { width, height } = this.scene.scale;

        const container = this.scene.add.container(0, 0);
        container.setDepth(2000);

        const overlay = this.scene.add.rectangle(
            0,
            0,
            width,
            height,
            0x000000,
            0.85
        );
        overlay.setOrigin(0, 0);

        const title = this.scene.add.text(
            width / 2,
            height / 2 - 120,
            "NÍVEL COMPLETO!",
            {
                fontSize: "72px",
                color: "#00ff00",
                fontFamily: "Arial Black, sans-serif",
                fontStyle: "bold",
                stroke: "#006600",
                strokeThickness: 8,
            }
        );
        title.setOrigin(0.5);

        const responseComplete = this.scene.add.text(
            width / 2,
            height / 2 - 20,
            responseText,
            {
                fontSize: "20px",
                color: "#ffff00",
                fontFamily: "Arial, sans-serif",
                align: "center",
                wordWrap: { width: width - 100 },
            }
        );
        responseComplete.setOrigin(0.5);

        const scoreDisplay = this.scene.add.text(
            width / 2,
            height / 2 + 60,
            `SCORE FINAL: ${score}`,
            {
                fontSize: "36px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
            }
        );
        scoreDisplay.setOrigin(0.5);

        const line = this.scene.add.graphics();
        line.lineStyle(2, 0x666666, 1);
        line.lineBetween(
            width / 2 - 150,
            height / 2 + 100,
            width / 2 + 150,
            height / 2 + 100
        );

        const continueText = this.scene.add.text(
            width / 2,
            height / 2 + 140,
            "PRESSIONE ESC PARA CONTINUAR",
            {
                fontSize: "20px",
                color: "#66ff66",
                fontFamily: "Arial, sans-serif",
            }
        );
        continueText.setOrigin(0.5);

        container.add([
            overlay,
            title,
            responseComplete,
            scoreDisplay,
            line,
            continueText,
        ]);

        // Animações
        this.animateLevelCompleteScreen(
            overlay,
            title,
            responseComplete,
            scoreDisplay,
            continueText
        );
    }

    private animateGameOverScreen(
        overlay: Phaser.GameObjects.Rectangle,
        title: Phaser.GameObjects.Text,
        scoreDisplay: Phaser.GameObjects.Text,
        restartText: Phaser.GameObjects.Text,
        menuText: Phaser.GameObjects.Text
    ) {
        overlay.setAlpha(0);
        title.setAlpha(0);
        title.setScale(0.5);
        scoreDisplay.setAlpha(0);
        restartText.setAlpha(0);
        menuText.setAlpha(0);

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0.85,
            duration: 300,
        });

        this.scene.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1,
            duration: 500,
            delay: 200,
            ease: "Back.easeOut",
        });

        this.scene.tweens.add({
            targets: scoreDisplay,
            alpha: 1,
            duration: 400,
            delay: 500,
        });

        this.scene.tweens.add({
            targets: restartText,
            alpha: 1,
            duration: 400,
            delay: 700,
        });

        this.scene.tweens.add({
            targets: menuText,
            alpha: 1,
            duration: 400,
            delay: 800,
        });

        this.scene.tweens.add({
            targets: restartText,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
    }

    private animateLevelCompleteScreen(
        overlay: Phaser.GameObjects.Rectangle,
        title: Phaser.GameObjects.Text,
        responseComplete: Phaser.GameObjects.Text,
        scoreDisplay: Phaser.GameObjects.Text,
        continueText: Phaser.GameObjects.Text
    ) {
        overlay.setAlpha(0);
        title.setAlpha(0);
        title.setScale(0.5);
        responseComplete.setAlpha(0);
        scoreDisplay.setAlpha(0);
        continueText.setAlpha(0);

        this.scene.tweens.add({
            targets: overlay,
            alpha: 0.85,
            duration: 300,
        });

        this.scene.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1,
            duration: 500,
            delay: 200,
            ease: "Back.easeOut",
        });

        this.scene.tweens.add({
            targets: responseComplete,
            alpha: 1,
            duration: 400,
            delay: 500,
        });

        this.scene.tweens.add({
            targets: scoreDisplay,
            alpha: 1,
            duration: 400,
            delay: 700,
        });

        this.scene.tweens.add({
            targets: continueText,
            alpha: 1,
            duration: 400,
            delay: 900,
        });

        this.scene.tweens.add({
            targets: continueText,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
    }
}
