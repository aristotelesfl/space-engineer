import Phaser from "phaser";
import PhaserConfig from "../config/phaserConfig";
import GameScene from "./scenes/GameScene";
import MenuScene from "./scenes/MenuScene";
import LevelIntroScene from "./scenes/LevelIntroScene";

// ====================================
// CONFIGURAÇÃO DE NÍVEIS COM POWERUPS
// ====================================

// Nível 1 - Requisitos Funcionais
const level1WordList = [
    "requisito",
    "funcional",
    "sistema",
    "usuario",
    "processo",
    "dados",
    "interface",
    "relatorio",
];

const level1 = new GameScene(
    80, // enemySpeed
    3, // enemyLimit
    level1WordList,
    3000, // spawnInterval
    "Level1",
    // 🆕 NOVOS PARÂMETROS
    "A documentação facilita o ________ do sistema e reduz custos de __________.",
    ["entendimento", "manutencao"]
);

// Nível 2 - Requisitos Não Funcionais
const level2WordList = [
    "desempenho",
    "seguranca",
    "usabilidade",
    "confiabilidade",
    "escalabilidade",
    "disponibilidade",
];

const level2 = new GameScene(
    80,
    5,
    level2WordList,
    3000,
    "Level2",
    "Requisitos não funcionais definem ________ e ________ do sistema.",
    ["qualidade", "restricoes"]
);

// Nível 3 - Testes de Software
const level3WordList = [
    "teste",
    "unitario",
    "integracao",
    "regressao",
    "validacao",
    "verificacao",
];

const level3 = new GameScene(
    250,
    7,
    level3WordList,
    1000,
    "Level3",
    "Testes de software garantem a ________ e identificam ________.",
    ["qualidade", "defeitos"]
);

// Nível Boss - Arquitetura de Software
const bossList = [
    "arquitetura",
    "componente",
    "modularidade",
    "acoplamento",
    "coesao",
    "padrao",
];

const bossLevel = new GameScene(
    300,
    10,
    bossList,
    800,
    "BossLevel",
    "Uma boa arquitetura promove ________ e minimiza o ________.",
    ["manutencao", "acoplamento"]
);

// ====================================
// INICIALIZAÇÃO DO JOGO
// ====================================

const Game = new Phaser.Game(PhaserConfig);

const menuScene = new MenuScene();
Game.scene.add("MenuScene", menuScene, true);

// ====================================
// CRIAÇÃO DAS TELAS DE INTRODUÇÃO
// ====================================

const introLevel1 = new LevelIntroScene(
    "NÍVEL 1 - REQUISITOS FUNCIONAIS",
    "Complete a frase coletando powerups!",
    "Digite palavras para destruir naves e colete powerups verdes",
    "Level1",
    "IntroLevel1"
);

const introLevel2 = new LevelIntroScene(
    "NÍVEL 2 - REQUISITOS NÃO FUNCIONAIS",
    "Defina qualidade e restrições!",
    "Velocidade aumentada - Colete os powerups corretos",
    "Level2",
    "IntroLevel2"
);

const introLevel3 = new LevelIntroScene(
    "NÍVEL 3 - TESTES DE SOFTWARE",
    "Garanta a qualidade!",
    "Desafio intenso - Complete a frase sobre testes",
    "Level3",
    "IntroLevel3"
);

const introBoss = new LevelIntroScene(
    "NÍVEL FINAL - ARQUITETURA",
    "Demonstre seu conhecimento!",
    "Teste final - Arquitetura de Software",
    "BossLevel",
    "IntroBoss"
);

// Adiciona as intros e níveis
Game.scene.add("IntroLevel1", introLevel1, false);
Game.scene.add("IntroLevel2", introLevel2, false);
Game.scene.add("IntroLevel3", introLevel3, false);
Game.scene.add("IntroBoss", introBoss, false);

Game.scene.add("Level1", level1, false);
Game.scene.add("Level2", level2, false);
Game.scene.add("Level3", level3, false);
Game.scene.add("BossLevel", bossLevel, false);

// ====================================
// FUNÇÕES AUXILIARES
// ====================================

export function startLevelWithIntro(introKey: string) {
    const currentScene = Game.scene.getScenes(true)[0];
    if (currentScene) {
        currentScene.scene.start(introKey);
    }
}

export function startLevel(levelKey: string) {
    const currentScene = Game.scene.getScenes(true)[0];
    if (currentScene) {
        currentScene.scene.start(levelKey);
    }
}

/**
 * 🆕 Cria um nível customizado com sistema de powerups
 */
export function createCustomLevelWithPowerups(config: {
    speed: number;
    limit: number;
    words: string[];
    interval: number;
    key: string;
    title: string;
    subtitle: string;
    question: string;
    responseText: string;
    correctWords: string[];
}) {
    // Cria o nível com powerups
    const level = new GameScene(
        config.speed,
        config.limit,
        config.words,
        config.interval,
        config.key,
        config.responseText,
        config.correctWords
    );

    // Cria a introdução
    const intro = new LevelIntroScene(
        config.title,
        config.subtitle,
        config.question,
        config.key,
        `Intro${config.key}`
    );

    // Adiciona ambos ao jogo
    Game.scene.add(config.key, level, false);
    Game.scene.add(`Intro${config.key}`, intro, false);

    return { level, intro };
}

/**
 * Exemplo de uso com data (alternativa ao construtor)
 */
export function startLevelWithData(
    sceneKey: string,
    data: {
        enemySpeed: number;
        enemyLimit: number;
        wordList: string[];
        spawnInterval: number;
        levelTitle?: string;
        levelQuestion?: string;
        responseText?: string;
        correctWords?: string[];
    }
) {
    const currentScene = Game.scene.getScenes(true)[0];
    if (currentScene) {
        currentScene.scene.start(sceneKey, data);
    }
}

export function listAvailableLevels() {
    return [
        {
            key: "Level1",
            difficulty: "Easy",
            topic: "Requisitos Funcionais",
            hasPowerups: true,
        },
        {
            key: "Level2",
            difficulty: "Medium",
            topic: "Requisitos Não Funcionais",
            hasPowerups: true,
        },
        {
            key: "Level3",
            difficulty: "Hard",
            topic: "Testes de Software",
            hasPowerups: true,
        },
        {
            key: "BossLevel",
            difficulty: "Extreme",
            topic: "Arquitetura de Software",
            hasPowerups: true,
        },
    ];
}

// ====================================
// EXEMPLO DE CRIAÇÃO DINÂMICA
// ====================================

/**
 * Exemplo de como criar um nível educativo dinamicamente:
 */
export function createEducationalLevel() {
    const customLevel = createCustomLevelWithPowerups({
        speed: 150,
        limit: 5,
        words: ["codigo", "teste", "debug", "deploy"],
        interval: 1200,
        key: "CustomEducational",
        title: "NÍVEL CUSTOMIZADO",
        subtitle: "Aprenda sobre desenvolvimento!",
        question: "Complete a frase sobre programação",
        responseText: "Bom código requer ________ e ________.",
        correctWords: ["testes", "documentacao"],
    });

    console.log("📚 Nível educativo criado:", customLevel);
    return customLevel;
}

// ====================================
// DEBUG E LOGS
// ====================================

console.log("🎮 Jogo inicializado com sistema de powerups!");
console.log("📋 Níveis disponíveis:", listAvailableLevels());
console.log("⭐ Sistema de powerups ativo em todos os níveis!");

export default Game;
