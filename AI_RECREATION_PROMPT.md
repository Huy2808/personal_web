# 🌌 Complete AI Prompt: Astrophysics Portfolio Website with Cosmic Web Background

## Mission Statement
Create a **professional, modern personal website** for a Master's student in Astrophysics using **pure HTML, CSS, and JavaScript** (no frameworks). The centerpiece is a **scientifically accurate, animated cosmic web background** using HTML5 Canvas that represents the large-scale structure of the universe as seen in SDSS, 2dF, Illustris, and Planck surveys.

---

## 🎯 Project Requirements

### Technology Stack
- **HTML5** for semantic structure
- **CSS3** for styling with custom properties (variables)
- **Vanilla JavaScript** (ES6+) for interactivity
- **HTML5 Canvas API** for cosmic web visualization
- **Google Fonts**: Inter font family
- **Font Awesome 6.4.0** for icons
- **No frameworks or libraries** (pure vanilla code)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop, tablet, mobile
- 60 FPS animation performance target
- <5% CPU usage on modern devices

---

## 🌌 PART 1: Cosmic Web Background (Primary Feature)

### Scientific Concept
The background represents the **large-scale structure of the universe**:
- **Nodes** = Galaxy clusters and dark matter halos
- **Filaments** = Cosmic web threads where matter accumulates
- **Voids** = Under-dense regions between structures
- **Particles** = Cosmic dust, light, or distant galaxies

### Visual Specifications

#### Canvas Setup
```javascript
- Full-screen canvas element: <canvas id="starfield"></canvas>
- Position: fixed, top: 0, left: 0, width: 100vw, height: 100vh
- Z-index: -1 (behind all content)
- Canvas opacity: 0.8 in CSS
- Background: radial-gradient from dark navy center to darker edges
```

#### Configuration Object
```javascript
config = {
  // Animation timing
  animationSpeed: 0.001,      // Very slow time progression
  pulseSpeed: 0.003,          // Node pulsing frequency
  
  // Cosmic structure density
  numNodes: 45,               // Galaxy clusters
  numStars: 80,               // Background stars
  numParticles: 25,           // Moving light particles
  
  // Filament network
  maxFilamentDistance: 220,   // Max connection radius (px)
  filamentOpacity: 0.25,      // Base filament visibility
  
  // Scientific color palette (RGBA)
  colors: {
    deepNavy: 'rgba(15, 23, 42, 0.8)',      // Deep space
    indigo: 'rgba(30, 27, 75, 0.6)',        // Mid-depth filaments
    violet: 'rgba(88, 28, 135, 0.5)',       // Distant structures
    faintCyan: 'rgba(6, 182, 212, 0.4)',    // Bright clusters
    gold: 'rgba(245, 158, 11, 0.3)'         // Accent highlights
  },
  
  // Interaction
  mouseInfluence: 0.3,        // Mouse parallax strength
  parallaxStrength: 0.5,      // Layer depth multiplier
  
  // Portrait centering
  portraitCenter: { x, y },   // Auto-detected from DOM
  focusRadius: 200            // Portrait influence area
}
```

### Node Generation Algorithm

```javascript
generateNodes() {
  const center = portraitCenter; // Center on user portrait
  
  for (let i = 0; i < numNodes; i++) {
    // Distribute in concentric rings
    const angle = (i / numNodes) * Math.PI * 2;
    const distance = 100 + Math.random() * 400;
    
    const node = {
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance,
      mass: Math.random() * 1.5 + 0.5,        // 0.5 to 2.0
      layer: Math.floor(Math.random() * 3),   // 0, 1, or 2 (parallax)
      phase: Math.random() * Math.PI * 2,     // Pulse phase offset
      pulseSpeed: pulseSpeed + Math.random() * 0.001
    };
    
    nodes.push(node);
  }
}
```

### Filament Generation Algorithm

```javascript
generateFilaments() {
  // Connect nodes within distance threshold
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < maxFilamentDistance) {
        filaments.push({
          start: nodes[i],
          end: nodes[j],
          strength: 1 - (distance / maxFilamentDistance), // 0 to 1
          layer: Math.min(nodes[i].layer, nodes[j].layer)
        });
      }
    }
  }
}
```

### Star Field Generation

```javascript
generateStars() {
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      brightness: Math.random(),              // 0 to 1
      twinkleSpeed: 0.01 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2
    });
  }
}
```

### Particle Generation

