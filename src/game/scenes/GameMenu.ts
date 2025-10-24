import Phaser from "phaser";

export default class GameMenu extends Phaser.Scene {
    private background!: Phaser.GameObjects.TileSprite;
    private menuItems: Phaser.GameObjects.Text[] = [];
    private selectedIndex: number = 0;

    constructor(public speed: number) {
        super("MenuScene");
    }

    preload() {
        this.load.image("background", "assets/background.png");
        this.load.image("player", "assets/player.png");
    }

    create() {
        const { width, height } = this.scale;
        const options = [
            { label: "Jogar", action: () => this.scene.start("GameScene") },
            { label: "Créditos", action: () => this.scene.start("CreditsScene") },
        ];
        this.menuItems = [];

        this.background = this.add
            .tileSprite(0, 0, width, height, "background")
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.add.text(width / 2, height / 3, "Space\nEngineering", {
            fontFamily: "VT323",
            fontSize: "72px",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        options.forEach((opt, i) => {
            const text = this.add.text(width / 2, height / 2 + i * 75, opt.label, {
                fontFamily: "VT323",
                fontSize: "42px",
                color: i === 0 ? "#00ff88" : "#ffffff"
            }).setOrigin(0.5).setInteractive();

            this.menuItems.push(text);
        });

        this.input.keyboard?.on("keydown-UP", () => this.moveSelection(-1));
        this.input.keyboard?.on("keydown-DOWN", () => this.moveSelection(1));
        this.input.keyboard?.on("keydown-ENTER", () => options[this.selectedIndex].action());
    }

    private setSelected(index: number) {
        this.selectedIndex = index;
        this.menuItems.forEach((item, i) => {
            item.setColor(i === index ? "#00ff88" : "#ffffff");
            item.setScale(i === index ? 1.2 : 1);
        });
    }

    private moveSelection(direction: number) {
        const max = this.menuItems.length;
        this.selectedIndex = (this.selectedIndex + direction + max) % max;
        this.setSelected(this.selectedIndex);
    }

    update() {
        this.background.tilePositionY -= this.speed;
    }
}
