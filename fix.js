const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const splitIndex = code.indexOf('// Helper for fading materials in a group');
if (splitIndex === -1) {
    console.log("Could not find split index");
    process.exit(1);
}

const topPart = code.substring(0, splitIndex);

const bottomPart = `// --- ScrollTrigger Setup ---

// Helper for color transitions
const proxyColor = {
    ambientR: initialFogColor.r,
    ambientG: initialFogColor.g,
    ambientB: initialFogColor.b,
    lightR: 1, lightG: 1, lightB: 1,
    fogR: initialFogColor.r, fogG: initialFogColor.g, fogB: initialFogColor.b
};

function updateColors() {
    ambientLight.color.setRGB(proxyColor.ambientR, proxyColor.ambientG, proxyColor.ambientB);
    directionalLight.color.setRGB(proxyColor.lightR, proxyColor.lightG, proxyColor.lightB);
    scene.fog.color.setRGB(proxyColor.fogR, proxyColor.fogG, proxyColor.fogB);
    document.body.style.backgroundColor = \`rgb(\${Math.round(proxyColor.fogR*255)}, \${Math.round(proxyColor.fogG*255)}, \${Math.round(proxyColor.fogB*255)})\`;
}

// Progress Indicator logic
const dots = document.querySelectorAll('.progress-indicator .dot');
function updateDot(activeIndex, color) {
    dots.forEach((dot, i) => {
        if (i === activeIndex) {
            dot.classList.add('active');
            dot.style.setProperty('--active-color', color);
        } else {
            dot.classList.remove('active');
        }
    });
}

// 1. Hero Animations
heroGroup.visible = true;
const heroMats = [];
heroGroup.traverse(c => {
    if(c.isMesh) {
        c.material.userData.originalOpacity = 1;
        heroMats.push(c.material);
    }
});

// Scrub hero 3D fade out
gsap.to(heroMats, {
    opacity: 0,
    scrollTrigger: {
        trigger: "#section-hero",
        start: "bottom 80%",
        end: "bottom 30%",
        scrub: true,
        onLeave: () => heroGroup.visible = false,
        onEnterBack: () => heroGroup.visible = true
    }
});

// State changes for Hero -> Chapter 1 transition
ScrollTrigger.create({
    trigger: "#section-hero",
    start: "top top",
    end: "bottom 50%",
    onLeave: () => { 
        document.querySelector('.progress-indicator').classList.add('visible');
    },
    onEnterBack: () => { 
        document.querySelector('.progress-indicator').classList.remove('visible');
        
        // Reverse Color to Hero state
        gsap.to(proxyColor, {
            ambientR: initialFogColor.r, ambientG: initialFogColor.g, ambientB: initialFogColor.b,
            lightR: 1, lightG: 1, lightB: 1,
            fogR: initialFogColor.r, fogG: initialFogColor.g, fogB: initialFogColor.b,
            duration: 1.0,
            ease: "power2.inOut",
            onUpdate: updateColors
        });
    }
});

gsap.to(".hero .content", {
    scrollTrigger: {
        trigger: "#section-hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    },
    y: 100,
    opacity: 0
});

// 2. Chapter Animations
const chapterSections = document.querySelectorAll('.chapter-section');

chapterSections.forEach((section, index) => {
    const data = chaptersData[index];
    const group = chapterGroups[index];
    const content = section.querySelector('.chapter-content');
    
    const targetAmbient = new THREE.Color(data.ambientColor);
    const targetLight = new THREE.Color(data.lightColor);
    const targetFog = new THREE.Color(data.fogColor);
    
    const materials = [];
    group.traverse(c => {
        if(c.isMesh || c.isPoints) materials.push(c.material);
    });

    // 3D Fade IN/OUT scrubbed timeline
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            scrub: true,
            onEnter: () => group.visible = true,
            onLeave: () => group.visible = false,
            onEnterBack: () => group.visible = true,
            onLeaveBack: () => group.visible = false
        }
    });

    materials.forEach(mat => {
        const orig = mat.userData.originalOpacity || 1;
        tl.fromTo(mat, { opacity: 0 }, { opacity: orig, duration: 0.2, ease: "none" }, 0);
        tl.to(mat, { opacity: 0, duration: 0.2, ease: "none" }, 0.8);
    });

    // State changes (colors, dots, fragments)
    ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => {
            updateDot(index, data.themeColor);
            
            const frag = document.getElementById(\`frag-\${index}\`);
            if(frag) {
                frag.classList.add('collected');
                frag.style.setProperty('--frag-color', data.themeColor);
            }

            gsap.to(proxyColor, {
                ambientR: targetAmbient.r, ambientG: targetAmbient.g, ambientB: targetAmbient.b,
                lightR: targetLight.r, lightG: targetLight.g, lightB: targetLight.b,
                fogR: targetFog.r, fogG: targetFog.g, fogB: targetFog.b,
                duration: 1.0,
                ease: "power2.inOut",
                onUpdate: updateColors
            });
        },
        onEnterBack: () => {
            updateDot(index, data.themeColor);
            
            const frag = document.getElementById(\`frag-\${index}\`);
            if(frag) {
                frag.classList.add('collected');
                frag.style.setProperty('--frag-color', data.themeColor);
            }

            gsap.to(proxyColor, {
                ambientR: targetAmbient.r, ambientG: targetAmbient.g, ambientB: targetAmbient.b,
                lightR: targetLight.r, lightG: targetLight.g, lightB: targetLight.b,
                fogR: targetFog.r, fogG: targetFog.g, fogB: targetFog.b,
                duration: 1.0,
                ease: "power2.inOut",
                onUpdate: updateColors
            });
        },
        onLeaveBack: () => {
            const frag = document.getElementById(\`frag-\${index}\`);
            if(frag) {
                frag.classList.remove('collected');
            }
        }
    });

    // 3D Parallax Depth effect
    gsap.fromTo(group.position,
        { y: -1.5 },
        { 
            y: 1.5,
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        }
    );
    
    // Content Scroll Parallax & Fade
    gsap.fromTo(content, 
        { opacity: 0, y: 100 },
        { 
            opacity: 1, 
            y: 0,
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "top 30%",
                scrub: true
            }
        }
    );
    
    gsap.to(content, {
        opacity: 0,
        y: -100,
        scrollTrigger: {
            trigger: section,
            start: "bottom 70%",
            end: "bottom 20%",
            scrub: true
        }
    });
});

// 3. Closing Animations
closingGroup.visible = false;
const closingMats = [];
closingGroup.traverse(c => {
    if(c.isPoints) closingMats.push(c.material);
});

gsap.to(closingMats, {
    opacity: 0.8,
    scrollTrigger: {
        trigger: "#section-closing",
        start: "top 80%",
        end: "top 30%",
        scrub: true,
        onEnter: () => closingGroup.visible = true,
        onLeaveBack: () => closingGroup.visible = false
    }
});

ScrollTrigger.create({
    trigger: "#section-closing",
    start: "top 50%",
    onEnter: () => {
        document.querySelector('.progress-indicator').classList.remove('visible');
        
        const badge = document.getElementById('completion-badge');
        if (badge) badge.classList.add('visible');
        document.querySelectorAll('.myth-fragment').forEach(f => f.classList.add('fully-lit'));

        gsap.to(proxyColor, {
            ambientR: 0.05, ambientG: 0.05, ambientB: 0.08,
            lightR: 1, lightG: 1, lightB: 1,
            fogR: 0.02, fogG: 0.03, fogB: 0.05,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: updateColors
        });
    },
    onLeaveBack: () => {
        document.querySelector('.progress-indicator').classList.add('visible');
        
        const badge = document.getElementById('completion-badge');
        if (badge) badge.classList.remove('visible');
        document.querySelectorAll('.myth-fragment').forEach(f => f.classList.remove('fully-lit'));
        
        // Reverse Color to Chapter 5 (Kappa)
        const kappaData = chaptersData[4];
        const targetAmbient = new THREE.Color(kappaData.ambientColor);
        const targetLight = new THREE.Color(kappaData.lightColor);
        const targetFog = new THREE.Color(kappaData.fogColor);
        
        gsap.to(proxyColor, {
            ambientR: targetAmbient.r, ambientG: targetAmbient.g, ambientB: targetAmbient.b,
            lightR: targetLight.r, lightG: targetLight.g, lightB: targetLight.b,
            fogR: targetFog.r, fogG: targetFog.g, fogB: targetFog.b,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: updateColors
        });
    }
});

// Initial hero appearance
gsap.fromTo(".hero .content", 
    { opacity: 0, y: 30 }, 
    { opacity: 1, y: 0, duration: 1.5, ease: "power2.out", delay: 0.2 }
);

// Legend Selector smooth scroll
window.scrollToChapter = (id) => {
    const el = document.getElementById(\`section-\${id}\`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
};
`;

fs.writeFileSync('main.js', topPart + bottomPart);
console.log("Rewrote main.js successfully");