```javascript
generateParticles() {
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.2,        // Slow drift
      vy: (Math.random() - 0.5) * 0.2,
      life: Math.random() * 1000 + 500,       // Frames alive
      maxLife: Math.random() * 1000 + 500
    });
  }
}
```

### Drawing Methods (Render Order)

#### 1. Draw Stars (Background Layer)
```javascript
drawStars() {
  stars.forEach(star => {
    star.phase += star.twinkleSpeed;
    const brightness = (Math.sin(star.phase) * 0.5 + 0.5) * star.brightness;
    
    ctx.fillStyle = `rgba(245, 158, 11, ${brightness * 0.6})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, 1 + brightness * 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
}
```

#### 2. Draw Particles (Mid Layer)
```javascript
drawParticles() {
  particles.forEach(particle => {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;
    
    // Wrap around edges
    if (particle.x < 0) particle.x = canvasWidth;
    if (particle.x > canvasWidth) particle.x = 0;
    if (particle.y < 0) particle.y = canvasHeight;
    if (particle.y > canvasHeight) particle.y = 0;
    
    // Fade based on life
    const alpha = particle.life / particle.maxLife * 0.7;
    
    // Draw with radial gradient glow
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, 3
    );
    gradient.addColorStop(0, `rgba(6, 182, 212, ${alpha})`);
    gradient.addColorStop(1, `rgba(6, 182, 212, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}
```

#### 3. Draw Density Field (Ambient Glow)
```javascript
drawDensityField() {
  nodes.forEach(node => {
    const parallaxOffset = getParallaxOffset(node.layer);
    const intensity = node.mass * 0.4;
    const radius = 150 * node.mass;
    
    const gradient = ctx.createRadialGradient(
      node.x + parallaxOffset.x, node.y + parallaxOffset.y, 0,
      node.x + parallaxOffset.x, node.y + parallaxOffset.y, radius
    );
    
    gradient.addColorStop(0, colors.faintCyan.replace('0.4', (0.12 * intensity)));
    gradient.addColorStop(0.4, colors.violet.replace('0.5', (0.08 * intensity)));
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
    
    ctx.globalCompositeOperation = 'screen';  // Additive blending
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.globalCompositeOperation = 'source-over';
  });
}
```

#### 4. Draw Filaments (Cosmic Web)
```javascript
drawFilaments() {
  filaments.forEach(filament => {
    const parallaxOffset = getParallaxOffset(filament.layer);
    const opacity = filament.strength * filamentOpacity;
    
    // Color by layer depth
    let color;
    if (filament.layer === 0) color = colors.faintCyan;
    else if (filament.layer === 1) color = colors.violet;
    else color = colors.indigo;
    
    ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${opacity})`);
    ctx.lineWidth = filament.strength * 1.8;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(
      filament.start.x + parallaxOffset.x,
      filament.start.y + parallaxOffset.y
    );
    ctx.lineTo(
      filament.end.x + parallaxOffset.x,
      filament.end.y + parallaxOffset.y
    );
    ctx.stroke();
  });
}
```

#### 5. Draw Nodes (Galaxy Clusters)
```javascript
drawNodes() {
  nodes.forEach(node => {
    node.phase += node.pulseSpeed;
    const pulse = Math.sin(node.phase) * 0.2 + 0.8;  // 0.6 to 1.0
    const parallaxOffset = getParallaxOffset(node.layer);
    
    const size = node.mass * 3 * pulse;
    const glowSize = size * 4;
    
    // Outer glow
    const glowGradient = ctx.createRadialGradient(
      node.x + parallaxOffset.x, node.y + parallaxOffset.y, 0,
      node.x + parallaxOffset.x, node.y + parallaxOffset.y, glowSize
    );
    
    let glowColor;
    if (node.layer === 0) glowColor = colors.faintCyan;
    else if (node.layer === 1) glowColor = colors.gold;
    else glowColor = colors.violet;
    
    glowGradient.addColorStop(0, glowColor.replace(/[\d.]+\)$/, `${0.15 * pulse})`));
    glowGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(node.x + parallaxOffset.x, node.y + parallaxOffset.y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Core node
    const coreGradient = ctx.createRadialGradient(
      node.x + parallaxOffset.x, node.y + parallaxOffset.y, 0,
      node.x + parallaxOffset.x, node.y + parallaxOffset.y, size
    );
    
    coreGradient.addColorStop(0, colors.faintCyan.replace(/[\d.]+\)$/, `${0.5 * pulse})`));
    coreGradient.addColorStop(0.7, colors.violet.replace(/[\d.]+\)$/, `${0.3 * pulse})`));
    coreGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
    
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(node.x + parallaxOffset.x, node.y + parallaxOffset.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
}
```

### Parallax Calculation

```javascript
getParallaxOffset(layer) {
  const dx = (mouse.x - portraitCenter.x) * parallaxStrength;
  const dy = (mouse.y - portraitCenter.y) * parallaxStrength;
  
  // Layer 0 = foreground (most movement)
  // Layer 2 = background (least movement)
  const layerMultiplier = (layer + 1) * 0.3;
  
  return {
    x: dx * layerMultiplier * 0.1,
    y: dy * layerMultiplier * 0.1
  };
}
```

### Animation Loop

```javascript
animate() {
  time += animationSpeed;
  
  // Clear with subtle trailing effect
  ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw layers (back to front)
  drawStars();
  drawParticles();
  drawDensityField();
  drawFilaments();
  drawNodes();
  
  animationId = requestAnimationFrame(() => animate());
}
```

### Mouse Tracking

```javascript
setupMouseTracking() {
  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  canvas.addEventListener('mouseleave', () => {
    mouse.x = portraitCenter.x;
    mouse.y = portraitCenter.y;
  });
}
```

### Portrait Center Detection

```javascript
updatePortraitCenter() {
  const portrait = document.querySelector('.about-image');
  if (portrait) {
    const rect = portrait.getBoundingClientRect();
    portraitCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  } else {
    // Fallback
    portraitCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.3
    };
  }
}
```

### Resize Handling

```javascript
resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  updatePortraitCenter();
  generateCosmicStructure(); // Regenerate for new dimensions
}

