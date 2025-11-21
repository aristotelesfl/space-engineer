import Phaser from "phaser";

/**
 * Componente visual para mostrar progresso de coleta de powerups
 * Exibe palavras necessárias e marca as já coletadas
 */
export class ProgressHUD {
    private scene: Phaser.Scene;
    private container!: Phaser.GameObjects.Container;
    private wordTexts: Map<string, Phaser.GameObjects.Text> = new Map();
    private progressBar!: Phaser.GameObjects.Graphics;
    private progressText!: Phaser.GameObjects.Text;
    private correctWords: string[];
    private collectedWords: Set<string> = new Set();

    constructor(scene: Phaser.Scene, correctWords: string[]) {
        this.scene = scene;
        this.correctWords = correctWords;
    }

    create(x: number, y: number) {
        this.container = this.scene.add.container(x, y);
        this.container.setDepth(1002);

        // Título
        const title = this.scene.add.text(0, 0, "PALAVRAS NECESSÁRIAS", {
            fontSize: "14px",
            color: "#ffffff",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
        });
        title.setOrigin(0.5);
        this.container.add(title);

        // Lista de palavras
        const startY = 30;
        const spacing = 25;

        this.correctWords.forEach((word, index) => {
            // Ícone (checkbox)
            const icon = this.scene.add.text(
                -80,
                startY + index * spacing,
                "☐",
                {
                    fontSize: "16px",
                    color: "#666666",
                }
            );
            icon.setOrigin(0.5);

            // Texto da palavra
            const wordText = this.scene.add.text(
                -60,
                startY + index * spacing,
                word.toUpperCase(),
                {
                    fontSize: "14px",
                    color: "#888888",
                    fontFamily: "Arial, sans-serif",
                }
            );
            wordText.setOrigin(0, 0.5);

            this.container.add([icon, wordText]);
            this.wordTexts.set(word, wordText);

            // Guarda referência ao ícone no objeto wordText
            (wordText as any).icon = icon;
        });

        // Barra de progresso
        const barY = startY + this.correctWords.length * spacing + 20;
        this.createProgressBar(barY);

        console.log("📊 ProgressHUD criado");
    }

    private createProgressBar(y: number) {
        // Background da barra
        const barBg = this.scene.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(-80, y, 160, 20, 10);
        this.container.add(barBg);

        // Barra de progresso
        this.progressBar = this.scene.add.graphics();
        this.container.add(this.progressBar);

        // Texto de porcentagem
        this.progressText = this.scene.add.text(0, y + 10, "0%", {
            fontSize: "12px",
            color: "#ffffff",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
        });
        this.progressText.setOrigin(0.5);
        this.container.add(this.progressText);

        this.updateProgressBar();
    }

    private updateProgressBar() {
        const progress = this.collectedWords.size / this.correctWords.length;
        const barWidth = 160;
        const barHeight = 20;
        const fillWidth = barWidth * progress;

        this.progressBar.clear();
        this.progressBar.fillStyle(0x00ff00, 1);
        this.progressBar.fillRoundedRect(
            -80,
            this.progressBar.y,
            fillWidth,
            barHeight,
            10
        );

        const percentage = Math.floor(progress * 100);
        this.progressText.setText(`${percentage}%`);

        // Cor da porcentagem baseada no progresso
        if (percentage === 100) {
            this.progressText.setColor("#FFD700"); // Dourado
        } else if (percentage >= 50) {
            this.progressText.setColor("#00ff00"); // Verde
        } else {
            this.progressText.setColor("#ffffff"); // Branco
        }
    }

    markWordAsCollected(word: string) {
        const normalizedWord = word.toLowerCase().trim();

        if (!this.correctWords.includes(normalizedWord)) {
            console.warn(`⚠️ Palavra "${word}" não está na lista`);
            return;
        }

        if (this.collectedWords.has(normalizedWord)) {
            console.log(`ℹ️ Palavra "${word}" já marcada`);
            return;
        }

        this.collectedWords.add(normalizedWord);

        // Atualiza visual da palavra
        const wordText = this.wordTexts.get(normalizedWord);
        if (wordText) {
            // Marca como coletada
            wordText.setStyle({
                fontSize: "14px",
                color: "#00ff00",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
            });

            // Atualiza ícone
            const icon = (wordText as any).icon;
            if (icon) {
                icon.setText("☑");
                icon.setColor("#00ff00");
            }

            // Animação de pulso
            this.scene.tweens.add({
                targets: [wordText, icon],
                scale: 1.3,
                duration: 200,
                yoyo: true,
                ease: "Back.easeOut",
            });

            // Linha através do texto (riscado)
            const strikethrough = this.scene.add.graphics();
            strikethrough.lineStyle(2, 0x00ff00, 1);
            const bounds = wordText.getBounds();
            strikethrough.lineBetween(
                bounds.x - 80,
                bounds.y + bounds.height / 2,
                bounds.x + bounds.width - 60,
                bounds.y + bounds.height / 2
            );
            this.container.add(strikethrough);
        }

        // Atualiza barra de progresso
        this.updateProgressBar();

        console.log(`ProgressHUD: "${word}" marcada como coletada`);
        console.log(
            `📊 Progresso: ${this.collectedWords.size}/${this.correctWords.length}`
        );
    }

    reset() {
        this.collectedWords.clear();

        // Reseta visuais
        this.wordTexts.forEach((wordText, word) => {
            wordText.setStyle({
                fontSize: "14px",
                color: "#888888",
                fontFamily: "Arial, sans-serif",
            });

            const icon = (wordText as any).icon;
            if (icon) {
                icon.setText("☐");
                icon.setColor("#666666");
            }
        });

        this.updateProgressBar();
        console.log("🔄 ProgressHUD resetado");
    }

    setVisible(visible: boolean) {
        this.container.setVisible(visible);
    }

    setPosition(x: number, y: number) {
        this.container.setPosition(x, y);
    }

    destroy() {
        this.container.destroy();
        this.wordTexts.clear();
    }
}
