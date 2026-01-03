/**
 * Boss Enemy - Giant undodgeable enemy that requires a nuke to defeat
 * Appears with warning, gives player time to find and grab a nuke
 */
export const BossEnemy = {
    id: 'boss',
    name: 'The Destroyer',
    width: 200,
    height: 180,
    color: '#2c3e50',
    type: 'boss',
    isBoss: true,
    
    render(ctx, obstacle, frameCount) {
        const ox = obstacle.x;
        const oy = obstacle.y;
        const ow = obstacle.width;
        const oh = obstacle.height;
        
        // Animation values
        const pulse = Math.sin(frameCount * 0.05) * 5;
        const eyeGlow = Math.sin(frameCount * 0.1) * 0.3 + 0.7;
        const armSwing = Math.sin(frameCount * 0.08) * 10;
        const breathe = Math.sin(frameCount * 0.06) * 3;
        
        // Ominous aura/glow
        const gradient = ctx.createRadialGradient(
            ox + ow / 2, oy + oh / 2, 0,
            ox + ow / 2, oy + oh / 2, ow * 0.8
        );
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
        gradient.addColorStop(0.5, 'rgba(139, 0, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ox + ow / 2, oy + oh / 2, ow * 0.8 + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(ox + 10, oy + 10, ow, oh);
        
        // Legs (massive, mechanical)
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(ox + 20, oy + oh - 30, 50, 40);
        ctx.fillRect(ox + ow - 70, oy + oh - 30, 50, 40);
        
        // Leg joints
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(ox + 45, oy + oh - 30, 12, 0, Math.PI * 2);
        ctx.arc(ox + ow - 45, oy + oh - 30, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Main body
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(ox + 10, oy + 40 + breathe, ow - 20, oh - 70);
        
        // Armor plating
        ctx.fillStyle = '#34495e';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(ox + 20, oy + 60 + i * 35 + breathe, ow - 40, 25);
        }
        
        // Chest core (glowing)
        ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(ox + ow / 2, oy + oh / 2 + breathe, 25 + pulse * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Inner core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ox + ow / 2, oy + oh / 2 + breathe, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms (massive, swinging)
        ctx.fillStyle = '#1a252f';
        // Left arm
        ctx.save();
        ctx.translate(ox + 5, oy + 60);
        ctx.rotate(-0.3 + armSwing * 0.02);
        ctx.fillRect(-15, 0, 30, 80);
        // Claw
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(-15, 80);
        ctx.lineTo(-25, 110);
        ctx.lineTo(-5, 85);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(15, 80);
        ctx.lineTo(25, 110);
        ctx.lineTo(5, 85);
        ctx.fill();
        ctx.restore();
        
        // Right arm
        ctx.fillStyle = '#1a252f';
        ctx.save();
        ctx.translate(ox + ow - 5, oy + 60);
        ctx.rotate(0.3 - armSwing * 0.02);
        ctx.fillRect(-15, 0, 30, 80);
        // Claw
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(-15, 80);
        ctx.lineTo(-25, 110);
        ctx.lineTo(-5, 85);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(15, 80);
        ctx.lineTo(25, 110);
        ctx.lineTo(5, 85);
        ctx.fill();
        ctx.restore();
        
        // Head
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(ox + ow / 2 - 40, oy + breathe, 80, 50);
        
        // Horns
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(ox + ow / 2 - 35, oy + 10 + breathe);
        ctx.lineTo(ox + ow / 2 - 55, oy - 30 + breathe);
        ctx.lineTo(ox + ow / 2 - 25, oy + 15 + breathe);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ox + ow / 2 + 35, oy + 10 + breathe);
        ctx.lineTo(ox + ow / 2 + 55, oy - 30 + breathe);
        ctx.lineTo(ox + ow / 2 + 25, oy + 15 + breathe);
        ctx.closePath();
        ctx.fill();
        
        // Eyes (glowing, menacing)
        ctx.fillStyle = `rgba(255, 255, 0, ${eyeGlow})`;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 15;
        ctx.fillRect(ox + ow / 2 - 30, oy + 15 + breathe, 20, 8);
        ctx.fillRect(ox + ow / 2 + 10, oy + 15 + breathe, 20, 8);
        ctx.shadowBlur = 0;
        
        // Angry brow
        ctx.fillStyle = '#1a252f';
        ctx.beginPath();
        ctx.moveTo(ox + ow / 2 - 35, oy + 12 + breathe);
        ctx.lineTo(ox + ow / 2 - 10, oy + 18 + breathe);
        ctx.lineTo(ox + ow / 2 - 10, oy + 12 + breathe);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(ox + ow / 2 + 35, oy + 12 + breathe);
        ctx.lineTo(ox + ow / 2 + 10, oy + 18 + breathe);
        ctx.lineTo(ox + ow / 2 + 10, oy + 12 + breathe);
        ctx.closePath();
        ctx.fill();
        
        // Mouth (teeth)
        ctx.fillStyle = '#000';
        ctx.fillRect(ox + ow / 2 - 25, oy + 35 + breathe, 50, 12);
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(ox + ow / 2 - 20 + i * 8, oy + 35 + breathe);
            ctx.lineTo(ox + ow / 2 - 16 + i * 8, oy + 43 + breathe);
            ctx.lineTo(ox + ow / 2 - 12 + i * 8, oy + 35 + breathe);
            ctx.closePath();
            ctx.fill();
        }
        
        // "DESTROYER" label (optional visual flair)
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DESTROYER', ox + ow / 2, oy + oh - 5);
        ctx.textAlign = 'left';
    }
};
