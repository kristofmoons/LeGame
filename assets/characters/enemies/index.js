/**
 * Enemy Registry - Export all enemies for easy importing
 * Located in: assets/characters/enemies/index.js
 * 
 * To add more enemies:
 * 1. Create a new file in this folder (e.g., dragon.js, ghost.js)
 * 2. Export an enemy object with id, name, dimensions, color, type, and render function
 * 3. Import and add to the appropriate array below (groundEnemies, flyingEnemies, or bossEnemies)
 */
import { SpikeEnemy } from './spike.js';
import { RobotEnemy } from './robot.js';
import { SlimeEnemy } from './slime.js';
import { BatEnemy } from './bat.js';
import { BirdEnemy } from './bird.js';
import { BossEnemy } from './boss.js';

// Ground enemies (must jump over)
export const groundEnemies = [
    SpikeEnemy,
    RobotEnemy,
    SlimeEnemy
];

// Flying enemies (must duck under)
export const flyingEnemies = [
    BatEnemy,
    BirdEnemy
];

// Boss enemies
export const bossEnemies = [
    BossEnemy
];

// All enemies
export const allEnemies = [...groundEnemies, ...flyingEnemies, ...bossEnemies];

// Get enemy by id
export function getEnemyById(id) {
    return allEnemies.find(e => e.id === id);
}

// Get random ground enemy
export function getRandomGroundEnemy() {
    return groundEnemies[Math.floor(Math.random() * groundEnemies.length)];
}

// Get random flying enemy
export function getRandomFlyingEnemy() {
    return flyingEnemies[Math.floor(Math.random() * flyingEnemies.length)];
}

export {
    SpikeEnemy,
    RobotEnemy,
    SlimeEnemy,
    BatEnemy,
    BirdEnemy,
    BossEnemy
};
