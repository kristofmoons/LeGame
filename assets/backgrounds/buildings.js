/**
 * Background Buildings - Parallax scrolling city elements
 */

// House styles
export const houses = [
    {
        id: 'house_small',
        width: 80,
        height: 100,
        render(ctx, x, y, frameCount) {
            // Main building
            ctx.fillStyle = '#4a3728';
            ctx.fillRect(x, y, 80, 100);
            
            // Roof
            ctx.fillStyle = '#8b4513';
            ctx.beginPath();
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 40, y - 30);
            ctx.lineTo(x + 85, y);
            ctx.closePath();
            ctx.fill();
            
            // Door
            ctx.fillStyle = '#2d1f14';
            ctx.fillRect(x + 30, y + 60, 20, 40);
            
            // Windows
            ctx.fillStyle = '#f4d03f';
            ctx.fillRect(x + 10, y + 20, 18, 18);
            ctx.fillRect(x + 52, y + 20, 18, 18);
            
            // Window frames
            ctx.strokeStyle = '#2d1f14';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 10, y + 20, 18, 18);
            ctx.strokeRect(x + 52, y + 20, 18, 18);
            
            // Chimney
            ctx.fillStyle = '#6b4423';
            ctx.fillRect(x + 60, y - 25, 12, 25);
        }
    },
    {
        id: 'house_tall',
        width: 60,
        height: 140,
        render(ctx, x, y, frameCount) {
            // Main building
            ctx.fillStyle = '#5d4e37';
            ctx.fillRect(x, y, 60, 140);
            
            // Roof
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath();
            ctx.moveTo(x - 3, y);
            ctx.lineTo(x + 30, y - 25);
            ctx.lineTo(x + 63, y);
            ctx.closePath();
            ctx.fill();
            
            // Windows (3 floors)
            ctx.fillStyle = '#f4d03f';
            for (let floor = 0; floor < 3; floor++) {
                ctx.fillRect(x + 8, y + 15 + floor * 40, 16, 20);
                ctx.fillRect(x + 36, y + 15 + floor * 40, 16, 20);
            }
            
            // Door
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(x + 20, y + 110, 20, 30);
        }
    }
];

// Bar/Pub
export const bars = [
    {
        id: 'bar_western',
        width: 120,
        height: 90,
        render(ctx, x, y, frameCount) {
            // Main building
            ctx.fillStyle = '#8b6914';
            ctx.fillRect(x, y, 120, 90);
            
            // Western style top
            ctx.fillStyle = '#6b4423';
            ctx.fillRect(x - 5, y - 15, 130, 20);
            ctx.fillRect(x + 10, y - 25, 100, 15);
            
            // Sign
            ctx.fillStyle = '#2c1810';
            ctx.fillRect(x + 30, y - 20, 60, 12);
            ctx.fillStyle = '#f4d03f';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SALOON', x + 60, y - 11);
            ctx.textAlign = 'left';
            
            // Swinging doors
            ctx.fillStyle = '#5d3a1a';
            ctx.fillRect(x + 40, y + 50, 18, 40);
            ctx.fillRect(x + 62, y + 50, 18, 40);
            
            // Windows with warm light
            const flicker = Math.sin(frameCount * 0.1) * 20;
            ctx.fillStyle = `rgb(${244 + flicker}, ${180 + flicker}, ${60})`;
            ctx.fillRect(x + 10, y + 20, 25, 25);
            ctx.fillRect(x + 85, y + 20, 25, 25);
            
            // Window frames
            ctx.strokeStyle = '#2d1f14';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 10, y + 20, 25, 25);
            ctx.strokeRect(x + 85, y + 20, 25, 25);
        }
    }
];

