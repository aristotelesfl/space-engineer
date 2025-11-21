import Phaser from "phaser";
import { AudioManager } from "../managers/AudioManager";

export default class MenuScene extends Phaser.Scene {
    private menuItems: Phaser.GameObjects.Text[] = [];
    private selectedIndex: number = 0;
    private title!: Phaser.GameObjects.Text;
    private subtitle!: Phaser.GameObjects.Text;
    private playerShip!: Phaser.GameObjects.Sprite;
    private currentMenu: "main" | "levels" = "main";

    constructor() {
        super("MenuScene");
    }

    preload() {
        AudioManager.preload(this);
        this.load.image("player", "assets/player.png");
    }

    create() {
        this.createBackground();
        this.createTitle();
        this.createPlayerShip();
        this.showMainMenu();
        this.setupKeyboardInput();
    }

    private createBackground() {
        const { width, height } = this.scale;
        const bg = this.add.rectangle(0, 0, width, height, 0x0a0a1a);
        bg.setOrigin(0, 0);
        this.createStarfield(100);
    }

    private createTitle() {
        const { width } = this.scale;

        this.subtitle = this.add.text(width / 2, 60, "INTERESTELAR", {
            fontSize: "16px",
            color: "#888888",
            fontFamily: "Arial, sans-serif",
            letterSpacing: 4,
        });
        this.subtitle.setOrigin(0.5);

        this.title = this.add.text(width / 2, 160, "SPACE\nENGINEER", {
            align: "center",
            fontSize: "60px",
            color: "#ffffff",
            fontFamily: "Arial Black, sans-serif",
            fontStyle: "bold",
            letterSpacing: 10,
        });
        this.title.setOrigin(0.5);
    }

