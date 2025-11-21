import Phaser from "phaser";

export default class LevelIntroScene extends Phaser.Scene {
    private titleText: string;
    private subtitleText: string;
    private questionText: string;
    private targetSceneKey: string;
    private targetSceneData?: any;

    private titleDisplay!: Phaser.GameObjects.Text;
    private subtitleDisplay!: Phaser.GameObjects.Text;
    private questionDisplay!: Phaser.GameObjects.Text;
    private instructionDisplay!: Phaser.GameObjects.Text;
    private overlay!: Phaser.GameObjects.Rectangle;
    private canStart: boolean = false;

    /**
     * Cria uma cena de introdução de nível
     * @param titleText - Texto principal (ex: "NÍVEL 1")
     * @param subtitleText - Frase secundária (ex: "Prepare-se para o desafio")
     * @param questionText - Pergunta ou texto adicional (ex: "Qual é a capital do Brasil?")
     * @param targetSceneKey - Chave da cena do nível a ser iniciado
     * @param sceneKey - Chave única para esta cena (opcional)
     * @param targetSceneData - Dados opcionais para passar à cena alvo
     */
    constructor(
        titleText: string,
        subtitleText: string,
        questionText: string,
        targetSceneKey: string,
        sceneKey?: string,
        targetSceneData?: any
    ) {
        super({ key: sceneKey || `LevelIntro_${targetSceneKey}` });

        this.titleText = titleText;
        this.subtitleText = subtitleText;
        this.questionText = questionText;
        this.targetSceneKey = targetSceneKey;
        this.targetSceneData = targetSceneData;

        console.log(`📋 LevelIntroScene criada para: ${targetSceneKey}`);
    }

    create() {
        const { width, height } = this.scale;

        // Overlay semi-transparente escuro
        this.overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
        this.overlay.setOrigin(0, 0);
        this.overlay.setAlpha(0);

        // Título principal (grande e destacado)
        this.titleDisplay = this.add.text(
            width / 2,
            height / 2 - 120,
            this.titleText,
            {
                fontSize: "48px",
                color: "#ffffff",
                fontFamily: "Arial Black, sans-serif",
                fontStyle: "bold",
                align: "center",
                stroke: "#000000",
                strokeThickness: 6,
                wordWrap: { width: width - 100 },
            }
        );
        this.titleDisplay.setOrigin(0.5);
        this.titleDisplay.setAlpha(0);

        // Subtítulo (frase secundária)
        this.subtitleDisplay = this.add.text(
            width / 2,
            height / 2 - 40,
            this.subtitleText,
            {
                fontSize: "22px",
                color: "#ffaa66",
                fontFamily: "Arial, sans-serif",
                align: "center",
            }
        );
        this.subtitleDisplay.setOrigin(0.5);
        this.subtitleDisplay.setAlpha(0);

        // Questão/Texto adicional (se fornecido)
        this.questionDisplay = this.add.text(
            width / 2,
            height / 2 + 20,
            this.questionText,
            {
                fontSize: "20px",
                color: "#ffffff",
                fontFamily: "Arial, sans-serif",
                align: "center",
                wordWrap: { width: width - 100 }, // Quebra de linha automática
            }
        );
        this.questionDisplay.setOrigin(0.5);
        this.questionDisplay.setAlpha(0);

        // Instrução para iniciar
        this.instructionDisplay = this.add.text(
            width / 2,
            height / 2 + 140,
            "Pressione ESPAÇO ou toque na tela para iniciar",
            {
                fontSize: "18px",
                color: "#888888",
                fontFamily: "Arial, sans-serif",
                align: "center",
            }
        );
        this.instructionDisplay.setOrigin(0.5);
        this.instructionDisplay.setAlpha(0);

        // Animação de fade-in
        this.fadeIn();

        // Configura inputs
        this.setupInputs();

        console.log(`✨ Tela de introdução exibida: "${this.titleText}"`);
    }

