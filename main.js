import './style.css';
import { WebHaptics } from 'web-haptics';
import footstepAudioUrl from './assets/footstep.ogg';
const haptics = new WebHaptics();

// --- 1. UI Animations & Smooth Scroll ---

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Connect Lenis to GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// GSAP Animations

// Initial load animation
const tlLoad = gsap.timeline();
tlLoad.from('.hero h1 .char', {
    y: 100,
    opacity: 0,
    rotationZ: 10,
    duration: 1,
    stagger: 0.1,
    ease: "power4.out"
})
    .from('.hero-subtitle', { y: 20, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.6')
    .from('.scroll-indicator', { opacity: 0, duration: 1 }, '-=0.4');

// Background parallax scrolling
gsap.to('.row-1', {
    x: '-10%',
    ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
});
gsap.to('.row-2', {
    x: '10%',
    ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
});
gsap.to('.row-3', {
    x: '-15%',
    ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
});
gsap.to('.row-4', {
    x: '5%',
    ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1 }
});

// Removed panel reveal animation because it conflicts with CSS rotate transforms and causes mobile scrolling jank
// --- 2. Core Logic ---

const ghosts = [
    { name: "Banshee", speeds: [1.7] },
    { name: "Dayan", speeds: [1.2, 1.7, 2.25], conditional: true },
    { name: "Demon", speeds: [1.7] },
    { name: "Deogen", speeds: [0.4, 3.0], conditional: true },
    { name: "Gallu", speeds: [1.36, 1.7, 1.96], conditional: true },
    { name: "Goryo", speeds: [1.7] },
    { name: "Hantu", speeds: [1.4, 2.7], conditional: true },
    { name: "Jinn", speeds: [1.7, 2.5], conditional: true },
    { name: "Mare", speeds: [1.7] },
    { name: "Moroi", speeds: [1.5, 2.25], conditional: true },
    { name: "Myling", speeds: [1.7] },
    { name: "Obake", speeds: [1.7] },
    { name: "Obambo", speeds: [1.45, 1.96], conditional: true },
    { name: "Oni", speeds: [1.7] },
    { name: "Onryo", speeds: [1.7] },
    { name: "Phantom", speeds: [1.7, 2.5], conditional: true },
    { name: "Revenant", speeds: [1.0, 3.0], conditional: true },
    { name: "Shade", speeds: [1.7] },
    { name: "Spirit", speeds: [1.7] },
    { name: "Thaye", speeds: [1.0, 2.75], conditional: true },
    { name: "The Mimic", speeds: [1.7] },
    { name: "The Twins", speeds: [1.5, 1.9], conditional: true },
    { name: "Wraith", speeds: [1.7] },
    { name: "Yokai", speeds: [1.7] },
    { name: "Yurei", speeds: [1.7] }
];

let taps = [];
const modifiers = [0.5, 0.75, 1.0, 1.25, 1.5];

function getModifier() {
    return modifiers[document.getElementById("speedModifier").value];
}

function bpmToSpeed(bpm) {
    const mod = getModifier();
    return bpm / (mod * (60 + bpm * 0.095));
}

function speedToBpm(speed) {
    const mod = getModifier();
    const C = 0.095;
    return (speed * mod * 60) / (1 - speed * mod * C);
}

function animateValueUpdate(elementId) {
    const el = document.getElementById(elementId);
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 300);
}

function updateGhostFilter(estimatedBaseSpeed) {
    const mod = getModifier();
    const estimatedActual = estimatedBaseSpeed * mod;
    const container = document.getElementById('ghost-list');
    container.innerHTML = '';

    const possibleGhosts = ghosts.filter(ghost => {
        return ghost.speeds.some(base => {
            const actual = base * mod;
            return Math.abs(actual - estimatedActual) <= 0.175;
        });
    });

    if (possibleGhosts.length === 0) {
        container.innerHTML = '<div class="helper-text" style="text-align: center; margin-bottom: 0;">No ghosts match this speed.</div>';
        return;
    }

    possibleGhosts.forEach(ghost => {
        const el = document.createElement('div');
        el.className = 'ghost-item';

        // Format speeds relative to modifier
        const speedStrs = ghost.speeds.map(s => (s * mod).toFixed(2) + 'm/s').join(', ');
        let speedText = `<span class="ghost-speeds">${speedStrs}</span>`;
        if (ghost.conditional) {
            speedText += ' <span class="ghost-conditional" title="Depending on situation">*</span>';
        }

        el.innerHTML = `
            <span class="ghost-name">${ghost.name}</span>
            <div class="ghost-speed-wrap">${speedText}</div>
        `;
        container.appendChild(el);
    });
}

