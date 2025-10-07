import Phaser from "phaser";
import PhaserConfig from "../config/phaserConfig";
import GameScene from "./scenes/GameScene";

const Game = new Phaser.Game(PhaserConfig);

const newGame = new GameScene(0.75, 5000, ["ABC", "DEF", "GHI"]);

Game.scene.add("GameScene", newGame, true);

export default Game;
