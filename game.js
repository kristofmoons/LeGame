/**
 * Runner - Infinite Side Scroller Game
 * Works on PC (keyboard) and Mobile (touch)
 * Score saved to local storage
 */

// ============ CANVAS SETUP ============
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas resolution
function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Get actual display size
function getDisplaySize() {
    const rect = canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
}

// ============ LOCAL STORAGE ============
const STORAGE_KEY = 'runner_high_score';

function getHighScore() {
    const score = localStorage.getItem(STORAGE_KEY);
    return score ? parseInt(score, 10) : 0;
}

function setHighScore(score) {
    localStorage.setItem(STORAGE_KEY, score.toString());
}

// ============ GAME STATE ============
let gameState = 'menu'; // menu, playing, gameOver
let score = 0;
let highScore = getHighScore();
let gameSpeed = 5;
let frameCount = 0;
let lastObstacleX = 0; // Track last obstacle position for fair spacing
let lastMilestone = 0; // Track last milestone for plane announcements
let announcementPlane = null; // Flying plane with message

// ============ BOSS STATE ============
let bossActive = false;
let bossPlane = null;
let bossTimer = 0;
let bossTimeLimit = 15 * 60; // 15 seconds at 60fps
let bossesDefeated = 0;
const BOSS_SCORES = [1000, 5000, 10000]; // Scores at which boss appears
let lastBossScore = 0; // Track which boss we've triggered

// ============ PLAYER ============
const PLAYER_NORMAL_HEIGHT = 50;
const PLAYER_DUCK_HEIGHT = 25;

const player = {
    x: 80,
    y: 0,
    width: 40,
    height: PLAYER_NORMAL_HEIGHT,
    velocityY: 0,
    gravity: 0.8,
    jumpForce: -15,
    grounded: false,
    ducking: false,
    onPlatform: null,
    color: '#e94560'
};

// ============ OBSTACLES ============
let obstacles = [];

// Ground obstacles - must jump over (enemy-like)
const groundObstacles = [
    { width: 35, height: 40, color: '#e74c3c', type: 'ground', style: 'spike' },
    { width: 30, height: 55, color: '#c0392b', type: 'ground', style: 'robot' },
    { width: 45, height: 35, color: '#9b59b6', type: 'ground', style: 'slime' },
];

// Flying obstacles - must duck under
const flyingObstacles = [
    { width: 45, height: 30, color: '#e67e22', type: 'flying', style: 'bat' },
    { width: 55, height: 25, color: '#d35400', type: 'flying', style: 'bird' },
];

// ============ PLATFORMS ============
let platforms = [];
const platformColors = ['#27ae60', '#2980b9', '#8e44ad'];

// Platform levels - FIXED for fullscreen (use pixels from ground, not percentages)
// These are pixel offsets from the ground
const PLATFORM_LEVELS = {
    low: { offset: 80, variance: 20 },     // Easy jump from ground (80-100px above ground)
    mid: { offset: 140, variance: 30 },    // Medium height (140-170px above ground)
    high: { offset: 200, variance: 40 },   // High platforms (200-240px above ground)
};

// ============ COINS ============
let coins = [];

// ============ POWERUPS (NUKES) ============
let nukes = [];
let hasNuke = false; // Player can only hold 1 nuke

// ============ BACKGROUND ============
let clouds = [];
let groundOffset = 0;

// Background building layers (parallax)
let bgLayerFar = [];    // Furthest - slowest
let bgLayerMid = [];    // Middle
let bgLayerNear = [];   // Nearest - fastest

