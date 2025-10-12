// === UTILITY FUNCTIONS ===
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// === 2dF-STYLE COSMIC WEB FIXED TO PORTRAIT ===
// Large-scale structure survey visualization emanating from portrait
class CosmicWeb {
    constructor(canvasId) {
        this.canvas = $(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Cosmic structures
        this.galaxyClusters = [];        // Rich Abell-style clusters
        this.galaxies = [];              // Individual galaxy points
        this.filaments = [];             // Connecting filaments
        this.portraitCenter = null;      // Fixed to portrait position
        
        // Animation state
        this.time = 0;
        this.breathingPhase = 0;
        
        // 2dF Survey configuration
        this.config = {
            // Large-scale structure (~500 Mpc slice)
            surveyRadius: 600,              // Visual extent in pixels
            
            // Structure counts (detailed visualization)
            numClusters: 35,                // Galaxy clusters
            numGalaxies: 800,               // Individual galaxies
            numFilaments: 60,               // Connecting filaments
            
            // Visual parameters
            clusterSize: [8, 20],           // Pixel radius range
            galaxySize: [0.8, 2.5],         // Point size range
            filamentWidth: [0.5, 2],        // Line width range
            
            // Artistic cosmic color palette
            colors: {
                deepSpace: 'rgba(8, 8, 15, 1.0)',
                cluster: 'rgba(255, 200, 120, 0.7)',
                galaxyBlue: 'rgba(120, 180, 255, 0.6)',
                galaxyPurple: 'rgba(180, 140, 220, 0.5)',
                galaxyGold: 'rgba(255, 220, 140, 0.6)',
                filament: 'rgba(140, 120, 200, 0.3)',
                filamentGlow: 'rgba(180, 160, 240, 0.15)',
            },
            
            // Breathing animation
            breathingSpeed: 0.0008,         // Very subtle
            breathingAmount: 0.03,          // 3% size variation
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
        this.generateCosmicStructure();
        this.animate();

        window.addEventListener('resize', () => {
            this.resize();
            this.updatePortraitPosition();
            this.generateCosmicStructure();
        });

        // Update portrait position when scrolling or resizing
        window.addEventListener('scroll', () => this.updatePortraitPosition());
        setInterval(() => this.updatePortraitPosition(), 1000);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.updatePortraitPosition();
    }

    updatePortraitPosition() {
        // Find portrait and fix cosmic web origin to it
        const portrait = document.querySelector('.about-image');
        if (portrait) {
            const rect = portrait.getBoundingClientRect();
            this.portraitCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                visible: rect.top < window.innerHeight && rect.bottom > 0
            };
        } else {
            // Fallback position
            this.portraitCenter = {
                x: window.innerWidth * 0.7,
                y: window.innerHeight * 0.4,
                visible: true
            };
        }
    }

    generateCosmicStructure() {
        if (!this.portraitCenter) {
            this.updatePortraitPosition();
        }

        const center = this.portraitCenter;
        const maxRadius = this.config.surveyRadius;
        
        // Reset structures
        this.galaxyClusters = [];
        this.galaxies = [];
        this.filaments = [];

        // Generate galaxy clusters emanating from portrait in 2dF slice pattern
        const numClusters = this.config.numClusters;
        for (let i = 0; i < numClusters; i++) {
            // Distribute clusters in a realistic 2dF pattern (slice of universe)
            const angle = (Math.random() * Math.PI * 2);
            const distance = Math.sqrt(Math.random()) * maxRadius; // Radial distribution
            
            const cluster = {
                x: center.x + Math.cos(angle) * distance,
                y: center.y + Math.sin(angle) * distance,
                size: this.config.clusterSize[0] + Math.random() * 
                      (this.config.clusterSize[1] - this.config.clusterSize[0]),
                richness: 10 + Math.floor(Math.random() * 40), // Number of galaxies
                brightness: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2, // For breathing
            };
            
            this.galaxyClusters.push(cluster);
        }

        // Generate individual galaxies (field galaxies between clusters)
        const numGalaxies = this.config.numGalaxies;
        for (let i = 0; i < numGalaxies; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.sqrt(Math.random()) * maxRadius;
            
            // Bias galaxies toward filaments (clustered distribution)
            const nearestCluster = this.findNearestCluster(
                center.x + Math.cos(angle) * distance,
                center.y + Math.sin(angle) * distance
            );
            
            const galaxy = {
                x: center.x + Math.cos(angle) * distance,
                y: center.y + Math.sin(angle) * distance,
                size: this.config.galaxySize[0] + Math.random() * 
                      (this.config.galaxySize[1] - this.config.galaxySize[0]),
                type: Math.random() < 0.4 ? 'blue' : (Math.random() < 0.7 ? 'purple' : 'gold'),
                brightness: 0.3 + Math.random() * 0.7,
                phase: Math.random() * Math.PI * 2,
                inCluster: nearestCluster && nearestCluster.distance < 50,
            };
            
            this.galaxies.push(galaxy);
        }

        // Generate filaments connecting clusters (cosmic web structure)
        const numFilaments = this.config.numFilaments;
        for (let i = 0; i < numFilaments; i++) {
            if (this.galaxyClusters.length < 2) break;
            
            // Connect nearby clusters with filaments
            const cluster1 = this.galaxyClusters[Math.floor(Math.random() * this.galaxyClusters.length)];
            const cluster2 = this.findNearbyCluster(cluster1, 200);
            
            if (cluster2) {
                const filament = {
                    start: { x: cluster1.x, y: cluster1.y },
                    end: { x: cluster2.x, y: cluster2.y },
                    width: this.config.filamentWidth[0] + Math.random() * 
                           (this.config.filamentWidth[1] - this.config.filamentWidth[0]),
                    density: 0.3 + Math.random() * 0.7,
                    phase: Math.random() * Math.PI * 2,
                };
                
                this.filaments.push(filament);
            }
        }
    }

    findNearestCluster(x, y) {
        let nearest = null;
        let minDist = Infinity;
        
        this.galaxyClusters.forEach(cluster => {
            const dist = Math.sqrt((cluster.x - x) ** 2 + (cluster.y - y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = { cluster, distance: dist };
            }
        });
        
        return nearest;
    }

    findNearbyCluster(sourceCluster, maxDistance) {
        const candidates = this.galaxyClusters.filter(cluster => {
            if (cluster === sourceCluster) return false;
            const dist = Math.sqrt(
                (cluster.x - sourceCluster.x) ** 2 + 
                (cluster.y - sourceCluster.y) ** 2
            );
            return dist < maxDistance;
        });
        
        return candidates.length > 0 ? 
               candidates[Math.floor(Math.random() * candidates.length)] : 
               null;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.config.colors.deepSpace;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Only draw if portrait is visible
        if (!this.portraitCenter || !this.portraitCenter.visible) return;

        // Breathing effect calculation
        const breathing = 1 + Math.sin(this.breathingPhase) * this.config.breathingAmount;

        // Draw filaments first (background layer)
        this.drawFilaments(breathing);
        
        // Draw galaxies (middle layer)
        this.drawGalaxies(breathing);
        
        // Draw clusters (foreground layer)
        this.drawClusters(breathing);
    }

    drawFilaments(breathing) {
        this.filaments.forEach(filament => {
            const alpha = filament.density * breathing;
            
            // Draw glow
            this.ctx.strokeStyle = this.config.colors.filamentGlow.replace(/[\d.]+\)$/, `${alpha * 0.5})`);
            this.ctx.lineWidth = filament.width * 4 * breathing;
            this.ctx.beginPath();
            this.ctx.moveTo(filament.start.x, filament.start.y);
            this.ctx.lineTo(filament.end.x, filament.end.y);
            this.ctx.stroke();
            
            // Draw core
            this.ctx.strokeStyle = this.config.colors.filament.replace(/[\d.]+\)$/, `${alpha})`);
            this.ctx.lineWidth = filament.width * breathing;
            this.ctx.beginPath();
            this.ctx.moveTo(filament.start.x, filament.start.y);
            this.ctx.lineTo(filament.end.x, filament.end.y);
            this.ctx.stroke();
        });
    }