// Church
export const churches = [
    {
        id: 'church_small',
        width: 100,
        height: 150,
        render(ctx, x, y, frameCount) {
            // Main building
            ctx.fillStyle = '#d4c4a8';
            ctx.fillRect(x + 10, y + 50, 80, 100);
            
            // Steeple
            ctx.fillStyle = '#d4c4a8';
            ctx.fillRect(x + 35, y + 20, 30, 35);
            
            // Steeple roof
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(x + 30, y + 20);
            ctx.lineTo(x + 50, y - 20);
            ctx.lineTo(x + 70, y + 20);
            ctx.closePath();
            ctx.fill();
            
            // Cross
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x + 47, y - 35, 6, 20);
            ctx.fillRect(x + 42, y - 30, 16, 5);
            
            // Main roof
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(x + 5, y + 50);
            ctx.lineTo(x + 50, y + 25);
            ctx.lineTo(x + 95, y + 50);
            ctx.closePath();
            ctx.fill();
            
            // Arched door
            ctx.fillStyle = '#5d3a1a';
            ctx.fillRect(x + 38, y + 110, 24, 40);
            ctx.beginPath();
            ctx.arc(x + 50, y + 110, 12, Math.PI, 0);
            ctx.fill();
            
            // Rose window
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(x + 50, y + 75, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2d1f14';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Window details
            ctx.beginPath();
            ctx.moveTo(x + 35, y + 75);
            ctx.lineTo(x + 65, y + 75);
            ctx.moveTo(x + 50, y + 60);
            ctx.lineTo(x + 50, y + 90);
            ctx.stroke();
        }
    }
];

// Skyscrapers/Tall buildings
export const skyscrapers = [
    {
        id: 'skyscraper_1',
        width: 70,
        height: 200,
        render(ctx, x, y, frameCount) {
            // Main building
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(x, y, 70, 200);
            
            // Windows grid
            ctx.fillStyle = '#f4d03f';
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 3; col++) {
                    // Random window on/off
                    if (Math.sin(x + row * 10 + col * 5 + frameCount * 0.001) > -0.3) {
                        ctx.fillRect(x + 8 + col * 22, y + 10 + row * 24, 15, 18);
                    } else {
                        ctx.fillStyle = '#1a252f';
                        ctx.fillRect(x + 8 + col * 22, y + 10 + row * 24, 15, 18);
                        ctx.fillStyle = '#f4d03f';
                    }
                }
            }
            
            // Antenna
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(x + 32, y - 30, 6, 30);
            
            // Blinking light
            if (frameCount % 60 < 30) {
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(x + 35, y - 30, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
];

// All buildings combined
export const allBuildings = [...houses, ...bars, ...churches, ...skyscrapers];

// Get random building
export function getRandomBuilding() {
    return allBuildings[Math.floor(Math.random() * allBuildings.length)];
}

// Background layer class for parallax
export class BackgroundLayer {
    constructor(buildings, speed, yOffset, scale = 1, tint = null) {
        this.buildings = buildings;
        this.speed = speed;
        this.yOffset = yOffset;
        this.scale = scale;
        this.tint = tint;
        this.elements = [];
    }
    
    init(width, groundY) {
        this.elements = [];
        let x = 0;
        while (x < width + 200) {
            const building = this.buildings[Math.floor(Math.random() * this.buildings.length)];
            this.elements.push({
                building,
                x,
                y: groundY - (building.height * this.scale) + this.yOffset
            });
            x += (building.width * this.scale) + 20 + Math.random() * 50;
        }
    }
    
    update(gameSpeed, width, groundY) {
        this.elements.forEach(el => {
            el.x -= gameSpeed * this.speed;
        });
        
        // Remove off-screen and add new
        this.elements = this.elements.filter(el => el.x + el.building.width * this.scale > -100);
        
        const lastEl = this.elements[this.elements.length - 1];
        if (lastEl && lastEl.x + lastEl.building.width * this.scale < width + 100) {
            const building = this.buildings[Math.floor(Math.random() * this.buildings.length)];
            this.elements.push({
                building,
                x: lastEl.x + lastEl.building.width * this.scale + 20 + Math.random() * 50,
                y: groundY - (building.height * this.scale) + this.yOffset
            });
        }
    }
    
    render(ctx, frameCount) {
        ctx.save();
        if (this.tint) {
            ctx.globalAlpha = this.tint.alpha || 1;
        }
        
        this.elements.forEach(el => {
            ctx.save();
            ctx.translate(el.x, el.y);
            ctx.scale(this.scale, this.scale);
            el.building.render(ctx, 0, 0, frameCount);
            ctx.restore();
        });
        
        ctx.restore();
    }
}
