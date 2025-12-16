import Phaser from "phaser";

export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: "CreditsScene" });
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.createBackground(width, height);

        // Container para os créditos (facilita animação)
        const creditsContainer = this.add.container(width / 2, height + 100);

        // Título
        const title = this.add.text(0, 0, "CRÉDITOS", {
            fontSize: "56px",
            color: "#FFD700",
            fontFamily: "Arial Black, sans-serif",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 6,
        });
        title.setOrigin(0.5);
        creditsContainer.add(title);

        // Linha decorativa
        const line1 = this.add.graphics();
        line1.lineStyle(3, 0xffd700, 1);
        line1.lineBetween(-200, 80, 200, 80);
        creditsContainer.add(line1);

        // Seção: Equipe de Desenvolvimento
        const teamTitle = this.add.text(0, 150, "EQUIPE DE DESENVOLVIMENTO", {
            fontSize: "24px",
            color: "#00ff00",
            fontFamily: "Arial, sans-serif",
            fontStyle: "bold",
            letterSpacing: 2,
        });
        teamTitle.setOrigin(0.5);
        creditsContainer.add(teamTitle);

        // Membros da equipe (5 pessoas)
        const teamMembers = [
            { name: "Aristóteles", role: "Programador" },
            { name: "Eduardo Melo", role: "Redator" },
            { name: "Francisco Gabriel", role: "Tester" },
            { name: "Paulo Matheus", role: "Level Designer" },
            { name: "Victor Timbó", role: "Tech Lead" },
        ];

        let yOffset = 220;
        const memberSpacing = 70;

        teamMembers.forEach((member, index) => {
            // Nome do membro
            const nameText = this.add.text(0, yOffset, member.name, {
                fontSize: "20px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
            });
            nameText.setOrigin(0.5);
            creditsContainer.add(nameText);

            // Função/Role
            const roleText = this.add.text(0, yOffset + 25, member.role, {
                fontSize: "16px",
                color: "#aaaaaa",
                fontFamily: "Arial, sans-serif",
            });
            roleText.setOrigin(0.5);
            creditsContainer.add(roleText);

            yOffset += memberSpacing;
        });

        // Linha decorativa
        const line2 = this.add.graphics();
        line2.lineStyle(3, 0xffd700, 1);
        line2.lineBetween(-200, yOffset + 20, 200, yOffset + 20);
        creditsContainer.add(line2);

        yOffset += 80;

        // Seção: Agradecimentos
        const thanksTitle = this.add.text(
            0,
            yOffset,
            "AGRADECIMENTOS ESPECIAIS",
            {
                fontSize: "20px",
                color: "#00ff00",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
                letterSpacing: 2,
            }
        );
        thanksTitle.setOrigin(0.5);
        creditsContainer.add(thanksTitle);

        yOffset += 60;

        // Professor em destaque
        const professorText = this.add.text(
            0,
            yOffset,
            "EXCELENTÍSSIMO PROFESSOR",
            {
                fontSize: "18px",
                color: "#FFD700",
                fontFamily: "Arial, sans-serif",
                fontStyle: "bold",
                letterSpacing: 1,
            }
        );
        professorText.setOrigin(0.5);
        creditsContainer.add(professorText);

        yOffset += 35;

        const professorName = this.add.text(0, yOffset, "ISMAYLE", {
            fontSize: "28px",
            color: "#ffffff",
            fontFamily: "Arial Black, sans-serif",
            fontStyle: "bold",
            stroke: "#FFD700",
        });
        professorName.setOrigin(0.5);
        creditsContainer.add(professorName);

        // Adiciona brilho dourado ao nome do professor
        const professorGlow = this.add.circle(0, yOffset, 100, 0xffd700, 0.1);
        creditsContainer.add(professorGlow);

        // Animação de pulso no glow
        this.tweens.add({
            targets: professorGlow,
            alpha: 0.2,
            scale: 1.2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        yOffset += 50;

        const dedicationText = this.add.text(
            0,
            yOffset,
            "Por sua dedicação, inspiração e orientação\nque tornaram este projeto possível",
            {
                fontSize: "14px",
                color: "#aaaaaa",
                fontFamily: "Arial, sans-serif",
                align: "center",
                lineSpacing: 5,
                fontStyle: "italic",
            }
        );
        dedicationText.setOrigin(0.5);
        creditsContainer.add(dedicationText);

        yOffset += 70;

        // Outros agradecimentos
        const otherThanks = this.add.text(
            0,
            yOffset,
            "Phaser Framework\nClaude AI\nComunidade Open Source",
            {
                fontSize: "14px",
                color: "#666666",
                fontFamily: "Arial, sans-serif",
                align: "center",
                lineSpacing: 8,
            }
        );
        otherThanks.setOrigin(0.5);
        creditsContainer.add(otherThanks);

        yOffset += 120;

        // Rodapé
        const footer = this.add.text(
            0,
            yOffset,
            "© 2024 Space Engineer Team\nTodos os direitos reservados",
            {
                fontSize: "14px",
                color: "#666666",
                fontFamily: "Arial, sans-serif",
                align: "center",
                lineSpacing: 5,
            }
        );
        footer.setOrigin(0.5);
        creditsContainer.add(footer);

        // Instruções (fixo na tela)
        const instructions = this.add.text(
            width / 2,
            height - 40,
            "ESPAÇO: Menu Principal | ESC: Voltar",
            {
                fontSize: "16px",
                color: "#888888",
                fontFamily: "Arial, sans-serif",
            }
        );
        instructions.setOrigin(0.5);
        instructions.setDepth(1000);

        // Animação de scroll dos créditos (rolagem para cima)
        this.tweens.add({
            targets: creditsContainer,
            y: -yOffset - 200, // Move para fora da tela no topo
            duration: 20000, // 20 segundos
            ease: "Linear",
            onComplete: () => {
                // Quando terminar, volta ao menu automaticamente
                this.time.delayedCall(1000, () => {
                    this.returnToMenu();
                });
            },
        });

        // Input
        this.setupInput();

        // Animação de entrada
        this.cameras.main.fadeIn(300);
    }

    private createBackground(width: number, height: number) {
        const bg = this.add.rectangle(0, 0, width, height, 0x0a0a1a);
        bg.setOrigin(0, 0);

        // Starfield animado
        for (let i = 0; i < 150; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.FloatBetween(0.5, 2.5);
            const alpha = Phaser.Math.FloatBetween(0.3, 1);

            const star = this.add.circle(x, y, size, 0xffffff);
            star.setAlpha(alpha);

            // Algumas estrelas piscam
            if (Math.random() > 0.6) {
                this.tweens.add({
                    targets: star,
                    alpha: alpha * 0.2,
                    duration: Phaser.Math.Between(1000, 4000),
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut",
                });
            }

            // Movimento lento das estrelas para dar sensação de viagem espacial
            this.tweens.add({
                targets: star,
                y: y + height,
                duration: Phaser.Math.Between(15000, 30000),
                repeat: -1,
                onRepeat: () => {
                    star.y = -10;
                    star.x = Phaser.Math.Between(0, width);
                },
            });
        }

        // Nebulosa/glow decorativo
        for (let i = 0; i < 5; i++) {
            const glow = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(100, 200),
                0x4400ff,
                0.05
            );

            this.tweens.add({
                targets: glow,
                alpha: 0.02,
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });
        }
    }

    private setupInput() {
        if (!this.input.keyboard) return;

        // Voltar ao menu principal
        this.input.keyboard.on("keydown-SPACE", () => {
            this.returnToMenu();
        });

        this.input.keyboard.on("keydown-ENTER", () => {
            this.returnToMenu();
        });

        this.input.keyboard.on("keydown-ESC", () => {
            this.returnToMenu();
        });

        // Clique também volta ao menu
        this.input.once("pointerdown", () => {
            this.returnToMenu();
        });
    }

    private returnToMenu() {
        // Para todos os tweens
        this.tweens.killAll();

        this.cameras.main.fadeOut(300);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("MenuScene");
        });
    }
}
