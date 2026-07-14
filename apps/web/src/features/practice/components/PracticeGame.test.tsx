/** @vitest-environment happy-dom */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { PracticeGame } from "@/features/practice/components/PracticeGame";
import { renderWithProviders } from "@/test/render";

describe("PracticeGame", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts a playable match from the intro card", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);

    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );

    expect(screen.getByText("Get ready")).toBeInTheDocument();
    expect(screen.getByLabelText("Match scoreboard")).toBeInTheDocument();
  });

  it("shows move buttons during commit phase", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithProviders(<PracticeGame />);

    await user.click(
      screen.getByRole("button", { name: "Start Practice Match" }),
    );
    await vi.advanceTimersByTimeAsync(3000);

    expect(screen.getByRole("button", { name: "Choose Rock" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Choose Paper" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Choose Scissors" }),
    ).toBeEnabled();
  });
});
