export class Enemy {
    constructor(
        public id: string,
        public x: number,
        public y: number,
        public speed: number,
        public gate: string
    ) {}

    moveToward(target: { x: number; y: number }): void {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude === 0) return;

        const normalizedX = dx / magnitude;
        const normalizedY = dy / magnitude;

        this.x += normalizedX * this.speed;
        this.y += normalizedY * this.speed;
    }

    takeShot(letter: string): void {
        if (this.gate.includes(letter)) {
            this.gate = this.gate.replace(letter, "");
        }
    }

    isDestroyed(): boolean {
        return this.gate.length === 0;
    }

    getLetters(): string {
        return this.gate;
    }
}
