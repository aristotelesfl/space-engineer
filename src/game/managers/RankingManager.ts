export interface RankingEntry {
    name: string;
    score: number;
    date: string;
    level: string;
}

export class RankingManager {
    private static readonly STORAGE_KEY = "space_engineer_ranking";
    private static readonly MAX_ENTRIES = 10;

    /**
     * Carrega o ranking do localStorage
     */
    static loadRanking(): RankingEntry[] {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return [];

            const ranking = JSON.parse(data) as RankingEntry[];
            return ranking.sort((a, b) => b.score - a.score);
        } catch (error) {
            console.error("Erro ao carregar ranking:", error);
            return [];
        }
    }

    /**
     * Salva o ranking no localStorage
     */
    static saveRanking(ranking: RankingEntry[]): void {
        try {
            const sorted = ranking
                .sort((a, b) => b.score - a.score)
                .slice(0, this.MAX_ENTRIES);

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sorted));
            console.log("✅ Ranking salvo com sucesso");
        } catch (error) {
            console.error("❌ Erro ao salvar ranking:", error);
        }
    }

    /**
     * Adiciona uma nova entrada ao ranking
     */
    static addEntry(name: string, score: number, level: string): boolean {
        const ranking = this.loadRanking();

        const newEntry: RankingEntry = {
            name: name.trim() || "Anônimo",
            score: score,
            date: new Date().toLocaleDateString("pt-BR"),
            level: level,
        };

        ranking.push(newEntry);
        this.saveRanking(ranking);

        console.log(`🏆 Nova entrada adicionada: ${name} - ${score} pts`);
        return true;
    }

    /**
     * Verifica se uma pontuação entra no ranking
     */
    static isHighScore(score: number): boolean {
        const ranking = this.loadRanking();

        // Se o ranking não está cheio, qualquer pontuação entra
        if (ranking.length < this.MAX_ENTRIES) {
            return true;
        }

        // Verifica se a pontuação é maior que a última do ranking
        const lowestScore = ranking[ranking.length - 1].score;
        return score > lowestScore;
    }

    /**
     * Retorna a posição que uma pontuação ficaria no ranking
     */
    static getPosition(score: number): number {
        const ranking = this.loadRanking();

        let position = 1;
        for (const entry of ranking) {
            if (score <= entry.score) {
                position++;
            }
        }

        return position;
    }

    /**
     * Limpa todo o ranking (para testes/debug)
     */
    static clearRanking(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log("🗑️ Ranking limpo");
    }

    /**
     * Retorna o top N do ranking
     */
    static getTopEntries(count: number = 10): RankingEntry[] {
        const ranking = this.loadRanking();
        return ranking.slice(0, count);
    }

    /**
     * Retorna estatísticas do ranking
     */
    static getStats() {
        const ranking = this.loadRanking();

        if (ranking.length === 0) {
            return {
                totalPlayers: 0,
                highestScore: 0,
                averageScore: 0,
            };
        }

        const totalScore = ranking.reduce((sum, entry) => sum + entry.score, 0);

        return {
            totalPlayers: ranking.length,
            highestScore: ranking[0].score,
            averageScore: Math.floor(totalScore / ranking.length),
        };
    }
}
