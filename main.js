gsap.registerPlugin(ScrollTrigger);

// --- Intro Sequence ---
const initIntro = () => {
    const overlay = document.getElementById("intro-overlay");
    const text = document.querySelector(".intro-text");
    
    if (overlay && text) {
        let isSkipped = false;
        
        const cleanup = () => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        };

        const skipIntro = () => {
            if (isSkipped) return;
            isSkipped = true;
            
            overlay.style.opacity = "0";
            setTimeout(cleanup, 1000);
        };

        overlay.addEventListener("click", skipIntro);
        
        setTimeout(() => {
            if (isSkipped) return;
            text.style.opacity = "1";
            
            setTimeout(() => {
                if (isSkipped) return;
                overlay.style.opacity = "0";
                
                setTimeout(() => {
                    if (isSkipped) return;
                    cleanup();
                }, 1000);
            }, 2500); // 1s fade in + 1.5s hold
        }, 100);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
} else {
    initIntro();
}

// --- Content Generation ---
const chaptersContainer = document.getElementById('chapters-container');
const chaptersData = [
    {
        id: "icarus",
        number: "Chapter I",
        title: "Icarus",
        text: "He crafted wings of wax and feathers, yearning for the heavens. But in his ascent towards the glowing orb, ambition melted into ruin, a fiery plunge back to the mortal sea.",
        themeColor: "#ffaa00",
        lightColor: 0xffaa00,
        ambientColor: 0x442200,
        fogColor: 0x0a0500,
        riddle: "What warned him, and what did he ignore?",
        options: ["The sun's heat", "His father's counsel"],
        reply: "Perhaps both truths can coexist in a single fall."
    },
    {
        id: "ravana",
        number: "Chapter II",
        title: "Ravana's Ten Heads",
        text: "A scholar of boundless intellect, whose ten heads symbolized mastery over the scriptures. Yet, unchecked power and desire transformed enlightenment into an inescapable, consuming darkness.",
        themeColor: "#cc0000",
        lightColor: 0xff0000,
        ambientColor: 0x110000,
        fogColor: 0x1a0000,
        riddle: "Was his downfall knowledge, or the pride it fed?",
        options: ["Knowledge itself", "Unchecked pride"],
        reply: "The greatest mind can be its own heaviest anchor."
    },
    {
        id: "yakshi",
        number: "Chapter III",
        title: "Yakshi",
        text: "Beneath the pale moonlight, the palm trees whisper her name. A beautiful, haunting spirit bound to the earth, luring wanderers into the mist with a song of sorrow and vengeance.",
        themeColor: "#88bbff",
        lightColor: 0x88bbff,
        ambientColor: 0x001133,
        fogColor: 0x001122,
        riddle: "Is she a warning, or a mirror of desire?",
        options: ["A warning", "A mirror"],
        reply: "She is whatever the wanderer's heart conceals."
    },
    {
        id: "phoenix",
        number: "Chapter IV",
        title: "Phoenix",
        text: "When the weight of ages grows too heavy, it surrenders to the pyre. From the roaring flames and blinding embers, it rises anew—a testament that every end is merely a beginning.",
        themeColor: "#ff4400",
        lightColor: 0xff4400,
        ambientColor: 0x331100,
        fogColor: 0x1a0500,
        riddle: "Does the fire destroy, or does it cleanse?",
        options: ["It destroys", "It cleanses"],
        reply: "To rise as ash is to be freed from form."
    },
    {
        id: "kappa",
        number: "Chapter V",
        title: "Kappa",
        text: "In the murky, rippling currents, the river child waits. A mischievous guardian of the depths, whose power is tied to the life-giving waters pooled upon its head.",
        themeColor: "#00ff88",
        lightColor: 0x00ff88,
        ambientColor: 0x002211,
        fogColor: 0x001a11,
        riddle: "Guardian of the water, or its mischievous thief?",
        options: ["A guardian", "A trickster"],
        reply: "The river answers only to its own current."
    }
];

