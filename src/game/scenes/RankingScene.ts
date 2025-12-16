import Phaser from "phaser";
import { RankingManager, RankingEntry } from "../managers/RankingManager";

export default class RankingScene extends Phaser.Scene {
    private highlightScore?: number;
    private returnToMenu: boolean = false;

    constructor() {
        super({ key: "RankingScene" });
    }

    init(data: any) {
        this.highlightScore = data.highlightScore;
        this.returnToMenu = data.returnToMenu ?? false;
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.createBackground(width, height);

        // Título
        const title = this.add.text(width / 2, 80, "🏆 RANKING 🏆", {
            fontSize: "56px",
            color: "#FFD700",
            fontFamily: "Arial Black, sans-serif",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 6,
        });
        title.setOrigin(0.5);

        // Subtítulo
        const subtitle = this.add.text(width / 2, 140, "TOP 10 JOGADORES", {
            fontSize: "20px",
            color: "#aaaaaa",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 2,
        });
        subtitle.setOrigin(0.5);

        // Carregar ranking
        const ranking = RankingManager.getTopEntries(10);

        if (ranking.length === 0) {
            this.showEmptyRanking(width, height);
        } else {
            this.displayRanking(ranking, width, height);
        }

        // Estatísticas
        this.displayStats(width, height);

        // Instruções
        const instructions = this.add.text(
            width / 2,
            height - 40,
            "ESPAÇO: Menu Principal | C: Limpar Ranking",
            {
                fontSize: "16px",
                color: "#888888",
                fontFamily: "Arial, sans-serif",
            }
        );
        instructions.setOrigin(0.5);

        // Input
        this.setupInput();

        // Animação de entrada
        this.cameras.main.fadeIn(300);
    }

    private createBackground(width: number, height: number) {
        const bg = this.add.rectangle(0, 0, width, height, 0x0a0a1a);
        bg.setOrigin(0, 0);

        // Starfield
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.FloatBetween(0.5, 2);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.8);

            const star = this.add.circle(x, y, size, 0xffffff);
            star.setAlpha(alpha);

