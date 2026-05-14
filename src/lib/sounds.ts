// Lightweight WebAudio "sound effect" helpers — no asset files needed.
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(freq: number, durationMs: number, type: OscillatorType = "sine", gain = 0.08) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(c.destination);
  const now = c.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

export function playLikeSound() {
  tone(660, 90, "triangle", 0.1);
  setTimeout(() => tone(990, 120, "triangle", 0.1), 70);
}

export function playCommentSound() {
  tone(520, 70, "sine", 0.08);
  setTimeout(() => tone(720, 90, "sine", 0.08), 60);
}

export function playPopSound() {
  tone(400, 60, "square", 0.05);
}
