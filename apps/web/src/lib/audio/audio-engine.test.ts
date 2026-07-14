/** @vitest-environment happy-dom */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { audioEngine } from "@/lib/audio/audio-engine";
import { SOUND_REGISTRY } from "@/lib/audio/sound-registry";

const levels = {
  masterVolume: 1,
  sfxVolume: 1,
  musicVolume: 1,
  masterMuted: false,
  sfxMuted: false,
  musicMuted: false,
};

describe("audioEngine custom assets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(
      undefined,
    );
  });

  afterEach(() => {
    audioEngine.stopAll();
    vi.restoreAllMocks();
  });

  it("registers custom file paths for wired sounds", () => {
    expect(SOUND_REGISTRY.button.src).toBe("/assets/audio/ui-click.mp3");
    expect(SOUND_REGISTRY.countdown_warning.src).toBe(
      "/assets/audio/countdown-warning.mp3",
    );
    expect(SOUND_REGISTRY.match_win.src).toBe(
      "/assets/audio/match-victory.mp3",
    );
    expect(SOUND_REGISTRY.match_loss.src).toBe(
      "/assets/audio/match-defeat.mp3",
    );
    expect(SOUND_REGISTRY.notification.src).toBe(
      "/assets/audio/notification.mp3",
    );
  });

  it("uses generated tones for move lock and opening countdown", () => {
    expect(SOUND_REGISTRY.move_locked.src).toBeUndefined();
    expect(SOUND_REGISTRY.move_locked.frequencies?.length).toBeGreaterThan(0);
    expect(SOUND_REGISTRY.countdown.frequencies?.length).toBeGreaterThan(0);
  });

  it("does not register the old target lock asset as active", () => {
    expect(SOUND_REGISTRY.move_locked.src).not.toBe(
      "/assets/audio/move-lock.mp3",
    );
  });

  it("plays file based UI click sounds", () => {
    audioEngine.play("button", levels);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("plays generated move lock tones without file playback", () => {
    const start = vi.fn();
    const stop = vi.fn();
    const connect = vi.fn();
    const gain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect,
    };
    const osc = {
      type: "sine",
      frequency: { value: 0 },
      connect,
      start,
      stop,
      onended: null as (() => void) | null,
    };

    vi.spyOn(audioEngine, "ensureContext").mockReturnValue({
      state: "running",
      currentTime: 0,
      createOscillator: vi.fn(() => osc),
      createGain: vi.fn(() => gain),
      destination: {},
    } as unknown as AudioContext);

    audioEngine.play("move_locked", levels);
    audioEngine.play("move_locked", levels);
    expect(start).toHaveBeenCalledTimes(2);
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("respects mute settings", () => {
    audioEngine.play("button", { ...levels, masterMuted: true });
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("scales playback with volume settings", () => {
    audioEngine.play("countdown_warning", { ...levels, sfxVolume: 0.5 });
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("plays match victory and defeat only through dedicated ids", () => {
    audioEngine.play("match_win", levels);
    audioEngine.play("match_loss", levels);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(SOUND_REGISTRY.round_win.enabled).toBe(false);
    expect(SOUND_REGISTRY.round_loss.enabled).toBe(false);
  });
});