    drawGalaxies(breathing) {
        this.galaxies.forEach(galaxy => {
            const size = galaxy.size * breathing;
            const brightness = galaxy.brightness * breathing;
            
            // Choose color based on type
            let color;
            switch(galaxy.type) {
                case 'blue':
                    color = this.config.colors.galaxyBlue;
                    break;
                case 'purple':
                    color = this.config.colors.galaxyPurple;
                    break;
                case 'gold':
                    color = this.config.colors.galaxyGold;
                    break;
            }
            
            this.ctx.fillStyle = color.replace(/[\d.]+\)$/, `${brightness})`);
            this.ctx.beginPath();
            this.ctx.arc(galaxy.x, galaxy.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawClusters(breathing) {
        this.galaxyClusters.forEach(cluster => {
            const size = cluster.size * breathing;
            const brightness = cluster.brightness * breathing;
            
            // Outer glow
            const gradient = this.ctx.createRadialGradient(
                cluster.x, cluster.y, 0,
                cluster.x, cluster.y, size * 2
            );
            gradient.addColorStop(0, this.config.colors.cluster.replace(/[\d.]+\)$/, `${brightness * 0.5})`));
            gradient.addColorStop(0.5, this.config.colors.cluster.replace(/[\d.]+\)$/, `${brightness * 0.2})`));
            gradient.addColorStop(1, 'rgba(255, 200, 120, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(cluster.x, cluster.y, size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Core
            this.ctx.fillStyle = this.config.colors.cluster.replace(/[\d.]+\)$/, `${brightness})`);
            this.ctx.beginPath();
            this.ctx.arc(cluster.x, cluster.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        // Update breathing phase
        this.breathingPhase += this.config.breathingSpeed;
        
        // Draw current frame
        this.draw();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        // Cleanup if needed
        this.galaxyClusters = [];
        this.galaxies = [];
        this.filaments = [];
    }
}

// === NAVIGATION ===
        // Find the portrait element (center of cosmic web)
        const portrait = document.querySelector('.about-image');
        if (portrait) {
            const rect = portrait.getBoundingClientRect();
            this.portraitCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        } else {
            // Fallback to left-center (typical survey visualization)
            this.portraitCenter = {
                x: window.innerWidth * 0.35,
                y: window.innerHeight * 0.45
            };
        }
    }

    setupMouseTracking() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.canvas.addEventListener('mouseleave', () => {
            // Gradually return to center
            this.mouse.x = this.config.portraitCenter.x;
            this.mouse.y = this.config.portraitCenter.y;
        });
    }
    
    generateCosmicStructure() {
        this.galaxyClusters = [];
        this.filaments = [];
        this.voids = [];
        this.galaxyNodes = [];

        // Ensure portrait center is set
        if (!this.portraitCenter) {
            this.updateObserverPosition();
        }
        
        const center = this.portraitCenter;
        const maxRadius = Math.min(this.canvas.width, this.canvas.height) * 0.8;
        
        // Generate cosmic voids first (they define the structure)
        for (let i = 0; i < this.config.numVoids; i++) {
            const angle = (i / this.config.numVoids) * Math.PI * 2 + Math.random() * 0.5;
            const distance = 150 + Math.random() * 350;
            const voidRadius = this.config.voidRadius[0] + Math.random() * (this.config.voidRadius[1] - this.config.voidRadius[0]);
            
            this.voids.push({
                x: center.x + Math.cos(angle) * distance,
                y: center.y + Math.sin(angle) * distance,
                radius: voidRadius,
                depth: Math.random() * 0.5 + 0.3, // z-depth for parallax
                name: `Void-${i+1}` // Like Boötes void, CMa void, etc.
            });
        }
        
        // Generate galaxy clusters (Abell catalog style)
        for (let i = 0; i < this.config.numClusters; i++) {
            let validPosition = false;
            let attempts = 0;
            let x, y;
            
            // Ensure clusters avoid void centers
            while (!validPosition && attempts < 50) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 80 + Math.random() * (maxRadius - 80);
                x = center.x + Math.cos(angle) * distance;
                y = center.y + Math.sin(angle) * distance;
                
                validPosition = true;
                for (let void_region of this.voids) {
                    const distToVoid = Math.sqrt((x - void_region.x)**2 + (y - void_region.y)**2);
                    if (distToVoid < void_region.radius * 0.7) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }
            
            if (validPosition) {
                this.galaxyClusters.push({
                    x: x,
                    y: y,
                    mass: this.config.clusterMass[0] + Math.random() * (this.config.clusterMass[1] - this.config.clusterMass[0]),
                    richness: 30 + Math.random() * 200, // Number of galaxies
                    redshift: (Math.sqrt((x-center.x)**2 + (y-center.y)**2) / maxRadius) * this.config.maxRedshift,
                    depth: Math.random() * 0.8 + 0.2,
                    name: `Abell-${2000 + i}`, // Abell catalog naming
                    xrayLuminosity: Math.random() * 1e45 // erg/s
                });
            }
        }
        
        // Generate galaxy nodes (DESI LRG sample)
        for (let i = 0; i < this.config.numNodes; i++) {
            let validPosition = false;
            let attempts = 0;
            let x, y;
            
            while (!validPosition && attempts < 50) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 40 + Math.random() * (maxRadius - 40);
                x = center.x + Math.cos(angle) * distance;
                y = center.y + Math.sin(angle) * distance;
                
                validPosition = true;
                // Nodes prefer to be near clusters and away from void centers
                for (let void_region of this.voids) {
                    const distToVoid = Math.sqrt((x - void_region.x)**2 + (y - void_region.y)**2);
                    if (distToVoid < void_region.radius * 0.5) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }
            
            if (validPosition) {
                const distanceFromCenter = Math.sqrt((x-center.x)**2 + (y-center.y)**2);
                const galaxyType = Math.random() < 0.6 ? 'lrg' : (Math.random() < 0.8 ? 'elg' : 'qso');
                
                this.galaxyNodes.push({
                    x: x,
                    y: y,
                    type: galaxyType,
                    magnitude: -20 - Math.random() * 4, // Absolute magnitude
                    redshift: (distanceFromCenter / maxRadius) * this.config.maxRedshift,
                    depth: Math.random() * 1.0,
                    stellarMass: Math.random() * 1e12, // Solar masses
                    color: galaxyType === 'lrg' ? 1.2 : (galaxyType === 'elg' ? 0.6 : 0.0) // g-r color
                });
            }
        }
        
        // Generate filaments connecting structures (matter density ridges)
        const allNodes = [...this.galaxyClusters, ...this.galaxyNodes];
        const maxFilamentLength = 200;
        
        for (let i = 0; i < allNodes.length; i++) {
            for (let j = i + 1; j < allNodes.length; j++) {
                const dx = allNodes[i].x - allNodes[j].x;
                const dy = allNodes[i].y - allNodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxFilamentLength) {
                    // Check if filament avoids void centers
                    let avoidsVoids = true;
                    const midX = (allNodes[i].x + allNodes[j].x) / 2;
                    const midY = (allNodes[i].y + allNodes[j].y) / 2;
                    
                    for (let void_region of this.voids) {
                        const distToVoid = Math.sqrt((midX - void_region.x)**2 + (midY - void_region.y)**2);
                        if (distToVoid < void_region.radius * 0.6) {
                            avoidsVoids = false;
                            break;
                        }
                    }
                    
                    // Probability based on distance and void avoidance
                    const connectionProb = (1 - distance / maxFilamentLength) * (avoidsVoids ? 1.0 : 0.3);
                    
                    if (Math.random() < connectionProb * this.config.webDensity) {
                        this.filaments.push({
                            start: allNodes[i],
                            end: allNodes[j],
                            strength: 1 - (distance / maxFilamentLength),
                            overdensity: 2 + Math.random() * 5, // δ = ρ/ρ_mean - 1
                            width: Math.max(1, (1 - distance / maxFilamentLength) * 3),
                            crossesVoid: !avoidsVoids
                        });
                    }
                }
            }
        }
    }
    
