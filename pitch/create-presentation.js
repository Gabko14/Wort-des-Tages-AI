// Run from ../pitch folder which has all dependencies installed
// Usage: cd ../pitch && node ../pitch-v2/create-presentation.js

const pptxgen = require('pptxgenjs');
const path = require('path');

// Path to html2pptx library
const html2pptx = require('/Users/gabko14/.claude/plugins/cache/anthropic-agent-skills/document-skills/69c0b1a06741/skills/pptx/scripts/html2pptx.js');

async function createPresentation() {
    const pptx = new pptxgen();

    // Set presentation properties
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = 'Wort des Tages AI - Gate 2 Pitch (v2)';
    pptx.author = 'Gabriel, Ayan, Raphael';
    pptx.subject = 'M241 LB3 Pitch für Stage Gate 2 - Version 2';

    // Use pitch-v2 slides directory
    const slidesDir = '/Users/gabko14/work/side-projects/Wort-des-Tages-AI/pitch-v2/slides';

    // Create all slides
    const slideFiles = [
        'slide00.html', // Titelfolie
        'slide01.html', // Das Problem
        'slide02.html', // Unsere Lösung
        'slide02b.html', // Unsere Lösung - Screenshot
        'slide03.html', // Warum es funktioniert
        'slide04.html', // Der Markt
        'slide05.html', // Die Mitbewerber
        'slide06.html', // Geschäftsmodell
        'slide07.html', // Die Umsetzung
        'slide08.html', // Finanzen
        'slide09.html', // Team
        'slide10.html', // Fazit
        'slide11.html', // Q&A
    ];

    for (let i = 0; i < slideFiles.length; i++) {
        const slidePath = path.join(slidesDir, slideFiles[i]);
        console.log(`Creating slide ${i}: ${slideFiles[i]}`);

        try {
            await html2pptx(slidePath, pptx);
        } catch (err) {
            console.error(`Error creating slide ${i}:`, err.message);
            throw err;
        }
    }

    // Save the presentation to pitch-v2 folder
    const outputPath = '/Users/gabko14/work/side-projects/Wort-des-Tages-AI/pitch-v2/Wort-des-Tages-AI-Pitch-v2.pptx';
    await pptx.writeFile({ fileName: outputPath });
    console.log(`\nPresentation saved to: ${outputPath}`);
}

createPresentation().catch(err => {
    console.error('Failed to create presentation:', err);
    process.exit(1);
});
