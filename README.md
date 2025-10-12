# Astrophysics Portfolio Website

A modern, elegant, and responsive personal website for a Master's student in Astrophysics. Built with pure HTML, CSS, and JavaScript - no frameworks required.

## ✨ Features

### Design
- **Cosmological large scale structure background** featuring cosmic web visualization
- **Realistic galaxy cluster distribution** with filaments and voids
- **Dynamic density field rendering** showing large-scale structure
- **Professional typography** using Google Fonts (Inter)
- **Responsive design** that works on all devices
- **Dark/Light mode toggle** with localStorage persistence
- **Smooth animations** and hover effects

### Sections
- **About Me** - Introduction, research interests, and professional portrait
- **CV** - Education timeline, research experience, skills, and downloadable PDF
- **Research** - Project gallery with descriptions, tools, and links
- **Notes** - Blog-style academic reflections and insights
- **Travel** - Academic travel gallery with conferences and observatory visits
- **Contact** - Contact form and academic profile links

### Interactive Features
- **Sticky navigation** with active section highlighting
- **Smooth scrolling** between sections
- **Mobile-responsive menu** with hamburger toggle
- **Contact form** with validation and submission feedback
- **Scroll animations** for enhanced user experience
- **Theme persistence** across browser sessions
- **Cosmic web visualization** inspired by SDSS and cosmological surveys

## 🌌 **About the Cosmic Web Background**

The background visualization is inspired by **real cosmological large-scale structure surveys** such as:

- **Sloan Digital Sky Survey (SDSS)** - 3D maps of galaxy distribution
- **2dF Galaxy Redshift Survey** - Cosmic web filament structures
- **Illustris/EAGLE Simulations** - Dark matter halo networks
- **Planck Mission** - Cosmic microwave background patterns

### **Visual Elements:**

1. **Galaxy Clusters (Nodes)** - Bright blue points representing high-density regions
2. **Cosmic Filaments** - Purple lines connecting clusters, showing matter distribution
3. **Cosmic Voids** - Darker regions representing low-density space
4. **Density Field** - Gradient overlays showing matter concentration
5. **Subtle Animation** - Gentle pulsing mimicking the dynamic nature of the universe

This creates an **authentic astrophysical aesthetic** that immediately conveys the scientific nature of the content.

## 🚀 Quick Start

1. **Clone or download** the files to your web server
2. **Open `index.html`** in your browser
3. **Customize** the content (see customization guide below)
4. **Deploy** to your preferred hosting platform

## 📁 File Structure

```
├── index.html          # Main HTML structure
├── style.css           # CSS styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🎨 Customization Guide

### Personal Information
Edit the following in `index.html`:

```html
<!-- Update name and title -->
<h1 class="hero-title">Your Name</h1>
<h2 class="hero-subtitle">Your Title</h2>

<!-- Update research interests -->
<span class="interest-tag">Your Research Area</span>

<!-- Update contact information -->
<a href="mailto:your.email@university.edu">your.email@university.edu</a>
```

### Research Projects
Add your projects in the research section:

```html
<div class="research-card">
    <div class="research-content">
        <h3>Your Project Title</h3>
        <p>Project description...</p>
        <div class="research-tools">
            <span class="tool-tag">Python</span>
            <span class="tool-tag">Your Tools</span>
        </div>
        <div class="research-links">
            <a href="your-github-link" class="link-btn">
                <i class="fab fa-github"></i> GitHub
            </a>
        </div>
    </div>
</div>
```

### CV Timeline
Update your education and experience:

```html
<div class="timeline-item">
    <div class="timeline-date">2023 - Present</div>
    <div class="timeline-content">
        <h4>Your Degree</h4>
        <p>Your University</p>
        <p>Additional details...</p>
    </div>
</div>
```

### Color Scheme
Modify colors in `style.css`:

```css
:root {
    --accent-primary: #4a9eff;        /* Main accent color */
    --accent-secondary: #ff6b6b;      /* Secondary accent */
    --accent-gold: #ffd700;           /* Gold highlights */
    /* ... other variables */
}
```

### Images
Replace image placeholders:

1. **Profile photo**: Replace the placeholder in the About section
2. **Research images**: Add project screenshots or plots
3. **Travel photos**: Add conference and observatory images

```html
<!-- Replace placeholder with actual image -->
<div class="about-image">
    <img src="your-photo.jpg" alt="Your Name" class="profile-image">