// Building definitions (inline for simplicity, assets folder has detailed versions)
const buildings = {
    house: {
        width: 80,
        height: 100,
        render(ctx, x, y, frameCount) {
            ctx.fillStyle = '#4a3728';
            ctx.fillRect(x, y, 80, 100);
            ctx.fillStyle = '#8b4513';
            ctx.beginPath();
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 40, y - 30);
            ctx.lineTo(x + 85, y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#f4d03f';
            ctx.fillRect(x + 10, y + 20, 18, 18);
            ctx.fillRect(x + 52, y + 20, 18, 18);
            ctx.fillStyle = '#2d1f14';
            ctx.fillRect(x + 30, y + 60, 20, 40);
        }
    },
    tallHouse: {
        width: 60,
        height: 140,
        render(ctx, x, y, frameCount) {
            ctx.fillStyle = '#5d4e37';
            ctx.fillRect(x, y, 60, 140);
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath();
            ctx.moveTo(x - 3, y);
            ctx.lineTo(x + 30, y - 25);
            ctx.lineTo(x + 63, y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#f4d03f';
            for (let floor = 0; floor < 3; floor++) {
                ctx.fillRect(x + 8, y + 15 + floor * 40, 16, 20);
                ctx.fillRect(x + 36, y + 15 + floor * 40, 16, 20);
            }
        }
    },
    bar: {
        width: 120,
        height: 90,
        render(ctx, x, y, frameCount) {
            ctx.fillStyle = '#8b6914';
            ctx.fillRect(x, y, 120, 90);
            ctx.fillStyle = '#6b4423';
            ctx.fillRect(x - 5, y - 15, 130, 20);
            ctx.fillStyle = '#2c1810';
            ctx.fillRect(x + 30, y - 20, 60, 12);
            ctx.fillStyle = '#f4d03f';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SALOON', x + 60, y - 11);
            ctx.textAlign = 'left';
            const flicker = Math.sin(frameCount * 0.1) * 20;
            ctx.fillStyle = `rgb(${Math.floor(244 + flicker)}, ${Math.floor(180 + flicker)}, 60)`;
            ctx.fillRect(x + 10, y + 20, 25, 25);
            ctx.fillRect(x + 85, y + 20, 25, 25);
            ctx.fillStyle = '#5d3a1a';
            ctx.fillRect(x + 45, y + 50, 30, 40);
        }
    },
    church: {
        width: 100,
        height: 150,
        render(ctx, x, y, frameCount) {
            ctx.fillStyle = '#d4c4a8';
            ctx.fillRect(x + 10, y + 50, 80, 100);
            ctx.fillRect(x + 35, y + 20, 30, 35);
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(x + 30, y + 20);
            ctx.lineTo(x + 50, y - 20);
            ctx.lineTo(x + 70, y + 20);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x + 47, y - 35, 6, 20);
            ctx.fillRect(x + 42, y - 30, 16, 5);
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(x + 5, y + 50);
            ctx.lineTo(x + 50, y + 25);
            ctx.lineTo(x + 95, y + 50);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(x + 50, y + 75, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#5d3a1a';
            ctx.fillRect(x + 38, y + 110, 24, 40);
            ctx.beginPath();
            ctx.arc(x + 50, y + 110, 12, Math.PI, 0);
            ctx.fill();
        }
    },
    skyscraper: {
        width: 70,
        height: 200,
        render(ctx, x, y, frameCount) {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(x, y, 70, 200);
            ctx.fillStyle = '#f4d03f';
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 3; col++) {
                    if (Math.sin(x * 0.1 + row * 10 + col * 5) > -0.3) {
                        ctx.fillRect(x + 8 + col * 22, y + 10 + row * 24, 15, 18);
                    }
                }
            }
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(x + 32, y - 30, 6, 30);
            if (frameCount % 60 < 30) {
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(x + 35, y - 30, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
};

const buildingTypes = Object.values(buildings);

function initBackgroundLayers() {
    const { width, height } = getDisplaySize();
    const groundY = height - 100;
    
    // Far layer (small, slow, dark)
    bgLayerFar = [];
    let x = -100;
    while (x < width + 200) {
        const building = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
        bgLayerFar.push({
            building,
            x,
            scale: 0.4,
            y: groundY - building.height * 0.4
        });
        x += building.width * 0.4 + 30 + Math.random() * 60;
    }
    
    // Mid layer
    bgLayerMid = [];
    x = -100;
    while (x < width + 200) {
        const building = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
        bgLayerMid.push({
            building,
            x,
            scale: 0.6,
            y: groundY - building.height * 0.6
        });
        x += building.width * 0.6 + 40 + Math.random() * 80;
    }
    
    // Near layer
    bgLayerNear = [];
    x = -100;
    while (x < width + 200) {
        const building = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
        bgLayerNear.push({
            building,
            x,
            scale: 0.8,
            y: groundY - building.height * 0.8
        });
        x += building.width * 0.8 + 50 + Math.random() * 100;
    }
}

function updateBackgroundLayer(layer, speed, width, groundY) {
    layer.forEach(el => {
        el.x -= speed;
    });
    
    // Remove off-screen
    while (layer.length > 0 && layer[0].x + layer[0].building.width * layer[0].scale < -50) {
        layer.shift();
    }
    
    // Add new buildings
    if (layer.length > 0) {
        const last = layer[layer.length - 1];
        if (last.x + last.building.width * last.scale < width + 100) {
            const building = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
            const scale = last.scale;
            layer.push({
                building,
                x: last.x + last.building.width * scale + 40 + Math.random() * 80,
                scale,
                y: groundY - building.height * scale
            });
        }
    }
}

function renderBackgroundLayer(layer, alpha, frameCount) {
    ctx.save();
    ctx.globalAlpha = alpha;
    layer.forEach(el => {
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.scale(el.scale, el.scale);
        el.building.render(ctx, 0, 0, frameCount);
        ctx.restore();
    });
    ctx.restore();
}

function initClouds() {
    const { width, height } = getDisplaySize();
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.4) + 20,
            width: Math.random() * 60 + 40,
            speed: Math.random() * 0.5 + 0.2
        });
    }
    
    // Initialize background building layers
    initBackgroundLayers();
}

// Helper function to darken/lighten a hex color
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ============ PARTICLES ============
let particles = [];

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 5 + 2,
            color: color,
            life: 1
        });
    }
}

// ============ ANNOUNCEMENT PLANE ============
function spawnAnnouncementPlane(message) {
    const { height } = getDisplaySize();
    announcementPlane = {
        x: -200,
        y: height * 0.15 + Math.random() * 50,
        message: message,
        speed: 3
    };
}

function checkMilestones() {
    const milestones = [100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000];
    
    for (const milestone of milestones) {
        if (score >= milestone && lastMilestone < milestone) {
            lastMilestone = milestone;
            spawnAnnouncementPlane(`🎉 ${milestone}!`);
            return;
        }
    }
    
    // Check for new high score (only once when passing it)
    if (score > highScore && lastMilestone !== -1 && score > 50) {
        // Use -1 as a flag that we've announced the high score
        if (lastMilestone !== -1) {
            spawnAnnouncementPlane('🏆 NEW RECORD!');
            lastMilestone = -1; // Mark that we announced it
        }
    }
}

