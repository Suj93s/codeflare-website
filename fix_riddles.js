const fs = require('fs');
let code = fs.readFileSync('main.js', 'utf8');

const replacement = `const chaptersData = [
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
    section.id = \`section-\${chapter.id}\`;
    
    const content = document.createElement('div');
    content.className = 'chapter-content';
    content.style.setProperty('--theme-color', chapter.themeColor);
    
    content.innerHTML = \`
        <div class="chapter-number">\${chapter.number}</div>
        <h2 class="chapter-title">\${chapter.title}</h2>
        <p class="chapter-text">\${chapter.text}</p>
        <div class="chapter-riddle">
            <p class="riddle-q">\${chapter.riddle}</p>
            <div class="riddle-options">
                <button onclick="revealReply(this)">\${chapter.options[0]}</button>
                <button onclick="revealReply(this)">\${chapter.options[1]}</button>
            </div>
            <p class="riddle-reply">\${chapter.reply}</p>
        </div>
    \`;
    
    section.appendChild(content);
    chaptersContainer.appendChild(section);
});`;

// We want to replace from "const chaptersData = [" up to the end of "chaptersContainer.appendChild(section);\n});"
const startIndex = code.indexOf('const chaptersData = [');
const endIndex = code.indexOf('chaptersContainer.appendChild(section);\n});') + 'chaptersContainer.appendChild(section);\n});'.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find slice boundaries.");
    process.exit(1);
}

const newCode = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('main.js', newCode);
console.log("Updated main.js with riddles");