// Generate DOM elements for chapters
chaptersData.forEach((chapter, index) => {
    const section = document.createElement('section');
    section.className = 'section chapter-section';
    section.id = `section-${chapter.id}`;
    
    const content = document.createElement('div');
    content.className = 'chapter-content';
    content.style.setProperty('--theme-color', chapter.themeColor);
    
    content.innerHTML = `
        <div class="chapter-number">${chapter.number}</div>
        <h2 class="chapter-title">${chapter.title}</h2>
        <p class="chapter-text">${chapter.text}</p>
        <div class="chapter-riddle">
            <p class="riddle-q">${chapter.riddle}</p>
            <div class="riddle-options">
                <button onclick="revealReply(this)">${chapter.options[0]}</button>
                <button onclick="revealReply(this)">${chapter.options[1]}</button>
            </div>
            <p class="riddle-reply">${chapter.reply}</p>
        </div>
    `;
    
    section.appendChild(content);
    chaptersContainer.appendChild(section);
});

// --- Three.js Setup ---
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

const initialFogColor = new THREE.Color(0x050810);
scene.fog = new THREE.FogExp2(initialFogColor, 0.04);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Global Lights
const ambientLight = new THREE.AmbientLight(0x111111, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Helper for particle creation
const createParticles = (count, color, size = 0.05) => {
    const geometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(count * 3);
    for(let i = 0; i < count * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 12; // spread
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({
        size: size,
        color: color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    return new THREE.Points(geometry, material);
}

// --- Chapter Scenes ---

// Hero Object (Before Chapter 1)
const heroGroup = new THREE.Group();
const heroGeometry = new THREE.IcosahedronGeometry(2.2, 1);
const heroMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa, 
    wireframe: true,
    emissive: 0x222222,
    transparent: true,
    opacity: 1
});
const heroMesh = new THREE.Mesh(heroGeometry, heroMaterial);
heroGroup.add(heroMesh);

// Soft radial glow behind wireframe
const canvasGlow = document.createElement('canvas');
canvasGlow.width = 128;
canvasGlow.height = 128;
const ctxGlow = canvasGlow.getContext('2d');
const grad = ctxGlow.createRadialGradient(64, 64, 0, 64, 64, 64);
grad.addColorStop(0, 'rgba(255, 170, 0, 0.4)');
grad.addColorStop(1, 'rgba(255, 170, 0, 0)');
ctxGlow.fillStyle = grad;
ctxGlow.fillRect(0, 0, 128, 128);

const glowTexture = new THREE.CanvasTexture(canvasGlow);
const glowMaterial = new THREE.SpriteMaterial({ 
    map: glowTexture, 
    blending: THREE.AdditiveBlending, 
    depthWrite: false,
    transparent: true,
    opacity: 1
});
const glowSprite = new THREE.Sprite(glowMaterial);
glowSprite.scale.set(8, 8, 1);
glowSprite.position.set(0, 0, 0); // Center it so it doesn't orbit
glowSprite.renderOrder = -1; // Force render behind the icosahedron
heroGroup.add(glowSprite);

scene.add(heroGroup);

// Chapter 1: Icarus
const createIcarus = () => {
    console.log("Creating Icarus scene");
    const group = new THREE.Group();
    
    const sunGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff6600,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 1
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(-2, 0, -2);
    group.add(sun);
    
    const feathers = createParticles(400, 0xffddaa, 0.06);
    group.add(feathers);
    
    const baseSunX = -2;
    const baseSunY = 0;
    
    group.userData.update = (time, delta) => {
        const positions = feathers.geometry.attributes.position.array;
        for(let i = 1; i < positions.length; i+=3) {
            positions[i] -= 0.015; // falling
            if(positions[i] < -6) positions[i] = 6;
            positions[i-1] += Math.sin(time + i) * 0.005; // swaying
        }
        feathers.geometry.attributes.position.needsUpdate = true;
        
        // Mouse reaction (parallax position and tilt)
        sun.position.x = baseSunX + mouse.x * 0.4;
        sun.position.y = baseSunY + mouse.y * 0.4;
        sun.rotation.x = -mouse.y * 0.2; // tilt
        sun.rotation.y = time * 0.1 + mouse.x * 0.2;
    };
    return group;
};

// Chapter 2: Ravana's Ten Heads
const createRavana = () => {
    const group = new THREE.Group();
    group.position.set(2.5, 0, -2); // Visual on the right
    
    const maskCount = 4;
    for(let i = 0; i < maskCount; i++) {
        const maskGroup = new THREE.Group();
        
        // Base mask shape
        const coneGeo = new THREE.ConeGeometry(0.8, 1.8, 4);
        const coneMat = new THREE.MeshStandardMaterial({
            color: 0x660000, // dark red
            emissive: 0x220000,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        
        // Gold halo/crown arch
        const haloGeo = new THREE.TorusGeometry(0.9, 0.04, 8, 24, Math.PI);
        const haloMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00, // gold
            emissive: 0x442200,
            transparent: true,
            opacity: 0.9
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.y = 0.5;
        halo.rotation.x = Math.PI / 12; // tilt slightly
        
        maskGroup.add(cone);
        maskGroup.add(halo);
        
        // Fan arrangement
        const angle = (i - (maskCount - 1) / 2) * 0.45; // Fan spread
        maskGroup.rotation.z = -angle;
        maskGroup.rotation.y = angle * 0.5;
        maskGroup.position.x = Math.sin(angle) * 0.8;
        maskGroup.position.z = -Math.abs(angle) * 0.8;
        
        group.add(maskGroup);
    }
    
    let currentRotation = 0;
    let rotationSpeed = 0.002;
    group.userData.update = (time, delta) => {
        // Approximate screen position of Ravana (it's on the right)
        const dist = Math.hypot(mouse.x - 0.4, mouse.y);
        const targetSpeed = dist < 0.5 ? 0.012 : 0.002;
        rotationSpeed += (targetSpeed - rotationSpeed) * 0.05;
        
        currentRotation += rotationSpeed;
        group.rotation.y = currentRotation + Math.sin(time * 0.5) * 0.1; // Continuous rotation + sway
        
        group.children.forEach((child, i) => {
            child.position.y = Math.sin(time * 1.5 + i) * 0.1; // bobbing
        });
    };
    return group;
};

// Chapter 3: Yakshi
const createYakshi = () => {
    const group = new THREE.Group();
    group.position.set(-2.5, 0, -2); // Visual on the left
    
    const treeGroup = new THREE.Group();
    group.add(treeGroup);
    
    const treeMat = new THREE.MeshStandardMaterial({ 
        color: 0x050a10, 
        roughness: 0.9,
        transparent: true,
        opacity: 1
    });
    
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 5, 8), treeMat);
    trunk.position.set(0, -1, 0);
    treeGroup.add(trunk);
    
    for(let i=0; i<6; i++) {
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.08, 2.5, 8), treeMat);
        branch.position.set(0, i * 0.6, 0);
        branch.rotation.z = (Math.random() - 0.5) * 2;
        branch.rotation.x = (Math.random() - 0.5) * 2;
        branch.position.x += Math.sin(branch.rotation.z) * 1.2;
        branch.position.y += Math.cos(branch.rotation.z) * 1.2;
        treeGroup.add(branch);
    }
    
    const mist = createParticles(600, 0x88bbff, 0.15);
    group.add(mist);
    
    let treeSway = 0;
    group.userData.update = (time, delta) => {
        mist.rotation.y = time * 0.03;
        const positions = mist.geometry.attributes.position.array;
        for(let i = 0; i < positions.length; i+=3) {
            positions[i] += Math.sin(time + positions[i+1]) * 0.001;
        }
        mist.geometry.attributes.position.needsUpdate = true;
        
        // Mouse wind effect (subtle sway on Z-axis)
        treeSway += (mouse.x * 0.3 - treeSway) * 0.05;
        treeGroup.rotation.z = treeSway + Math.sin(time * 0.5) * 0.02;
    };
    return group;
};

