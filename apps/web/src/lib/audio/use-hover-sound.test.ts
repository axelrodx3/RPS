/** @vitest-environment happy-dom */

import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  canPlayPointerHover,
  useHoverSound,
} from "@/lib/audio/use-hover-sound";

const play = vi.fn();
const unlock = vi.fn();

vi.mock("@/providers/AudioProvider", () => ({
  useAudio: () => ({ play, unlock }),
}));

function pointerEnter(pointerType: string) {
  return {
    pointerType,
  } as React.PointerEvent<HTMLElement>;
}

describe("useHoverSound", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("plays ui_hover once on mouse pointer entry", () => {
    const { result } = renderHook(() => useHoverSound(false));

    act(() => {
      result.current(pointerEnter("mouse"));
    });

    expect(unlock).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledWith("ui_hover");
  });

  it("does not play on disabled controls", () => {
    const { result } = renderHook(() => useHoverSound(true));

    act(() => {
      result.current(pointerEnter("mouse"));
    });

    expect(play).not.toHaveBeenCalled();
  });

  it("does not play on touch pointer interaction", () => {
    const { result } = renderHook(() => useHoverSound(false));

    act(() => {
      result.current(pointerEnter("touch"));
    });

    expect(play).not.toHaveBeenCalled();
  });

  it("does not play when the device lacks fine pointer hover", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(() => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useHoverSound(false));

    act(() => {
      result.current(pointerEnter("mouse"));
    });

    expect(play).not.toHaveBeenCalled();
  });

  it("reports hover capability from matchMedia", () => {
    expect(canPlayPointerHover()).toBe(true);
  });
});
