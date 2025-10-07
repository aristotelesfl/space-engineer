import { Enemy } from "../../entities/Enemy";

export function spawnEnemy(
    screenWidth: number,
    target: { x: number; y: number },
    speed: number,
    gate: string
): Enemy {
    const randomX = Math.random() * screenWidth;
    const startY = 0;

    const enemy = new Enemy(crypto.randomUUID(), randomX, startY, speed, gate);
    enemy.moveToward(target);
    return enemy;
}
