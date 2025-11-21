import Phaser from "phaser";
import { Powerup } from "../../core/entities/Powerup";
import Player from "../../core/entities/Player";

export class PowerupManager {
    private scene: Phaser.Scene;
    private powerups: Powerup[] = [];
    private correctWords: string[];
    private spawnChance: number = 0.6;
    private spawnTimer?: Phaser.Time.TimerEvent;
    private onCollectCallback?: (word: string) => void;
    private maxPowerups: number = 4;
    private powerupSpeed: number = 80;

    constructor(
        scene: Phaser.Scene,
        correctWords: string[],
        onCollectCallback?: (word: string) => void
    ) {
        this.scene = scene;
        this.correctWords = correctWords.map((w) => w.toLowerCase().trim());
        this.onCollectCallback = onCollectCallback;

        console.log(
            `⭐ PowerupManager criado com palavras: [${this.correctWords.join(
                ", "
            )}]`
        );
    }

    startSpawner(spawnInterval: number) {
        if (this.correctWords.length === 0) {
            console.warn(
                "⚠️ Nenhuma palavra em correctWords! Powerups não serão spawnados."
            );
            return;
        }

        this.spawnTimer = this.scene.time.addEvent({
            delay: spawnInterval * 2,
            callback: () => this.trySpawn(),
            loop: true,
        });

        // Spawn inicial
        this.scene.time.delayedCall(3000, () => {
            this.trySpawn();
        });

        console.log(
            `⭐ Sistema de powerups iniciado (intervalo: ${
                spawnInterval * 2
            }ms)`
        );
    }

    /**
     * ✅ TENTA SPAWNAR - Verifica unicidade de palavras
     */
    private trySpawn() {
        // Verifica chance de spawn
        if (Math.random() > this.spawnChance) {
            console.log(`⭐ Spawn ignorado (chance)`);
            return;
        }

        // Limita quantidade total
        const activePowerups = this.powerups.filter(
            (p) => p.active && !p.collected
        ).length;

        if (activePowerups >= this.maxPowerups) {
            console.log(`⭐ Spawn ignorado (máximo: ${this.maxPowerups})`);
            return;
        }

        // ✅ VERIFICA UNICIDADE: obtém palavras disponíveis
        const availableWords = this.getAvailableWords();

        if (availableWords.length === 0) {
            console.log(
                `⭐ Spawn ignorado (todas as palavras já estão na tela)`
            );
            return;
        }

        // Escolhe palavra aleatória das disponíveis
        const word = Phaser.Utils.Array.GetRandom(availableWords);

        // Spawna no topo
        const { width } = this.scene.scale;
        const x = Phaser.Math.Between(100, width - 100);
        const y = -50;

        this.spawn(x, y, word);
    }

    /**
     * ✅ RETORNA PALAVRAS QUE NÃO ESTÃO ATIVAS NA TELA
     */
    private getAvailableWords(): string[] {
        // Obtém palavras dos powerups ativos
        const activeWords = this.powerups
            .filter((p) => p.active && !p.collected)
            .map((p) => p.originalWord);

        // Retorna apenas palavras que NÃO estão ativas
        return this.correctWords.filter((word) => !activeWords.includes(word));
    }

    /**
     * ✅ VERIFICA SE UMA PALAVRA JÁ ESTÁ ATIVA
     */
    private hasActiveWord(word: string): boolean {
        return this.powerups.some(
            (p) => p.active && !p.collected && p.originalWord === word
        );
    }

    /**
     * ✅ SPAWN DO POWERUP
     */
    spawn(x: number, y: number, word: string) {
        // Double-check: verifica se palavra já está ativa
        if (this.hasActiveWord(word)) {
            console.warn(
                `⚠️ Tentativa de spawnar palavra duplicada: "${word}" - ignorado`
            );
            return;
        }

        const powerup = new Powerup(this.scene, x, y, word, this.powerupSpeed);

        // Inicia movimento para baixo
        const playerY = this.scene.scale.height - 150;
        const playerX = this.scene.scale.width / 2;

        powerup.startMoving(playerX, playerY);

        this.powerups.push(powerup);

        console.log(
            `⭐✨ Powerup SPAWNADO: "${word}" em (${x.toFixed(0)}, ${y.toFixed(
                0
            )})`
        );
        console.log(`   📊 Total de powerups ativos: ${this.powerups.length}`);
        console.log(
            `   📝 Palavras ativas: [${this.powerups
                .filter((p) => p.active && !p.collected)
                .map((p) => p.originalWord)
                .join(", ")}]`
        );
    }

