import Phaser from "phaser";
import PhaserConfig from "../config/phaserConfig";
import GameScene from "./scenes/GameScene";
import MenuScene from "./scenes/MenuScene";
import LevelIntroScene from "./scenes/LevelIntroScene";

const LEVELS_FILE_PATH = "assets/levels.json";

async function loadLevels() {
    const response = await fetch(LEVELS_FILE_PATH);
    if (!response.ok) {
        throw new Error("Erro ao carregar levels.json");
    }
    return await response.json();
}

const Game = new Phaser.Game(PhaserConfig);

const menuScene = new MenuScene();
Game.scene.add("MenuScene", menuScene, true);

async function initGame() {
    try {
        const data = await loadLevels();
        const levels = Array.isArray(data?.levels) ? data.levels : [];

        if (!levels.length) {
            console.warn(
                "Nenhum nível encontrado em levels.json (ou formato inválido)."
            );
        }

        levels.forEach((level: any) => {
            const levelScene = new GameScene(
                level.enemyConfig.speed,
                level.enemyConfig.spawnLimit,
                level.wordList,
                level.introConfig.question,
                level.enemyConfig.spawnRate,
                level.key,
                level.response,
                level.responseWord
            );
            const levelIntro = new LevelIntroScene(
                level.introConfig.title,
                level.introConfig.description,
                level.introConfig.question,
                level.key,
                `Intro${level.key}`
            );

            Game.scene.add(level.key, levelScene, false);
            Game.scene.add(`Intro${level.key}`, levelIntro, false);
        });
    } catch (error) {
        console.error("Erro ao inicializar os níveis:", error);
        // decide se quer: mostrar menu de erro, criar níveis padrão, ou apenas continuar
    }
}

// chama a função (sem await no topo)
initGame();

export default Game;
