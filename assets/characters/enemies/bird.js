/**
 * Bird Enemy - Aggressive diving motion (flying type)
 */
export const BirdEnemy = {
    id: 'bird',
    name: 'Evil Bird',
    width: 55,
    height: 25,
    color: '#d35400',
    type: 'flying',
    
    render(ctx, obstacle, frameCount) {
        const ox = obstacle.x;
        const oy = obstacle.y;
        const ow = obstacle.width;
        const oh = obstacle.height;
        
        const wingFlap = Math.sin(frameCount * 0.5) * 10;
        const dive = Math.sin(frameCount * 0.1) * 3;
        
        // Body (sleek and aggressive)
        ctx.fillStyle = obstacle.color;
        ctx.beginPath();
        ctx.ellipse(ox + ow / 2, oy + oh / 2 + dive, ow * 0.45, oh * 0.35, 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings (sharp, aggressive)
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.25, oy + oh * 0.4 + dive);
        ctx.lineTo(ox - 15, oy - wingFlap - 5 + dive);
        ctx.lineTo(ox + ow * 0.35, oy + oh * 0.5 + dive);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.75, oy + oh * 0.4 + dive);
        ctx.lineTo(ox + ow + 15, oy - wingFlap - 5 + dive);
        ctx.lineTo(ox + ow * 0.65, oy + oh * 0.5 + dive);
        ctx.closePath();
        ctx.fill();
        
        // Tail feathers
        ctx.beginPath();
        ctx.moveTo(ox, oy + oh * 0.4 + dive);
        ctx.lineTo(ox - 20, oy + oh * 0.3 + dive);
        ctx.lineTo(ox - 18, oy + oh * 0.5 + dive);
        ctx.lineTo(ox - 22, oy + oh * 0.6 + dive);
        ctx.lineTo(ox + 5, oy + oh * 0.55 + dive);
        ctx.closePath();
        ctx.fill();
        
        // Sharp beak
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.8, oy + oh * 0.45 + dive);
        ctx.lineTo(ox + ow + 20, oy + oh * 0.4 + dive);
        ctx.lineTo(ox + ow * 0.8, oy + oh * 0.55 + dive);
        ctx.closePath();
        ctx.fill();
        
        // Angry eye with scar
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ox + ow * 0.6, oy + oh * 0.35 + dive, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(ox + ow * 0.62, oy + oh * 0.35 + dive, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye scar
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.5, oy + oh * 0.25 + dive);
        ctx.lineTo(ox + ow * 0.7, oy + oh * 0.45 + dive);
        ctx.stroke();
        
        // Crest/mohawk
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(ox + ow * 0.4, oy + oh * 0.2 + dive);
        ctx.lineTo(ox + ow * 0.35, oy - 10 + dive);
        ctx.lineTo(ox + ow * 0.5, oy + oh * 0.15 + dive);
        ctx.lineTo(ox + ow * 0.5, oy - 5 + dive);
        ctx.lineTo(ox + ow * 0.6, oy + oh * 0.2 + dive);
        ctx.closePath();
        ctx.fill();
    }
};