// Chapter 4: Phoenix
const createPhoenix = () => {
    const group = new THREE.Group();
    group.position.set(2.5, 0, -2); // Visual on the right
    const embers = createParticles(1000, 0xff5500, 0.05);
    
    const positions = embers.geometry.attributes.position.array;
    const baseXs = new Float32Array(1000);
    for(let i=0; i<positions.length; i+=3) {
        let x = (Math.random() - 0.5) * 8;
        let y = (Math.random() - 0.5) * 6;
        let z = (Math.random() - 0.5) * 3;
        
        if(Math.abs(x) > 1) {
            y += Math.abs(x) * 0.6;
        }
        positions[i] = x;
        positions[i+1] = y;
        positions[i+2] = z;
        baseXs[i/3] = x;
    }
    group.add(embers);
    
    group.userData.update = (time, delta) => {
        const smX = mouse.x * 5 - 2.5; // adjust for group offset
        const smY = mouse.y * 3;
        
        const positions = embers.geometry.attributes.position.array;
        for(let i=1; i<positions.length; i+=3) {
            const index = (i-1)/3;
            positions[i] += 0.02 + Math.random() * 0.02; // rise
            
            // Drift back to base X + flutter
            const targetX = baseXs[index] + Math.sin(time*2 + i) * 0.1;
            positions[i-1] += (targetX - positions[i-1]) * 0.05;
            
            // Mouse repel
            const dx = positions[i-1] - smX;
            const dy = positions[i] - smY;
            const distSq = dx*dx + dy*dy;
            if(distSq < 4.0) {
                const force = (4.0 - distSq) * 0.02;
                positions[i-1] += dx * force;
                positions[i] += dy * force;
            }
            
            if(positions[i] > 5) {
                positions[i] = -5;
                let x = baseXs[index];
                if(Math.abs(x) > 1) {
                    positions[i] += Math.abs(x) * 0.6 - 2;
                }
                positions[i-1] = x;
            }
        }
        embers.geometry.attributes.position.needsUpdate = true;
        embers.scale.y = 1 + Math.sin(time * 4) * 0.05; // Flapping
    };
    return group;
};