window.addEventListener('resize', () => resize());
```

---

## 📄 PART 2: Website Structure (HTML)

### File: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Name - Astrophysics Research</title>
    <meta name="description" content="Personal website of [Name], Master's student in Astrophysics specializing in cosmology and large-scale structure.">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Cosmic Web Background Canvas -->
    <canvas id="starfield"></canvas>
    
    <!-- Navigation Bar -->
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <span class="logo-text">Your Name</span>
            </div>
            <div class="nav-menu" id="nav-menu">
                <a href="#about" class="nav-link">About</a>
                <a href="#cv" class="nav-link">CV</a>
                <a href="#research" class="nav-link">Research</a>
                <a href="#notes" class="nav-link">Notes</a>
                <a href="#travel" class="nav-link">Travel</a>
                <a href="#contact" class="nav-link">Contact</a>
                <button class="theme-toggle" id="theme-toggle">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
            <div class="nav-toggle" id="nav-toggle">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main>
        <!-- About Section -->
        <section id="about" class="section">
            <div class="container">
                <div class="about-content">
                    <div class="about-text">
                        <h1 class="hero-title">Your Name</h1>
                        <h2 class="hero-subtitle">Master's Student in Astrophysics</h2>
                        <p class="hero-description">
                            Exploring the cosmos through computational modeling and observational astronomy. 
                            Currently researching galaxy evolution and cosmic microwave background at [University].
                        </p>
                        <div class="research-interests">
                            <h3>Research Interests</h3>
                            <div class="interests-grid">
                                <span class="interest-tag">Cosmology</span>
                                <span class="interest-tag">Large-Scale Structure</span>
                                <span class="interest-tag">CMB Analysis</span>
                                <span class="interest-tag">Galaxy Evolution</span>
                                <span class="interest-tag">Dark Matter</span>
                                <span class="interest-tag">Computational Astrophysics</span>
                            </div>
                        </div>
                        <blockquote class="science-quote">
                            <p>"Somewhere, something incredible is waiting to be known."</p>
                            <cite>— Carl Sagan</cite>
                        </blockquote>
                    </div>
                    <div class="about-image">
                        <div class="image-placeholder">
                            <i class="fas fa-user-astronaut"></i>
                            <p>Professional Portrait</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CV Section -->
        <section id="cv" class="section">
            <div class="container">
                <h2 class="section-title">Curriculum Vitae</h2>
                <div class="cv-download">
                    <a href="#" class="download-btn" onclick="downloadCV()">
                        <i class="fas fa-download"></i>
                        Download CV (PDF)
                    </a>
                </div>
                
                <div class="cv-content">
                    <div class="cv-column">
                        <div class="cv-section">
                            <h3>Education</h3>
                            <div class="timeline">
                                <div class="timeline-item">
                                    <div class="timeline-date">2023 - Present</div>
                                    <div class="timeline-content">
                                        <h4>M.S. in Astrophysics</h4>
                                        <p>[University Name]</p>
                                        <p>Thesis: "[Your Thesis Title]"</p>
                                        <p>Advisor: Prof. [Name]</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="cv-section">
                            <h3>Research Experience</h3>
                            <div class="timeline">
                                <div class="timeline-item">
                                    <div class="timeline-date">2023 - Present</div>
                                    <div class="timeline-content">
                                        <h4>Graduate Research Assistant</h4>
                                        <p>[University] - Cosmology Group</p>
                                        <p>[Brief description of research]</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="cv-column">
                        <div class="cv-section">
                            <h3>Technical Skills</h3>
                            <div class="skills-grid">
                                <div class="skill-category">
                                    <h4>Programming</h4>
                                    <div class="skill-tags">
                                        <span class="skill-tag">Python</span>
                                        <span class="skill-tag">C++</span>
                                        <span class="skill-tag">MATLAB</span>
                                        <span class="skill-tag">R</span>
                                    </div>
                                </div>
                                <div class="skill-category">
                                    <h4>Astrophysics Tools</h4>
                                    <div class="skill-tags">
                                        <span class="skill-tag">AstroPy</span>
                                        <span class="skill-tag">GADGET-2</span>
                                        <span class="skill-tag">HEALPix</span>
                                        <span class="skill-tag">DS9</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Research Section -->
        <section id="research" class="section">
            <div class="container">
                <h2 class="section-title">Research Projects</h2>
                <div class="research-grid">
                    <div class="research-card">
                        <h3>Project Title</h3>
                        <p>Brief description of research project, methodology, and findings.</p>
                        <div class="project-tools">
                            <span class="tool-tag">Python</span>
                            <span class="tool-tag">AstroPy</span>
                        </div>
                        <div class="project-links">
                            <a href="#"><i class="fab fa-github"></i></a>
                            <a href="#"><i class="fas fa-file-pdf"></i></a>
                        </div>
                    </div>
                    <!-- Repeat for more projects -->
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="section">
            <div class="container">
                <h2 class="section-title">Get In Touch</h2>
                <form id="contact-form" class="contact-form">
                    <input type="text" name="name" placeholder="Your Name" required>
                    <input type="email" name="email" placeholder="Your Email" required>
                    <textarea name="message" placeholder="Your Message" rows="5" required></textarea>
                    <button type="submit" class="submit-btn">
                        <i class="fas fa-paper-plane"></i> Send Message
                    </button>
                </form>
                
                <div class="social-links">
                    <a href="#"><i class="fab fa-linkedin"></i></a>
                    <a href="#"><i class="fab fa-github"></i></a>
                    <a href="#"><i class="fab fa-orcid"></i></a>
                    <a href="mailto:email@example.com"><i class="fas fa-envelope"></i></a>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 Your Name. Designed with ❤️ for astrophysics.</p>
    </footer>

    <!-- Custom JavaScript -->
    <script src="script.js"></script>
</body>
</html>
```

