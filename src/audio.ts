/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundGenerator {
  private ctx: AudioContext | null = null;
  private backgroundNode: OscillatorNode | null = null;
  private backgroundGain: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private windNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private currentMelodyTimer: any = null;
  private chordTimer: any = null;
  public soundEnabled = true;
  public musicEnabled = true;
  public musicVolume = 70;
  public soundVolume = 85;

  setMusicVolume(vol: number) {
    this.musicVolume = vol;
    this.musicEnabled = vol > 0;
    if (this.backgroundGain && this.ctx) {
      this.backgroundGain.gain.setValueAtTime((vol / 100) * 0.05, this.ctx.currentTime);
    }
  }

  setSoundVolume(vol: number) {
    this.soundVolume = vol;
    this.soundEnabled = vol > 0;
  }

  constructor() {
    // Lazy initialize to bypass user gesture policy on browser start
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a procedurally generated soft melody chord
  startMusic(worldId?: string) {
    if (!this.musicEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    this.stopMusic();

    // Create a smooth chord progression node
    this.backgroundGain = this.ctx.createGain();
    this.backgroundGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    this.backgroundGain.connect(this.ctx.destination);

    // Dynamic Chords depending on the world
    let chords = [
      [130.81, 164.81, 196.00, 261.63], // C major (Sky Kingdom default)
      [146.83, 174.61, 220.00, 293.66], // D minor
      [164.81, 196.00, 246.94, 329.63], // E minor
      [174.61, 220.00, 261.63, 349.23], // F major
    ];

    let oscType: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'triangle';
    let melodyPitches = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // Peaceful pentatonic default
    let chordInterval = 8000;
    let melodyInterval = 2000;
    let cutoffFreq = 1000;

    if (worldId === 'cloud-city') {
      chords = [
        [174.61, 220.00, 261.63, 349.23], // F major
        [196.00, 246.94, 293.66, 392.00], // G major
        [220.00, 261.63, 329.63, 440.00], // A minor
        [174.61, 261.63, 349.23, 523.25], // F/C major
      ];
      oscType = 'sine';
      melodyPitches = [349.23, 392.00, 440.00, 523.25, 587.33, 698.46];
      chordInterval = 7000;
      melodyInterval = 1750;
    } else if (worldId === 'crystal-canyon') {
      chords = [
        [220.00, 261.63, 329.63, 440.00], // A minor
        [174.61, 220.00, 261.63, 349.23], // F major
        [196.00, 246.94, 293.66, 392.00], // G major
        [164.81, 196.00, 246.94, 329.63], // E minor
      ];
      oscType = 'sine';
      melodyPitches = [440.00, 523.25, 587.33, 659.25, 783.99, 880.00]; // High crystal bells
      chordInterval = 6500;
      melodyInterval = 1600;
      cutoffFreq = 2200;
    } else if (worldId === 'frozen-peak') {
      chords = [
        [261.63, 329.63, 392.00, 523.25], // C5 high pure
        [293.66, 349.23, 440.00, 587.33], // D5 high
        [329.63, 392.00, 493.88, 659.25], // E5 high
        [261.63, 349.23, 392.00, 523.25], // C/F high
      ];
      oscType = 'sine';
      melodyPitches = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // Frosty high notes
      chordInterval = 9500;
      melodyInterval = 2300;
      cutoffFreq = 1500;
    } else if (worldId === 'volcano-island') {
      chords = [
        [87.31, 110.00, 130.81, 174.61], // Low heavy rumbles
        [98.00, 116.54, 146.83, 196.00], 
        [110.00, 130.81, 164.81, 220.00], 
        [87.31, 116.54, 130.81, 174.61], 
      ];
      oscType = 'triangle';
      melodyPitches = [174.61, 196.00, 220.00, 261.63, 293.66, 349.23];
      chordInterval = 9000;
      melodyInterval = 2200;
      cutoffFreq = 450; // Muffly basalt cave sound
    } else if (worldId === 'storm-valley') {
      chords = [
        [146.83, 174.61, 220.00, 293.66], // Energetic D minor
        [164.81, 196.00, 246.94, 329.63], 
        [130.81, 155.56, 196.00, 261.63], // C minor friction
        [146.83, 174.61, 220.00, 293.66],
      ];
      oscType = 'sawtooth';
      melodyPitches = [293.66, 329.63, 349.23, 392.00, 440.00, 523.25];
      chordInterval = 5500;
      melodyInterval = 1300;
      cutoffFreq = 650;
    } else if (worldId === 'moon-realm') {
      chords = [
        [110.00, 146.83, 164.81, 220.00], // Lunar drone
        [130.81, 164.81, 196.00, 261.63], 
        [146.83, 174.61, 220.00, 293.66], 
        [98.00, 130.81, 146.83, 196.00],
      ];
      oscType = 'sine';
      melodyPitches = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00];
      chordInterval = 8500;
      melodyInterval = 2100;
      cutoffFreq = 800;
    } else if (worldId === 'sun-temple') {
      chords = [
        [196.00, 246.94, 293.66, 392.00], // G major radiant
        [220.00, 277.18, 329.63, 440.00], // A major
        [246.94, 311.13, 369.99, 493.88], // B major
        [196.00, 246.94, 293.66, 392.00],
      ];
      oscType = 'triangle';
      melodyPitches = [392.00, 440.00, 493.88, 587.33, 659.25, 783.99];
      chordInterval = 7500;
      melodyInterval = 1800;
      cutoffFreq = 1200;
    } else if (worldId === 'galaxy-sky') {
      chords = [
        [220.00, 293.66, 329.63, 440.00], // Deep space 4ths
        [261.63, 329.63, 392.00, 523.25], 
        [293.66, 349.23, 440.00, 587.33], 
        [220.00, 293.66, 329.63, 440.00],
      ];
      oscType = 'sine';
      melodyPitches = [440.00, 523.25, 587.33, 659.25, 783.99, 1046.50];
      chordInterval = 8000;
      melodyInterval = 1900;
      cutoffFreq = 1800;
    } else if (worldId === 'ancient-ruins') {
      chords = [
        [130.81, 138.59, 196.00, 261.63], // Phrygian mystery
        [146.83, 155.56, 220.00, 293.66], 
        [130.81, 138.59, 196.00, 261.63], 
        [110.00, 116.54, 164.81, 220.00],
      ];
      oscType = 'triangle';
      melodyPitches = [261.63, 277.18, 329.63, 349.23, 392.00, 440.00];
      chordInterval = 8500;
      melodyInterval = 2100;
      cutoffFreq = 700;
    }

    let chordIndex = 0;
    
    const playChord = () => {
      if (!this.ctx || !this.backgroundGain || !this.musicEnabled) return;
      const now = this.ctx.currentTime;
      const notes = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      notes.forEach((freq) => {
        if (!this.ctx || !this.backgroundGain) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gainNode = this.ctx.createGain();

        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoffFreq, now);

        // Smooth fade-in and fade-out for chord notes
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.025, now + 2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + chordInterval / 1000);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.backgroundGain);
        osc.start(now);
        osc.stop(now + chordInterval / 1000);
      });

      // Play soft high-pitched flute melody note inside chords
      let melodyCount = 0;
      const playMelodyNote = () => {
        if (!this.ctx || !this.backgroundGain || !this.musicEnabled) return;
        const mNow = this.ctx.currentTime;
        const pitch = melodyPitches[Math.floor(Math.random() * melodyPitches.length)];

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, mNow);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoffFreq * 1.5, mNow);

        gainNode.gain.setValueAtTime(0, mNow);
        gainNode.gain.linearRampToValueAtTime(0.012, mNow + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, mNow + 2.5);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.backgroundGain);

        osc.start(mNow);
        osc.stop(mNow + 2.5);

        melodyCount++;
        if (melodyCount < Math.floor(chordInterval / melodyInterval)) {
          this.currentMelodyTimer = setTimeout(playMelodyNote, melodyInterval);
        }
      };

      playMelodyNote();
    };

    playChord();
    this.chordTimer = setInterval(playChord, chordInterval);
  }

  stopMusic() {
    if (this.chordTimer) {
      clearInterval(this.chordTimer);
      this.chordTimer = null;
    }
    if (this.currentMelodyTimer) {
      clearTimeout(this.currentMelodyTimer);
      this.currentMelodyTimer = null;
    }
    if (this.backgroundGain) {
      try {
        this.backgroundGain.disconnect();
      } catch (e) {}
      this.backgroundGain = null;
    }
  }

  // SFX: Soft wing flap (low frequency swoosh)
  playFlap() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // SFX: Magical blue crystal collection (high-pitched bell chime combo)
  playCrystal(combo = 1) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    // Frequency escalates based on combo level
    const baseFreq = 880 + (combo - 1) * 110;

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now); // Sweet harmonic fifth

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  // SFX: Powerup collection (joyous ascending chime)
  playPowerup() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // SFX: Game Over (gently descending melancholic bells)
  playGameOver() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  // SFX: Dragon happy roar or sneeze (soft fire noise)
  playRoar() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);

    // Apply lowpass filtering to make it growly
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // SFX: Soft button tap pop
  playTap() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // SFX: Magic explosion chime
  playMagicExplosion() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const pitches = [523.25, 659.25, 783.99, 1046.50]; // Beautiful C Major chord arpeggio
    
    pitches.forEach((pitch, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now + idx * 0.06);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  }
}

export const audio = new SoundGenerator();