// ============ DOM ELEMENTS ============
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const menuHighScore = document.getElementById('menu-high-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const newRecordDisplay = document.getElementById('new-record');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const powerupDisplay = document.getElementById('powerup-display');
const democracyOverlay = document.getElementById('democracy-overlay');

// Update high score displays
function updateHighScoreDisplays() {
    highScoreDisplay.textContent = highScore;
    menuHighScore.textContent = highScore;
}
updateHighScoreDisplays();

// ============ GAME FUNCTIONS ============
function resetGame() {
    const { width, height } = getDisplaySize();
    score = 0;
    gameSpeed = 5;
    frameCount = 0;
    obstacles = [];
    platforms = [];
    particles = [];
    coins = [];
    nukes = [];
    hasNuke = false;
    lastObstacleX = width;
    lastMilestone = 0;
    announcementPlane = null;
    
    // Reset boss state
    bossActive = false;
    bossPlane = null;
    bossTimer = 0;
    bossesDefeated = 0;
    lastBossScore = 0;
    
    player.height = PLAYER_NORMAL_HEIGHT;
    player.y = height - 100 - player.height;
    player.velocityY = 0;
    player.grounded = true;
    player.ducking = false;
    player.onPlatform = null;
    
    // Update UI
    powerupDisplay.classList.remove('active');
    hideBossUI();
    
    initClouds();
    scoreDisplay.textContent = '0';
}

function startGame() {
    resetGame();
    gameState = 'playing';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function endGame() {
    gameState = 'gameOver';
    
    // Check for new high score
    const isNewRecord = score > highScore;
    if (isNewRecord) {
        highScore = score;
        setHighScore(highScore);
        updateHighScoreDisplays();
    }
    
    finalScoreDisplay.textContent = score;
    newRecordDisplay.classList.toggle('hidden', !isNewRecord);
    gameOverScreen.classList.remove('hidden');
}

// Democracy explosion - use the nuke!
function triggerDemocracy(obstacle) {
    if (!hasNuke) return false;
    
    hasNuke = false;
    powerupDisplay.classList.remove('active');
    
    // Show democracy overlay
    democracyOverlay.classList.add('active');
    setTimeout(() => {
        democracyOverlay.classList.remove('active');
    }, 800);
    
    // Create massive explosion particles
    createParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, '#ff0', 20);
    createParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, '#f00', 15);
    createParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, '#fff', 10);
    
    // Check if this was the boss
    if (obstacle.isBoss) {
        defeatBoss();
    }
    
    // Remove the obstacle
    obstacles = obstacles.filter(o => o !== obstacle);
    
    // Bonus points for democracy!
    score += 50;
    scoreDisplay.textContent = score;
    
    return true;
}

// ============ BOSS FUNCTIONS ============
function checkBossSpawn() {
    // Check if we should spawn a boss
    for (const bossScore of BOSS_SCORES) {
        if (score >= bossScore && lastBossScore < bossScore && !bossActive) {
            spawnBoss(bossScore);
            lastBossScore = bossScore;
            return;
        }
    }
}

function spawnBoss(atScore) {
    const { width, height } = getDisplaySize();
    
    bossActive = true;
    bossTimer = bossTimeLimit;
    
    // Spawn the evil boss plane
    bossPlane = {
        x: width + 100,
        y: height * 0.3,
        width: 200,
        height: 80,
        targetX: width - 250, // Where it will hover
        color: '#2c3e50',
        isBoss: true,
        style: 'boss_plane',
        type: 'boss',
        passed: false,
        health: 1, // Dies in one nuke hit
        entryPhase: true // Flying in
    };
    
    // Add to obstacles for collision detection
    obstacles.push(bossPlane);
    
    // Show boss warning
    spawnAnnouncementPlane('⚠️ BOSS INCOMING! ⚠️');
    showBossUI();
    
    // Spawn nukes immediately to give player a chance
    spawnBossNukes();
}

function spawnBossNukes() {
    const { width, height } = getDisplaySize();
    const groundY = height - 100;
    
    // Spawn 3-4 nukes on platforms at different levels during boss
    const levels = ['low', 'mid', 'high'];
    
    levels.forEach((levelKey, index) => {
        // Spawn a nuke at EACH level during boss (max 4)
        if (nukes.length < 4) {
            const level = PLATFORM_LEVELS[levelKey];
            const platformY = groundY - level.offset - Math.random() * level.variance;
            const platformWidth = 400 + Math.random() * 200; // Longer platforms for boss
            const startX = width + 100 + index * 350;
            
            // Create platform for the nuke
            platforms.push({
                x: startX,
                y: platformY,
                width: platformWidth,
                height: 18,
                color: '#e74c3c', // Red to indicate urgency
                level: levelKey,
                passed: false
            });
            
            // Spawn nuke on this platform
            nukes.push({
                x: startX + platformWidth * 0.5,
                y: platformY - 40,
                collected: false
            });
        }
    });
    
    // Also spawn one on ground level
    if (nukes.length < 4) {
        nukes.push({
            x: width + 200,
            y: groundY - 50,
            collected: false
        });
    }
}

