export class Player {
    constructor(
        private id: string,
        private lives: number = 3,
        private x: number,
        private y: number
    ) {}

    takeDamage(): void {
        this.lives -= 1;
    }

    isAlive(): boolean {
        return this.lives > 0;
    }

    addLives(): void {
        this.lives += 1;
    }

    getLives(): number {
        return this.lives;
    }

    getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }
}
