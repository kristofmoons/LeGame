/**
 * Nuke Powerup - 500kg bomb that grants an extra life
 * Use it to defeat enemies with DEMOCRACY!
 */
export const NukePowerup = {
    id: 'nuke',
    name: '500KG Nuke',
    width: 36,
    height: 70,
    rarity: 'rare',
    minScore: 500, // Only spawns after this score
    spawnChance: 0.05, // 5% chance per eligible platform
    
    render(ctx, nuke, frameCount) {
        const nx = nuke.x;
        const ny = nuke.y;
        const bobble = Math.sin(frameCount * 0.08 + nx * 0.02) * 5;
        const glow = Math.sin(frameCount * 0.15) * 0.3 + 0.7;
        
        // Warning glow
        ctx.fillStyle = `rgba(255, 0, 0, ${glow * 0.3})`;
        ctx.beginPath();
        ctx.arc(nx, ny + bobble, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Bomb body (dark gray/black)
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.ellipse(nx, ny + bobble, 18, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Bomb nose cone
        ctx.beginPath();
        ctx.moveTo(nx - 12, ny - 20 + bobble);
        ctx.lineTo(nx, ny - 35 + bobble);
        ctx.lineTo(nx + 12, ny - 20 + bobble);
        ctx.closePath();
        ctx.fill();
        
        // Fins at bottom
        ctx.fillStyle = '#34495e';
        ctx.beginPath();
        ctx.moveTo(nx - 5, ny + 20 + bobble);
        ctx.lineTo(nx - 20, ny + 35 + bobble);
        ctx.lineTo(nx - 5, ny + 30 + bobble);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(nx + 5, ny + 20 + bobble);
        ctx.lineTo(nx + 20, ny + 35 + bobble);
        ctx.lineTo(nx + 5, ny + 30 + bobble);
        ctx.closePath();
        ctx.fill();
        
        // "500KG" text
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('500', nx, ny - 2 + bobble);
        ctx.fillText('KG', nx, ny + 8 + bobble);
        ctx.textAlign = 'left';
        
        // Radiation symbol hint
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(nx, ny + 18 + bobble, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(nx - 6, ny - 8 + bobble, 5, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
    },
    
    onCollect(gameState) {
        // Called when player collects this powerup
        return {
            hasNuke: true,
            message: '💣 500KG ACQUIRED!'
        };
    },
    
    onUse(obstacle, gameState) {
        // Called when player hits an enemy while holding the nuke
        return {
            hasNuke: false,
            destroyObstacle: true,
            bonusScore: 50,
            effect: 'democracy'
        };
    }
};

export default NukePowerup;