    private fadeIn() {
        // Fade-in do overlay
        this.tweens.add({
            targets: this.overlay,
            alpha: 0.85,
            duration: 300,
            ease: "Power2",
        });

        // Fade-in do título com delay
        this.tweens.add({
            targets: this.titleDisplay,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            duration: 400,
            delay: 150,
            ease: "Back.easeOut",
        });

        // Fade-in do subtítulo
        this.tweens.add({
            targets: this.subtitleDisplay,
            alpha: 1,
            y: this.subtitleDisplay.y,
            duration: 400,
            delay: 300,
            ease: "Power2",
        });

        // Fade-in da questão/texto adicional
        this.tweens.add({
            targets: this.questionDisplay,
            alpha: 1,
            y: this.questionDisplay.y,
            duration: 400,
            delay: 450,
            ease: "Power2",
            onComplete: () => {
                // Apenas após o fade-in completo, permite iniciar
                this.canStart = true;
            },
        });

        // Fade-in da instrução com pulso
        this.tweens.add({
            targets: this.instructionDisplay,
            alpha: 1,
            duration: 400,
            delay: 600,
            ease: "Power2",
            onComplete: () => {
                // Animação de pulso contínua na instrução
                this.tweens.add({
                    targets: this.instructionDisplay,
                    alpha: 0.4,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: "Sine.easeInOut",
                });
            },
        });
    }

    private setupInputs() {
        // Input de teclado (ESPAÇO)
        if (this.input.keyboard) {
            this.input.keyboard.on("keydown-SPACE", () => {
                this.startLevel();
            });

            // Também permite ENTER como alternativa
            this.input.keyboard.on("keydown-ENTER", () => {
                this.startLevel();
            });
        }

        // Input de toque/clique (mobile e desktop)
        this.input.on("pointerdown", () => {
            this.startLevel();
        });
    }

    private startLevel() {
        // Evita múltiplos acionamentos
        if (!this.canStart) {
            console.log("⏳ Aguarde o fade-in completar...");
            return;
        }

        this.canStart = false;
        console.log(`🚀 Iniciando nível: ${this.targetSceneKey}`);

        // Feedback visual ao clicar (flash rápido)
        this.cameras.main.flash(
            100,
            255,
            255,
            255,
            false,
            (camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                if (progress === 1) {
                    this.fadeOutAndStart();
                }
            }
        );
    }

    private fadeOutAndStart() {
        // Para todas as animações
        this.tweens.killAll();

        // Fade-out de todos os elementos
        const fadeOutDuration = 300;

        this.tweens.add({
            targets: [
                this.overlay,
                this.titleDisplay,
                this.subtitleDisplay,
                this.questionDisplay,
                this.instructionDisplay,
            ],
            alpha: 0,
            duration: fadeOutDuration,
            ease: "Power2",
        });

        // Fade-out da câmera
        this.cameras.main.fadeOut(fadeOutDuration, 0, 0, 0);

        this.cameras.main.once("camerafadeoutcomplete", () => {
            // Inicia o nível alvo
            if (this.targetSceneData) {
                this.scene.start(this.targetSceneKey, this.targetSceneData);
            } else {
                this.scene.start(this.targetSceneKey);
            }

            console.log(`✅ Nível ${this.targetSceneKey} iniciado!`);
        });
    }

    /**
     * Método estático para criar e adicionar a cena ao jogo
     * Útil para criar intros dinamicamente
     */
    static createAndAdd(
        game: Phaser.Game,
        titleText: string,
        subtitleText: string,
        targetSceneKey: string,
        sceneKey: string
    ): LevelIntroScene {
        const intro = new LevelIntroScene(
            titleText,
            subtitleText,
            targetSceneKey,
            sceneKey
        );

        const key = sceneKey || `LevelIntro_${targetSceneKey}`;
        game.scene.add(key, intro, false);

        return intro;
    }

    /**
     * Método para atualizar os textos dinamicamente
     * Útil se quiser reutilizar a mesma instância
     */
    updateTexts(newTitle: string, newSubtitle: string, newTarget: string) {
        this.titleText = newTitle;
        this.subtitleText = newSubtitle;
        this.targetSceneKey = newTarget;

        // Se a cena já estiver ativa, atualiza os displays
        if (this.titleDisplay) {
            this.titleDisplay.setText(newTitle);
        }
        if (this.subtitleDisplay) {
            this.subtitleDisplay.setText(newSubtitle);
        }
    }
}
