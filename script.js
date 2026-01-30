// === UTILITY FUNCTIONS ===
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// === 2dF-STYLE COSMIC WEB FIXED TO PORTRAIT ===
// Multi-scale filamentary structure like real observations
class CosmicWeb {
    constructor(canvasId) {
        this.canvas = $(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Cosmic structures
        this.filaments = [];
        this.clusters = [];
        this.galaxies = [];
        this.portraitCenter = null;
        this.initialPortraitCenter = null; // Store initial position for offset calculation
        
        // Animation
        this.time = 0;
        
        // Parameters
        this.config = {
            majorFilaments: 10, // Reduced from 15
            intermediateFilaments: 0, // Removed
            minorFilaments: 0, // Removed
            pointsPerFilament: 1200,
            wedgeAngle: Math.PI * 2, // Full 360 degrees around portrait
            maxRadius: 600,
            clusterCount: 35,
            shimmerSpeed: 0.003,
            motionAmplitude: 2,
            aberrationOffset: 3, // Pixels to offset for chromatic aberration
            colors: {
                deepSpace: 'rgba(5, 8, 20, 1.0)',
            }
        };

        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    // Get theme-aware colors
    getThemeColors() {
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (theme === 'light') {
            return {
                filament: 'rgba(0, 0, 0', // Darker black for light mode
                bigBang: {
                    core: 'rgba(0, 0, 0',
                    mid: 'rgba(20, 20, 20',
                    outer: 'rgba(40, 40, 40'
                },
                galaxy: 'rgba(20, 20, 20'
            };
        } else {
            return {
                filament: 'rgba(150, 200, 255', // Blue for dark mode
                bigBang: {
                    core: 'rgba(255, 255, 255',
                    mid: 'rgba(200, 220, 255',
                    outer: 'rgba(150, 200, 255'
                },
                galaxy: 'rgba(150, 200, 255'
            };
        }
    }

    initialize() {
        this.resize();
        this.updatePortraitPosition();
        this.initialPortraitCenter = { ...this.portraitCenter }; // Store initial position
        this.generateCosmicStructure();
        this.animate();

        window.addEventListener('resize', () => {
            this.resize();
            this.updatePortraitPosition();
            this.initialPortraitCenter = { ...this.portraitCenter }; // Reset initial position on resize
            this.generateCosmicStructure();
        });

        window.addEventListener('scroll', () => {
            this.updatePortraitPosition();
            // Don't regenerate - just update position for offset drawing on portrait pages
            // For non-portrait pages, keep center fixed
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updatePortraitPosition() {
        const portrait = document.querySelector('.about-image');
        const isAboutPage = window.location.pathname.includes('about') || 
                           window.location.pathname === '/' || 
                           window.location.pathname === '/index.html';
        
        if (portrait && isAboutPage) {
            // About page: center on portrait
            const rect = portrait.getBoundingClientRect();
            this.portraitCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                radius: Math.min(rect.width, rect.height) / 2,
                visible: rect.top < window.innerHeight && rect.bottom > 0,
                isPortraitOrigin: true
            };
        } else {
            // Other pages: central bright point on the right side, similar to portrait position
            // Position it where the portrait would typically be (right side of content area)
            const rightOffset = Math.min(window.innerWidth * 0.75, window.innerWidth - 250);
            this.portraitCenter = {
                x: rightOffset,
                y: Math.min(window.innerHeight * 0.4, 400), // Upper-right area
                radius: 20, // Small central point
                visible: true,
                isPortraitOrigin: false
            };
        }
    }

    rand(a, b) {
        return Math.random() * (b - a) + a;
    }

    gauss(m = 0, s = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    inWedge(x, y) {
        if (!this.portraitCenter) return false;
        const dx = x - this.portraitCenter.x;
        const dy = y - this.portraitCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Allow all angles, just check distance from center
        return dist > this.portraitCenter.radius * 1.1; // Outside origin point
    }

    generateCosmicStructure() {
        if (!this.portraitCenter) return;
        
        const origin = this.portraitCenter;
        const isPortraitOrigin = origin.isPortraitOrigin;
        
        // Adjust parameters based on page type
        const maxRadius = 2000; // Extended to span across page
        const wedgeAngle = Math.PI * 2; // Always full circle now
        
        this.clusters = [];
        this.filaments = [];
        this.galaxies = [];

        // Generate clusters along the filament paths
        for (let i = 0; i < this.config.clusterCount; i++) {
            const r = Math.pow(Math.random(), 0.8) * maxRadius * this.rand(0.3, 1);
            const a = Math.random() * Math.PI * 2; // Full circle
            const x = origin.x + r * Math.cos(a) + this.rand(-30, 30);
            const y = origin.y + r * Math.sin(a) + this.rand(-30, 30);
            this.clusters.push({ x, y, connections: 0 });
        }

        // Major filaments - straight lines with variable skew based on position
        // Aberration effect tilted towards down-left, lifted 10° from previous (20° down from left)
        
        for (let i = 0; i < this.config.majorFilaments; i++) {
            const angle = (i / this.config.majorFilaments) * Math.PI * 2; // Evenly distributed full circle
            
            // Start from origin edge
            const startX = origin.x + origin.radius * Math.cos(angle);
            const startY = origin.y + origin.radius * Math.sin(angle);
            
            // Rotate the aberration direction: 180° (left) + 20° (down) = 200° (down-left, lifted 10°)
            const aberrationDirection = Math.PI + Math.PI / 3; // 180° + 20° = 200° (down-left)
            
            // Calculate how aligned this filament is with the aberration direction
            // Filaments pointing opposite to aberration direction get max skew
            const alignmentWithAberration = Math.cos(angle - aberrationDirection);
            
            // Apply variable skew: filaments pointing away from down-left tilt more towards down-left
            // Reduced magnitude: -0.4 radians (~-23°) for more subtle aberration effect
            const variableSkew = alignmentWithAberration * -0.4;
            
            const aberratedAngle = angle + variableSkew;
            const endX = origin.x + maxRadius * Math.cos(aberratedAngle);
            const endY = origin.y + maxRadius * Math.sin(aberratedAngle);
            
            // Assign 3D orientation angle for this filament
            // Map the 2D angle to a 3D orientation where 0° points toward viewer
            // We'll use a simple mapping: angle in [0, 2π] maps to 3D angle in [-π/2, π/2]
            // This creates variation where some filaments point toward/away from viewer
            const angle3D = Math.sin(angle * 2) * Math.PI / 2; // Varies between -π/2 and π/2
            
            // For straight lines, control points are along the line (no curvature)
            this.filaments.push({
                p0: { x: startX, y: startY },
                p1: { x: startX + (endX - startX) * 0.33, y: startY + (endY - startY) * 0.33 },
                p2: { x: startX + (endX - startX) * 0.67, y: startY + (endY - startY) * 0.67 },
                p3: { x: endX, y: endY },
                type: 'major',
                depth: 1.0, // Foreground filaments
                angle3D: angle3D // 3D orientation angle
            });
        }

        // Add background filaments for depth (faint, positioned between major filaments)
        // Place them between major filaments but not exactly in the middle
        const backgroundCount = 5; // Reduced number of faint filaments
        const angleStep = (Math.PI * 2) / this.config.majorFilaments;
        
        for (let i = 0; i < backgroundCount; i++) {
            // Distribute across the full circle, between major filaments
            const majorFilamentIndex = Math.floor(i * (this.config.majorFilaments / backgroundCount));
            // Position between major filaments, offset by 35-45% of the gap (not exactly 50%)
            const offsetRatio = 0.35 + Math.random() * 0.1; // Random offset between 35-45%
            const angle = (majorFilamentIndex * angleStep) + (angleStep * offsetRatio);
            
            const startX = origin.x + origin.radius * Math.cos(angle);
            const startY = origin.y + origin.radius * Math.sin(angle);
            
            const alignmentWithAberration = Math.cos(angle - (Math.PI + Math.PI / 3));
            const variableSkew = alignmentWithAberration * -0.4;
            
            const aberratedAngle = angle + variableSkew;
            const endX = origin.x + maxRadius * 0.85 * Math.cos(aberratedAngle); // Slightly shorter than major
            const endY = origin.y + maxRadius * 0.85 * Math.sin(aberratedAngle);
            
            // Assign 3D orientation angle for background filaments
            const angle3D = Math.sin(angle * 2 + Math.PI / 4) * Math.PI / 2;
            
            this.filaments.push({
                p0: { x: startX, y: startY },
                p1: { x: startX + (endX - startX) * 0.33, y: startY + (endY - startY) * 0.33 },
                p2: { x: startX + (endX - startX) * 0.67, y: startY + (endY - startY) * 0.67 },
                p3: { x: endX, y: endY },
                type: 'background',
                depth: 0.15, // Much fainter
                angle3D: angle3D
            });
        }

        // Populate galaxies along filaments
        for (const f of this.filaments) {
            const points = this.config.pointsPerFilament; // All filaments are major now
            
            for (let i = 0; i < points; i++) {
                const t = i / points;
                const pos = this.bezierPoint(f, t);
                if (!this.inWedge(pos.x, pos.y)) continue;
                
                const tangent = this.bezierTangent(f, t);
                const len = Math.sqrt(tangent.dx * tangent.dx + tangent.dy * tangent.dy) || 1;
                const nx = -tangent.dy / len;
                const ny = tangent.dx / len;
                
                // Cone effect: width INCREASES with distance from origin
                // Galaxies spread out more as they move away from the central point
                // Start narrow (10) and expand wider (60) to match the cone shape
                const minWidth = 5;    // Very tight at origin
                const maxWidth = 120;  // Very wide at edge
                const width = minWidth + (maxWidth - minWidth) * Math.pow(t, 1.2); // Width increases exponentially with distance
                
                const offset = this.gauss(0, width);
                const dist = Math.sqrt((pos.x - origin.x) ** 2 + (pos.y - origin.y) ** 2);
                
                this.galaxies.push({
                    x: pos.x + nx * offset,
                    y: pos.y + ny * offset,
                    baseSize: 0.5 + Math.random() * 1.5,
                    phase: Math.random() * Math.PI * 2,
                    dist,
                    filamentDepth: f.depth || 1.0 // Store filament's depth for brightness control
                });
            }
        }
    }

    bezierPoint(f, t) {
        const inv = 1 - t;
        return {
            x: inv * inv * inv * f.p0.x + 3 * inv * inv * t * f.p1.x +
               3 * inv * t * t * f.p2.x + t * t * t * f.p3.x,
            y: inv * inv * inv * f.p0.y + 3 * inv * inv * t * f.p1.y +
               3 * inv * t * t * f.p2.y + t * t * t * f.p3.y
        };
    }

    bezierTangent(f, t) {
        const inv = 1 - t;
        return {
            dx: 3 * inv * inv * (f.p1.x - f.p0.x) + 6 * inv * t * (f.p2.x - f.p1.x) +
                3 * t * t * (f.p3.x - f.p2.x),
            dy: 3 * inv * inv * (f.p1.y - f.p0.y) + 6 * inv * t * (f.p2.y - f.p1.y) +
                3 * t * t * (f.p3.y - f.p2.y)
        };
    }

    draw() {
        // Clear canvas with transparency (let CSS background show through)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.portraitCenter || !this.initialPortraitCenter) return;

        // Calculate offset for smooth scrolling
        this.offsetX = this.portraitCenter.x - this.initialPortraitCenter.x;
        this.offsetY = this.portraitCenter.y - this.initialPortraitCenter.y;

        // Draw in layers
        // this.drawClusters(); // Removed - clusters looked unrelated to the cosmic web
        this.drawFilaments();
        this.drawGalaxies();
        
        // Draw bright central point (Big Bang) for non-portrait pages
        if (!this.portraitCenter.isPortraitOrigin) {
            this.drawBigBangPoint();
        }
    }
    
    drawBigBangPoint() {
        if (!this.portraitCenter) return;
        
        const origin = this.portraitCenter;
        const cx = origin.x;
        const cy = origin.y;
        
        // Static bright point (no pulsing)
        const pulse = 1;
        
        // Get theme-aware colors
        const colors = this.getThemeColors();
        
        // Multiple glowing layers for bright point
        const gradients = [
            { radius: 40 * pulse, alpha: 0.15 },
            { radius: 25 * pulse, alpha: 0.3 },
            { radius: 15 * pulse, alpha: 0.5 },
            { radius: 8 * pulse, alpha: 0.8 },
            { radius: 3 * pulse, alpha: 1.0 }
        ];
        
        for (const g of gradients) {
            const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, g.radius);
            gradient.addColorStop(0, `${colors.bigBang.core}, ${g.alpha})`);
            gradient.addColorStop(0.4, `${colors.bigBang.mid}, ${g.alpha * 0.6})`);
            gradient.addColorStop(1, `${colors.bigBang.outer}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, g.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawClusters() {
        if (!this.clusters || !this.portraitCenter) return;
        
        const origin = this.portraitCenter;
        const isPortraitOrigin = origin.isPortraitOrigin;
        const maxRadius = 2000; // Match the extended radius
        const offsetX = this.offsetX || 0;
        const offsetY = this.offsetY || 0;
        
        for (const c of this.clusters) {
            if (!this.inWedge(c.x, c.y)) continue;
            
            // Apply offset for scrolling
            const cx = c.x + offsetX;
            const cy = c.y + offsetY;
            
            // Distance-based fade only for portrait origin
            const distance = Math.sqrt(Math.pow(cx - origin.x, 2) + Math.pow(cy - origin.y, 2));
            const fadeFactor = isPortraitOrigin ? Math.max(0, 1 - distance / maxRadius) : 1;
            
            const r0 = 15 + 8 * c.connections;
            const nPts = 50 + Math.floor(30 * c.connections);
            
            for (let i = 0; i < nPts; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.pow(Math.random(), 0.5) * r0;
                const gx = cx + radius * Math.cos(angle);
                const gy = cy + radius * Math.sin(angle);
                const alpha = (0.1 + 0.05 * Math.random()) * fadeFactor;
                const size = 0.8 + Math.random() * 1.2;
                const redShift = Math.min(1, Math.sqrt((gx - origin.x) ** 2 + (gy - origin.y) ** 2) / this.config.maxRadius);
                const color = `rgba(${Math.floor(170 + 85 * redShift)},${Math.floor(220 - 80 * redShift)},${Math.floor(255 - 150 * redShift)},${alpha})`;
                
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(gx, gy, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    drawFilaments() {
        if (!this.filaments || !this.portraitCenter) return;
        
        const origin = this.portraitCenter;
        const isPortraitOrigin = origin.isPortraitOrigin;
        const maxRadius = 2000; // Match the extended radius
        const offsetX = this.offsetX || 0;
        const offsetY = this.offsetY || 0;
        
        // Get theme-aware colors once for all filaments
        const colors = this.getThemeColors();
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        
        for (const f of this.filaments) {
            // Apply offset for scrolling
            const p0x = f.p0.x + offsetX;
            const p0y = f.p0.y + offsetY;
            const p1x = f.p1.x + offsetX;
            const p1y = f.p1.y + offsetY;
            const p2x = f.p2.x + offsetX;
            const p2y = f.p2.y + offsetY;
            const p3x = f.p3.x + offsetX;
            const p3y = f.p3.y + offsetY;
            
            // Calculate average distance of filament from origin
            const midX = (p0x + p3x) / 2;
            const midY = (p0y + p3y) / 2;
            const distance = Math.sqrt(Math.pow(midX - origin.x, 2) + Math.pow(midY - origin.y, 2));
            const fadeFactor = isPortraitOrigin ? Math.max(0, 1 - distance / maxRadius) : 1;
            
            // Depth-based properties with theme-aware alpha
            const depth = f.depth || 1.0;
            const baseAlpha = f.type === 'background' ? 
                (theme === 'light' ? 0.03 : 0.01) : 
                (theme === 'light' ? 0.08 : 0.01); // In light mode: much subtler filaments
            const alpha = baseAlpha * fadeFactor * depth;
            
            // Draw filament with cone/tapering effect
            // Filaments start THIN at the central point and WIDEN as they expand outward
            // Split into segments and gradually INCREASE width (cone expanding outward)
            const segments = 20;
            for (let i = 0; i < segments; i++) {
                const t1 = i / segments;
                const t2 = (i + 1) / segments;
                
                // Calculate positions
                const pos1 = this.bezierPoint({
                    p0: {x: p0x, y: p0y},
                    p1: {x: p1x, y: p1y},
                    p2: {x: p2x, y: p2y},
                    p3: {x: p3x, y: p3y}
                }, t1);
                const pos2 = this.bezierPoint({
                    p0: {x: p0x, y: p0y},
                    p1: {x: p1x, y: p1y},
                    p2: {x: p2x, y: p2y},
                    p3: {x: p3x, y: p3y}
                }, t2);
                
                // Calculate 3D orientation width modifier
                // Filaments pointing toward viewer (angle3D ~ 0) should be wider
                // Filaments pointing away or sideways should be narrower
                // Use cosine: cos(0) = 1 (toward viewer, max width), cos(±π/2) = 0 (perpendicular, min width)
                const angle3D = f.angle3D || 0;
                const orientationFactor = 0.4 + 0.6 * Math.abs(Math.cos(angle3D)); // Range: 0.4 to 1.0
                
                // Cone effect: width INCREASES from origin (thin) to outer edge (wide)
                // Modified by 3D orientation for foreshortening effect
                const startWidth = f.type === 'background' ? 0.15 : 0.2;  // Very thin at origin
                const endWidth = f.type === 'background' ? 3.5 : 8.0;     // Much wider at edge
                const baseWidth = startWidth + (endWidth - startWidth) * t1;  // Increases with distance
                const width = baseWidth * orientationFactor; // Apply 3D orientation scaling
                
                this.ctx.beginPath();
                this.ctx.moveTo(pos1.x, pos1.y);
                this.ctx.lineTo(pos2.x, pos2.y);
                this.ctx.strokeStyle = `${colors.filament}, ${alpha})`;
                this.ctx.lineWidth = width;
                this.ctx.stroke();
            }
        }
    }

    drawGalaxies() {
        if (!this.galaxies || !this.portraitCenter) return;
        
        const origin = this.portraitCenter;
        const isPortraitOrigin = origin.isPortraitOrigin;
        const maxRadius = 2000; // Match the extended radius
        const offsetX = this.offsetX || 0;
        const offsetY = this.offsetY || 0;
        
        for (const g of this.galaxies) {
            // Apply offset for scrolling
            const gx = g.x + offsetX;
            const gy = g.y + offsetY;
            
            // Distance-based fade for portrait origin (using current position)
            const distance = Math.sqrt(Math.pow(gx - origin.x, 2) + Math.pow(gy - origin.y, 2));
            const fadeFactor = isPortraitOrigin ? Math.max(0, 1 - distance / maxRadius) : 1;
            
            // Depth-based brightness: foreground filaments (depth=1.0) are much brighter
            const filamentDepth = g.filamentDepth || 1.0;
            const depthBrightness = filamentDepth === 1.0 ? 2.5 : 0.5; // Foreground 2.5x brighter, background 0.3x
            
            const baseAlpha = 0.7 + 0.3 * Math.sin(this.time * this.config.shimmerSpeed + g.phase);
            const alpha = baseAlpha * fadeFactor * depthBrightness;
            const r = g.baseSize * (0.7 + 0.3 * Math.sin(this.time * this.config.shimmerSpeed + g.phase));
            const x = gx + this.config.motionAmplitude * Math.sin(this.time * 0.001 + g.phase);
            const y = gy + this.config.motionAmplitude * Math.cos(this.time * 0.001 + g.phase);
            const redShift = Math.min(1, g.dist / this.config.maxRadius);
            
            // Get theme for color calculation
            const theme = document.documentElement.getAttribute('data-theme') || 'dark';
            
            // Apply redshift effect in dark mode, simple dark gray in light mode
            let color;
            if (theme === 'light') {
                // Darker and more opaque for light mode
                const lightModeAlpha = alpha * 100; // Increase opacity by 20%
                color = `rgba(20, 20, 20, ${lightModeAlpha})`;
            } else {
                // Redshift effect for dark mode (blue to red as distance increases)
                color = `rgba(${Math.floor(170 + 85 * redShift)},${Math.floor(220 - 80 * redShift)},${Math.floor(255 - 150 * redShift)},${alpha})`;
            }
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    animate(time = 0) {
        this.time = time;
        this.draw();
        requestAnimationFrame((t) => this.animate(t));
    }

    destroy() {
        this.clusters = [];
        this.galaxies = [];
        this.filaments = [];
    }
}

// === NAVIGATION ===
class Navigation {
    constructor() {
        this.navbar = $('#navbar');
        this.navToggle = $('#nav-toggle');
        this.navMenu = $('#nav-menu');
        this.navLinks = $$('.nav-link');
        this.sections = $$('.section');
        
        this.init();
    }
    
    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        
        window.addEventListener('scroll', () => this.handleScroll());
    }
    
    setupScrollEffect() {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        };
        
        window.addEventListener('scroll', handleScroll);
    }
    
    setupMobileMenu() {
        this.navToggle.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('active');
                this.navToggle.classList.remove('active');
            });
        });
    }
    
    setupSmoothScrolling() {
        // For separate pages, we don't need smooth scrolling
        // The navigation links already point to the correct HTML files
        // This method is kept for compatibility but does nothing
        return;
    }
    
    setupActiveNavigation() {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetId = `#${entry.target.id}`;
                    this.updateActiveNavLink(targetId);
                }
            });
        }, observerOptions);
        
        this.sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    updateActiveNavLink(targetId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });
    }
    
    handleScroll() {
        // Add any additional scroll handling here
    }
}

