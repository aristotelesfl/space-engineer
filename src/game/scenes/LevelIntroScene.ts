import Phaser from "phaser";

export default class LevelIntroScene extends Phaser.Scene {
    private titleText: string;
    private subtitleText: string;
    private questionText: string;
    private currentScore: number = 0;
    private targetSceneKey: string;
    private targetSceneData?: any;

    private overlay!: Phaser.GameObjects.Rectangle;
    private canStart: boolean = false;

    constructor(
        titleText: string,
        subtitleText: string,
        questionText: string,
        currentScore: number = 0, // ✅ Adicionado parâmetro
        targetSceneKey: string,
        sceneKey?: string,
        targetSceneData?: any
    ) {
        super({ key: sceneKey || `LevelIntro_${targetSceneKey}` });
        this.titleText = titleText;
        this.subtitleText = subtitleText;
        this.questionText = questionText;
        this.currentScore = currentScore; // ✅ Inicializado
        this.targetSceneKey = targetSceneKey;
        this.targetSceneData = targetSceneData;
    }

    init(data: any) {
        // ✅ Atualiza o score se vier nos dados
        if (data?.score !== undefined) {
            this.currentScore = data.score;
        }
    }

    create() {
        const { width, height } = this.scale;

        this.overlay = this.add
            .rectangle(0, 0, width, height, 0x000000, 0.85)
            .setOrigin(0, 0)
            .setAlpha(0);

        const title = this.add
            .text(width / 2, height / 2 - 130, this.titleText, {
                fontSize: "48px",
                color: "#ffffff",
                fontFamily: "Arial Black",
                align: "center",
                stroke: "#000",
                strokeThickness: 6,
                wordWrap: { width: width - 100 },
            })
            .setOrigin(0.5)
            .setAlpha(0);

        const subtitle = this.add
            .text(width / 2, height / 2 - 30, this.subtitleText, {
                fontSize: "22px",
                align: "center",
                wordWrap: { width: width - 200 },
                color: "#ffaa66",
                fontFamily: "Arial",
            })
            .setOrigin(0.5)
            .setAlpha(0);

        const question = this.add
            .text(width / 2, height / 2 + 20, this.questionText, {
                fontSize: "20px",
                color: "#ffffff",
                fontFamily: "Arial",
                align: "center",
                wordWrap: { width: width - 100 },
            })
            .setOrigin(0.5)
            .setAlpha(0);

        const instruction = this.add
            .text(
                width / 2,
                height / 2 + 140,
                "Pressione ESPAÇO para iniciar",
                {
                    fontSize: "18px",
                    color: "#888888",
                }
            )
            .setOrigin(0.5)
            .setAlpha(0);

        // Sequence Animation
        this.tweens.add({ targets: this.overlay, alpha: 0.85, duration: 300 });
        this.tweens.add({
            targets: title,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            delay: 150,
            duration: 400,
            ease: "Back.easeOut",
        });
        this.tweens.add({
            targets: subtitle,
            alpha: 1,
            delay: 300,
            duration: 400,
        });
        this.tweens.add({
            targets: question,
            alpha: 1,
            delay: 450,
            duration: 400,
            onComplete: () => {
                this.canStart = true;
            },
        });

        this.tweens.add({
            targets: instruction,
            alpha: 1,
            delay: 600,
            duration: 400,
            onComplete: () => {
                this.tweens.add({
                    targets: instruction,
                    alpha: 0.4,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                });
            },
        });

        // Inputs
        this.input.keyboard?.once("keydown-SPACE", () => this.startLevel());
        this.input.keyboard?.once("keydown-ENTER", () => this.startLevel());
        this.input.once("pointerdown", () => this.startLevel());
    }

    private startLevel() {
        if (!this.canStart) return;
        this.canStart = false;

        this.cameras.main.flash(200);
        this.cameras.main.fadeOut(300);

        this.cameras.main.once("camerafadeoutcomplete", () => {
            const nextLevelData = {
                ...this.targetSceneData,
                score: this.currentScore,
            };

            this.scene.start(this.targetSceneKey, nextLevelData);
        });
    }
}
