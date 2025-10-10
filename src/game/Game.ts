import Phaser from "phaser";
import PhaserConfig from "../config/phaserConfig";
import GameScene from "./scenes/GameScene";
import GameMenu from "./scenes/GameMenu";
import CreditsScene from "./scenes/CreditsScene";

const Game = new Phaser.Game(PhaserConfig);

const newGame = new GameScene(0.25, 5000, ["ABC", "DEF", "GHI"]);

Game.scene.add("MenuScene", new GameMenu(0.25), true);
Game.scene.add("GameScene", newGame);
Game.scene.add("CreditsScene", new CreditsScene(0.25));

export default Game;
