gsap.registerPlugin(ScrollTrigger);

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
        fogColor: 0x0a0500
    },
    {
        id: "ravana",
        number: "Chapter II",
        title: "Ravana's Ten Heads",
        text: "A scholar of boundless intellect, whose ten heads symbolized mastery over the scriptures. Yet, unchecked power and desire transformed enlightenment into an inescapable, consuming darkness.",
        themeColor: "#cc0000",
        lightColor: 0xff0000,
        ambientColor: 0x110000,
        fogColor: 0x1a0000
    },
    {
        id: "yakshi",
        number: "Chapter III",
        title: "Yakshi",
        text: "Beneath the pale moonlight, the palm trees whisper her name. A beautiful, haunting spirit bound to the earth, luring wanderers into the mist with a song of sorrow and vengeance.",
        themeColor: "#88bbff",
        lightColor: 0x88bbff,
        ambientColor: 0x001133,
        fogColor: 0x001122
    },
    {
        id: "phoenix",
        number: "Chapter IV",
        title: "Phoenix",
        text: "When the weight of ages grows too heavy, it surrenders to the pyre. From the roaring flames and blinding embers, it rises anew—a testament that every end is merely a beginning.",
        themeColor: "#ff4400",
        lightColor: 0xff4400,
        ambientColor: 0x331100,
        fogColor: 0x1a0500
    },
    {
        id: "kappa",
        number: "Chapter V",
        title: "Kappa",
        text: "In the murky, rippling currents, the river child waits. A mischievous guardian of the depths, whose power is tied to the life-giving waters pooled upon its head.",
        themeColor: "#00ff88",
        lightColor: 0x00ff88,
        ambientColor: 0x002211,
        fogColor: 0x001a11
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
const heroGeometry = new THREE.IcosahedronGeometry(1.5, 1);
const heroMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa, 
    wireframe: true,
    emissive: 0x222222,
    transparent: true,
    opacity: 1
});
const heroMesh = new THREE.Mesh(heroGeometry, heroMaterial);
heroGroup.add(heroMesh);
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
    
    group.userData.update = (time) => {
        const positions = feathers.geometry.attributes.position.array;
        for(let i = 1; i < positions.length; i+=3) {
            positions[i] -= 0.015; // falling
            if(positions[i] < -6) positions[i] = 6;
            positions[i-1] += Math.sin(time + i) * 0.005; // swaying
        }
        feathers.geometry.attributes.position.needsUpdate = true;
        sun.rotation.y += 0.002;
    };
    return group;
};

// Chapter 2: Ravana's Ten Heads
const createRavana = () => {
    const group = new THREE.Group();
    const geometry = new THREE.ConeGeometry(0.8, 2, 4);
    const material = new THREE.MeshStandardMaterial({
        color: 0x440000,
        emissive: 0x110000,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    
    for(let i = 0; i < 10; i++) {
        const mask = new THREE.Mesh(geometry, material);
        const angle = (i / 10) * Math.PI * 2;
        mask.position.x = Math.cos(angle) * 2.5;
        mask.position.z = Math.sin(angle) * 2.5;
        mask.lookAt(0,0,0);
        group.add(mask);
    }
    
    group.userData.update = (time) => {
        group.rotation.y = time * 0.15;
        group.children.forEach((child, i) => {
            child.position.y = Math.sin(time * 2 + i) * 0.2;
        });
    };
    return group;
};

// Chapter 3: Yakshi
const createYakshi = () => {
    const group = new THREE.Group();
    
    const treeMat = new THREE.MeshStandardMaterial({ 
        color: 0x050a10, 
        roughness: 0.9,
        transparent: true,
        opacity: 1
    });
    
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 5, 8), treeMat);
    trunk.position.set(2, -1, -1);
    group.add(trunk);
    
    for(let i=0; i<6; i++) {
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.08, 2.5, 8), treeMat);
        branch.position.set(2, i * 0.6, -1);
        branch.rotation.z = (Math.random() - 0.5) * 2;
        branch.rotation.x = (Math.random() - 0.5) * 2;
        branch.position.x += Math.sin(branch.rotation.z) * 1.2;
        branch.position.y += Math.cos(branch.rotation.z) * 1.2;
        group.add(branch);
    }
    
    const mist = createParticles(600, 0x88bbff, 0.15);
    group.add(mist);
    
    group.userData.update = (time) => {
        mist.rotation.y = time * 0.03;
        const positions = mist.geometry.attributes.position.array;
        for(let i = 0; i < positions.length; i+=3) {
            positions[i] += Math.sin(time + positions[i+1]) * 0.001;
        }
        mist.geometry.attributes.position.needsUpdate = true;
    };
    return group;
};

