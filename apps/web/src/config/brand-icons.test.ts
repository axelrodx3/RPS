/** @vitest-environment happy-dom */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { brand } from "@/config/brand";

const BRAND_DIR = path.resolve(process.cwd(), "public/brand");

function pngHasAlphaChannel(filePath: string): boolean {
  const buffer = readFileSync(filePath);
  return buffer.length > 25 && buffer[25] === 6;
}

function cornerAlpha(filePath: string): number {
  const output = execSync(
    `python -c "from PIL import Image; import sys; print(Image.open(sys.argv[1]).getpixel((0,0))[3])" "${filePath}"`,
    { encoding: "utf8" },
  );
  return Number(output.trim());
}

describe("brand icon assets", () => {
  it("uses the cropped header icon asset", () => {
    expect(brand.assets.icon).toBe("/brand/rps-icon-header.png");
    expect(
      readFileSync(path.join(BRAND_DIR, "rps-icon-header.png")),
    ).toBeTruthy();
  });

  it("points metadata favicon entries at the transparent favicon set", () => {
    expect(brand.assets.icon16).toBe("/brand/rps-icon-16.png");
    expect(brand.assets.icon32).toBe("/brand/rps-icon-32.png");
    expect(brand.assets.icon48).toBe("/brand/rps-icon-48.png");
    expect(brand.assets.icon180).toBe("/brand/rps-icon-180.png");
  });

  it.each([16, 32, 48, 180])(
    "favicon %ipx has a transparent background",
    (size) => {
      const filePath = path.join(BRAND_DIR, `rps-icon-${size}.png`);
      expect(pngHasAlphaChannel(filePath)).toBe(true);
      expect(cornerAlpha(filePath)).toBe(0);
    },
  );

  it("centers the header icon in a square touch target", () => {
    const css = readFileSync(
      path.resolve(process.cwd(), "src/components/brand/brand.module.css"),
      "utf8",
    );
    const shellCss = readFileSync(
      path.resolve(process.cwd(), "src/components/shell/app-shell.module.css"),
      "utf8",
    );
    expect(css).toContain("object-position: center");
    expect(css).toContain("width: 40px");
    expect(shellCss).toContain("justify-content: center");
    expect(shellCss).toContain("min-height: 48px");
  });
});
