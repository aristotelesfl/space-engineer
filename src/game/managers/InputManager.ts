import Phaser from "phaser";

export class InputManager {
    private scene: Phaser.Scene;
    private keyboardHandler?: (event: KeyboardEvent) => void;
    private escHandler?: () => void;
    private onLetterCallback?: (letter: string) => void;
    private onEscCallback?: () => void;

    constructor(
        scene: Phaser.Scene,
        onLetterCallback?: (letter: string) => void,
        onEscCallback?: () => void
    ) {
        this.scene = scene;
        this.onLetterCallback = onLetterCallback;
        this.onEscCallback = onEscCallback;
    }

    setup() {
        if (!this.scene.input.keyboard) return;

        this.keyboardHandler = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();

            if (key.length !== 1 || !/[a-z]/.test(key)) return;

            if (this.onLetterCallback) {
                this.onLetterCallback(key);
            }
        };

        this.escHandler = () => {
            if (this.onEscCallback) {
                this.onEscCallback();
            }
        };

        this.scene.input.keyboard.on("keydown", this.keyboardHandler);
        this.scene.input.keyboard.on("keydown-ESC", this.escHandler);
    }

    cleanup() {
        if (this.scene.input.keyboard) {
            if (this.keyboardHandler) {
                this.scene.input.keyboard.off("keydown", this.keyboardHandler);
            }
            if (this.escHandler) {
                this.scene.input.keyboard.off("keydown-ESC", this.escHandler);
            }
            this.scene.input.keyboard.removeAllListeners();
        }
    }
}
