/**
 * Spike Enemy - Animated triangle with pulsing
 */
export const SpikeEnemy = {
    id: 'spike',
    name: 'Spike',
    width: 35,
    height: 40,
    color: '#e74c3c',
    type: 'ground',
    
    render(ctx, obstacle, frameCount) {
        const ox = obstacle.x;
        const oy = obstacle.y;
        const ow = obstacle.width;
        const oh = obstacle.height;
        
        const bounce = Math.sin(frameCount * 0.1 + ox * 0.01) * 3;
        const eyeMove = Math.sin(frameCount * 0.15) * 2;
        const pulseSize = Math.sin(frameCount * 0.1) * 3;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(ox + 4, oy + 4 + bounce, ow, oh);
        
        // Body
        ctx.fillStyle = obstacle.color;
        ctx.beginPath();
        ctx.moveTo(ox - pulseSize, oy + oh + bounce);
        ctx.lineTo(ox + ow / 2, oy - pulseSize + bounce);
        ctx.lineTo(ox + ow + pulseSize, oy + oh + bounce);
        ctx.closePath();
        ctx.fill();
        
        // Dark outline
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Evil eyes with glow
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ox + ow * 0.35, oy + oh * 0.55 + bounce, 6, 0, Math.PI * 2);
        ctx.arc(ox + ow * 0.65, oy + oh * 0.55 + bounce, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry eyebrows
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.2, oy + oh * 0.45 + bounce);
        ctx.lineTo(ox + ow * 0.45, oy + oh * 0.5 + bounce);
        ctx.moveTo(ox + ow * 0.8, oy + oh * 0.45 + bounce);
        ctx.lineTo(ox + ow * 0.55, oy + oh * 0.5 + bounce);
        ctx.stroke();
        
        // Red glowing pupils
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(ox + ow * 0.35 + eyeMove, oy + oh * 0.55 + bounce, 3, 0, Math.PI * 2);
        ctx.arc(ox + ow * 0.65 + eyeMove, oy + oh * 0.55 + bounce, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Menacing mouth
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.3, oy + oh * 0.75 + bounce);
        ctx.lineTo(ox + ow * 0.5, oy + oh * 0.85 + bounce);
        ctx.lineTo(ox + ow * 0.7, oy + oh * 0.75 + bounce);
        ctx.closePath();
        ctx.fill();
    }
};