function updateBoss() {
    if (!bossActive || !bossPlane) return;
    const { width, height } = getDisplaySize();
    // Entry animation
    if (bossPlane.entryPhase) {
        bossPlane.x -= 6;
        if (bossPlane.x <= width - bossPlane.width - 20) {
            bossPlane.x = width - bossPlane.width - 20;
            bossPlane.entryPhase = false;
            bossPlane.baseY = bossPlane.y;
        }
    } else {
        // Stay at right edge, move up and down to cover most of the screen
        bossPlane.x = width - bossPlane.width - 20;
        bossPlane.y = 40 + Math.sin(frameCount * 0.07) * (height - bossPlane.height - 160) / 2;
    }
    // Update timer
    bossTimer--;
    updateBossTimerUI();
    // Spawn more nukes during boss fight (every 2 seconds)
    if (bossTimer % 120 === 0 && bossTimer > 0 && nukes.length < 3 && !hasNuke) {
        spawnBossNukes();
    }
    // Time's up - auto-use nuke if available, else game over
    if (bossTimer <= 0) {
        if (hasNuke) {
            triggerDemocracy(bossPlane);
        } else {
            createParticles(player.x + player.width / 2, player.y + player.height / 2, player.color);
            endGame();
        }
    }
    // Check collision with boss (unavoidable)
    if (checkCollision(player, bossPlane)) {
        if (hasNuke) {
            triggerDemocracy(bossPlane);
        } else {
            createParticles(player.x + player.width / 2, player.y + player.height / 2, player.color);
            endGame();
        }
    }
}

function defeatBoss() {
    bossActive = false;
    bossPlane = null;
    bossesDefeated++;
    
    // Big score bonus
    score += 500;
    scoreDisplay.textContent = score;
    
    // Hide boss UI
    hideBossUI();
    
    // Victory announcement
    spawnAnnouncementPlane('🦅 BOSS DEFEATED! +500 🦅');
}

function showBossUI() {
    const bossUI = document.getElementById('boss-ui');
    if (bossUI) bossUI.classList.add('active');
}

function hideBossUI() {
    const bossUI = document.getElementById('boss-ui');
    if (bossUI) bossUI.classList.remove('active');
}

function updateBossTimerUI() {
    const timerEl = document.getElementById('boss-timer');
    if (timerEl) {
        const seconds = Math.ceil(bossTimer / 60);
        timerEl.textContent = seconds;
        
        // Flash when low
        if (seconds <= 5) {
            timerEl.style.color = '#e74c3c';
            timerEl.style.animation = 'pulse 0.5s ease-in-out infinite';
        } else {
            timerEl.style.color = '#fff';
            timerEl.style.animation = 'none';
        }
    }
}