            if (Math.random() > 0.7) {
                this.tweens.add({
                    targets: star,
                    alpha: alpha * 0.3,
                    duration: Phaser.Math.Between(1000, 3000),
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut",
                });
            }
        }
    }

    private showEmptyRanking(width: number, height: number) {
        const emptyText = this.add.text(
            width / 2,
            height / 2,
            "Nenhum recorde ainda...\nSeja o primeiro!",
            {
                fontSize: "24px",
                color: "#666666",
                fontFamily: "Arial, sans-serif",
                align: "center",
            }
        );
        emptyText.setOrigin(0.5);
    }

    private displayRanking(
        ranking: RankingEntry[],
        width: number,
        height: number
    ) {
        const startY = 200;
        const lineHeight = 45;
        const maxVisible = 10;

        // Headers
        const headerY = startY - 30;
        this.createHeader(width, headerY);

        // Entradas
        ranking.slice(0, maxVisible).forEach((entry, index) => {
            const y = startY + index * lineHeight;
            const isHighlight = entry.score === this.highlightScore;

            this.createRankingEntry(entry, index + 1, width, y, isHighlight);
        });
    }

    private createHeader(width: number, y: number) {
        const headerStyle = {
            fontSize: "14px",
            color: "#888888",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
        };

        this.add.text(width / 2 - 300, y, "#", headerStyle).setOrigin(0, 0.5);
        this.add
            .text(width / 2 - 250, y, "JOGADOR", headerStyle)
            .setOrigin(0, 0.5);
        this.add
            .text(width / 2 + 100, y, "PONTOS", headerStyle)
            .setOrigin(0, 0.5);
        this.add
            .text(width / 2 + 220, y, "DATA", headerStyle)
            .setOrigin(0, 0.5);
    }

    private createRankingEntry(
        entry: RankingEntry,
        position: number,
        width: number,
        y: number,
        isHighlight: boolean
    ) {
        const baseColor = isHighlight ? "#FFD700" : "#ffffff";
        const bgColor = isHighlight ? 0x333300 : 0x1a1a2e;

        // Background da linha
        const bg = this.add.rectangle(
            width / 2,
            y,
            700,
            40,
            bgColor,
            isHighlight ? 0.5 : 0.3
        );
        bg.setOrigin(0.5);

        // Posição
        const positionText = this.add.text(width / 2 - 300, y, `${position}º`, {
            fontSize: "20px",
            color: this.getPositionColor(position),
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
        });
        positionText.setOrigin(0, 0.5);

        // Nome
        const nameText = this.add.text(
            width / 2 - 250,
            y,
            entry.name.substring(0, 15),
            {
                fontSize: "18px",
                color: baseColor,
                fontFamily: "Arial, sans-serif",
            }
        );
        nameText.setOrigin(0, 0.5);

        // Pontos
        const scoreText = this.add.text(
            width / 2 + 100,
            y,
            entry.score.toString(),
            {
                fontSize: "20px",
                color: baseColor,
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
            }
        );
        scoreText.setOrigin(0, 0.5);

        // Data
        const dateText = this.add.text(width / 2 + 220, y, entry.date, {
            fontSize: "16px",
            color: "#888888",
            fontFamily: "Arial, sans-serif",
        });
        dateText.setOrigin(0, 0.5);

        // Animação de entrada
        bg.setAlpha(0);
        positionText.setAlpha(0);
        nameText.setAlpha(0);
        scoreText.setAlpha(0);
        dateText.setAlpha(0);

        this.tweens.add({
            targets: [bg, positionText, nameText, scoreText, dateText],
            alpha: isHighlight ? 1 : bg.alpha === 0 ? 0.3 : 1,
            duration: 300,
            delay: position * 50,
            ease: "Power2",
        });

        // Efeito especial para entrada destacada
        if (isHighlight) {
            this.tweens.add({
                targets: [positionText, nameText, scoreText],
                scale: 1.1,
                duration: 500,
                yoyo: true,
                repeat: 2,
                delay: position * 50 + 300,
            });
        }
    }

    private getPositionColor(position: number): string {
        switch (position) {
            case 1:
                return "#FFD700"; // Ouro
            case 2:
                return "#C0C0C0"; // Prata
            case 3:
                return "#CD7F32"; // Bronze
            default:
                return "#ffffff";
        }
    }

    private displayStats(width: number, height: number) {
        const stats = RankingManager.getStats();
        const statsY = height - 120;

        const statsContainer = this.add.container(width / 2, statsY);

        const statsBg = this.add.rectangle(0, 0, 600, 60, 0x1a1a2e, 0.5);
        statsBg.setOrigin(0.5);

        const statsText = this.add.text(
            0,
            0,
            `Jogadores: ${stats.totalPlayers} | ` +
                `Recorde: ${stats.highestScore} | ` +
                `Média: ${stats.averageScore}`,
            {
                fontSize: "16px",
                color: "#aaaaaa",
                fontFamily: "Arial, sans-serif",
                align: "center",
            }
        );
        statsText.setOrigin(0.5);

        statsContainer.add([statsBg, statsText]);
    }

    private setupInput() {
        if (!this.input.keyboard) return;

        // Voltar ao menu
        this.input.keyboard.on("keydown-SPACE", () => {
            this.returnToMainMenu();
        });

        this.input.keyboard.on("keydown-ENTER", () => {
            this.returnToMainMenu();
        });

        this.input.keyboard.on("keydown-ESC", () => {
            this.returnToMainMenu();
        });

        // Limpar ranking (para testes)
        this.input.keyboard.on("keydown-C", () => {
            this.confirmClearRanking();
        });
    }

    private confirmClearRanking() {
        const { width, height } = this.scale;

        // Overlay de confirmação
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0, 0);
        overlay.setDepth(1000);

        const confirmText = this.add.text(
            width / 2,
            height / 2 - 30,
            "Limpar todo o ranking?",
            {
                fontSize: "28px",
                color: "#ff6666",
                fontFamily: "Arial, sans-serif",
            }
        );
        confirmText.setOrigin(0.5);
        confirmText.setDepth(1001);

        const instructionText = this.add.text(
            width / 2,
            height / 2 + 20,
            "Pressione Y para confirmar | N para cancelar",
            {
                fontSize: "18px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
            }
        );
        instructionText.setOrigin(0.5);
        instructionText.setDepth(1001);

        // Remover listeners anteriores
        this.input.keyboard?.removeAllListeners();

        // Novo listener para confirmação
        const confirmHandler = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "y") {
                RankingManager.clearRanking();
                this.cameras.main.flash(200, 255, 0, 0);
                this.scene.restart();
            } else if (event.key.toLowerCase() === "n") {
                overlay.destroy();
                confirmText.destroy();
                instructionText.destroy();
                this.setupInput();
            }
        };

        this.input.keyboard?.once("keydown", confirmHandler);
    }

    private returnToMainMenu() {
        this.cameras.main.fadeOut(300);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("MenuScene");
        });
    }
}