function tap() {
    haptics.trigger('nudge');

    const now = Date.now();
    taps.push(now);

    // Button visual feedback
    const tapBtn = document.getElementById('tap');
    gsap.fromTo(tapBtn, { scale: 0.95 }, { scale: 1, duration: 0.2, ease: "back.out(2)" });

    if (taps.length > 20) taps.shift();

    if (taps.length >= 2) {
        let intervals = [];
        for (let i = 1; i < taps.length; i++) {
            intervals.push(taps[i] - taps[i - 1]);
        }

        let avg = intervals.reduce((a, b) => a + b) / intervals.length;
        let bpm = 60000 / avg;
        let speed = bpmToSpeed(bpm);

        document.getElementById("bpm").innerText = bpm.toFixed(1);
        document.getElementById("speed").innerText = speed.toFixed(2);

        animateValueUpdate('bpm');
        animateValueUpdate('speed');

        updateGhostFilter(speed);
    }
}

document.getElementById("tap").onclick = tap;

document.addEventListener("keydown", e => {
    if (e.code === "Space" && e.target.tagName !== 'INPUT') {
        e.preventDefault(); // Prevent page scroll when tapping
        tap();
    }
});

document.getElementById("speedModifier").addEventListener("change", () => {
    if (taps.length >= 2) {
        let intervals = [];
        for (let i = 1; i < taps.length; i++) {
            intervals.push(taps[i] - taps[i - 1]);
        }
        let avg = intervals.reduce((a, b) => a + b) / intervals.length;
        let bpm = 60000 / avg;
        let speed = bpmToSpeed(bpm);

        document.getElementById("speed").innerText = speed.toFixed(2);
        animateValueUpdate('speed');
        updateGhostFilter(speed);
    }
});

document.getElementById("reset").onclick = () => {
    taps = [];
    document.getElementById("bpm").innerText = "0";
    document.getElementById("speed").innerText = "0";
    document.getElementById("ghost-list").innerHTML = '<div class="helper-text" style="text-align: center; margin-bottom: 0;">Tap to calculate BPM and filter ghosts.</div>';

    // GSAP feedback
    const resetBtn = document.getElementById('reset');
    gsap.fromTo(resetBtn, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "power2.out" });
};

// Simulator
let audioCtx = null;
let audioBuffer = null;

// Initialize Web Audio API to preload zero-latency audio for mobile
async function initAudio() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        audioCtx = new AudioContext();
        const response = await fetch(footstepAudioUrl);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error("Failed to load or decode audio asset:", e);
    }
}
initAudio();

function playStep() {
    if (!audioCtx || !audioBuffer) return;

    // Resume context if suspended (common on mobile browsers before first interaction)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(e => console.log(e));
    }

    try {
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start(0);
    } catch (e) {
        console.log("Audio playback requires user interaction first, or asset is missing.");
    }
}

let stepTimer = null;
let isSimulating = false;
let currentInterval = 1000;
const simulatorSection = document.getElementById('simulator-section');

function loop() {
    if (!isSimulating) return;
    playStep();
    stepTimer = setTimeout(loop, currentInterval);
}

function simulate(speed) {
    const bpm = speedToBpm(speed);
    currentInterval = 60000 / bpm;

    if (isSimulating) return;

    isSimulating = true;
    simulatorSection.classList.add('is-simulating');

    clearTimeout(stepTimer);
    loop();
}

function stopSimulation() {
    isSimulating = false;
    clearTimeout(stepTimer);
    simulatorSection.classList.remove('is-simulating');
}

document.getElementById("simulate").onclick = () => {
    let speed = parseFloat(document.getElementById("simSpeed").value);
    if (speed > 0) {
        simulate(speed);
    }

    const simBtn = document.getElementById('simulate');
    gsap.fromTo(simBtn, { scale: 0.95 }, { scale: 1, duration: 0.2, ease: "back.out(2)" });
};

document.getElementById("stop").onclick = () => {
    stopSimulation();
    const stopBtn = document.getElementById('stop');
    gsap.fromTo(stopBtn, { scale: 0.95 }, { scale: 1, duration: 0.2, ease: "back.out(2)" });
};

// Stop simulation if target speed is edited while running
document.getElementById("simSpeed").addEventListener("input", () => {
    if (isSimulating) {
        stopSimulation();
    }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