    private createPlayerShip() {
        const { width, height } = this.scale;

        this.playerShip = this.add.sprite(width / 2, height / 2 + 20, "player");
        this.playerShip.setScale(1.5);
        this.playerShip.setAlpha(0.9);

        this.tweens.add({
            targets: this.playerShip,
            y: this.playerShip.y - 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
    }

    private showMainMenu() {
        this.currentMenu = "main";
        this.clearMenuItems();

        const menuOptions = [
            { text: "Novo Jogo", action: () => this.showLevelSelection() },
            {
                text: "Continue",
                action: () => this.showMessage("Continue: Not implemented"),
            },
            {
                text: "Ranking",
                action: () => this.showMessage("Ranking: Not implemented"),
            },
            {
                text: "Créditos",
                action: () => this.showMessage("Credits: Not implemented"),
            },
        ];

        this.createMenuItems(menuOptions);
    }

    private showLevelSelection() {
        this.currentMenu = "levels";
        this.clearMenuItems();

        const levelOptions = [
            {
                text: "Level 1 - Easy",
                description: "Speed: 120 | Enemies: 3 | Spawn: 2s",
                action: () => this.startLevelWithIntro("IntroLevel1"),
            },
            {
                text: "Level 2 - Medium",
                description: "Speed: 180 | Enemies: 5 | Spawn: 1.5s",
                action: () => this.startLevelWithIntro("IntroLevel2"),
            },
            {
                text: "Level 3 - Hard",
                description: "Speed: 250 | Enemies: 7 | Spawn: 1s",
                action: () => this.startLevelWithIntro("IntroLevel3"),
            },
            {
                text: "Boss Level - Extreme",
                description: "Speed: 300 | Enemies: 10 | Spawn: 0.8s",
                action: () => this.startLevelWithIntro("IntroBoss"),
            },
            {
                text: "← Back to Main Menu",
                description: "",
                action: () => this.showMainMenu(),
            },
        ];

        this.createMenuItems(levelOptions);
    }

    private createMenuItems(
        options: Array<{
            text: string;
            description?: string;
            action: () => void;
        }>
    ) {
        const { width, height } = this.scale;
        const startY = height - 280;
        const spacing = 50;

        options.forEach((option, index) => {
            const menuItem = this.add.text(
                width / 2,
                startY + index * spacing,
                option.text,
                {
                    fontSize: "24px",
                    color: "#aa6633",
                    fontFamily: "Arial, sans-serif",
                }
            );

            menuItem.setOrigin(0.5);
            menuItem.setInteractive({ useHandCursor: true });

            // Adiciona descrição do nível se disponível
            if (option.description) {
                const desc = this.add.text(
                    width / 2,
                    startY + index * spacing + 22,
                    option.description,
                    {
                        fontSize: "12px",
                        color: "#666666",
                        fontFamily: "Arial, sans-serif",
                    }
                );
                desc.setOrigin(0.5);
                desc.setAlpha(0);

                // Armazena a descrição no menuItem para controle
                (menuItem as any).descriptionText = desc;
            }

            menuItem.on("pointerover", () => {
                this.selectMenuItem(index);
            });

            menuItem.on("pointerdown", () => {
                option.action();
            });

            this.menuItems.push(menuItem);

            // Fade-in animation
            menuItem.setAlpha(0);
            this.tweens.add({
                targets: menuItem,
                alpha: 1,
                duration: 300,
                delay: index * 50,
            });
        });

        this.selectMenuItem(0);
        this.updateFooter();
    }

    private clearMenuItems() {
        this.menuItems.forEach((item) => {
            // Remove descrição se existir
            if ((item as any).descriptionText) {
                (item as any).descriptionText.destroy();
            }
            item.destroy();
        });
        this.menuItems = [];
        this.selectedIndex = 0;
    }

    private selectMenuItem(index: number) {
        // Remove destaque do item anterior
        const previousItem = this.menuItems[this.selectedIndex];
        if (previousItem) {
            previousItem.setStyle({
                fontSize: "24px",
                color: "#aa6633",
            });

            // Esconde descrição anterior
            if ((previousItem as any).descriptionText) {
                (previousItem as any).descriptionText.setAlpha(0);
            }
        }

        // Atualiza índice
        this.selectedIndex = index;

        // Destaca o item selecionado
        const currentItem = this.menuItems[this.selectedIndex];
        currentItem.setStyle({
            fontSize: "24px",
            color: "#ffaa66",
        });

        // Mostra descrição do item atual
        if ((currentItem as any).descriptionText) {
            this.tweens.add({
                targets: (currentItem as any).descriptionText,
                alpha: 0.8,
                duration: 200,
            });
        }
    }

    private selectPrevious() {
        const newIndex =
            this.selectedIndex > 0
                ? this.selectedIndex - 1
                : this.menuItems.length - 1;
        this.selectMenuItem(newIndex);
    }

    private selectNext() {
        const newIndex =
            this.selectedIndex < this.menuItems.length - 1
                ? this.selectedIndex + 1
                : 0;
        this.selectMenuItem(newIndex);
    }

    private confirmSelection() {
        const selected = this.menuItems[this.selectedIndex];

        this.tweens.add({
            targets: selected,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                // Dispara o evento de clique
                selected.emit("pointerdown");
            },
        });
    }

    private startLevelWithIntro(introKey: string) {
        console.log(`🎬 Iniciando introdução: ${introKey}...`);

        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start(introKey);
        });
    }

    private startLevel(levelKey: string) {
        console.log(`🎮 Iniciando ${levelKey}...`);

        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start(levelKey);
        });
    }

    private setupKeyboardInput() {
        if (!this.input.keyboard) return;

        this.input.keyboard.on("keydown-UP", () => {
            this.selectPrevious();
        });

        this.input.keyboard.on("keydown-DOWN", () => {
            this.selectNext();
        });

        this.input.keyboard.on("keydown-ENTER", () => {
            this.confirmSelection();
        });

        this.input.keyboard.on("keydown-SPACE", () => {
            this.confirmSelection();
        });

        // ESC para voltar
        this.input.keyboard.on("keydown-ESC", () => {
            if (this.currentMenu === "levels") {
                this.showMainMenu();
            }
        });
    }

    private updateFooter() {
        // Remove footer anterior se existir
        const existingFooter = this.children.getByName("footer");
        if (existingFooter) {
            existingFooter.destroy();
        }

        const { width, height } = this.scale;
        const footerText =
            this.currentMenu === "levels"
                ? "↑↓ Navigate | ENTER Select | ESC Back"
                : "↑↓ Navigate | ENTER Select";

        const footer = this.add.text(width / 2, height - 20, footerText, {
            fontSize: "12px",
            color: "#444444",
            fontFamily: "Arial, sans-serif",
        });
        footer.setOrigin(0.5);
        footer.setName("footer");
    }

    private showMessage(text: string) {
        const message = this.add.text(
            this.scale.width / 2,
            this.scale.height - 60,
            text,
            {
                fontSize: "16px",
                color: "#ff6666",
                backgroundColor: "#000000",
                padding: { x: 10, y: 5 },
                fontFamily: "Arial, sans-serif",
            }
        );
        message.setOrigin(0.5);
        message.setAlpha(0);

        this.tweens.add({
            targets: message,
            alpha: 1,
            duration: 200,
            yoyo: true,
            hold: 1500,
            onComplete: () => message.destroy(),
        });
    }

    private createStarfield(count: number) {
        const { width, height } = this.scale;

        for (let i = 0; i < count; i++) {
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
}
