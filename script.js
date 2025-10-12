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
            // Don't regenerate - just update position for offset drawing
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
            // Other pages: origin at right edge of screen
            this.portraitCenter = {
                x: window.innerWidth + 300, // Off-screen to the right
                y: window.innerHeight / 2,
                radius: 100,
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
        return dist > this.portraitCenter.radius * 1.1; // Outside portrait
    }

    generateCosmicStructure() {
        if (!this.portraitCenter) return;
        
        const origin = this.portraitCenter;
        const isPortraitOrigin = origin.isPortraitOrigin;
        
        // Adjust parameters based on page type
        const maxRadius = isPortraitOrigin ? 2000 : 2000; // Extended to span across page
        const wedgeAngle = isPortraitOrigin ? Math.PI * 2 : Math.PI * 1.2; // Full circle vs wedge
        
        this.clusters = [];
        this.filaments = [];
        this.galaxies = [];

        // Generate clusters along the filament paths
        for (let i = 0; i < this.config.clusterCount; i++) {
            const r = Math.pow(Math.random(), 0.8) * maxRadius * this.rand(0.3, 1);
            const a = isPortraitOrigin ? 
                     Math.random() * Math.PI * 2 : // Full circle around portrait
                     -wedgeAngle/2 + Math.random() * wedgeAngle; // Wedge from right edge
            const x = origin.x + r * Math.cos(a) + this.rand(-30, 30);
            const y = origin.y + r * Math.sin(a) + this.rand(-30, 30);
            this.clusters.push({ x, y, connections: 0 });
        }

        // Major filaments - straight lines with variable skew based on position
        // Aberration effect tilted towards down-left, lifted 10° from previous (20° down from left)
        
        for (let i = 0; i < this.config.majorFilaments; i++) {
            const angle = isPortraitOrigin ?
                         (i / this.config.majorFilaments) * Math.PI * 2 : // Evenly distributed around portrait
                         -wedgeAngle/2 + (i / this.config.majorFilaments) * wedgeAngle; // Evenly distributed in wedge
            
            // Start from portrait edge or right screen edge
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
            
            // For straight lines, control points are along the line (no curvature)
            this.filaments.push({
                p0: { x: startX, y: startY },
                p1: { x: startX + (endX - startX) * 0.33, y: startY + (endY - startY) * 0.33 },
                p2: { x: startX + (endX - startX) * 0.67, y: startY + (endY - startY) * 0.67 },
                p3: { x: endX, y: endY },
                type: 'major',
                depth: 1.0 // Foreground filaments
            });
        }

        // Add background filaments for depth (faint, slightly offset)
        const backgroundCount = 5; // Reduced from 8
        for (let i = 0; i < backgroundCount; i++) {
            const angle = isPortraitOrigin ?
                         (i / backgroundCount) * Math.PI * 2 + 0.15 : // Offset from main filaments
                         -wedgeAngle/2 + (i / backgroundCount) * wedgeAngle;
            
            const startX = origin.x + origin.radius * Math.cos(angle);
            const startY = origin.y + origin.radius * Math.sin(angle);
            
            const alignmentWithAberration = Math.cos(angle - (Math.PI + Math.PI / 3));
            const variableSkew = alignmentWithAberration * -0.4;
            
            const aberratedAngle = angle + variableSkew;
            const endX = origin.x + maxRadius * 0.9 * Math.cos(aberratedAngle); // Slightly shorter
            const endY = origin.y + maxRadius * 0.9 * Math.sin(aberratedAngle);
            
            this.filaments.push({
                p0: { x: startX, y: startY },
                p1: { x: startX + (endX - startX) * 0.33, y: startY + (endY - startY) * 0.33 },
                p2: { x: startX + (endX - startX) * 0.67, y: startY + (endY - startY) * 0.67 },
                p3: { x: endX, y: endY },
                type: 'background',
                depth: 0.15 // Much fainter - reduced from 0.3
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
                
                const width = 30 * (0.5 + 0.5 * Math.sqrt(t)); // Increased width from 20 to 30
                
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
        // Clear canvas
        this.ctx.fillStyle = this.config.colors.deepSpace;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.portraitCenter || !this.initialPortraitCenter) return;

        // Calculate offset for smooth scrolling
        this.offsetX = this.portraitCenter.x - this.initialPortraitCenter.x;
        this.offsetY = this.portraitCenter.y - this.initialPortraitCenter.y;

        // Draw in layers
        this.drawClusters();
        this.drawFilaments();
        this.drawGalaxies();
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
            
            // Distance-based fade for portrait origin (using current position)
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
            
            // Depth-based properties
            const depth = f.depth || 1.0;
            const baseAlpha = f.type === 'background' ? 0.02 : 0.08; // Main lines subtle, background fainter
            const alpha = baseAlpha * fadeFactor * depth;
            
            // Draw filament with tapering effect (cone-like)
            // Split into segments and gradually reduce width
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
                
                // Tapering: width decreases from base (2.5) to tip (0.5)
                const baseWidth = f.type === 'background' ? 1.2 : 2.5;
                const tipWidth = f.type === 'background' ? 0.3 : 0.5;
                const width = baseWidth - (baseWidth - tipWidth) * t1;
                
                this.ctx.beginPath();
                this.ctx.moveTo(pos1.x, pos1.y);
                this.ctx.lineTo(pos2.x, pos2.y);
                this.ctx.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
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
            
            // Simple galaxy rendering with depth-based brightness
            const color = `rgba(${Math.floor(170 + 85 * redShift)},${Math.floor(220 - 80 * redShift)},${Math.floor(255 - 150 * redShift)},${alpha})`;
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
    constructor() {
        this.themeToggle = $('#theme-toggle');
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
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
            
            // Initialize theme toggle
            this.themeToggle = new ThemeToggle();
            
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