---

## 🎨 PART 3: Complete CSS Styling

### File: `style.css`

```css
/* === CSS RESET === */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* === CSS VARIABLES === */
:root {
    /* Dark theme */
    --bg-primary: #0a0a0f;
    --bg-secondary: #1a1a2e;
    --bg-tertiary: #16213e;
    --text-primary: #ffffff;
    --text-secondary: #b8b8b8;
    --text-muted: #888888;
    --accent-primary: #4a9eff;
    --accent-secondary: #ff6b6b;
    --accent-gold: #ffd700;
    --gradient-cosmic: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --shadow-primary: 0 4px 20px rgba(74, 158, 255, 0.3);
    --border-color: rgba(255, 255, 255, 0.1);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Light theme */
[data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #e9ecef;
    --text-primary: #212529;
    --text-secondary: #495057;
    --text-muted: #6c757d;
    --border-color: rgba(0, 0, 0, 0.1);
    --shadow-primary: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* === BASE STYLES === */
html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
}

/* === COSMIC WEB CANVAS === */
#starfield {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.8;
    background: radial-gradient(ellipse at center,
        rgba(15, 23, 42, 0.3) 0%,
        rgba(30, 27, 75, 0.2) 30%,
        rgba(15, 23, 42, 0.5) 70%,
        rgba(15, 23, 42, 0.7) 100%);
    pointer-events: none;
}

/* === NAVIGATION === */
.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(10, 10, 15, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-color);
    z-index: 1000;
    transition: var(--transition);
}

.navbar.scrolled {
    background: rgba(10, 10, 15, 0.98);
    box-shadow: var(--shadow-primary);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
    position: relative;
}

.nav-link:hover,
.nav-link.active {
    color: var(--accent-primary);
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent-primary);
    transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.active::after {
    width: 100%;
}

/* === SECTIONS === */
.section {
    padding: 8rem 2rem;
    min-height: 100vh;
    display: flex;
    align-items: center;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.section-title {
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: 3rem;
    text-align: center;
    background: var(--gradient-cosmic);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

/* === ABOUT SECTION === */
.about-content {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 4rem;
    align-items: center;
}

.hero-title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-subtitle {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    color: var(--accent-primary);
    margin-bottom: 1.5rem;
}

.about-image {
    display: flex;
    justify-content: center;
}

.image-placeholder {
    width: 300px;
    height: 300px;
    background: var(--bg-secondary);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 3px solid var(--accent-primary);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-placeholder:hover {
    transform: scale(1.05);
    box-shadow: 0 0 40px rgba(74, 158, 255, 0.5);
}

/* === RESEARCH CARDS === */
.research-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.research-card {
    background: rgba(26, 26, 46, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.research-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 40px rgba(74, 158, 255, 0.3);
    border-color: var(--accent-primary);
}

/* === CONTACT FORM === */
.contact-form {
    max-width: 600px;
    margin: 0 auto 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.contact-form input,
.contact-form textarea {
    background: rgba(26, 26, 46, 0.6);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    color: var(--text-primary);
    font-family: inherit;
    transition: var(--transition);
}

.contact-form input:focus,
.contact-form textarea:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1);
}

.submit-btn {
    background: var(--gradient-cosmic);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

/* === ANIMATIONS === */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
    .about-content {
        grid-template-columns: 1fr;
    }
    
    .nav-menu {
        position: fixed;
        right: -100%;
        top: 70px;
        flex-direction: column;
        background: rgba(10, 10, 15, 0.98);
        width: 100%;
        padding: 2rem;
        transition: right 0.3s ease;
    }
    
    .nav-menu.active {
        right: 0;
    }
}
```

