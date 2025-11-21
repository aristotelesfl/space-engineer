import Phaser from "phaser";

const PhaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#000000",
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 0,
                x: 0,
            },
            debug: false,
        },
    },
    scale: {
        parent: "game-container",
        mode: Phaser.Scale.FIT,
        width: 720,
        height: 1080,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        expandParent: false,
    },
    scene: [], // As cenas serão adicionadas dinamicamente
    audio: {
        disableWebAudio: false,
    },
};

export default PhaserConfig;
