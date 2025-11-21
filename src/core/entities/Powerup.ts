import Phaser from "phaser";

export class Powerup extends Phaser.Physics.Arcade.Sprite {
    word: string;
    originalWord: string;
    collected: boolean = false;
    id: string;
    wordText: Phaser.GameObjects.Text;
    isActive: boolean = true;
    speed: number = 80;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        word: string,
        speed?: number,
        id?: string
    ) {
        // Usa 'powerup' ou 'enemy' como fallback
        const texture = scene.textures.exists("powerup") ? "powerup" : "enemy";
        super(scene, x, y, texture);

        this.word = word.toLowerCase();
        this.originalWord = word.toLowerCase();
        this.speed = speed || 80;
        this.id = id || `powerup_${Date.now()}_${Math.random()}`;

        // Adiciona à cena e física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configurações físicas
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setCollideWorldBounds(false);

        // ✅ VISUAL DO POWERUP - SEM TINT (cor original)
        this.setScale(0.8);
        this.setOrigin(0.5);
        // NÃO usa setTint() - mantém sprite com cor original

        // ✅ LABEL PRETA COM LETRAS BRANCAS (igual aos inimigos)
        this.wordText = scene.add.text(0, 0, this.word.toLowerCase(), {
            fontSize: "20px",
            color: "#ffffff", // ✅ LETRAS BRANCAS
            backgroundColor: "#000000", // ✅ FUNDO PRETO
            padding: { x: 5, y: 5 },
        });
        this.wordText.setOrigin(0.5, 1);
        this.wordText.setDepth(100);

        // Animação flutuante suave (opcional)
        scene.tweens.add({
            targets: this,
            scaleX: 0.85,
            scaleY: 0.85,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        console.log(`⭐ Powerup criado: "${this.word}" em (${x}, ${y})`);
    }

    /**
     * ✅ MOVIMENTO: Desce em direção ao player (como os inimigos)
     */
    startMoving(targetX: number, targetY: number) {
        this.isActive = true;
        const body = this.body as Phaser.Physics.Arcade.Body;

        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            targetX,
            targetY
        );

        const velocityX = Math.cos(angle) * this.speed;
        const velocityY = Math.sin(angle) * this.speed;

        body.setVelocity(velocityX, velocityY);

        console.log(
            `⭐ Powerup "${this.word}" descendo para (${targetX.toFixed(
                0
            )}, ${targetY.toFixed(0)})`
        );
    }

    /**
     * ✅ VERIFICA LETRA (mesma lógica dos inimigos)
     */
    checkLetter(letter: string): boolean {
        if (!this.isActive || this.collected || this.word.length === 0) {
            return false;
        }
        return letter === this.word[0];
    }

    /**
     * ✅ REMOVE PRIMEIRA LETRA (mesma lógica dos inimigos)
     */
    removeFirstLetter() {
        if (this.word.length > 0) {
            this.word = this.word.substring(1);
            this.updateWordDisplay();
            console.log(
                `✂️ Powerup letra removida. Palavra restante: "${this.word}"`
            );
        }
    }

    updateWordDisplay() {
        if (this.wordText && this.wordText.active) {
            this.wordText.setText(this.word.toUpperCase());
        }
    }

    isCompleted(): boolean {
        return this.word.length === 0;
    }

    getNextLetter(): string {
        return this.word.length > 0 ? this.word[0] : "";
    }

    getDistanceToPoint(x: number, y: number): number {
        return Phaser.Math.Distance.Between(this.x, this.y, x, y);
    }

    /**
     * ✅ COLETA DO POWERUP (quando colide com player)
     */
    onCollected() {
        if (this.collected) return;

        this.collected = true;
        this.isActive = false;

        console.log(`⭐✅ Powerup "${this.originalWord}" coletado!`);

        // Para o movimento IMEDIATAMENTE
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        body.setEnable(false); // Desabilita física

        // Destrói o texto imediatamente
        if (this.wordText && this.wordText.active) {
            this.wordText.destroy();
        }

        // Efeito visual rápido de coleta e destruição
        this.scene.tweens.add({
            targets: this,
            scale: 1.5,
            alpha: 0,
            duration: 200, // Mais rápido
            ease: "Back.easeIn",
            onComplete: () => {
                // Garante destruição completa
                this.destroy(true);
            },
        });
    }

    /**
     * ✅ UPDATE: Apenas atualiza posição do texto
     * NÃO remove automaticamente se sair da tela
     */
    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        // Atualiza posição do texto
        if (this.wordText && this.wordText.active) {
            this.wordText.setPosition(this.x, this.y - 40);
        }

        // ✅ NÃO DESTRÓI SE SAIR DA TELA
        // Powerup permanece ativo até ser destruído ou coletado
    }

    destroy(fromScene?: boolean) {
        if (this.wordText && this.wordText.active) {
            this.wordText.destroy();
        }
        super.destroy(fromScene);
    }
}
