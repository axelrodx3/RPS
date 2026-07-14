/** @vitest-environment happy-dom */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AudioControl } from "@/components/AudioControl";
import { renderWithProviders } from "@/test/render";

describe("AudioControl", () => {
  it("toggles mute from the audio panel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AudioControl />);

    const muteSwitch = screen.getByRole("switch", { name: "Mute" });
    expect(muteSwitch).not.toBeChecked();

    await user.click(muteSwitch);
    expect(muteSwitch).toBeChecked();

    await user.click(muteSwitch);
    expect(muteSwitch).not.toBeChecked();
  });
});
