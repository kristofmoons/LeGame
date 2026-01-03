/**
 * Default Player Character
 * Located in: assets/characters/players/default.js
 * 
 * To add more characters:
 * 1. Create a new file in this folder (e.g., ninja.js, astronaut.js)
 * 2. Export a player object with id, name, dimensions, color, and render function
 * 3. Import and add to allPlayers array in index.js
 */
export const DefaultPlayer = {
    id: 'default',
    name: 'Runner',
    width: 40,
    normalHeight: 50,
    duckHeight: 25,
    color: '#e94560',
    
    render(ctx, player, frameCount, isDucking, isGrounded, isOnPlatform) {
        const px = player.x;
        const py = player.y;
        const pw = player.width;
        const ph = player.height;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(px + 5, py + 5, pw, ph);
        
        // Body
        ctx.fillStyle = player.color || this.color;
        ctx.fillRect(px, py, pw, ph);
        
        // Face (adjusts based on ducking)
        if (isDucking) {
            // Ducking face - squished
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 25, py + 5, 10, 6); // Wide eye
            ctx.fillStyle = '#333';
            ctx.fillRect(px + 29, py + 7, 4, 3); // Pupil
            
            // Sweat drop to show effort
            ctx.fillStyle = '#87ceeb';
            ctx.beginPath();
            ctx.ellipse(px + 10, py + 8, 3, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Normal face
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 25, py + 10, 8, 8); // Eye
            ctx.fillStyle = '#333';
            ctx.fillRect(px + 28, py + 12, 3, 4); // Pupil
        }
        
        // Running legs animation (when grounded and not ducking)
        if ((isGrounded || isOnPlatform) && !isDucking) {
            const legOffset = Math.sin(frameCount * 0.3) * 5;
            ctx.fillStyle = player.color || this.color;
            ctx.fillRect(px + 5, py + ph, 10, 5 + legOffset);
            ctx.fillRect(px + 25, py + ph, 10, 5 - legOffset);
        }
    }
};

// All player characters
export const allPlayers = [
    DefaultPlayer
];

// Get player by id
export function getPlayerById(id) {
    return allPlayers.find(p => p.id === id) || DefaultPlayer;
}

export default DefaultPlayer;
