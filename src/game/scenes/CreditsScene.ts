import Phaser from "phaser";

export default class CreditsScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.TileSprite;

    constructor(
        public speed: number
    ) {
        super("CreditsScene");
    }

    create() {
        const { width, height } = this.scale;
        const options = [
            { label: "Aristoteles Feitosa" },
            { label: "Eduardo Matos" },
            { label: "Francisco Gabriel" },
            { label: "Paulo Matheus" },
            { label: "Victor Manoel" },
            { label: "Voltar" }
        ];

        this.background = this.add
            .tileSprite(0, 0, width, height, "background")
            .setOrigin(0, 0)
            .setScrollFactor(0);

        const playerSprite = this.add.sprite(
            width / 2,
            height - 100,
            "player"
        );

        this.add.text(width / 2, height / 3, "Space\nEngineering", {
            fontFamily: "VT323",
            fontSize: "72px",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        options.forEach((opt, i) => {
            const text = this.add.text(width / 2, height / 2 + i * 60, opt.label, {
                fontFamily: "VT323",
                fontSize: "42px",
                color: i === 5 ? "#00ff88" : "#ffffff"
            }).setOrigin(0.5);

            if (opt.label === "Voltar") {
                this.input.keyboard?.on("keydown-ENTER", () => this.scene.start("MenuScene"));
            }
        });
    }

    update() {
        this.background.tilePositionY -= this.speed;
    }
}