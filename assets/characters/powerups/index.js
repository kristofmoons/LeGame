/**
 * Powerup Registry - Export all powerups
 */
import { NukePowerup } from './nuke.js';

export const allPowerups = [
    NukePowerup
];

export function getPowerupById(id) {
    return allPowerups.find(p => p.id === id);
}

export {
    NukePowerup
};