// === THEME TOGGLE ===
class ThemeToggle {
    constructor(cosmicWeb = null) {
        this.themeToggle = $('#theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.cosmicWeb = cosmicWeb;
        
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Force cosmic web to redraw with new theme colors
        if (this.cosmicWeb) {
            this.cosmicWeb.draw();
        }
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = this.themeToggle.querySelector('i');
        
        if (theme === 'light') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// === ANIMATIONS ===
class ScrollAnimations {
    constructor() {
        this.animatedElements = $$('.research-card, .note-card, .travel-card, .timeline-item, .cv-section');
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// === FORM HANDLING ===
class ContactForm {
    constructor() {
        this.form = $('#contact-form');
        this.submitBtn = this.form.querySelector('.submit-btn');
        this.originalBtnText = this.submitBtn.innerHTML;
        
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Simulate form submission (replace with actual endpoint)
            await this.simulateFormSubmission(data);
            this.showSuccess();
            this.form.reset();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.innerHTML = this.originalBtnText;
            this.submitBtn.disabled = false;
        }
    }
    
    async simulateFormSubmission(data) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate for demo
                    resolve();
                } else {
                    reject(new Error('Failed to send message. Please try again.'));
                }
            }, 2000);
        });
    }
    
    showSuccess() {
        this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// === UTILITY FUNCTIONS ===
function downloadCV() {
    // Create a simple PDF or link to CV
    const cvUrl = '#'; // Replace with actual CV URL
    
    if (cvUrl === '#') {
        // Show notification that CV download is not available yet
        showTempNotification('CV download will be available soon!', 'info');
        return;
    }
    
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = 'Sarah_Chen_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showTempNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #17a2b8;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// === PERFORMANCE OPTIMIZATIONS ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// === INITIALIZATION ===
class App {
    constructor() {
        this.starField = null;
        this.navigation = null;
        this.themeToggle = null;
        this.scrollAnimations = null;
        this.contactForm = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }
    
    initializeComponents() {
        try {
            // Initialize cosmic web visualization
            this.starField = new CosmicWeb('#starfield');
            
            // Initialize navigation
            this.navigation = new Navigation();
            
            // Initialize theme toggle (pass cosmic web for redrawing on theme change)
            this.themeToggle = new ThemeToggle(this.starField);
            
            // Initialize scroll animations
            this.scrollAnimations = new ScrollAnimations();
            
            // Initialize contact form
            this.contactForm = new ContactForm();
            
            // Add loading complete class
            document.body.classList.add('loaded');
            
            console.log('🌟 Astrophysics portfolio loaded successfully!');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }
    
    destroy() {
        if (this.starField) {
            this.starField.destroy();
        }
    }
}

// === GLOBAL EVENT LISTENERS ===
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.destroy();
    }
});