function renderBossPlane(boss) {
    const bx = boss.x;
    const by = boss.y;
    const bw = boss.width;
    const bh = boss.height;
    // Evil aura
    const pulse = Math.sin(frameCount * 0.1) * 10;
    ctx.save();
    ctx.globalAlpha = 0.5 + 0.2 * Math.sin(frameCount * 0.07);
    ctx.beginPath();
    ctx.ellipse(bx + bw / 2, by + bh / 2, bw / 2 + 30 + pulse, bh / 2 + 20 + pulse, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.18)';
    ctx.fill();
    ctx.restore();
    // Main fuselage (dark evil color)
    ctx.save();
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(bx + bw / 2, by + bh / 2, bw / 2, bh / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cockpit (red tinted)
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.ellipse(bx + bw * 0.8, by + bh / 2 - 5, 25, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Wings (bat-like)
    ctx.fillStyle = '#2c2c44';
    // Top wing
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.3, by + bh / 2);
    ctx.lineTo(bx + bw * 0.1, by - 40);
    ctx.lineTo(bx + bw * 0.5, by + bh * 0.3);
    ctx.closePath();
    ctx.fill();
    // Bottom wing
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.3, by + bh / 2);
    ctx.lineTo(bx + bw * 0.1, by + bh + 40);
    ctx.lineTo(bx + bw * 0.5, by + bh * 0.7);
    ctx.closePath();
    ctx.fill();
    // Tail fins
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(bx + 20, by + bh / 2);
    ctx.lineTo(bx - 30, by - 20);
    ctx.lineTo(bx + 10, by + bh / 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + 20, by + bh / 2);
    ctx.lineTo(bx - 30, by + bh + 20);
    ctx.lineTo(bx + 10, by + bh / 2);
    ctx.closePath();
    ctx.fill();
    // Evil eyes on nose
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(bx + bw * 0.85, by + bh / 2 - 8, 6, 0, Math.PI * 2);
    ctx.arc(bx + bw * 0.85, by + bh / 2 + 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Skull emblem
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bx + bw / 2, by + bh / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(bx + bw / 2 - 4, by + bh / 2 - 2, 3, 0, Math.PI * 2);
    ctx.arc(bx + bw / 2 + 4, by + bh / 2 - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(bx + bw / 2 - 5, by + bh / 2 + 4, 10, 3);
    // Propeller (spinning fast)
    const propAngle = frameCount * 0.8;
    ctx.fillStyle = '#333';
    ctx.save();
    ctx.translate(bx + bw + 10, by + bh / 2);
    ctx.rotate(propAngle);
    ctx.fillRect(-4, -30, 8, 60);
    ctx.restore();
    // Engine flames
    const flameSize = 20 + Math.random() * 10;
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(bx + 5, by + bh / 2 - 10);
    ctx.lineTo(bx - flameSize, by + bh / 2);
    ctx.lineTo(bx + 5, by + bh / 2 + 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(bx + 5, by + bh / 2 - 5);
    ctx.lineTo(bx - flameSize * 0.5, by + bh / 2);
    ctx.lineTo(bx + 5, by + bh / 2 + 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function jump() {
    if (gameState === 'playing' && (player.grounded || player.onPlatform)) {
        player.velocityY = player.jumpForce;
        player.grounded = false;
        player.onPlatform = null;
        player.ducking = false;
        player.height = PLAYER_NORMAL_HEIGHT;
        createParticles(player.x + player.width / 2, player.y + player.height, '#fff', 5);
    }
}

function startDuck() {
    if (gameState === 'playing' && !player.ducking) {
        player.ducking = true;
        const oldHeight = player.height;
        player.height = PLAYER_DUCK_HEIGHT;
        // Adjust Y position so player ducks down, not up
        if (player.grounded || player.onPlatform) {
            player.y += oldHeight - PLAYER_DUCK_HEIGHT;
        }
    }
}

function stopDuck() {
    if (gameState === 'playing' && player.ducking) {
        player.ducking = false;
        const oldHeight = player.height;
        player.height = PLAYER_NORMAL_HEIGHT;
        // Adjust Y position back
        player.y -= PLAYER_NORMAL_HEIGHT - oldHeight;
    }
}

// Calculate minimum safe gap between obstacles based on game speed
function getMinObstacleGap() {
    // Minimum gap = time to react + jump over obstacle
    // At higher speeds, we need bigger gaps
    const baseGap = 200;
    const speedFactor = gameSpeed * 15;
    return baseGap + speedFactor;
}

function spawnObstacle() {
    const { width, height } = getDisplaySize();
    const groundY = height - 100;
    
    // Check if we have enough space since last obstacle
    const minGap = getMinObstacleGap();
    if (lastObstacleX > width - minGap) {
        return; // Don't spawn, not enough gap
    }
    
    // Decide what to spawn: ground obstacle, flying obstacle, or platform
    const rand = Math.random();
    
    if (rand < 0.35) {
        // Ground obstacle (35% chance)
        const type = groundObstacles[Math.floor(Math.random() * groundObstacles.length)];
        obstacles.push({
            x: width + 50,
            y: groundY - type.height,
            width: type.width,
            height: type.height,
            color: type.color,
            type: 'ground',
            style: type.style,
            passed: false,
            onGround: true
        });
        lastObstacleX = width + 50;
    } else if (rand < 0.50) {
        // Flying obstacle (15% chance) - must duck
        const type = flyingObstacles[Math.floor(Math.random() * flyingObstacles.length)];
        // Position at head height when standing
        const flyingY = groundY - PLAYER_NORMAL_HEIGHT - 15;
        obstacles.push({
            x: width + 50,
            y: flyingY,
            width: type.width,
            height: type.height,
            color: type.color,
            type: 'flying',
            style: type.style,
            passed: false,
            onGround: false
        });
        lastObstacleX = width + 50;
    } else {
        // Platform system (50% chance) - spawn MULTIPLE LEVELS at once
        const levels = Object.keys(PLATFORM_LEVELS);
        
        // Decide how many levels to spawn (2-3 levels at once for more vertical gameplay!)
        const numLevelsToSpawn = 2 + Math.floor(Math.random() * 2); // 2 or 3 levels always!
        const levelsToSpawn = [];
        
        // Always include at least low and one other level for accessibility
        levelsToSpawn.push('low');
        
        // 70% chance to also include mid level
        if (Math.random() < 0.7) {
            levelsToSpawn.push('mid');
        }
        
        // 50% chance to also include high level
        if (Math.random() < 0.5 && levelsToSpawn.length < numLevelsToSpawn) {
            levelsToSpawn.push('high');
        }
        
        // Fill remaining slots with random levels
        const shuffledLevels = [...levels].sort(() => Math.random() - 0.5);
        for (const lvl of shuffledLevels) {
            if (levelsToSpawn.length < numLevelsToSpawn && !levelsToSpawn.includes(lvl)) {
                levelsToSpawn.push(lvl);
            }
        }
        
        let furthestX = width + 50;
        
        // Spawn platforms at each selected level
        levelsToSpawn.forEach((levelKey, levelIndex) => {
            const level = PLATFORM_LEVELS[levelKey];
            // Calculate platform Y using pixel offset from ground
            const platformY = groundY - level.offset - Math.random() * level.variance;
            
            // Stagger the start positions slightly for visual variety
            let currentX = width + 50 + levelIndex * 100;
            
            // Create platform segments for this level - MUCH LONGER
            const numSegments = 2 + Math.floor(Math.random() * 3); // 2-4 segments per level
            
            for (let i = 0; i < numSegments; i++) {
                const segmentWidth = 400 + Math.random() * 300; // 400-700px per segment
                const platformHeight = 18;
                
                platforms.push({
                    x: currentX,
                    y: platformY,
                    width: segmentWidth,
                    height: platformHeight,
                    color: platformColors[Math.floor(Math.random() * platformColors.length)],
                    level: levelKey,
                    passed: false
                });
                
                // Spawn coins on platform - FEWER coins
                if (Math.random() < 0.5) { // 50% chance for coin
                    coins.push({
                        x: currentX + segmentWidth * 0.5,
                        y: platformY - 25,
                        collected: false
                    });
                }
                
                // Maybe spawn an enemy on platform (20% chance, not on first segment)
                if (Math.random() < 0.2 && i > 0 && i < numSegments - 1) {
                    const enemyType = groundObstacles[Math.floor(Math.random() * groundObstacles.length)];
                    obstacles.push({
                        x: currentX + segmentWidth * 0.5 + Math.random() * segmentWidth * 0.3,
                        y: platformY - enemyType.height,
                        width: enemyType.width,
                        height: enemyType.height,
                        color: enemyType.color,
                        type: 'ground',
                        style: enemyType.style,
                        passed: false,
                        onGround: false,
                        platformY: platformY
                    });
                }
                
                // Spawn nuke - MUCH INCREASED spawn rate!
                // 25% normally after 300 score, 50% during boss fight
                // Can spawn on ANY segment
                const nukeChance = bossActive ? 0.5 : 0.25; // 50% during boss, 25% normally
                const minScoreForNuke = bossActive ? 0 : 300; // No minimum during boss
                if (score >= minScoreForNuke && Math.random() < nukeChance && nukes.length === 0 && !hasNuke) {
                    nukes.push({
                        x: currentX + 80,
                        y: platformY - 40,
                        collected: false
                    });
                }
                
                currentX += segmentWidth;
                
                // Add gap between segments
                if (i < numSegments - 1) {
                    const gapWidth = 80 + Math.random() * 60; // 80-140px gap
                    currentX += gapWidth;
                }
            }
            
            if (currentX > furthestX) {
                furthestX = currentX;
            }
        });
        
        lastObstacleX = furthestX;
    }
}

function checkCollision(rect1, rect2) {
    // Add some padding for more forgiving collision
    const padding = 6;
    return (
        rect1.x + padding < rect2.x + rect2.width - padding &&
        rect1.x + rect1.width - padding > rect2.x + padding &&
        rect1.y + padding < rect2.y + rect2.height - padding &&
        rect1.y + rect1.height - padding > rect2.y + padding
    );
}

function checkPlatformCollision(playerRect, platform) {
    // Only collide if player is falling and above platform
    if (player.velocityY < 0) return false;
    
    const playerBottom = playerRect.y + playerRect.height;
    const playerPrevBottom = playerBottom - player.velocityY;
    
    // Check if player is horizontally aligned with platform
    const horizontalOverlap = 
        playerRect.x + playerRect.width > platform.x + 5 &&
        playerRect.x < platform.x + platform.width - 5;
    
    // Check if player just crossed the platform top
    const crossedPlatform = 
        playerPrevBottom <= platform.y &&
        playerBottom >= platform.y;
    
    return horizontalOverlap && crossedPlatform;
}

// ============ UPDATE ============
function update() {
    if (gameState !== 'playing') return;
    
    const { width, height } = getDisplaySize();
    const groundY = height - 100;
    
    frameCount++;
    
    // Increase difficulty over time (capped)
    if (frameCount % 600 === 0) {
        gameSpeed = Math.min(gameSpeed + 0.4, 12);
    }
    
    // Update player physics
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    
    // Check platform collisions
    player.onPlatform = null;
    platforms.forEach(platform => {
        if (checkPlatformCollision(player, platform)) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.onPlatform = platform;
        }
    });
    
    // Ground collision
    if (player.y + player.height >= groundY) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.grounded = true;
        player.onPlatform = null;
    } else if (!player.onPlatform) {
        player.grounded = false;
    }
    
    // If on platform and platform moves away, fall
    if (player.onPlatform) {
        if (player.x + player.width < player.onPlatform.x || 
            player.x > player.onPlatform.x + player.onPlatform.width) {
            player.onPlatform = null;
        }
    }
    
    // Spawn obstacles with controlled timing
    const spawnChance = 0.02 + (gameSpeed - 5) * 0.003; // Increases slightly with speed
    if (Math.random() < spawnChance) {
        spawnObstacle();
    }
    
    // Update obstacles
    obstacles.forEach((obstacle) => {
        obstacle.x -= gameSpeed;
        
        // Score when passing obstacle
        if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
            obstacle.passed = true;
            score += obstacle.type === 'flying' ? 15 : 10;
            scoreDisplay.textContent = score;
            createParticles(obstacle.x + obstacle.width, obstacle.y + obstacle.height / 2, '#ffd700', 3);
        }
        
        // Check collision
        if (checkCollision(player, obstacle)) {
            // Try to use nuke (democracy!)
            if (!triggerDemocracy(obstacle)) {
                // No nuke - game over
                createParticles(player.x + player.width / 2, player.y + player.height / 2, player.color);
                endGame();
            }
        }
    });
    
    // Update platforms
    platforms.forEach((platform) => {
        platform.x -= gameSpeed;
        
        // Score when passing platform
        if (!platform.passed && platform.x + platform.width < player.x) {
            platform.passed = true;
            score += 5;
            scoreDisplay.textContent = score;
        }
    });
    
    // Update coins
    coins.forEach((coin) => {
        coin.x -= gameSpeed;
        
        // Check coin collection
        if (!coin.collected) {
            const coinHitbox = { x: coin.x - 12, y: coin.y - 12, width: 24, height: 24 };
            if (checkCollision(player, coinHitbox)) {
                coin.collected = true;
                score += 10;
                scoreDisplay.textContent = score;
                createParticles(coin.x, coin.y, '#ffd700', 8);
            }
        }
    });
    
    // Update nukes
    nukes.forEach((nuke) => {
        nuke.x -= gameSpeed;
        
        // Check nuke collection
        if (!nuke.collected && !hasNuke) {
            const nukeHitbox = { x: nuke.x - 20, y: nuke.y - 20, width: 40, height: 40 };
            if (checkCollision(player, nukeHitbox)) {
                nuke.collected = true;
                hasNuke = true;
                powerupDisplay.classList.add('active');
                createParticles(nuke.x, nuke.y, '#ff0', 15);
                createParticles(nuke.x, nuke.y, '#f00', 10);
                
                // Announcement
                spawnAnnouncementPlane('💣 500KG ACQUIRED!');
            }
        }
    });
    
    // Track last obstacle position as they move
    if (obstacles.length > 0 || platforms.length > 0) {
        const allObjects = [...obstacles, ...platforms];
        lastObstacleX = Math.max(...allObjects.map(o => o.x));
    } else {
        lastObstacleX = 0;
    }
    
    // Remove off-screen obstacles and platforms
    obstacles = obstacles.filter(o => o.x + o.width > -50);
    platforms = platforms.filter(p => p.x + p.width > -50);
    coins = coins.filter(c => c.x > -50 && !c.collected);
    nukes = nukes.filter(n => n.x > -50 && !n.collected);
    
    // Update clouds
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = width + cloud.width;
            cloud.y = Math.random() * (height * 0.4) + 20;
        }
    });
    
    // Update particles
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
    });
    particles = particles.filter(p => p.life > 0);
    
    // Update ground offset for scrolling effect
    groundOffset = (groundOffset + gameSpeed) % 40;
    
    // Update background layers (parallax)
    updateBackgroundLayer(bgLayerFar, 0.2, width, groundY);
    updateBackgroundLayer(bgLayerMid, 0.4, width, groundY);
    updateBackgroundLayer(bgLayerNear, 0.6, width, groundY);
    
    // Update boss
    updateBoss();
    
    // Check if boss should spawn
    if (!bossActive) {
        checkBossSpawn();
    }
    
    // Add score over time (but NOT during boss fight!)
    if (frameCount % 10 === 0 && !bossActive) {
        score += 1;
        scoreDisplay.textContent = score;
        
        // Check for milestone announcements
        checkMilestones();
    }
    
    // Update announcement plane
    if (announcementPlane) {
        announcementPlane.x += announcementPlane.speed;
        const { width } = getDisplaySize();
        if (announcementPlane.x > width + 300) {
            announcementPlane = null;
        }
    }
}

