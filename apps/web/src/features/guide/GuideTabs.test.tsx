/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GuideTabs } from "@/features/guide/GuideTabs";
import { renderWithProviders } from "@/test/render";

describe("GuideTabs", () => {
  it("shows FAQ content by default and switches to Modes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GuideTabs />);

    expect(
      screen.getByText(/Practice is local only, uses a fair random CPU/),
    ).toBeVisible();
    expect(
      screen.queryByText("1v1 — first to two non tied rounds."),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Modes" }));

    expect(
      screen.getByText("1v1 — first to two non tied rounds."),
    ).toBeVisible();
    expect(
      screen.queryByText(/Practice is local only, uses a fair random CPU/),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Modes" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

describe("CSP configuration", () => {
  it("allows inline scripts required for Next.js hydration", () => {
    const config = readFileSync(
      resolve(process.cwd(), "next.config.ts"),
      "utf8",
    );
    expect(config).toContain("'unsafe-inline'");
  });
});