    /**
     * ✅ UPDATE: Verifica colisão com player
     */
    update(player: Player) {
        // Limpa powerups inativos
        this.powerups = this.powerups.filter((p) => p.active);

        this.powerups.forEach((powerup) => {
            if (!powerup.active || powerup.collected) return;

            // Verifica colisão com player
            const distance = Phaser.Math.Distance.Between(
                powerup.x,
                powerup.y,
                player.x,
                player.y
            );

            if (distance < 50) {
                console.log(
                    `💥 Colisão! Player (${player.x.toFixed(
                        0
                    )}, ${player.y.toFixed(0)}) - Powerup "${
                        powerup.originalWord
                    }" (${powerup.x.toFixed(0)}, ${powerup.y.toFixed(0)})`
                );
                this.collectPowerup(powerup);
            }
        });
    }

    /**
     * ✅ COLETA DO POWERUP
     */
    collectPowerup(powerup: Powerup) {
        if (powerup.collected) {
            console.log(`⚠️ Powerup já coletado`);
            return;
        }

        const originalWord = powerup.originalWord;

        // Valida palavra
        if (!this.correctWords.includes(originalWord)) {
            console.warn(`⚠️ Palavra inválida: "${originalWord}"`);
            powerup.onCollected();
            this.removePowerup(powerup);
            return;
        }

        console.log(`⭐✅ Powerup coletado: "${originalWord}"`);

        // Marca como coletado
        powerup.collected = true;
        powerup.isActive = false;

        // Emite evento com a instância para que a GameScene saiba exatamente qual powerup foi coletado
        this.scene.events.emit("powerupCollected", powerup);

        // Callback para GameScene (mantendo compatibilidade com callback por palavra)
        if (this.onCollectCallback) {
            this.onCollectCallback(originalWord);
        }

        // Remove da lista
        this.removePowerup(powerup);

        // Efeito visual
        powerup.onCollected();
    }

    private removePowerup(powerup: Powerup) {
        const index = this.powerups.indexOf(powerup);
        if (index > -1) {
            this.powerups.splice(index, 1);
            console.log(
                `   🗑️ Powerup removido. Total ativo: ${this.powerups.length}`
            );
        }
    }

    /**
     * ✅ REMOVE POWERUP DESTRUÍDO (quando todas as letras são digitadas)
     */
    destroyPowerup(powerup: Powerup) {
        if (!powerup.active) return;

        console.log(`💥 Powerup "${powerup.originalWord}" DESTRUÍDO!`);

        powerup.isActive = false;

        // Efeito de destruição
        this.scene.tweens.add({
            targets: powerup,
            alpha: 0,
            scale: 0.5,
            duration: 200,
            ease: "Power2",
            onComplete: () => {
                this.removePowerup(powerup);
                powerup.destroy(true);
            },
        });

        if (powerup.wordText && powerup.wordText.active) {
            this.scene.tweens.add({
                targets: powerup.wordText,
                alpha: 0,
                duration: 200,
            });
        }
    }

    getPowerups(): Powerup[] {
        return this.powerups.filter((p) => p.active && !p.collected);
    }

    getActivePowerupCount(): number {
        return this.powerups.filter((p) => p.active && !p.collected).length;
    }

    cleanup() {
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = undefined;
        }
    }

    forceSpawn(player?: Player) {
        const availableWords = this.getAvailableWords();

        if (availableWords.length === 0) {
            console.warn(`⚠️ Nenhuma palavra disponível para spawn forçado`);
            return;
        }

        const word = Phaser.Utils.Array.GetRandom(availableWords);
        const { width } = this.scene.scale;
        const x = Phaser.Math.Between(100, width - 100);

        this.spawn(x, -50, word);
    }

    setSpawnChance(chance: number) {
        this.spawnChance = Phaser.Math.Clamp(chance, 0, 1);
        console.log(
            `⭐ Chance de spawn: ${(this.spawnChance * 100).toFixed(0)}%`
        );
    }

    setMaxPowerups(max: number) {
        this.maxPowerups = Math.max(1, max);
        console.log(`⭐ Máximo simultâneo: ${this.maxPowerups}`);
    }

    setSpeed(speed: number) {
        this.powerupSpeed = Math.max(20, speed);
        console.log(`⭐ Velocidade: ${this.powerupSpeed}px/s`);
    }
}