</div>
```

## 🔧 Advanced Customization

### Adding New Sections
1. Add section to HTML:
```html
<section id="new-section" class="section">
    <div class="container">
        <h2 class="section-title">New Section</h2>
        <!-- Your content -->
    </div>
</section>
```

2. Add navigation link:
```html
<a href="#new-section" class="nav-link">New Section</a>
```

3. Style in CSS if needed:
```css
#new-section {
    /* Custom styles */
}
```

### Modifying Animations
Adjust animation settings in `script.js`:

```javascript
// Cosmic web configuration
this.numNodes = 80;  // Number of galaxy clusters (adjust for density)
const maxDistance = 200;  // Maximum filament connection distance

// Adjust colors in drawDensityField() and drawNodes() methods
// High density: rgba(74, 158, 255, ...) - bright blue
// Medium density: rgba(102, 126, 234, ...) - purple
// Low density: rgba(52, 46, 80, ...) - dark purple

// Scroll animation threshold
threshold: 0.1  // When animations trigger
```

### Customizing the Cosmic Web Background

The background features a **procedurally generated cosmic web** inspired by large-scale structure surveys:

**Adjust galaxy cluster density:**
```javascript
this.numNodes = 80; // Increase for denser cosmic web
```

**Modify filament connections:**
```javascript
const maxDistance = 200; // Distance threshold for filament connections
```

**Change color scheme:**
```javascript
// In drawDensityField() method:
// High density regions (galaxy clusters)
gradient.addColorStop(0, `rgba(74, 158, 255, ${intensity})`); // Bright blue

// Medium density (filaments)
gradient.addColorStop(0, `rgba(74, 62, 122, ${intensity})`); // Purple

// Voids (empty space)
gradient.addColorStop(0, 'rgba(10, 10, 15, 0.3)'); // Very dark
```

**Performance tuning:**
```javascript
// Reduce nodes for better performance on slower devices
this.numNodes = 50; // Lower number = better performance

// Adjust animation smoothness
this.ctx.fillStyle = 'rgba(10, 10, 15, 0.05)'; // Higher alpha = less trailing
```

### Contact Form Integration
To connect the contact form to a backend service:

1. Replace the simulation in `script.js`:
```javascript
async simulateFormSubmission(data) {
    const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        throw new Error('Failed to send message');
    }
    
    return response.json();
}
```

2. Or integrate with services like:
   - Netlify Forms
   - Formspree
   - EmailJS
   - Custom PHP/Node.js backend

## 📱 Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **Features used**: CSS Grid, Flexbox, ES6+ JavaScript, Canvas API

## 🎯 Performance Tips

1. **Optimize images**: Use WebP format and appropriate sizes
2. **Lazy loading**: Add `loading="lazy"` to images
3. **Minify files**: Use tools like UglifyJS and cssnano for production
4. **CDN**: Host on a CDN for global performance

## 🔍 SEO Optimization

The website includes:
- Semantic HTML structure
- Meta descriptions and titles
- Alt text for images
- Structured data potential
- Fast loading times

## 📄 Adding Your CV

1. Create a PDF of your CV
2. Place it in the same directory
3. Update the download link:

```javascript
function downloadCV() {
    const cvUrl = './your-cv.pdf';  // Update this path
    // ... rest of function
}
```

## 🌐 Deployment Options

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (usually `main`)

### Netlify
1. Drag and drop files to Netlify
2. Or connect GitHub repository
3. Automatic deployments on push

### Traditional Web Hosting
1. Upload files via FTP/SFTP
2. Point domain to hosting directory
3. Ensure HTTPS is enabled

## 🤝 Contributing

Feel free to:
- Report bugs or issues
- Suggest improvements
- Submit pull requests
- Share your customizations

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Ensure all files are in the same directory
3. Verify internet connection for external resources (fonts, icons)
4. Test in different browsers

---

**Made with ⭐ and curiosity about the cosmos**

*Perfect for astrophysics students, researchers, and anyone passionate about space science.*