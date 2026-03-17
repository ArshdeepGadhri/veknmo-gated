# Veknmo: Phasmophobia Ghost Speed Tool

Veknmo is a beautiful, performant tool built for identifying and simulating ghost speeds in the game **Phasmophobia**. Built as a Progressive Web App (PWA) with Vite, it combines utility with an immersive, spooky horror aesthetic. You can find a live working version of the tool [here](https://veknmo.vercel.app/).

## Features

### 🎧 BPM Analyzer
Accurately determine the ghost's speed by tapping along to its footsteps.
1. Select the relevant **Ghost Speed Modifier** based on your custom difficulty settings.
2. Listen to the ghost walk during a hunt and tap the <kbd>Space</kbd> bar (or click the 'Tap' button) in rhythm with its footsteps. Experience haptic feedback with each tap on supported mobile devices!
3. The tool instantly calculates the footstep BPM (Beats Per Minute) and outputs the corresponding **Estimated Speed** in meters per second (m/s).

### 🏃‍♂️ Footstep Simulator
Familiarize yourself with what different ghost speeds sound like.
* Input a target speed in m/s (e.g., standard 100% ghost speed is 1.7 m/s).
* Click **Start Simulation** to play a looping audio file replicating the footstep rhythm at that exact speed.

### 📱 Progressive Web App (PWA)
* Install Veknmo directly to your home screen for quick access.
* Includes web-haptics integration for physical feedback when analyzing ghost speed.

## Technology Stack

This tool emphasizes performance, immersion, and modern web standards:
*   **Vite:** Lightning-fast local development server and optimized production builds.
*   **Vanilla JavaScript:** Core logic for math, interval timing, and audio playback. No heavy frontend frameworks.
*   **Web Haptics API:** Provides physical vibration feedback on supported mobile devices.
*   **GSAP (GreenSock):** Powers smooth reveal animations, dynamic UI feedback, and continuous parallax background text.
*   **Lenis:** Provides butter-smooth, momentum-based scrolling.
*   **Phasmophobia-inspired UI:** A custom spooky aesthetic featuring dark, desaturated tones, ghostly cyan and blood-red accents, grunge texture overlays, and subtle flickering glow effects.

## Local Development

1. Clone the repository and navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

> **Note on Audio:** For the Footstep Simulator to function, ensure you have a `footstep.ogg` audio file located in the `assets/` directory. 