// Chapter 5: Kappa
const createKappa = () => {
    const group = new THREE.Group();
    
    const waterGeo = new THREE.PlaneGeometry(12, 12, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
        color: 0x004433,
        transparent: true,
        opacity: 0.7,
        wireframe: true
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1.5;
    group.add(water);
    
    const kappaGroup = new THREE.Group();
    kappaGroup.position.set(-2, -1, -1);

    const kappaMat = new THREE.MeshStandardMaterial({ 
        color: 0x001105,
        transparent: true,
        opacity: 1
    });

    const kappaBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.6, 8), kappaMat);
    kappaGroup.add(kappaBody);

    const kappaTop = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), kappaMat);
    kappaTop.position.y = 0.3;
    kappaGroup.add(kappaTop);

    const kappaBottom = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), kappaMat);
    kappaBottom.position.y = -0.3;
    kappaGroup.add(kappaBottom);

    group.add(kappaGroup);
    
    group.userData.update = (time) => {
        const mouseX = mouse.x * 6;
        const mouseY = mouse.y * 6; // approximate projection onto plane

        const vertices = water.geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            
            let baseZ = Math.sin(x * 2 + time * 2) * 0.15 + Math.cos(y * 2 + time * 1.5) * 0.15;
            
            // Cursor ripple interaction
            const dx = x - mouseX;
            const dy = y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            let ripple = 0;
            if (dist < 3.0) {
                // Increased intensity near cursor
                ripple = Math.sin(dist * 6 - time * 8) * (3.0 - dist) * 0.2;
            }
            
            vertices[i + 2] = baseZ + ripple;
        }
        water.geometry.attributes.position.needsUpdate = true;
        kappaGroup.position.y = -1 + Math.sin(time * 2) * 0.1;
    };
    return group;
};

