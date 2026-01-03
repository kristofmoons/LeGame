/**
 * Background Registry - Export all background elements
 * Located in: assets/backgrounds/index.js
 * 
 * To add more backgrounds:
 * 1. Create a new file in this folder (e.g., mountains.js, forest.js)
 * 2. Export building/element objects with id, dimensions, and render function
 * 3. Import and add to the exports below
 */
export {
    houses,
    bars,
    churches,
    skyscrapers,
    allBuildings,
    getRandomBuilding,
    BackgroundLayer
} from './buildings.js';
