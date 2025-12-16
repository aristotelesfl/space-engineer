import Phaser from "phaser";

export class ScreenManager {
    private scene: Phaser.Scene;
    private container?: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Exibe a tela de Game Over
     */
    showGameOver(score: number, onRestart: () => void, onMenu: () => void) {
        this.clearExistingContainer();
        const { width, height } = this.scene.scale;

        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(2000);

        // Overlay
        const overlay = this.createOverlay(width, height);

        // Textos
        const title = this.createText(
            width / 2,
            height / 2 - 120,
            "GAME OVER",
            "72px",
            "#ff3333",
            true
        );
        const scoreDisplay = this.createText(
            width / 2,
            height / 2 - 20,
            `SCORE FINAL: ${score}`,
            "36px",
            "#ffffff"
        );

        const line = this.scene.add.graphics();
        line.lineStyle(2, 0x666666, 1);
        line.lineBetween(
            width / 2 - 150,
            height / 2 + 20,
            width / 2 + 150,
            height / 2 + 20
        );

        const restartText = this.createText(
            width / 2,
            height / 2 + 60,
            "PRESSIONE ESPAÇO PARA REINICIAR",
            "20px",
            "#66ff66"
        );
        const menuText = this.createText(
            width / 2,
            height / 2 + 100,
            "PRESSIONE ESC PARA MENU",
            "20px",
            "#ffaa66"
        );

        this.container.add([
            overlay,
            title,
            scoreDisplay,
            line,
            restartText,
            menuText,
        ]);

        // Animação de entrada
        this.animateEntry([
            overlay,
            title,
            scoreDisplay,
            restartText,
            menuText,
        ]);

        // Inputs
        this.setupInput("keydown-SPACE", onRestart);
        this.setupInput("keydown-ESC", onMenu);
    }

    /**
     * Exibe a tela de Nível Completo (com suporte a fluxo de último nível)
     */
    showLevelComplete(
        score: number,
        fullText: string,
        collectedWords: string[],
        isLastLevel: boolean,
        onNextLevel: () => void,
        onMenu: () => void
    ) {
        this.clearExistingContainer();
        const { width, height } = this.scene.scale;

        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(2000);

        // Configuração visual baseada se é o último nível
        const titleText = isLastLevel ? "JOGO COMPLETO!" : "NÍVEL COMPLETO!";
        const titleColor = isLastLevel ? "#FFD700" : "#00ff00";

        // Elementos
        const overlay = this.createOverlay(width, height);
        const title = this.createText(
            width / 2,
            height / 2 - 150,
            titleText,
            "64px",
            titleColor,
            true
        );

        const wordsText = this.createText(
            width / 2,
            height / 2 - 60,
            `Coletadas: ${collectedWords.join(", ")}`,
            "18px",
            "#ffff00"
        );
        const responseComplete = this.createText(
            width / 2,
            height / 2,
            fullText,
            "20px",
            "#ffffff"
        );
        const scoreDisplay = this.createText(
            width / 2,
            height / 2 + 80,
            `SCORE: ${score}`,
            "36px",
            "#ffffff"
        );

        const line = this.scene.add.graphics();
        line.lineStyle(2, 0x666666, 1);
        line.lineBetween(
            width / 2 - 200,
            height / 2 + 120,
            width / 2 + 200,
            height / 2 + 120
        );

        this.container.add([
            overlay,
            title,
            wordsText,
            responseComplete,
            scoreDisplay,
            line,
        ]);

        // Botões de Ação
        let actionText: Phaser.GameObjects.Text;

        if (isLastLevel) {
            actionText = this.createText(
                width / 2,
                height / 2 + 160,
                "PRESSIONE ESC PARA O MENU",
                "20px",
                "#ffaa66"
            );
            this.setupInput("keydown-ESC", onMenu);
        } else {
            actionText = this.createText(
                width / 2,
                height / 2 + 160,
                "PRESSIONE ESPAÇO PARA PRÓXIMO NÍVEL",
                "20px",
                "#66ff66"
            );
            const menuText = this.createText(
                width / 2,
                height / 2 + 200,
                "ESC: MENU",
                "16px",
                "#ffaa66"
            );
            this.container.add(menuText);

            this.setupInput("keydown-SPACE", onNextLevel);
            this.setupInput("keydown-ESC", onMenu);
        }

        this.container.add(actionText);

        // Animações
        this.animateEntry([
            overlay,
            title,
            wordsText,
            responseComplete,
            scoreDisplay,
            actionText,
        ]);
    }

    // --- Métodos Auxiliares para evitar repetição interna ---

    private clearExistingContainer() {
        if (this.container) {
            this.container.destroy();
            this.container = undefined;
        }
        // Remove listeners antigos para evitar duplicação de input
        this.scene.input.keyboard?.off("keydown-SPACE");
        this.scene.input.keyboard?.off("keydown-ESC");
    }

    private setupInput(key: string, callback: () => void) {
        this.scene.input.keyboard?.once(key, callback);
    }

    private createOverlay(w: number, h: number) {
        return this.scene.add
            .rectangle(0, 0, w, h, 0x000000, 0.85)
            .setOrigin(0, 0)
            .setAlpha(0);
    }

    private createText(
        x: number,
        y: number,
        text: string,
        size: string,
        color: string,
        bold: boolean = false
    ) {
        return this.scene.add
            .text(x, y, text, {
                fontSize: size,
                color: color,
                fontFamily: bold
                    ? "Arial Black, sans-serif"
                    : "Arial, sans-serif",
                fontStyle: bold ? "bold" : "normal",
                stroke: bold ? "#000000" : undefined,
                strokeThickness: bold ? 6 : 0,
                align: "center",
                wordWrap: { width: this.scene.scale.width - 100 },
            })
            .setOrigin(0.5)
            .setAlpha(0);
    }

    private animateEntry(targets: Phaser.GameObjects.GameObject[]) {
        this.scene.tweens.add({
            targets: targets,
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            stagger: 100, // Efeito cascata
            ease: "Back.easeOut",
        });
    }
}
