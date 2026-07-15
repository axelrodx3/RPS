/** @vitest-environment happy-dom */

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { usePracticeHoverSound } from "@/lib/audio/use-practice-hover-sound";
import { audioEngine } from "@/lib/audio/audio-engine";
import { AppProviders } from "@/providers/AppProviders";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}

describe("usePracticeHoverSound", () => {
  beforeEach(() => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("hover: hover"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.spyOn(audioEngine, "play").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("plays the practice hover asset instead of ui_hover", () => {
    const { result } = renderHook(() => usePracticeHoverSound(false), {
      wrapper,
    });

    result.current({
      pointerType: "mouse",
    } as React.PointerEvent<HTMLElement>);

    expect(audioEngine.play).toHaveBeenCalledWith(
      "practice_hover",
      expect.any(Object),
    );
    expect(audioEngine.play).not.toHaveBeenCalledWith(
      "ui_hover",
      expect.any(Object),
    );
  });
});
