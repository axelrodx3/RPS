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
    expect(SOUND_REGISTRY.countdown_warning.enabled).toBe(false);
    expect(SOUND_REGISTRY.selection_countdown_tick.frequencies?.length).toBe(1);
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

  it("uses generated tones for opening countdown", () => {
    expect(SOUND_REGISTRY.countdown.frequencies?.length).toBeGreaterThan(0);
  });

  it("registers practice move lock and reveal impact assets", () => {
    expect(SOUND_REGISTRY.move_lock_rock.src).toBe(
      "/assets/audio/move-lock-rock.mp3",
    );
    expect(SOUND_REGISTRY.move_lock_paper.src).toBe(
      "/assets/audio/move-lock-paper.mp3",
    );
    expect(SOUND_REGISTRY.move_lock_scissors.src).toBe(
      "/assets/audio/move-lock-scissors.mp3",
    );
    expect(SOUND_REGISTRY.reveal.src).toBe("/assets/audio/reveal-impact.mp3");
    expect(SOUND_REGISTRY.round_tie.src).toBe("/assets/audio/round-tie.mp3");
    expect(SOUND_REGISTRY.practice_hover.src).toBe(
      "/assets/audio/practice-hover.mp3",
    );
  });

  it("plays file based UI click sounds", () => {
    audioEngine.play("button", levels);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("plays move lock file assets", () => {
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

    audioEngine.play("move_lock_rock", levels);
    audioEngine.play("move_lock_rock", levels);
    expect(start).toHaveBeenCalledTimes(0);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it("respects mute settings", () => {
    audioEngine.play("button", { ...levels, masterMuted: true });
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("registers generated phase transition cues", () => {
    expect(SOUND_REGISTRY.waiting_cpu.frequencies?.length).toBeGreaterThan(0);
    expect(SOUND_REGISTRY.reveal_incoming.frequencies?.length).toBeGreaterThan(
      0,
    );
  });

  it("scales generated selection countdown ticks with volume settings", () => {
    const start = vi.fn();
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
      stop: vi.fn(),
      onended: null as (() => void) | null,
    };

    vi.spyOn(audioEngine, "ensureContext").mockReturnValue({
      state: "running",
      currentTime: 0,
      createOscillator: vi.fn(() => osc),
      createGain: vi.fn(() => gain),
      destination: {},
    } as unknown as AudioContext);

    audioEngine.play("selection_countdown_tick", { ...levels, sfxVolume: 0.5 });
    expect(start).toHaveBeenCalled();
  });

  it("plays match victory and defeat only through dedicated ids", () => {
    audioEngine.play("match_win", levels);
    audioEngine.play("match_loss", levels);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
    expect(SOUND_REGISTRY.round_win.enabled).toBe(true);
    expect(SOUND_REGISTRY.round_loss.enabled).toBe(true);
    expect(SOUND_REGISTRY.reveal.enabled).toBe(true);
  });

  it("plays generated ui hover tones quieter than button clicks", () => {
    expect(SOUND_REGISTRY.ui_hover.frequencies?.length).toBeGreaterThan(0);
    expect(SOUND_REGISTRY.ui_hover.volumeScale).toBeLessThan(
      SOUND_REGISTRY.button.volumeScale ?? 1,
    );

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

    audioEngine.play("ui_hover", levels);
    expect(start).toHaveBeenCalledTimes(1);
    expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("debounces rapid ui hover playback", () => {
    let time = Date.now() + 1_000;
    vi.spyOn(Date, "now").mockImplementation(() => time);

    const start = vi.fn();
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
      stop: vi.fn(),
      onended: null as (() => void) | null,
    };

    vi.spyOn(audioEngine, "ensureContext").mockReturnValue({
      state: "running",
      currentTime: 0,
      createOscillator: vi.fn(() => osc),
      createGain: vi.fn(() => gain),
      destination: {},
    } as unknown as AudioContext);

    audioEngine.play("ui_hover", levels);
    time += 50;
    audioEngine.play("ui_hover", levels);
    expect(start).toHaveBeenCalledTimes(1);

    time += 100;
    audioEngine.play("ui_hover", levels);
    expect(start).toHaveBeenCalledTimes(2);
  });
});
