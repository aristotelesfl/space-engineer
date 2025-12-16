import Phaser from "phaser";
import { RankingManager } from "../managers/RankingManager";

export default class NameInputScene extends Phaser.Scene {
    private score: number = 0;
    private levelKey: string = "";
    private playerName: string = "";
    private maxNameLength: number = 15;
    private nameText!: Phaser.GameObjects.Text;
    private cursor!: Phaser.GameObjects.Text;
    private submitButton!: Phaser.GameObjects.Text;
    private onSubmitCallback?: () => void;

    constructor() {
        super({ key: "NameInputScene" });
    }

    init(data: any) {
        this.score = data.score || 0;
        this.levelKey = data.levelKey || "Unknown";
        this.playerName = "";
        this.onSubmitCallback = data.onSubmit;
    }

    create() {
        const { width, height } = this.scale;

        // Background overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.9);
        overlay.setOrigin(0, 0);

        // Título
        const title = this.add.text(
            width / 2,
            height / 2 - 180,
            "NOVO RECORDE!",
            {
                fontSize: "56px",
                color: "#FFD700",
                fontFamily: "Arial Black, sans-serif",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 6,
            }
        );
        title.setOrigin(0.5);

        // Mensagem de parabéns
        const congratsText = this.add.text(
            width / 2,
            height / 2 - 110,
            `Você fez ${this.score} pontos!`,
            {
                fontSize: "28px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
            }
        );
        congratsText.setOrigin(0.5);

        // Posição no ranking
        const position = RankingManager.getPosition(this.score);
        const positionText = this.add.text(
            width / 2,
            height / 2 - 70,
            `${position}º lugar no ranking!`,
            {
                fontSize: "24px",
                color: "#00ff00",
                fontFamily: "Arial, sans-serif",
            }
        );
        positionText.setOrigin(0.5);

        // Label
        const label = this.add.text(
            width / 2,
            height / 2 - 20,
            "Digite seu nome:",
            {
                fontSize: "20px",
                color: "#aaaaaa",
                fontFamily: "Arial, sans-serif",
            }
        );
        label.setOrigin(0.5);

        // Campo de input (visual)
        const inputBox = this.add.graphics();
        inputBox.fillStyle(0x222222, 1);
        inputBox.fillRoundedRect(width / 2 - 200, height / 2 + 10, 400, 60, 10);
        inputBox.lineStyle(3, 0x00ff00, 1);
        inputBox.strokeRoundedRect(
            width / 2 - 200,
            height / 2 + 10,
            400,
            60,
            10
        );

        // Texto do nome
        this.nameText = this.add.text(width / 2, height / 2 + 40, "", {
            fontSize: "32px",
            color: "#ffffff",
            fontFamily: "Arial, sans-serif",
        });
        this.nameText.setOrigin(0.5);

        // Cursor piscante
        this.cursor = this.add.text(
            width / 2 + this.nameText.width / 2 + 5,
            height / 2 + 40,
            "|",
            {
                fontSize: "32px",
                color: "#00ff00",
                fontFamily: "Arial, sans-serif",
            }
        );
        this.cursor.setOrigin(0, 0.5);

        // Animação do cursor
        this.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        // Botão de submit
        this.submitButton = this.add.text(
            width / 2,
            height / 2 + 120,
            "[ CONFIRMAR ]",
            {
                fontSize: "24px",
                color: "#666666",
                fontFamily: "Arial, sans-serif",
            }
        );
        this.submitButton.setOrigin(0.5);

        // Instruções
        const instructions = this.add.text(
            width / 2,
            height / 2 + 170,
            "Digite seu nome e pressione ENTER",
            {
                fontSize: "16px",
                color: "#888888",
                fontFamily: "Arial, sans-serif",
            }
        );
        instructions.setOrigin(0.5);

        // Instruções extras
        const extraInstructions = this.add.text(
            width / 2,
            height / 2 + 195,
            "BACKSPACE para apagar | ESC para pular",
            {
                fontSize: "14px",
                color: "#666666",
                fontFamily: "Arial, sans-serif",
            }
        );
        extraInstructions.setOrigin(0.5);

        // Configurar input
        this.setupInput();

        // Animação de entrada
        this.cameras.main.fadeIn(300);
    }

    private setupInput() {
        if (!this.input.keyboard) return;

        // Captura teclas alfanuméricas e espaço
        this.input.keyboard.on("keydown", (event: KeyboardEvent) => {
            const key = event.key;

            // Letras, números e espaço
            if (
                /^[a-zA-Z0-9 ]$/.test(key) &&
                this.playerName.length < this.maxNameLength
            ) {
                this.playerName += key;
                this.updateNameDisplay();
            }

            // Backspace
            if (key === "Backspace" && this.playerName.length > 0) {
                this.playerName = this.playerName.slice(0, -1);
                this.updateNameDisplay();
            }

            // Enter - Submeter
            if (key === "Enter") {
                this.submitName();
            }

            // ESC - Pular (usar nome padrão)
            if (key === "Escape") {
                this.playerName = "Jogador";
                this.submitName();
            }
        });
    }

    private updateNameDisplay() {
        this.nameText.setText(this.playerName || "");

        // Atualizar posição do cursor
        const textWidth = this.nameText.width;
        this.cursor.setX(this.nameText.x + textWidth / 2 + 5);

        // Atualizar cor do botão
        if (this.playerName.length > 0) {
            this.submitButton.setColor("#00ff00");
        } else {
            this.submitButton.setColor("#666666");
        }
    }

    private submitName() {
        // Nome mínimo de 1 caractere (ou usa "Jogador")
        const finalName = this.playerName.trim() || "Jogador";

        console.log(`📝 Nome inserido: ${finalName}`);

        // Adiciona ao ranking
        RankingManager.addEntry(finalName, this.score, this.levelKey);

        // Efeito visual
        this.cameras.main.flash(200, 0, 255, 0);

        // Transição para a tela de ranking
        this.time.delayedCall(300, () => {
            this.cameras.main.fadeOut(300);
            this.cameras.main.once("camerafadeoutcomplete", () => {
                if (this.onSubmitCallback) {
                    this.onSubmitCallback();
                }
                this.scene.start("RankingScene", {
                    highlightScore: this.score,
                    returnToMenu: true,
                });
            });
        });
    }
}