// === START APPLICATION ===
window.app = new App();

// === ADDITIONAL FEATURES ===

// Typing effect for hero subtitle (optional enhancement)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Mouse parallax effect for hero section (optional enhancement)
function addParallaxEffect() {
    const hero = $('#about');
    if (!hero) return;
    
    document.addEventListener('mousemove', throttle((e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        
        const xPos = (clientX / innerWidth - 0.5) * 20;
        const yPos = (clientY / innerHeight - 0.5) * 20;
        
        hero.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }, 50));
}

// Initialize additional features after a delay
setTimeout(() => {
    const heroSubtitle = $('.hero-subtitle');
    if (heroSubtitle && heroSubtitle.textContent) {
        const originalText = heroSubtitle.textContent;
        typeWriter(heroSubtitle, originalText, 80);
    }
    
    // Uncomment to enable parallax effect
    // addParallaxEffect();
}, 1000);

// === EXPORT FOR TESTING ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, CosmicWeb, Navigation, ThemeToggle, ContactForm };
}

// === TABLE OF CONTENTS TOGGLE ===
class TableOfContents {
    constructor() {
        this.floatBtn = document.getElementById('tocFloatBtn');
        this.sidebar = document.getElementById('tocSidebar');
        this.overlay = document.getElementById('tocOverlay');
        this.closeBtn = document.getElementById('tocCloseBtn');
        this.tocContent = document.getElementById('tocContent');
        this.tocLinks = [];
        this.sections = [];
        this.currentActive = null;
        this.isOpen = false;
        this.expandState = new Map(); // key: section id of li, value: boolean expanded
        
        if (this.floatBtn && this.sidebar) {
            this.init();
        }
    }
    
