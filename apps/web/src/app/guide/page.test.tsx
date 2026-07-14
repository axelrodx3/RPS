/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GuidePage from "@/app/guide/page";
import { renderWithProviders } from "@/test/render";

describe("GuidePage branding", () => {
  it("shows the official RPS wordmark without preview wording", () => {
    renderWithProviders(<GuidePage />);

    expect(screen.getByLabelText("RPS")).toBeInTheDocument();
    expect(screen.queryByText(/Brand preview/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Secondary lime branding shown at guide scale/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Lime wordmark in context/i),
    ).not.toBeInTheDocument();
  });

  it("does not use the preview style box on the guide page", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/app/guide/guide.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).not.toContain("brandSection");
    expect(css).toContain("brandHero");
  });
});