    drawCosmicVoids() {
        // Draw supervoids as dark, low-density regions
        this.voids.forEach(void_region => {
            const parallaxOffset = this.getParallaxOffset(void_region.depth);
            const x = void_region.x + parallaxOffset.x;
            const y = void_region.y + parallaxOffset.y;
            
            // Large void boundary (like Boötes supervoid)
            const voidGradient = this.ctx.createRadialGradient(x, y, 0, x, y, void_region.radius);
            voidGradient.addColorStop(0, this.config.colors.void);
            voidGradient.addColorStop(0.6, 'rgba(30, 30, 60, 0.1)');
            voidGradient.addColorStop(1, 'rgba(30, 30, 60, 0)');
            
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = voidGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, void_region.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalCompositeOperation = 'source-over';
            
            // Void boundary ring (observational signature)
            this.ctx.strokeStyle = 'rgba(60, 60, 100, 0.15)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([3, 6]);
            this.ctx.beginPath();
            this.ctx.arc(x, y, void_region.radius * 0.85, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });
    }


    
    drawCosmicFilaments() {
        // Draw matter density ridges (filamentary structure)
        this.filaments.forEach(filament => {
            const startParallax = this.getParallaxOffset(filament.start.depth || 0.5);
            const endParallax = this.getParallaxOffset(filament.end.depth || 0.5);
            
            const startX = filament.start.x + startParallax.x;
            const startY = filament.start.y + startParallax.y;
            const endX = filament.end.x + endParallax.x;
            const endY = filament.end.y + endParallax.y;
            
            // Filament appearance based on overdensity
            const opacity = filament.strength * 0.6 * (filament.crossesVoid ? 0.4 : 1.0);
            const width = filament.width * (filament.crossesVoid ? 0.6 : 1.0);
            
            // Draw main filament
            this.ctx.strokeStyle = this.config.colors.filament.replace(/[\d.]+\)$/, `${opacity})`);
            this.ctx.lineWidth = width;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
            
            // Add galaxy distribution along filaments (higher density)
            if (filament.strength > 0.6 && !filament.crossesVoid) {
                const numGalaxiesOnFilament = Math.floor(filament.strength * 8);
                for (let i = 0; i < numGalaxiesOnFilament; i++) {
                    const t = Math.random();
                    const gx = startX + t * (endX - startX) + (Math.random() - 0.5) * width * 2;
                    const gy = startY + t * (endY - startY) + (Math.random() - 0.5) * width * 2;
                    
                    // Small galaxy marker
                    this.ctx.fillStyle = Math.random() < 0.7 ? 
                        this.config.colors.lrg.replace('0.8', '0.4') : 
                        this.config.colors.elg.replace('0.7', '0.3');
                    this.ctx.beginPath();
                    this.ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
    }
    
    drawNodes() {
        // Draw galaxy clusters (Abell catalog style)
        this.galaxyClusters.forEach(cluster => {
            const parallaxOffset = this.getParallaxOffset(cluster.depth);
            const x = cluster.x + parallaxOffset.x;
            const y = cluster.y + parallaxOffset.y;
            
            // Size based on richness and mass  
            const size = Math.sqrt(cluster.richness) * 0.4;
            const glowSize = size * 3;
            
            // X-ray gas emission (hot intracluster medium)
            const xrayGradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
            const xrayIntensity = Math.log10(cluster.xrayLuminosity / 1e43) * 0.1; // Log scale
            
            xrayGradient.addColorStop(0, this.config.colors.cluster.replace('0.6', (xrayIntensity * 0.4).toString()));
            xrayGradient.addColorStop(0.5, this.config.colors.cluster.replace('0.6', (xrayIntensity * 0.2).toString()));
            xrayGradient.addColorStop(1, 'rgba(255, 200, 150, 0)');

            this.ctx.fillStyle = xrayGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            this.ctx.fill();

            // Brightest Cluster Galaxy (BCG) at center
            const bcgGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
            bcgGradient.addColorStop(0, this.config.colors.lrg);
            bcgGradient.addColorStop(0.7, this.config.colors.lrg.replace('0.8', '0.3'));
            bcgGradient.addColorStop(1, 'rgba(255, 180, 120, 0)');

            this.ctx.fillStyle = bcgGradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Individual cluster member galaxies
            const memberCount = Math.floor(cluster.richness * 0.3); // Visible fraction
            for (let i = 0; i < memberCount; i++) {
                const memberAngle = Math.random() * Math.PI * 2;
                const memberDist = Math.random() * glowSize * 0.7;
                const mx = x + Math.cos(memberAngle) * memberDist;
                const my = y + Math.sin(memberAngle) * memberDist;
                
                this.ctx.fillStyle = Math.random() < 0.8 ? 
                    this.config.colors.lrg.replace('0.8', '0.3') : 
                    this.config.colors.elg.replace('0.7', '0.3');
                this.ctx.beginPath();
                this.ctx.arc(mx, my, 0.6, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw DESI galaxy sample (LRGs, ELGs, QSOs)
        this.galaxyNodes.forEach(galaxy => {
            const parallaxOffset = this.getParallaxOffset(galaxy.depth);
            const x = galaxy.x + parallaxOffset.x;
            const y = galaxy.y + parallaxOffset.y;
            
            // Size based on magnitude and type
            let size = Math.max(0.8, (-galaxy.magnitude - 18) * 0.2);
            if (galaxy.type === 'qso') size *= 1.5; // Quasars are bright point sources
            
            // Color and brightness by type
            let color, alpha;
            switch(galaxy.type) {
                case 'lrg': // Luminous Red Galaxies
                    color = this.config.colors.lrg;
                    alpha = 0.8;
                    break;
                case 'elg': // Emission Line Galaxies  
                    color = this.config.colors.elg;
                    alpha = 0.7;
                    break;
                case 'qso': // Quasars
                    color = this.config.colors.qso;
                    alpha = 0.9;
                    // Add point-source diffraction spikes for quasars
                    this.ctx.strokeStyle = this.config.colors.qso.replace('0.9', '0.4');
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - size * 2, y);
                    this.ctx.lineTo(x + size * 2, y);
                    this.ctx.moveTo(x, y - size * 2);
                    this.ctx.lineTo(x, y + size * 2);
                    this.ctx.stroke();
                    break;
            }
            
            this.ctx.fillStyle = color.replace(/[\d.]+\)$/, `${alpha})`);
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add subtle redshift-dependent dimming
            if (galaxy.redshift > 0.2) {
                const dimming = 1 - (galaxy.redshift - 0.2) / 0.2;
                this.ctx.fillStyle = `rgba(0, 0, 0, ${(1-dimming) * 0.3})`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    getParallaxOffset(depth) {
        // Minimal parallax for survey-like static feel
        // DESI survey is essentially a static snapshot
        const depthFactor = 1 / (depth || 1);
        const maxOffset = 1.5; // Very subtle
        
        const offsetX = (this.mouse.x - this.canvas.width / 2) * (maxOffset / this.canvas.width) * depthFactor;
        const offsetY = (this.mouse.y - this.canvas.height / 2) * (maxOffset / this.canvas.height) * depthFactor;
        
        return { x: offsetX, y: offsetY };
    }


    
    animate() {
        // Clear canvas with deep space background
        this.ctx.fillStyle = this.config.colors.deepSpace;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the static cosmic web (always draw, centered on portrait or fallback)
        this.drawCosmicVoids();              // Dark matter voids
        this.drawCosmicFilaments();          // WHIM filamentary structure  
        this.drawNodes();                    // Galaxy clusters, groups, and galaxies

        // Very slow refresh rate for survey-like static appearance
        if (this.animationId) {
            setTimeout(() => {
                if (this.animationId) {
                    this.animationId = requestAnimationFrame(() => this.animate());
                }
            }, 100); // 10 FPS for minimal updates
        }
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
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