    init() {
        // Generate TOC from headings and collect sections
        this.generateTOC();
        this.collectSections();
        
        // Bind events
        this.floatBtn.addEventListener('click', () => this.toggle());
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        
        // Handle TOC link clicks
        this.tocLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e));
        });
        
        // Track scroll for active section
        window.addEventListener('scroll', throttle(() => this.updateActiveSection(), 100));
        window.addEventListener('resize', throttle(() => this.updateAnchorPosition(), 100));
        
        // Initial active section
        this.updateActiveSection();
        this.setInitialExpandStates();
        this.updateAnchorPosition();
        
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Observe content changes to regenerate TOC automatically
        const noteBody = document.querySelector('.note-body');
        if (noteBody && 'MutationObserver' in window) {
            const observer = new MutationObserver(throttle(() => {
                this.generateTOC();
                this.collectSections();
                this.bindLinks();
                this.updateActiveSection();
                this.setInitialExpandStates();
            }, 300));
            observer.observe(noteBody, { childList: true, subtree: true });
            this.observer = observer;
        }
    }
    
    bindLinks() {
        // Remove previous listeners by replacing node list
        this.tocLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e));
        });
    }

    ensureId(element) {
        if (element.id && element.id.trim().length > 0) return element.id;
        const text = (element.textContent || '').trim().toLowerCase();
        let slug = text
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        if (!slug || slug === '-') slug = 'section';
        // Ensure uniqueness
        let unique = slug;
        let i = 1;
        while (document.getElementById(unique)) {
            unique = `${slug}-${i++}`;
        }
        element.id = unique;
        return unique;
    }

    generateTOC() {
        const container = this.tocContent;
        if (!container) return;

        const headings = document.querySelectorAll('.note-body h1, .note-body h2, .note-body h3');
        const list = document.createElement('ul');
        let currentH1 = null; // { li, id }
        let currentH2 = null; // { li, id }

        // Compute hierarchical numbering and prefix headings
        let h1Count = 0, h2Count = 0, h3Count = 0;
        const numberMap = new Map(); // id -> number string
        headings.forEach((h) => {
            const tag = h.tagName.toLowerCase();
            let num = '';
            if (tag === 'h1') {
                h1Count += 1; h2Count = 0; h3Count = 0;
                num = `${h1Count}`;
            } else if (tag === 'h2') {
                if (h1Count === 0) { h1Count = 1; }
                h2Count += 1; h3Count = 0;
                num = `${h1Count}.${h2Count}`;
            } else if (tag === 'h3') {
                if (h1Count === 0) { h1Count = 1; }
                if (h2Count === 0) { h2Count = 1; }
                h3Count += 1;
                num = `${h1Count}.${h2Count}.${h3Count}`;
            }
            const id = this.ensureId(h);
            numberMap.set(id, num);

            // Preserve original title and prefix visible heading with number
            const orig = h.dataset.origTitle || (h.textContent || '').trim();
            h.dataset.origTitle = orig;
            // Avoid duplicating numbers: rebuild from original
            h.innerHTML = `<span class="section-number">${num}</span> ${orig}`;
        });

        const createToggle = () => {
            const btn = document.createElement('button');
            btn.className = 'toc-toggle-sub';
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-expanded', 'true');
            btn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            return btn;
        };

        const createLink = (id, text, number) => {
            const a = document.createElement('a');
            a.className = 'toc-link';
            a.setAttribute('data-section', id);
            a.href = `#${id}`;
            a.innerHTML = `<span class="toc-number">${number}</span> ${text}`;
            return a;
        };

        const createItem = (level, id, text, number, parentId = null, rootId = null) => {
            const li = document.createElement('li');
            li.className = `toc-item level${level}`;
            const a = createLink(id, text, number);
            if (parentId) a.setAttribute('data-parent', parentId);
            if (rootId) a.setAttribute('data-root', rootId);
            li.appendChild(a);
            return li;
        };

        headings.forEach((h) => {
            const tag = h.tagName.toLowerCase();
            const id = this.ensureId(h);
            const text = (h.dataset.origTitle || h.textContent || '').trim();
            const number = numberMap.get(id) || '';

            if (tag === 'h1') {
                const li = createItem(1, id, text, number);
                const sub = document.createElement('ul');
                sub.className = 'toc-sublist';
                // Toggle only added if subsections exist; we'll add after first child
                li.appendChild(sub);
                list.appendChild(li);
                currentH1 = { li, id, sub };
                currentH2 = null;
            } else if (tag === 'h2') {
                const li = createItem(2, id, text, number, currentH1?.id || null, currentH1?.id || null);
                const sub = document.createElement('ul');
                sub.className = 'toc-sublist';
                li.appendChild(sub);
                if (currentH1) {
                    currentH1.sub.appendChild(li);
                    // Add toggle to H1 if this is the first H2
                    if (!currentH1.li.querySelector('.toc-toggle-sub')) {
                        const toggle = createToggle();
                        currentH1.li.insertBefore(toggle, currentH1.li.querySelector('.toc-link').nextSibling);
                    }
                } else {
                    list.appendChild(li);
                }
                currentH2 = { li, id, sub };
            } else if (tag === 'h3') {
                const li = createItem(3, id, text, number, currentH2?.id || currentH1?.id || null, currentH1?.id || null);
                if (currentH2) {
                    currentH2.sub.appendChild(li);
                    // Add toggle to H2 if first H3
                    if (!currentH2.li.querySelector('.toc-toggle-sub')) {
                        const toggle = createToggle();
                        currentH2.li.insertBefore(toggle, currentH2.li.querySelector('.toc-link').nextSibling);
                    }
                } else if (currentH1) {
                    currentH1.sub.appendChild(li);
                } else {
                    list.appendChild(li);
                }
            }
        });

        // Top-level numbers already computed; no need to renumber here

        // Hide toggle buttons on items without children
        list.querySelectorAll('.toc-item').forEach((item) => {
            const sub = item.querySelector(':scope > .toc-sublist');
            const toggle = item.querySelector(':scope > .toc-toggle-sub');
            if (toggle) {
                if (!sub || !sub.children.length) {
                    toggle.remove();
                } else {
                    // Restore previous expand state or default expanded
                    const sectionId = item.querySelector(':scope > .toc-link')?.getAttribute('data-section');
                    const expanded = this.expandState.has(sectionId) ? this.expandState.get(sectionId) : true;
                    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                    if (!expanded) {
                        sub.style.maxHeight = '0px';
                    } else {
                        sub.style.maxHeight = `${sub.scrollHeight}px`;
                    }
                }
            }
        });

        // Replace content
        container.innerHTML = '';
        container.appendChild(list);

        // Update links cache & bind toggles
        this.tocLinks = Array.from(container.querySelectorAll('.toc-link'));
        this.bindLinks();

        // Bind toggle events
        this.bindToggleEvents();
    }

    collectSections() {
        this.sections = [];
        this.tocLinks.forEach(link => {
            const sectionId = link.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                this.sections.push({
                    id: sectionId,
                    element: section,
                    link: link
                });
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.sidebar.classList.add('active');
        this.overlay.classList.add('active');
        this.floatBtn.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll on mobile
    }
    
    close() {
        this.isOpen = false;
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        this.floatBtn.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }
    
    handleLinkClick(e) {
        e.preventDefault();
        const link = e.currentTarget;
        const sectionId = link.getAttribute('data-section');
        const targetElement = document.getElementById(sectionId);
        
        if (targetElement) {
            // Calculate offset for fixed navbar
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
            const offset = 20;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - offset;
            
            // Smooth scroll
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Close sidebar on mobile after clicking
            if (window.innerWidth <= 768) {
                setTimeout(() => this.close(), 300);
            }
            
            // Update active state immediately
            this.setActiveLink(link);
        }
    }
    
    updateActiveSection() {
        const scrollPosition = window.pageYOffset + window.innerHeight / 3;
        
        let currentSection = null;
        
        // Find the current section based on scroll position
        for (let i = this.sections.length - 1; i >= 0; i--) {
            const section = this.sections[i];
            const sectionTop = section.element.offsetTop;
            
            if (scrollPosition >= sectionTop) {
                currentSection = section;
                break;
            }
        }
        
        // Update active link if section changed
        if (currentSection && currentSection.link !== this.currentActive) {
            this.setActiveLink(currentSection.link);
        }
    }
    
    setActiveLink(link) {
        // Remove active states
        this.tocLinks.forEach(l => {
            l.classList.remove('active');
            l.classList.remove('active-parent');
        });
        
        // Add active class to current link
        if (link) {
            link.classList.add('active');
            this.currentActive = link;

            // Highlight parents
            const parentId = link.getAttribute('data-parent');
            const rootId = link.getAttribute('data-root');
            const parentLink = parentId ? this.tocLinks.find(l => l.getAttribute('data-section') === parentId) : null;
            const rootLink = rootId ? this.tocLinks.find(l => l.getAttribute('data-section') === rootId) : null;
            if (parentLink) parentLink.classList.add('active-parent');
            if (rootLink && rootLink !== parentLink) rootLink.classList.add('active-parent');
            
            // Scroll link into view within sidebar
            const sidebar = document.querySelector('.toc-content');
            if (sidebar && link) {
                const linkTop = link.offsetTop;
                const linkHeight = link.offsetHeight;
                const sidebarHeight = sidebar.offsetHeight;
                const sidebarScroll = sidebar.scrollTop;
                
                // Check if link is outside visible area
                if (linkTop < sidebarScroll || linkTop + linkHeight > sidebarScroll + sidebarHeight) {
                    sidebar.scrollTo({
                        top: linkTop - sidebarHeight / 2 + linkHeight / 2,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }

    bindToggleEvents() {
        const toggles = this.tocContent.querySelectorAll('.toc-toggle-sub');
        toggles.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const item = btn.closest('.toc-item');
                const sub = item?.querySelector(':scope > .toc-sublist');
                const sectionId = item?.querySelector(':scope > .toc-link')?.getAttribute('data-section');
                if (!sub || !sectionId) return;
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                this.expandState.set(sectionId, !expanded);
                this.animateSublist(sub, !expanded);
                btn.setAttribute('aria-expanded', !expanded ? 'true' : 'false');
                // Ensure expanded content stays accessible within scrollable container
                if (!expanded) {
                    // If we just expanded, nudge scroll to reveal new content if clipped
                    this.ensureVisibleInSidebar(sub);
                }
            });
        });
    }

    animateSublist(sub, expand) {
        // Clean previous transitionend listener
        sub.ontransitionend = null;

        if (expand) {
            sub.style.display = 'block';
            // Set from 0 to measured height for animation
            sub.style.maxHeight = sub.scrollHeight + 'px';
            // After transition completes, set to none so content can grow naturally
            sub.ontransitionend = (e) => {
                if (e.propertyName === 'max-height') {
                    sub.style.maxHeight = 'none';
                    sub.ontransitionend = null;
                }
            };
        } else {
            // If currently 'none', set to current height then animate to 0
            if (sub.style.maxHeight === 'none' || !sub.style.maxHeight) {
                sub.style.maxHeight = sub.scrollHeight + 'px';
                // Force reflow
                // eslint-disable-next-line no-unused-expressions
                sub.offsetHeight;
            }
            sub.style.maxHeight = '0px';
            sub.ontransitionend = (e) => {
                if (e.propertyName === 'max-height') {
                    // Optionally hide after collapse
                    sub.style.display = 'block'; // keep accessible for measurement
                    sub.ontransitionend = null;
                }
            };
        }
    }

    ensureVisibleInSidebar(element) {
        const sidebar = document.querySelector('.toc-content');
        if (!sidebar || !element) return;
        const elTop = element.getBoundingClientRect().top;
        const elBottom = element.getBoundingClientRect().bottom;
        const sbTop = sidebar.getBoundingClientRect().top;
        const sbBottom = sidebar.getBoundingClientRect().bottom;
        if (elBottom > sbBottom) {
            const delta = elBottom - sbBottom + 24; // some padding
            sidebar.scrollBy({ top: delta, behavior: 'smooth' });
        } else if (elTop < sbTop) {
            const delta = elTop - sbTop - 24;
            sidebar.scrollBy({ top: delta, behavior: 'smooth' });
        }
    }

    setInitialExpandStates() {
        // Determine current active or hash target to expand ancestors
        let activeId = null;
        if (location.hash && document.getElementById(location.hash.slice(1))) {
            activeId = location.hash.slice(1);
        } else if (this.currentActive) {
            activeId = this.currentActive.getAttribute('data-section');
        } else if (this.sections.length) {
            activeId = this.sections[0].id;
        }

        // Default: collapse all groups unless previously stored in expandState
        const items = this.tocContent.querySelectorAll('.toc-item');
        items.forEach((item) => {
            const link = item.querySelector(':scope > .toc-link');
            const sub = item.querySelector(':scope > .toc-sublist');
            const toggle = item.querySelector(':scope > .toc-toggle-sub');
            if (!sub || !toggle || !link) return;
            const id = link.getAttribute('data-section');
            let expanded = this.expandState.has(id) ? this.expandState.get(id) : false;

            // If this is an ancestor of active, force expand
            if (!expanded && activeId) {
                const isAncestor = this.isAncestorOf(id, activeId);
                if (isAncestor) expanded = true;
            }

            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            if (expanded) {
                sub.style.maxHeight = sub.scrollHeight + 'px';
            } else {
                sub.style.maxHeight = '0px';
            }
        });
    }

    isAncestorOf(ancestorId, targetId) {
        // Walk up via data-parent to see if ancestorId appears
        let current = this.tocLinks.find(l => l.getAttribute('data-section') === targetId);
        const guard = 50; let i = 0;
        while (current && i++ < guard) {
            const parent = current.getAttribute('data-parent');
            if (!parent) return false;
            if (parent === ancestorId) return true;
            current = this.tocLinks.find(l => l.getAttribute('data-section') === parent);
        }
        return false;
    }

    updateAnchorPosition() {
        const article = document.querySelector('.note-article');
        const navbar = document.querySelector('.navbar');
        if (!article) return;

        const rect = article.getBoundingClientRect();
        const contentLeft = rect.left; // viewport-relative
        const gap = 16; // px gap between sidebar and content edge
        const buttonGap = 10;
        const sidebarWidth = this.sidebar.offsetWidth || 320;
        const buttonWidth = this.floatBtn.offsetWidth || 60;

        // Mobile: default positions
        if (window.innerWidth <= 768) {
            document.documentElement.style.setProperty('--toc-left', '0px');
            document.documentElement.style.setProperty('--toc-button-left', '15px');
            const top = (navbar?.offsetHeight || 80) + 10;
            document.documentElement.style.setProperty('--toc-button-top', `${top}px`);
            return;
        }

        // Desktop: anchor to content left edge
        const sidebarLeft = Math.max(0, contentLeft - sidebarWidth - gap);
        const buttonLeft = Math.max(0, contentLeft - buttonWidth - buttonGap);
        const top = (navbar?.offsetHeight || 80) + 40;

        document.documentElement.style.setProperty('--toc-left', `${sidebarLeft}px`);
        document.documentElement.style.setProperty('--toc-button-left', `${buttonLeft}px`);
        document.documentElement.style.setProperty('--toc-button-top', `${top}px`);
    }
}

// Initialize TOC when DOM is loaded
let tocInstance = null;

function initTableOfContents() {
    tocInstance = new TableOfContents();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTableOfContents);
} else {
    initTableOfContents();
}
