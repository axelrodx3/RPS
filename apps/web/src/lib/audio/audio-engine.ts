export type SoundId =
  | "button"
  | "countdown"
  | "reveal"
  | "round_win"
  | "round_loss"
  | "round_tie"
  | "match_win"
  | "match_loss";

const FREQUENCIES: Record<SoundId, number[]> = {
  button: [520],
  countdown: [440, 520],
  reveal: [330, 440, 550],
  round_win: [440, 660],
  round_loss: [220, 180],
  round_tie: [350, 350],
  match_win: [440, 554, 659, 880],
  match_loss: [220, 196, 165],
};

export class AudioEngine {
  private context: AudioContext | null = null;
  private unlocked = false;

  ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.context) {
      const Ctx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;
      this.context = new Ctx();
    }
    return this.context;
  }

  unlock(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.unlocked) return;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    this.unlocked = true;
  }

  play(id: SoundId, volume: number, muted: boolean): void {
    if (muted || volume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const freqs = FREQUENCIES[id];
    const now = ctx.currentTime;
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + index * 0.07;
      const peak = Math.min(0.18, volume * 0.22);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.16);
    });
  }
}

export const audioEngine = new AudioEngine();
