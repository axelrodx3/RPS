/** @vitest-environment happy-dom */

import { readFileSync } from "node:fs";
import path from "node:path";
import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import BrandPreviewPage from "@/app/brand-preview/page";
import { AppShell } from "@/components/shell/AppShell";
import { renderWithProviders } from "@/test/render";

describe("branding integration", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the R icon in the header", () => {
    renderWithProviders(
      <AppShell>
        <div>content</div>
      </AppShell>,
    );

    const homeLink = screen.getByRole("link", { name: "RPS Home" });
    expect(homeLink.querySelector("img")?.getAttribute("src")).toContain(
      "rps-icon-header",
    );
  });

  it("renders the white wordmark in the hero and removes legacy hero copy", () => {
    renderWithProviders(<HomePage />);

    const hero = screen.getByLabelText("RPS home hero");
    expect(hero.querySelector("img")?.getAttribute("src")).toContain(
      "rps-wordmark-white",
    );
    expect(
      screen.queryByText("Rock. Paper. Scissors."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Built for verifiable competition."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Competitive play. Verifiable rules."),
    ).not.toBeInTheDocument();
  });

  it("exposes a focusable animated hero wordmark shell", () => {
    renderWithProviders(<HomePage />);

    const hero = screen.getByLabelText("RPS home hero");
    expect(within(hero).getByLabelText("RPS wordmark")).toHaveAttribute(
      "tabindex",
      "0",
    );
  });

  it("renders all three brand assets on the preview route", () => {
    renderWithProviders(<BrandPreviewPage />);

    expect(screen.getByText("Internal branding preview")).toBeInTheDocument();
    expect(screen.getAllByAltText("RPS").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByAltText("RPS icon at 32 pixels wide"),
    ).toBeInTheDocument();
    expect(screen.getByText(/rps-wordmark-white/)).toBeInTheDocument();
    expect(screen.getByText(/rps-wordmark-lime/)).toBeInTheDocument();
  });
});

describe("branding safety", () => {
  it("does not introduce wallet or real SOL functionality on the home page", () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getAllByRole("button", {
        name: /Play with SOL · Coming Soon/i,
      })[0],
    ).toBeDisabled();
    expect(screen.queryByText(/connect wallet/i)).not.toBeInTheDocument();
  });
});

describe("RpsWordmark motion styles", () => {
  it("disables hover animation under reduced motion preferences", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/components/brand/brand.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation: none");
  });

  it("renders a larger header icon footprint", () => {
    const cssPath = path.resolve(
      process.cwd(),
      "src/components/brand/brand.module.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain("width: 40px");
    expect(css).toContain("height: 40px");
  });
});