// ============ RENDER ============
function render() {
    const { width, height } = getDisplaySize();
    const groundY = height - 100;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.width / 4, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw background buildings (parallax layers - far to near)
    renderBackgroundLayer(bgLayerFar, 0.3, frameCount);   // Furthest, darkest
    renderBackgroundLayer(bgLayerMid, 0.5, frameCount);   // Middle
    renderBackgroundLayer(bgLayerNear, 0.7, frameCount);  // Nearest, brightest
    
    // Draw platforms (longer, for leveling up)
    platforms.forEach(platform => {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(platform.x + 4, platform.y + 4, platform.width, platform.height);
        
        // Main body with gradient
        const platGradient = ctx.createLinearGradient(platform.x, platform.y, platform.x, platform.y + platform.height);
        platGradient.addColorStop(0, platform.color);
        platGradient.addColorStop(1, adjustColor(platform.color, -30));
        ctx.fillStyle = platGradient;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(platform.x, platform.y, platform.width, 4);
        
        // Side edges
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(platform.x, platform.y, 3, platform.height);
        ctx.fillRect(platform.x + platform.width - 3, platform.y, 3, platform.height);
        
        // Level indicator dots
        const dots = platform.level === 'high' ? 3 : platform.level === 'mid' ? 2 : 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < dots; i++) {
            ctx.beginPath();
            ctx.arc(platform.x + 15 + i * 12, platform.y + platform.height / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw coins
    coins.forEach(coin => {
        if (coin.collected) return;
        
        const cx = coin.x;
        const cy = coin.y;
        const bobble = Math.sin(frameCount * 0.1 + cx * 0.05) * 3;
        const rotation = frameCount * 0.05;
        const scaleX = Math.cos(rotation) * 0.5 + 0.5; // Creates spinning effect
        
        // Glow
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy + bobble, 16, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin body (ellipse for 3D spin effect)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.ellipse(cx, cy + bobble, 10 * (0.3 + scaleX * 0.7), 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin shine
        ctx.fillStyle = '#ffec8b';
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy - 2 + bobble, 4 * (0.3 + scaleX * 0.7), 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin edge
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy + bobble, 10 * (0.3 + scaleX * 0.7), 10, 0, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // Draw nukes (500kg powerup)
    nukes.forEach(nuke => {
        if (nuke.collected) return;
        
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
    });
    
    // Draw ground
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, groundY, width, 100);
    
    // Ground texture (lines)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    for (let x = -groundOffset; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 20, groundY + 100);
        ctx.stroke();
    }
    
    // Ground top line
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();
    
    // Draw obstacles (enemies) - more menacing with animations
    obstacles.forEach(obstacle => {
        // Special rendering for boss plane
        if (obstacle.style === 'boss_plane') {
            renderBossPlane(obstacle);
            return;
        }
        
        const ox = obstacle.x;
        const oy = obstacle.y;
        const ow = obstacle.width;
        const oh = obstacle.height;
        
        // Animation values
        const bounce = Math.sin(frameCount * 0.1 + ox * 0.01) * 3;
        const eyeMove = Math.sin(frameCount * 0.15) * 2;
        const breathe = Math.sin(frameCount * 0.08) * 2;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(ox + 4, oy + 4 + bounce, ow, oh);
        
        if (obstacle.style === 'spike') {
            // Spiky enemy - animated triangle with pulsing
            const pulseSize = Math.sin(frameCount * 0.1) * 3;
            
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
            
        } else if (obstacle.style === 'robot') {
            // Robot enemy - walking animation with menacing look
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
            
        } else if (obstacle.style === 'slime') {
            // Slime enemy - pulsing blob with dripping animation
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
            
        } else if (obstacle.style === 'bat') {
            // Bat enemy - aggressive wing flapping
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
            
        } else if (obstacle.style === 'bird') {
            // Evil bird - aggressive diving motion
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
    });
    
    // Draw player
    const px = player.x;
    const py = player.y;
    const pw = player.width;
    const ph = player.height;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(px + 5, py + 5, pw, ph);
    
    // Body
    ctx.fillStyle = player.color;
    ctx.fillRect(px, py, pw, ph);
    
    // Face (adjusts based on ducking)
    if (player.ducking) {
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
    if ((player.grounded || player.onPlatform) && !player.ducking) {
        const legOffset = Math.sin(frameCount * 0.3) * 5;
        ctx.fillStyle = player.color;
               ctx.fillRect(px + 5, py + ph, 10, 5 + legOffset);
        ctx.fillRect(px + 25, py + ph, 10, 5 - legOffset);
    }
    
    // Draw particles
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
    
    // Duck indicator when ducking
    if (player.ducking) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px sans-serif';
        ctx.fillText('↓', px + pw / 2 - 4, py - 5);
    }
    
    // Draw announcement plane
    if (announcementPlane) {
        const apx = announcementPlane.x;
        const apy = announcementPlane.y;
        
        // Plane body
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.ellipse(apx + 40, apy + 15, 40, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cockpit
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.ellipse(apx + 70, apy + 12, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.moveTo(apx, apy + 15);
        ctx.lineTo(apx - 15, apy);
        ctx.lineTo(apx - 15, apy + 5);
        ctx.lineTo(apx + 5, apy + 15);
        ctx.closePath();
        ctx.fill();
        
        // Top fin
        ctx.beginPath();
        ctx.moveTo(apx + 5, apy + 5);
        ctx.lineTo(apx - 5, apy - 10);
        ctx.lineTo(apx + 15, apy + 5);
        ctx.closePath();
        ctx.fill();
        
        // Wing
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.moveTo(apx + 25, apy + 15);
        ctx.lineTo(apx + 20, apy + 35);
        ctx.lineTo(apx + 55, apy + 35);
        ctx.lineTo(apx + 50, apy + 15);
        ctx.closePath();
        ctx.fill();
        
        // Propeller
        const propAngle = frameCount * 0.5;
        ctx.fillStyle = '#333';
        ctx.save();
        ctx.translate(apx + 82, apy + 15);
        ctx.rotate(propAngle);
        ctx.fillRect(-2, -15, 4, 30);
        ctx.restore();
        
        // Banner
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(apx - 15, apy + 10);
        ctx.lineTo(apx - 120, apy + 15);
        ctx.lineTo(apx - 125, apy + 45);
        ctx.lineTo(apx - 15, apy + 40);
        ctx.closePath();
        ctx.fill();
        
        // Banner wave effect
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(apx - 125, apy + 45);
        ctx.lineTo(apx - 135, apy + 30);
        ctx.lineTo(apx - 125, apy + 15);
        ctx.closePath();
        ctx.fill();
        
        // Banner text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(announcementPlane.message, apx - 70, apy + 34);
        ctx.textAlign = 'left';
    }
}

// ============ GAME LOOP ============
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// ============ INPUT HANDLERS ============
// Track keys for ducking
const keys = {
    down: false
};

// Keyboard
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (gameState === 'menu') {
            startGame();
        } else if (gameState === 'playing') {
            jump();
        } else if (gameState === 'gameOver') {
            startGame();
        }
    }
    
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        if (!keys.down) {
            keys.down = true;
            startDuck();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        keys.down = false;
        stopDuck();
    }
});

// Touch controls - tap top half to jump, bottom half to duck
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchStartY = touch.clientY - rect.top;
    const canvasHeight = rect.height;
    
    if (gameState === 'playing') {
        // Swipe down detection will be in touchmove
        // Tap in upper 70% = jump
        if (touchStartY < canvasHeight * 0.7) {
            jump();
        } else {
            // Tap in lower 30% = duck
            startDuck();
        }
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (player.ducking) {
        stopDuck();
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
});

// Click on canvas (for PC without keyboard)
canvas.addEventListener('click', (e) => {
    if (gameState === 'playing') {
        const rect = canvas.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        
        if (clickY < rect.height * 0.7) {
            jump();
        }
    }
});

// Buttons
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    if (gameState === 'playing') {
        e.preventDefault();
    }
}, { passive: false });

// ============ START ============
initClouds();
gameLoop();