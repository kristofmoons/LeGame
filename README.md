# Runner - Infinite Side Scroller

A simple, fun infinite side-scroller game built with vanilla JavaScript and HTML5 Canvas. Works on both desktop and mobile!

## 🎮 How to Play

- **Desktop**: Press `SPACE` or `UP ARROW` to jump
- **Mobile**: Tap anywhere on the screen to jump
- Avoid obstacles and survive as long as possible!
- Score increases over time and when passing obstacles

## ✨ Features

- Infinite procedurally generated obstacles
- Increasing difficulty over time
- High score saved to local storage
- Responsive design (works on any screen size)
- Touch controls for mobile devices
- Particle effects
- Smooth animations

## 🚀 How to Run

Simply open `index.html` in a web browser. No build step or dependencies required!

```bash
# Or use a local server for best results
npx serve .
```

## 📁 Files

- `index.html` - Game structure and UI
- `style.css` - Styling and responsive design
- `game.js` - Game logic, rendering, and input handling

## 🎯 Scoring

- +1 point every 10 frames survived
- +10 points for each obstacle passed
- High score is automatically saved!