// Chapter 4: Phoenix
const createPhoenix = () => {
    const group = new THREE.Group();
    const embers = createParticles(1000, 0xff5500, 0.05);
    
    const positions = embers.geometry.attributes.position.array;
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
    }
    group.add(embers);
    
    group.userData.update = (time) => {
        const positions = embers.geometry.attributes.position.array;
        for(let i=1; i<positions.length; i+=3) {
            positions[i] += 0.02 + Math.random() * 0.02; // rise
            positions[i-1] += Math.sin(time*2 + i) * 0.005; // flutter
            if(positions[i] > 5) {
                positions[i] = -5;
                let x = positions[i-1];
                if(Math.abs(x) > 1) {
                    positions[i] += Math.abs(x) * 0.6 - 2;
                }
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
        const vertices = water.geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            vertices[i + 2] = Math.sin(x * 2 + time * 2) * 0.15 + Math.cos(y * 2 + time * 1.5) * 0.15;
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


// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    if(heroGroup.visible) {
        heroGroup.rotation.x = time * 0.2;
        heroGroup.rotation.y = time * 0.3;
    }
    
    chapterGroups.forEach(group => {
        if(group.visible && group.userData.update) {
            group.userData.update(time);
        }
    });
    
    if(closingGroup.visible && closingGroup.userData.update) {
        closingGroup.userData.update(time);
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

// Helper for fading materials in a group
function fadeGroup(group, targetState, duration = 1) {
    console.log(`Fading group to state: ${targetState}`, group);
    if (targetState === 1) group.visible = true;
    
    group.traverse((child) => {
        if (child.isMesh || child.isPoints) {
            const mat = child.material;
            const targetOpacity = targetState === 1 ? mat.userData.originalOpacity : 0;
            gsap.to(mat, {
                opacity: targetOpacity,
                duration: duration,
                ease: "power2.inOut"
            });
        }
    });

    if (targetState === 0) {
        gsap.delayedCall(duration, () => {
            // Check if it should actually be hidden (in case scroll reversed quickly)
            let isZero = true;
            group.traverse(child => {
                if(child.isMesh || child.isPoints) {
                    if(child.material.opacity > 0.01) isZero = false;
                }
            });
            if(isZero) group.visible = false;
        });
    }
}

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

// 1. Hero Animations
heroGroup.traverse(c => {
    if(c.isMesh) c.material.userData.originalOpacity = 1;
});

ScrollTrigger.create({
    trigger: "#section-hero",
    start: "top top",
    end: "bottom 50%",
    onLeave: () => { fadeGroup(heroGroup, 0, 1); },
    onEnterBack: () => { fadeGroup(heroGroup, 1, 1); }
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
    
    // Scene Transitions
    ScrollTrigger.create({
        trigger: section,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () => {
            fadeGroup(group, 1, 1);
            gsap.to(proxyColor, {
                ambientR: targetAmbient.r, ambientG: targetAmbient.g, ambientB: targetAmbient.b,
                lightR: targetLight.r, lightG: targetLight.g, lightB: targetLight.b,
                fogR: targetFog.r, fogG: targetFog.g, fogB: targetFog.b,
                duration: 1.5,
                ease: "power2.inOut",
                onUpdate: updateColors
            });
        },
        onLeave: () => {
            fadeGroup(group, 0, 1);
        },
        onEnterBack: () => {
            fadeGroup(group, 1, 1);
            gsap.to(proxyColor, {
                ambientR: targetAmbient.r, ambientG: targetAmbient.g, ambientB: targetAmbient.b,
                lightR: targetLight.r, lightG: targetLight.g, lightB: targetLight.b,
                fogR: targetFog.r, fogG: targetFog.g, fogB: targetFog.b,
                duration: 1.5,
                ease: "power2.inOut",
                onUpdate: updateColors
            });
        },
        onLeaveBack: () => {
            fadeGroup(group, 0, 1);
        }
    });
    
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
ScrollTrigger.create({
    trigger: "#section-closing",
    start: "top 70%",
    onEnter: () => {
        fadeGroup(closingGroup, 1, 1.5);
        gsap.to(proxyColor, {
            ambientR: 0.05, ambientG: 0.05, ambientB: 0.08,
            lightR: 1, lightG: 1, lightB: 1,
            fogR: 0.02, fogG: 0.03, fogB: 0.05,
            duration: 2,
            ease: "power2.inOut",
            onUpdate: updateColors
        });
    },
    onLeaveBack: () => {
        fadeGroup(closingGroup, 0, 1);
    }
});

// Initial hero appearance
gsap.fromTo(".hero .content", 
    { opacity: 0, y: 30 }, 
    { opacity: 1, y: 0, duration: 1.5, ease: "power2.out", delay: 0.2 }
);
