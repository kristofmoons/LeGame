/**
 * Robot Enemy - Walking animation with menacing look
 */
export const RobotEnemy = {
    id: 'robot',
    name: 'Robot',
    width: 30,
    height: 55,
    color: '#c0392b',
    type: 'ground',
    
    render(ctx, obstacle, frameCount) {
        const ox = obstacle.x;
        const oy = obstacle.y;
        const ow = obstacle.width;
        const oh = obstacle.height;
        
        const walkCycle = Math.sin(frameCount * 0.2) * 3;
        const legMove = Math.abs(Math.sin(frameCount * 0.15)) * 8;
        
        // Legs (walking)
        ctx.fillStyle = '#555';
        ctx.fillRect(ox + 5, oy + oh - 5, 8, 10 + legMove);
        ctx.fillRect(ox + ow - 13, oy + oh - 5, 8, 10 + (8 - legMove));
        
        // Body
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(ox, oy + 12 + walkCycle, ow, oh - 17);
        
        // Armor plates
        ctx.fillStyle = '#922';
        ctx.fillRect(ox + 3, oy + 20 + walkCycle, ow - 6, 8);
        ctx.fillRect(ox + 3, oy + oh - 20 + walkCycle, ow - 6, 8);
        
        // Antenna with spark
        ctx.fillStyle = '#444';
        ctx.fillRect(ox + ow / 2 - 2, oy + walkCycle, 4, 14);
        const sparkSize = 4 + Math.sin(frameCount * 0.5) * 2;
        ctx.fillStyle = frameCount % 10 < 5 ? '#ff0' : '#f00';
        ctx.beginPath();
        ctx.arc(ox + ow / 2, oy + walkCycle - 2, sparkSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry visor eyes (glowing red)
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillRect(ox + 4, oy + 18 + walkCycle, 10, 5);
        ctx.fillRect(ox + ow - 14, oy + 18 + walkCycle, 10, 5);
        ctx.shadowBlur = 0;
        
        // Menacing teeth/grille
        ctx.fillStyle = '#222';
        ctx.fillRect(ox + 4, oy + oh - 12 + walkCycle, ow - 8, 10);
        ctx.fillStyle = '#ddd';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(ox + 6 + i * 5, oy + oh - 10 + walkCycle, 3, 6);
        }
    }
};
