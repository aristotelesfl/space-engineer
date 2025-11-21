export class ResponseTextManager {
    private responseText: string;
    private currentText: string;
    private correctWords: string[];
    private collectedWords: Set<string>;
    private onProgressCallback?: (progress: number) => void;

    constructor(
        responseText: string,
        correctWords: string[],
        onProgressCallback?: (progress: number) => void
    ) {
        this.responseText = responseText;
        this.currentText = responseText;
        this.correctWords = correctWords.map((w) => w.toLowerCase().trim());
        this.collectedWords = new Set<string>();
        this.onProgressCallback = onProgressCallback;

        console.log(`📋 ResponseTextManager criado:`);
        console.log(
            `   - Palavras necessárias: [${this.correctWords.join(", ")}]`
        );
        console.log(`   - Texto base: "${responseText}"`);
    }

    /**
     * Adiciona uma palavra coletada ao set
     * Retorna true se a palavra foi adicionada com sucesso
     */
    addCollectedWord(word: string): boolean {
        const normalizedWord = word.toLowerCase().trim();

        // Verifica se a palavra faz parte das palavras corretas
        if (!this.correctWords.includes(normalizedWord)) {
            console.warn(`⚠️ Palavra "${word}" não está em correctWords`);
            return false;
        }

        // Verifica se já foi coletada
        if (this.collectedWords.has(normalizedWord)) {
            console.log(`ℹ️ Palavra "${word}" já foi coletada anteriormente`);
            return false;
        }

        // Adiciona ao set
        this.collectedWords.add(normalizedWord);
        console.log(`✅ Palavra coletada: "${word}"`);
        console.log(
            `📊 Progresso: ${this.collectedWords.size}/${this.correctWords.length}`
        );

        // Atualiza o texto preenchendo a próxima lacuna
        this.fillNextGap(normalizedWord);

        // Notifica callback de progresso
        if (this.onProgressCallback) {
            this.onProgressCallback(this.getProgressPercentage());
        }

        return true;
    }

    /**
     * Preenche a próxima lacuna disponível com a palavra
     */
    private fillNextGap(word: string): void {
        const gapPattern = /_{6,}/;

        if (gapPattern.test(this.currentText)) {
            this.currentText = this.currentText.replace(gapPattern, word);
            console.log(`✏️ Lacuna preenchida com: "${word}"`);
            console.log(`📝 Texto atual: "${this.currentText}"`);
        }
    }

    /**
     * Verifica se todas as palavras necessárias foram coletadas
     */
    isComplete(): boolean {
        const complete = this.collectedWords.size === this.correctWords.length;

        if (complete) {
            console.log(`🎉 TODAS AS PALAVRAS COLETADAS!`);
            console.log(
                `   - Coletadas: [${Array.from(this.collectedWords).join(
                    ", "
                )}]`
            );
        }

        return complete;
    }

    /**
     * Retorna o texto atual (com lacunas preenchidas)
     */
    getCurrentText(): string {
        return this.currentText;
    }

    /**
     * Retorna as palavras corretas necessárias
     */
    getCorrectWords(): string[] {
        return this.correctWords;
    }

    /**
     * Retorna as palavras já coletadas
     */
    getCollectedWords(): string[] {
        return Array.from(this.collectedWords);
    }

    /**
     * Retorna quantas palavras ainda faltam coletar
     */
    getRemainingWordsCount(): number {
        return this.correctWords.length - this.collectedWords.size;
    }

    /**
     * Retorna as palavras que ainda faltam coletar
     */
    getRemainingWords(): string[] {
        return this.correctWords.filter(
            (word) => !this.collectedWords.has(word)
        );
    }

    /**
     * Retorna o progresso em porcentagem (0-100)
     */
    getProgressPercentage(): number {
        return Math.floor(
            (this.collectedWords.size / this.correctWords.length) * 100
        );
    }

    /**
     * Reseta o estado para recomeçar
     */
    reset(): void {
        this.currentText = this.responseText;
        this.collectedWords.clear();
        console.log(`🔄 ResponseTextManager resetado`);
    }
}
