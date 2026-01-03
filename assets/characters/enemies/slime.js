/**
 * Slime Enemy - Pulsing blob with dripping animation
 */
export const SlimeEnemy = {
    id: 'slime',
    name: 'Slime',
    width: 45,
    height: 35,
    color: '#9b59b6',
    type: 'ground',
    
    render(ctx, obstacle, frameCount) {
        const ox = obstacle.x;
        const oy = obstacle.y;
        const ow = obstacle.width;
        const oh = obstacle.height;
        
        const pulse = Math.sin(frameCount * 0.1) * 4;
        const squish = Math.cos(frameCount * 0.1) * 3;
        
        // Dripping underneath
        ctx.fillStyle = obstacle.color;
        const dripHeight = Math.sin(frameCount * 0.15) * 5 + 8;
        ctx.beginPath();
        ctx.ellipse(ox + ow * 0.25, oy + oh + 2, 5, dripHeight, 0, 0, Math.PI * 2);
        ctx.ellipse(ox + ow * 0.75, oy + oh - 1, 4, dripHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Main body (squishing)
        ctx.beginPath();
        ctx.ellipse(ox + ow / 2, oy + oh - 12 + squish, ow / 2 + pulse, oh / 2 - squish, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Darker overlay for depth
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(ox + ow / 2 + 5, oy + oh - 8, ow / 3, oh / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Evil eyes (watching player)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ox + ow * 0.35, oy + oh * 0.35 + squish, 8, 0, Math.PI * 2);
        ctx.arc(ox + ow * 0.65, oy + oh * 0.35 + squish, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils following player direction
        ctx.fillStyle = '#4a0072';
        ctx.beginPath();
        ctx.arc(ox + ow * 0.35 + 2, oy + oh * 0.35 + squish + 1, 4, 0, Math.PI * 2);
        ctx.arc(ox + ow * 0.65 + 2, oy + oh * 0.35 + squish + 1, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry mouth
        ctx.fillStyle = '#2d0047';
        ctx.beginPath();
        ctx.arc(ox + ow / 2, oy + oh * 0.6 + squish, 8, 0, Math.PI);
        ctx.fill();
    }
};