---

## 🔧 PART 4: Complete JavaScript Implementation

### CosmicWeb Class Structure

```javascript
class CosmicWeb {
    constructor(canvasId)
    init()
    initialize()
    resize()
    updatePortraitCenter()
    setupMouseTracking()
    generateCosmicStructure()
    drawStars()
    drawParticles()
    drawDensityField()
    drawFilaments()
    drawNodes()
    getParallaxOffset(layer)
    animate()
    destroy()
}
```

### Additional Classes

```javascript
class Navigation {
    // Handle sticky nav, mobile menu, smooth scrolling, active links
}

class ThemeToggle {
    // Dark/light theme switching with localStorage
}

class ScrollAnimations {
    // Intersection Observer for fade-in animations
}

class ContactForm {
    // Form validation and submission handling
}

class App {
    // Initialize all components
}
```

---

## ✅ Quality Checklist

- [ ] Canvas covers full viewport (fixed position)
- [ ] 45 nodes arranged in concentric rings from portrait
- [ ] Filaments connect nodes < 220px apart
- [ ] 80 twinkling stars with sine wave brightness
- [ ] 25 particles drift slowly and wrap at edges
- [ ] 3 parallax layers (0, 1, 2)
- [ ] Mouse movement creates subtle parallax shift
- [ ] Node pulsing with sine wave (period ~10-20s)
- [ ] Color palette: navy, indigo, violet, cyan, gold
- [ ] Screen blending for density fields
- [ ] 60 FPS animation performance
- [ ] <5% CPU usage on modern devices
- [ ] Portrait center auto-detected from DOM
- [ ] Responsive: works on mobile, tablet, desktop
- [ ] Theme toggle: dark/light mode support
- [ ] Smooth scrolling navigation
- [ ] Contact form with validation
- [ ] Scroll animations with Intersection Observer
- [ ] All code pure vanilla JS (no frameworks)

---

## 🎯 Expected Result

A **professional astrophysics portfolio website** with:
- Scientifically accurate cosmic web background that looks like real cosmological simulations
- Subtle, elegant animations that don't distract from content
- Portrait-centered design where the cosmic web radiates outward
- Smooth 60 FPS performance
- Responsive design for all devices
- Professional aesthetic suitable for academic/research context

The cosmic web should evoke the feeling of **looking into the large-scale structure of the universe** — vast, interconnected, and beautiful — while remaining a complementary background element that enhances rather than overpowers the content.

---

**End of prompt. This specification contains everything needed to recreate the website from scratch.**
