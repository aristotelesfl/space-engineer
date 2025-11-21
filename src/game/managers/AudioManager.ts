import Phaser from "phaser";

export class AudioManager {
    private scene: Phaser.Scene;
    private bgm: Phaser.Sound.BaseSound | null = null;
    private shootSound: Phaser.Sound.BaseSound | null = null;
    private deathSound: Phaser.Sound.BaseSound | null = null;

    // Configurações de volume
    private static readonly BGM_VOLUME = 0.3;
    private static readonly SHOOT_VOLUME = 0.5;
    private static readonly DEATH_VOLUME = 0.6;
    private static readonly FADE_DURATION = 300;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    // Pré-carrega os arquivos de áudio
    static preload(scene: Phaser.Scene) {
        // Carrega os arquivos de áudio
        // Nota: Você deve ter esses arquivos em assets/sounds/
        scene.load.audio("bgm", "assets/sounds/bgm.mp3");
        scene.load.audio("shoot", "assets/sounds/shoot.mp3");
        scene.load.audio("death", "assets/sounds/death.mp3");
    }

    // Inicializa os sons após o carregamento
    init() {
        // Cria os objetos de som com configurações
        this.bgm = this.scene.sound.add("bgm", {
            volume: AudioManager.BGM_VOLUME,
            loop: true,
        });

        this.shootSound = this.scene.sound.add("shoot", {
            volume: AudioManager.SHOOT_VOLUME,
            loop: false,
        });

        this.deathSound = this.scene.sound.add("death", {
            volume: AudioManager.DEATH_VOLUME,
            loop: false,
        });

        console.log("🔊 AudioManager inicializado");
    }

    // Toca a música de fundo
    playBGM() {
        if (!this.bgm) {
            console.warn("⚠️ BGM não carregado");
            return;
        }

        // Se já está tocando, não reinicia
        if (this.bgm.isPlaying) {
            console.log("🎵 BGM já está tocando");
            return;
        }

        // Toca com fade-in
        this.bgm.play();

        // Fade-in suave
        this.scene.tweens.add({
            targets: this.bgm,
            volume: AudioManager.BGM_VOLUME,
            duration: AudioManager.FADE_DURATION,
            ease: "Linear",
        });

        console.log("🎵 BGM iniciado");
    }

    // Para a música de fundo com fade-out
    stopBGM() {
        if (!this.bgm || !this.bgm.isPlaying) return;

        this.scene.tweens.add({
            targets: this.bgm,
            volume: 0,
            duration: AudioManager.FADE_DURATION,
            ease: "Linear",
            onComplete: () => {
                if (this.bgm) {
                    this.bgm.stop();
                }
            },
        });

        console.log("🔇 BGM parando");
    }

    // Pausa a música (mantém a posição)
    pauseBGM() {
        if (this.bgm && this.bgm.isPlaying) {
            (this.bgm as Phaser.Sound.WebAudioSound).pause();
            console.log("⏸️ BGM pausado");
        }
    }

    // Retoma a música de onde parou
    resumeBGM() {
        if (this.bgm && (this.bgm as Phaser.Sound.WebAudioSound).isPaused) {
            (this.bgm as Phaser.Sound.WebAudioSound).resume();
            console.log("▶️ BGM retomado");
        }
    }

    // Toca o som de tiro
    playShoot() {
        if (!this.shootSound) {
            console.warn("⚠️ Som de tiro não carregado");
            return;
        }

        // Toca o som (permite múltiplas instâncias simultâneas)
        this.shootSound.play();
    }

    // Toca o som de morte do inimigo
    playEnemyDeath() {
        if (!this.deathSound) {
            console.warn("⚠️ Som de morte não carregado");
            return;
        }

        // Toca o som (permite múltiplas instâncias simultâneas)
        this.deathSound.play();
    }

    // Limpa recursos
    destroy() {
        if (this.bgm) {
            this.bgm.destroy();
        }
        if (this.shootSound) {
            this.shootSound.destroy();
        }
        if (this.deathSound) {
            this.deathSound.destroy();
        }
    }
}
