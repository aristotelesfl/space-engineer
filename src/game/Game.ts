import Phaser from "phaser";
import PhaserConfig from "../config/phaserConfig";
import GameScene from "./scenes/GameScene";

const Game = new Phaser.Game(PhaserConfig);

const newGame = new GameScene();

Game.scene.add("GameScene", newGame, true);

export default Game;
