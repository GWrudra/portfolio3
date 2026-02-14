// ============================================
// Ambient Sound System — Web Audio API
// Dynamic lo-fi synth with ups/downs & vibrato
// ============================================

class AmbientSoundEngine {
    constructor() {
        this.isPlaying = false;
        this.audioCtx = null;
        this.masterGain = null;
        this.oscillators = [];
        this.volume = 0.14;
        this.toggleBtn = document.getElementById('musicToggle');
        this.sweepInterval = null;
        this.init();
    }

    init() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
    }

    createAudioContext() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Master gain
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 0;
        this.masterGain.connect(this.audioCtx.destination);

        // Compressor to glue everything together
        const compressor = this.audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 4;
        compressor.connect(this.masterGain);

        // Main low-pass filter with slow sweep (ups & downs)
        this.filterNode = this.audioCtx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.value = 600;
        this.filterNode.Q.value = 2;
        this.filterNode.connect(compressor);

        // Slow filter LFO — creates the "breathing" ups & downs
        const filterLFO = this.audioCtx.createOscillator();
        filterLFO.type = 'sine';
        filterLFO.frequency.value = 0.08; // Very slow sweep
        const filterLFOGain = this.audioCtx.createGain();
        filterLFOGain.gain.value = 400; // Sweeps filter ±400Hz
        filterLFO.connect(filterLFOGain);
        filterLFOGain.connect(this.filterNode.frequency);
        filterLFO.start();

        // Volume tremolo LFO — gentle volume ups & downs
        const tremoloLFO = this.audioCtx.createOscillator();
        tremoloLFO.type = 'sine';
        tremoloLFO.frequency.value = 0.12; // Slow pulse
        const tremoloGain = this.audioCtx.createGain();
        tremoloGain.gain.value = 0.03; // Subtle volume swell
        tremoloLFO.connect(tremoloGain);
        tremoloGain.connect(this.masterGain.gain);
        tremoloLFO.start();

        // Delay for spaciousness
        const delay = this.audioCtx.createDelay();
        delay.delayTime.value = 0.45;
        const feedback = this.audioCtx.createGain();
        feedback.gain.value = 0.35;
        const delayFilter = this.audioCtx.createBiquadFilter();
        delayFilter.type = 'lowpass';
        delayFilter.frequency.value = 1000;
        this.filterNode.connect(delay);
        delay.connect(delayFilter);
        delayFilter.connect(feedback);
        feedback.connect(delay);
        delay.connect(compressor);

        // Second delay for depth
        const delay2 = this.audioCtx.createDelay();
        delay2.delayTime.value = 0.72;
        const feedback2 = this.audioCtx.createGain();
        feedback2.gain.value = 0.2;
        delay.connect(delay2);
        delay2.connect(feedback2);
        feedback2.connect(delay2);
        delay2.connect(compressor);

        // ---- CHORD OSCILLATORS with VIBRATO ----
        // Cmaj9 chord — dreamy & lush
        const chordFreqs = [
            { freq: 130.81, type: 'sine', vol: 0.18, vibRate: 4.5, vibDepth: 2.5 },  // C3
            { freq: 164.81, type: 'triangle', vol: 0.14, vibRate: 5.0, vibDepth: 3.0 },  // E3
            { freq: 196.00, type: 'sine', vol: 0.13, vibRate: 4.8, vibDepth: 2.0 },  // G3
            { freq: 246.94, type: 'triangle', vol: 0.10, vibRate: 5.2, vibDepth: 3.5 },  // B3
            { freq: 293.66, type: 'sine', vol: 0.07, vibRate: 5.5, vibDepth: 2.8 },  // D4 (the 9th)
            { freq: 261.63, type: 'sine', vol: 0.06, vibRate: 4.2, vibDepth: 2.2 },  // C4 octave
        ];

        chordFreqs.forEach((note) => {
            const osc = this.audioCtx.createOscillator();
            const oscGain = this.audioCtx.createGain();

            osc.type = note.type;
            osc.frequency.value = note.freq;

            // Slight random detune for stereo-like width
            osc.detune.value = (Math.random() - 0.5) * 15;

            // VIBRATO — pitch wobble on each note
            const vibrato = this.audioCtx.createOscillator();
            vibrato.type = 'sine';
            vibrato.frequency.value = note.vibRate; // ~4-6Hz vibrato speed
            const vibratoGain = this.audioCtx.createGain();
            vibratoGain.gain.value = note.vibDepth; // Depth in cents-ish
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            vibrato.start();

            oscGain.gain.value = note.vol;
            osc.connect(oscGain);
            oscGain.connect(this.filterNode);
            osc.start();

            this.oscillators.push({ osc, gain: oscGain, vibrato, vibratoGain });
        });

        // ---- SUB BASS with slow pitch drift ----
        const sub = this.audioCtx.createOscillator();
        sub.type = 'sine';
        sub.frequency.value = 65.41; // C2 sub bass
        const subGain = this.audioCtx.createGain();
        subGain.gain.value = 0.08;

        // Sub bass pitch drift for movement
        const subLFO = this.audioCtx.createOscillator();
        subLFO.type = 'sine';
        subLFO.frequency.value = 0.05;
        const subLFOGain = this.audioCtx.createGain();
        subLFOGain.gain.value = 1.5; // Very subtle pitch drift
        subLFO.connect(subLFOGain);
        subLFOGain.connect(sub.frequency);
        subLFO.start();

        sub.connect(subGain);
        subGain.connect(this.filterNode);
        sub.start();
        this.oscillators.push({ osc: sub, gain: subGain });

        // ---- WARM NOISE TEXTURE ----
        this.createNoise(compressor);

        // ---- PITCH SWEEP AUTOMATION (ups & downs over time) ----
        this.startPitchSweeps();
    }

    createNoise(destination) {
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Brown noise for warm texture
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        this.noiseNode = this.audioCtx.createBufferSource();
        this.noiseNode.buffer = noiseBuffer;
        this.noiseNode.loop = true;

        this.noiseGain = this.audioCtx.createGain();
        this.noiseGain.gain.value = 0.025;

        const noiseFilter = this.audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 400;
        noiseFilter.Q.value = 0.7;

        // Noise volume swell LFO
        const noiseLFO = this.audioCtx.createOscillator();
        noiseLFO.type = 'sine';
        noiseLFO.frequency.value = 0.06;
        const noiseLFOGain = this.audioCtx.createGain();
        noiseLFOGain.gain.value = 0.015;
        noiseLFO.connect(noiseLFOGain);
        noiseLFOGain.connect(this.noiseGain.gain);
        noiseLFO.start();

        this.noiseNode.connect(noiseFilter);
        noiseFilter.connect(this.noiseGain);
        this.noiseGain.connect(destination);
        this.noiseNode.start();
    }

    // Periodic pitch sweeps — creates evolving ups & downs
    startPitchSweeps() {
        const doSweep = () => {
            if (!this.isPlaying || !this.audioCtx) return;

            const now = this.audioCtx.currentTime;

            // Randomly sweep filter frequency up or down
            const targetFreq = 400 + Math.random() * 800; // 400-1200Hz
            const sweepDuration = 3 + Math.random() * 5;  // 3-8 seconds

            this.filterNode.frequency.cancelScheduledValues(now);
            this.filterNode.frequency.setValueAtTime(this.filterNode.frequency.value, now);
            this.filterNode.frequency.linearRampToValueAtTime(targetFreq, now + sweepDuration);

            // Also slightly shift the chord voicing
            this.oscillators.forEach((oscObj, i) => {
                if (oscObj.osc && i < 6) { // Only chord oscillators
                    const drift = (Math.random() - 0.5) * 4; // ±2 cents drift
                    oscObj.osc.detune.cancelScheduledValues(now);
                    oscObj.osc.detune.setValueAtTime(oscObj.osc.detune.value, now);
                    oscObj.osc.detune.linearRampToValueAtTime(drift, now + sweepDuration);
                }
            });

            // Gentle volume swell on random voices
            const randomIdx = Math.floor(Math.random() * Math.min(6, this.oscillators.length));
            const oscObj = this.oscillators[randomIdx];
            if (oscObj && oscObj.gain) {
                const baseVol = oscObj.gain.gain.value;
                const swell = baseVol * (1 + Math.random() * 0.5); // Up to 50% louder
                oscObj.gain.gain.cancelScheduledValues(now);
                oscObj.gain.gain.setValueAtTime(baseVol, now);
                oscObj.gain.gain.linearRampToValueAtTime(swell, now + sweepDuration * 0.4);
                oscObj.gain.gain.linearRampToValueAtTime(baseVol, now + sweepDuration);
            }
        };

        // Sweep every 4-8 seconds
        this.sweepInterval = setInterval(doSweep, 4000 + Math.random() * 4000);
        doSweep(); // Start immediately
    }

    stopPitchSweeps() {
        if (this.sweepInterval) {
            clearInterval(this.sweepInterval);
            this.sweepInterval = null;
        }
    }

    fadeIn() {
        if (!this.masterGain) return;
        const now = this.audioCtx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 2.5);
    }

    fadeOut() {
        if (!this.masterGain) return;
        const now = this.audioCtx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + 1.5);
    }

    toggle() {
        if (!this.isPlaying) {
            this.play();
        } else {
            this.pause();
        }
    }

    play() {
        if (!this.audioCtx) {
            this.createAudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        this.fadeIn();
        this.isPlaying = true;
        this.toggleBtn.classList.add('playing');
        if (!this.sweepInterval) this.startPitchSweeps();
    }

    pause() {
        this.fadeOut();
        this.isPlaying = false;
        this.toggleBtn.classList.remove('playing');
        this.stopPitchSweeps();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AmbientSoundEngine();
});