const chapterGroups = [];
const chaptersBuilders = [createIcarus, createRavana, createYakshi, createPhoenix, createKappa];

// Initialize all groups with a try/catch safety net
chaptersBuilders.forEach((builder, index) => {
    try {
        const group = builder();
        
        // Store original opacities and set to 0 initially
        group.traverse((child) => {
            if (child.isMesh || child.isPoints) {
                const mat = child.material;
                mat.transparent = true;
                mat.userData.originalOpacity = mat.opacity || 1;
                mat.opacity = 0;
            }
        });
        
        group.visible = false;
        scene.add(group);
        chapterGroups.push(group);
    } catch (error) {
        console.error(`Error building chapter ${index + 1}:`, error);
        // Push an empty placeholder group so animations and scroll triggers don't break
        const emptyGroup = new THREE.Group();
        emptyGroup.visible = false;
        scene.add(emptyGroup);
        chapterGroups.push(emptyGroup);
    }
});

// Closing scene background
const closingGroup = new THREE.Group();
const closingParticles = createParticles(400, 0xffffff, 0.04);
closingGroup.add(closingParticles);

// Hide initially
closingGroup.traverse(child => {
    if(child.isPoints) {
        child.material.userData.originalOpacity = 0.8;
        child.material.opacity = 0;
    }
});
closingGroup.visible = false;
scene.add(closingGroup);

closingGroup.userData.update = (time) => {
    closingGroup.rotation.x = time * 0.03;
    closingGroup.rotation.y = time * 0.03;
};


// --- Mouse Tracking ---
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
window.addEventListener('mousemove', (event) => {
    mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1; // Standard webgl coords
});

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    const delta = clock.getDelta();
    
    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    
    if(heroGroup.visible) {
        heroGroup.rotation.x = time * 0.35;
        heroGroup.rotation.y = time * 0.45;
    }
    
    chapterGroups.forEach(group => {
        if(group.visible && group.userData.update) {
            group.userData.update(time, delta);
        }
    });
    
    if(closingGroup.visible && closingGroup.userData.update) {
        closingGroup.userData.update(time, delta);
    }
    
    renderer.render(scene, camera);
}
animate();


// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- ScrollTrigger Setup ---

// --- ScrollTrigger Setup ---

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
    document.body.style.backgroundColor = `rgb(${Math.round(proxyColor.fogR*255)}, ${Math.round(proxyColor.fogG*255)}, ${Math.round(proxyColor.fogB*255)})`;
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
    if(c.isMesh || c.isSprite) {
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
            
            const frag = document.getElementById(`frag-${index}`);
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
            
            const frag = document.getElementById(`frag-${index}`);
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
            const frag = document.getElementById(`frag-${index}`);
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

// Initial hero appearance (Staggered)
const heroElements = [
    ".hero h1", 
    ".hero h2", 
    ".selector-title", 
    ".orb-wrapper", 
    ".scroll-indicator"
];
gsap.fromTo(heroElements, 
    { opacity: 0, y: 25 }, 
    { opacity: 1, y: 0, duration: 1.2, ease: "power2.out", delay: 0.2, stagger: 0.12 }
);

// Legend Selector smooth scroll
window.scrollToChapter = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
};

// Riddle interaction
window.revealReply = (btn) => {
    const riddleDiv = btn.closest('.chapter-riddle');
    const options = riddleDiv.querySelectorAll('button');
    options.forEach(opt => {
        opt.disabled = true;
        if(opt !== btn) {
            opt.style.opacity = '0.4';
        } else {
            opt.style.borderColor = 'var(--theme-color)';
            opt.style.backgroundColor = 'rgba(255,255,255,0.1)';
        }
    });
    const reply = riddleDiv.querySelector('.riddle-reply');
    reply.classList.add('visible');
};
