/**
 * Bat Enemy - Aggressive wing flapping (flying type)
 */
export const BatEnemy = {
    id: 'bat',
    name: 'Bat',
    width: 45,
    height: 30,
    color: '#e67e22',
    type: 'flying',
    
    render(ctx, obstacle, frameCount) {
        const ox = obstacle.x;
        const oy = obstacle.y;
        const ow = obstacle.width;
        const oh = obstacle.height;
        
        const wingFlap = Math.sin(frameCount * 0.4) * 15;
        const bodyBob = Math.sin(frameCount * 0.3) * 4;
        
        // Wings (more dramatic)
        ctx.fillStyle = obstacle.color;
        
        // Left wing
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.3, oy + oh / 2 + bodyBob);
        ctx.quadraticCurveTo(ox - 15, oy - wingFlap - 10, ox - 5, oy + oh * 0.3 + bodyBob);
        ctx.quadraticCurveTo(ox - 20, oy + wingFlap, ox + ow * 0.2, oy + oh * 0.7 + bodyBob);
        ctx.closePath();
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.7, oy + oh / 2 + bodyBob);
        ctx.quadraticCurveTo(ox + ow + 15, oy - wingFlap - 10, ox + ow + 5, oy + oh * 0.3 + bodyBob);
        ctx.quadraticCurveTo(ox + ow + 20, oy + wingFlap, ox + ow * 0.8, oy + oh * 0.7 + bodyBob);
        ctx.closePath();
        ctx.fill();
        
        // Body
        ctx.fillStyle = '#5d3a1a';
        ctx.beginPath();
        ctx.ellipse(ox + ow / 2, oy + oh / 2 + bodyBob, ow * 0.3, oh * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = obstacle.color;
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.35, oy + oh * 0.2 + bodyBob);
        ctx.lineTo(ox + ow * 0.25, oy - 8 + bodyBob);
        ctx.lineTo(ox + ow * 0.45, oy + oh * 0.25 + bodyBob);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.65, oy + oh * 0.2 + bodyBob);
        ctx.lineTo(ox + ow * 0.75, oy - 8 + bodyBob);
        ctx.lineTo(ox + ow * 0.55, oy + oh * 0.25 + bodyBob);
        ctx.fill();
        
        // Glowing eyes
        ctx.fillStyle = '#ff0';
        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ox + ow * 0.4, oy + oh * 0.4 + bodyBob, 5, 0, Math.PI * 2);
        ctx.arc(ox + ow * 0.6, oy + oh * 0.4 + bodyBob, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Fangs
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.4, oy + oh * 0.6 + bodyBob);
        ctx.lineTo(ox + ow * 0.35, oy + oh * 0.8 + bodyBob);
        ctx.lineTo(ox + ow * 0.45, oy + oh * 0.6 + bodyBob);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.55, oy + oh * 0.6 + bodyBob);
        ctx.lineTo(ox + ow * 0.65, oy + oh * 0.8 + bodyBob);
        ctx.lineTo(ox + ow * 0.6, oy + oh * 0.6 + bodyBob);
        ctx.fill();
    }
};
