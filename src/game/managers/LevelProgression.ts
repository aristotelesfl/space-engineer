/**
 * Sistema de progressão de níveis
 * Define a ordem e transições entre níveis
 */

export interface LevelDefinition {
    introKey: string;
    gameKey: string;
    nextIntroKey?: string;
    title: string;
}

export class LevelProgression {
    private static levels: LevelDefinition[] = [
        {
            introKey: "IntroLevel1",
            gameKey: "Level1",
            nextIntroKey: "IntroLevel2",
            title: "Nível 1 - Requisitos Funcionais",
        },
        {
            introKey: "IntroLevel2",
            gameKey: "Level2",
            nextIntroKey: "IntroLevel3",
            title: "Nível 2 - Requisitos Não Funcionais",
        },
        {
            introKey: "IntroLevel3",
            gameKey: "Level3",
            nextIntroKey: "IntroBoss",
            title: "Nível 3 - Testes de Software",
        },
        {
            introKey: "IntroBoss",
            gameKey: "BossLevel",
            nextIntroKey: undefined, // Último nível
            title: "Nível Boss - Arquitetura",
        },
    ];

    /**
     * Retorna o próximo nível baseado no nível atual
     */
    static getNextLevel(currentGameKey: string): string | null {
        const currentIndex = this.levels.findIndex(
            (level) => level.gameKey === currentGameKey
        );

        if (currentIndex === -1) {
            console.error(`❌ Nível "${currentGameKey}" não encontrado`);
            return null;
        }

        const nextLevel = this.levels[currentIndex]?.nextIntroKey;

        if (nextLevel) {
            console.log(`➡️ Próximo nível: ${nextLevel}`);
            return nextLevel;
        } else {
            console.log(`🏆 Jogo completo! Nenhum próximo nível.`);
            return null;
        }
    }

    /**
     * Verifica se é o último nível
     */
    static isLastLevel(currentGameKey: string): boolean {
        const currentIndex = this.levels.findIndex(
            (level) => level.gameKey === currentGameKey
        );

        if (currentIndex === -1) return false;

        return this.levels[currentIndex]?.nextIntroKey === undefined;
    }

    /**
     * Retorna informações sobre um nível
     */
    static getLevelInfo(gameKey: string): LevelDefinition | null {
        return this.levels.find((level) => level.gameKey === gameKey) || null;
    }

    /**
     * Retorna todos os níveis disponíveis
     */
    static getAllLevels(): LevelDefinition[] {
        return [...this.levels];
    }

    /**
     * Retorna o número do nível atual (1-based)
     */
    static getLevelNumber(gameKey: string): number {
        const index = this.levels.findIndex(
            (level) => level.gameKey === gameKey
        );
        return index === -1 ? 0 : index + 1;
    }

    /**
     * Retorna o total de níveis
     */
    static getTotalLevels(): number {
        return this.levels.length;
    }
}
