// ============================================================
// AUDIO — fully procedural WebAudio ambience & SFX. Zero files.
// ============================================================
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
    this.bellTimer = 7;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    this.master.connect(this.ctx.destination);
    this._startWind();
    this._startRain();
  }

  setMuted(m) {
    this.muted = m;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05);
  }

  _noiseBuffer(seconds = 2) {
    const ctx = this.ctx, len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (0.75 + 0.25 * Math.sin(i * 0.001));
    return buf;
  }

  _startWind() {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer(4); src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 320; bp.Q.value = 0.55;
    const g = ctx.createGain(); g.gain.value = 0.16;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.09;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(); lfo.start();
    const lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.045;
    const lfo2Gain = ctx.createGain(); lfo2Gain.gain.value = 130;
    lfo2.connect(lfo2Gain); lfo2Gain.connect(bp.frequency);
    lfo2.start();
  }

  _startRain() {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer(3); src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6500;
    const g = ctx.createGain(); g.gain.value = 0.075;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain); lfoGain.connect(g.gain);
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.master);
    src.start(); lfo.start();
  }

  update(dt) {
    if (!this.ctx) return;
    this.bellTimer -= dt;
    if (this.bellTimer <= 0) { this.bellToll(); this.bellTimer = 42 + Math.random() * 34; }
  }

  _env(node, t0, a, peak, d, end = 0.0001) {
    node.gain.setValueAtTime(0.0001, t0);
    node.gain.linearRampToValueAtTime(peak, t0 + a);
    node.gain.exponentialRampToValueAtTime(end, t0 + a + d);
  }

  bellToll(freq = 98, vol = 0.75) {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const partials = [[1, 1], [2.02, 0.55], [2.74, 0.3], [3.36, 0.18], [4.07, 0.1]];
    for (const [m, amp] of partials) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq * m;
      const g = ctx.createGain();
      o.connect(g); g.connect(this.master);
      this._env(g, t0, 0.008, vol * amp * 0.5, 4.5 + m);
      o.start(t0); o.stop(t0 + 6);
    }
  }

  thunder() {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime + 0.25;
    const src = ctx.createBufferSource(); src.buffer = this._noiseBuffer(2.6);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(220, t0); lp.frequency.exponentialRampToValueAtTime(60, t0 + 2.3);
    const g = ctx.createGain();
    src.connect(lp); lp.connect(g); g.connect(this.master);
    this._env(g, t0, 0.05, 0.9, 2.4);
    src.start(t0);
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(52, t0); o.frequency.exponentialRampToValueAtTime(34, t0 + 2);
    const og = ctx.createGain(); o.connect(og); og.connect(this.master);
    this._env(og, t0, 0.05, 0.5, 2.1);
    o.start(t0); o.stop(t0 + 2.4);
  }

  footstep(kind = 'wood', volume = 0.32) {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = this._noiseBuffer(0.09);
    const f = ctx.createBiquadFilter();
    if (kind === 'gravel') { f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.8; }
    else if (kind === 'marble') { f.type = 'bandpass'; f.frequency.value = 1250; f.Q.value = 2.2; }
    else if (kind === 'carpet') { f.type = 'lowpass'; f.frequency.value = 420; }
    else { f.type = 'bandpass'; f.frequency.value = 720; f.Q.value = 1.1; }
    const g = ctx.createGain();
    src.connect(f); f.connect(g); g.connect(this.master);
    this._env(g, t0, 0.004, volume, kind === 'gravel' ? 0.09 : 0.07);
    src.start(t0);
    if (kind === 'wood' && Math.random() < 0.3) {  // floorboard creak
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(96 + Math.random() * 60, t0 + 0.02);
      o.frequency.exponentialRampToValueAtTime(70, t0 + 0.34);
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 640; bp.Q.value = 4;
      const og = ctx.createGain();
      o.connect(bp); bp.connect(og); og.connect(this.master);
      this._env(og, t0 + 0.02, 0.01, 0.05, 0.32);
      o.start(t0 + 0.02); o.stop(t0 + 0.4);
    }
  }

  doorOpen(heavy = false) {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(heavy ? 62 : 88, t0);
    o.frequency.exponentialRampToValueAtTime(heavy ? 41 : 60, t0 + 0.85);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(760, t0 + 0.85); bp.Q.value = 3.2;
    const g = ctx.createGain(); o.connect(bp); bp.connect(g); g.connect(this.master);
    this._env(g, t0, 0.03, heavy ? 0.32 : 0.2, 0.85);
    o.start(t0); o.stop(t0 + 1);
    // latch click at the end
    const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = 240;
    const g2 = ctx.createGain(); o2.connect(g2); g2.connect(this.master);
    this._env(g2, t0 + 0.82, 0.004, 0.12, 0.06);
    o2.start(t0 + 0.82); o2.stop(t0 + 0.95);
  }

  doorClose() {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(74, t0); o.frequency.exponentialRampToValueAtTime(44, t0 + 0.22);
    const g = ctx.createGain(); o.connect(g); g.connect(this.master);
    this._env(g, t0, 0.005, 0.55, 0.3);
    o.start(t0); o.stop(t0 + 0.35);
  }

  metalClick() {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    for (const [f, a] of [[1850, .16], [2650, .12]]) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); o.connect(g); g.connect(this.master);
      this._env(g, t0, 0.002, a, 0.18);
      o.start(t0); o.stop(t0 + 0.25);
    }
  }

  rumble() {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 42;
    const g = ctx.createGain(); o.connect(g); g.connect(this.master);
    this._env(g, t0, 0.02, 0.6, 1.35);
    o.start(t0); o.stop(t0 + 1.5);
  }

  sealChime() {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const notes = [523.25, 659.25, 880.0, 1046.5];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); o.connect(g); g.connect(this.master);
      this._env(g, t0 + i * 0.22, 0.008, 0.34, 1.6);
      o.start(t0 + i * 0.22); o.stop(t0 + i * 0.22 + 2);
    });
  }

  ui() {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 660;
    const g = ctx.createGain(); o.connect(g); g.connect(this.master);
    this._env(g, t0, 0.003, 0.09, 0.08);
    o.start(t0); o.stop(t0 + 0.12);
  }

  journal() {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = this._noiseBuffer(0.35);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.7;
    bp.frequency.setValueAtTime(900, t0); bp.frequency.exponentialRampToValueAtTime(2400, t0 + 0.3);
    const g = ctx.createGain(); src.connect(bp); bp.connect(g); g.connect(this.master);
    this._env(g, t0, 0.02, 0.12, 0.33);
    src.start(t0);
  }

  musicBox() {  // melancholic phrase — Morvex territory
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const seq = [[659.25, 0], [783.99, .32], [987.77, .64], [1046.5, 1.1], [987.77, 1.55], [783.99, 1.9], [659.25, 2.3]];
    for (const [f, off] of seq) {
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 3.01;
      const g = ctx.createGain(), g2 = ctx.createGain();
      o.connect(g); g.connect(this.master); o2.connect(g2); g2.connect(this.master);
      this._env(g, t0 + off, 0.005, 0.16, 0.9);
      this._env(g2, t0 + off, 0.005, 0.045, 0.5);
      o.start(t0 + off); o.stop(t0 + off + 1.1);
      o2.start(t0 + off); o2.stop(t0 + off + 0.6);
    }
  }

  whisper() {  // Vorak territory
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = this._noiseBuffer(1.8);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 6;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 3.4;
    const lfoG = ctx.createGain(); lfoG.gain.value = 260;
    lfo.connect(lfoG); lfoG.connect(bp.frequency);
    const g = ctx.createGain(); src.connect(bp); bp.connect(g); g.connect(this.master);
    this._env(g, t0, 0.3, 0.055, 1.5);
    src.start(t0); src.stop(t0 + 2);
    lfo.start(t0); lfo.stop(t0 + 2);
  }

  boilerPower() {
    if (!this.ctx) return;
    const ctx = this.ctx, t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(48, t0); o.frequency.linearRampToValueAtTime(96, t0 + 1.1);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(160, t0); lp.frequency.linearRampToValueAtTime(900, t0 + 1.1);
    const g = ctx.createGain(); o.connect(lp); lp.connect(g); g.connect(this.master);
    this._env(g, t0, 0.08, 0.3, 1.5);
    o.start(t0); o.stop(t0 + 1.7);
    this.metalClick();
  }
}

export const audio = new AudioEngine();
