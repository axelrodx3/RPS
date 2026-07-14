import { SOUND_REGISTRY, type SoundId } from "@/lib/audio/sound-registry";

export type AudioLevels = {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  masterMuted: boolean;
  sfxMuted: boolean;
  musicMuted: boolean;
};

const activeOscillators = new Set<OscillatorNode>();
const activeElements = new Set<HTMLAudioElement>();

export class AudioEngine {
  private context: AudioContext | null = null;
  private unlocked = false;
  private lastPlayed = new Map<SoundId, number>();
  private readonly minGapMs = 40;

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

  stopAll(): void {
    for (const osc of activeOscillators) {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    }
    activeOscillators.clear();

    for (const element of activeElements) {
      element.pause();
      element.currentTime = 0;
    }
    activeElements.clear();
  }

  private resolveVolume(id: SoundId, levels: AudioLevels): number {
    if (levels.masterMuted) return 0;
    const def = SOUND_REGISTRY[id];
    if (!def.enabled) return 0;
    if (def.category === "music") {
      if (levels.musicMuted) return 0;
      return levels.masterVolume * levels.musicVolume * (def.volumeScale ?? 1);
    }
    if (levels.sfxMuted) return 0;
    return levels.masterVolume * levels.sfxVolume * (def.volumeScale ?? 1);
  }

  private playTone(id: SoundId, frequencies: number[], volume: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + index * 0.07;
      const peak = Math.min(0.18, volume * 0.22);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      activeOscillators.add(osc);
      osc.onended = () => activeOscillators.delete(osc);
      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  private playFile(src: string, volume: number): void {
    const element = new Audio(src);
    element.volume = Math.min(1, Math.max(0, volume));
    activeElements.add(element);
    element.onended = () => activeElements.delete(element);
    void element.play().catch(() => {
      activeElements.delete(element);
    });
  }

  play(id: SoundId, levels: AudioLevels): void {
    const def = SOUND_REGISTRY[id];
    const volume = this.resolveVolume(id, levels);
    if (volume <= 0) return;

    const nowMs = Date.now();
    const last = this.lastPlayed.get(id) ?? 0;
    if (nowMs - last < this.minGapMs) return;
    this.lastPlayed.set(id, nowMs);

    if (def.src) {
      this.playFile(def.src, volume);
      return;
    }

    if (def.frequencies?.length) {
      this.playTone(id, def.frequencies, volume);
    }
  }
}

export const audioEngine = new AudioEngine();
