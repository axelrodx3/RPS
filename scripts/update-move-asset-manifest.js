const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.join(__dirname, "..");
const manifestPath = path.join(repoRoot, "docs/asset-license-manifest.json");
const processingReportPath = path.join(
  repoRoot,
  "docs/move-skin-asset-processing-report.json",
);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const filtered = manifest.filter(
  (entry) =>
    !entry.assetName?.startsWith("Rock move skin tier") &&
    !entry.assetName?.startsWith("Paper move skin tier") &&
    !entry.assetName?.startsWith("Scissors move skin tier"),
);

const configs = [
  {
    move: "rock",
    folder: "animations/7 Tiers of stone blocks 512x512",
    files: [
      "stone block tier 1.png",
      "stone block tier 2.png",
      "stone block tier 3.png",
      "stone block tier 4.png",
      "stone block tier 5.png",
      "stone block tier 6.png",
      "stone block tier 7.png",
    ],
  },
  {
    move: "paper",
    folder: "animations/7 Tiers of blank papers 512x512",
    files: [
      "blank paper tier 1.png",
      "blank paper tier 2.png",
      "blank paper tier 3.png",
      "blank paper tier 4.png",
      "blank paper tier 5.png",
      "blank paper tier 6.png",
      "blank paper tier 7.png",
    ],
  },
  {
    move: "scissors",
    folder: "animations/21 v6.1 Scissors 512x512",
    files: ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png"],
  },
];

const processingReport = fs.existsSync(processingReportPath)
  ? JSON.parse(fs.readFileSync(processingReportPath, "utf8"))
  : [];

const entries = [];

for (const cfg of configs) {
  cfg.files.forEach((sourceFile, index) => {
    const tier = index + 1;
    const runtimePng = path.join(
      repoRoot,
      "apps/web/public/assets/moves/skins",
      cfg.move,
      `tier-${tier}.png`,
    );
    const runtimeWebp = path.join(
      repoRoot,
      "apps/web/public/assets/moves/skins",
      cfg.move,
      `tier-${tier}.webp`,
    );
    const pngStat = fs.statSync(runtimePng);
    const webpStat = fs.statSync(runtimeWebp);
    const report = processingReport.find(
      (item) => item.moveType === cfg.move && item.tier === tier,
    );

    entries.push({
      assetName: `${cfg.move[0].toUpperCase()}${cfg.move.slice(1)} move skin tier ${tier}`,
      moveType: cfg.move,
      tier,
      sourceFile,
      sourceFolder: cfg.folder,
      filePath: path.relative(repoRoot, runtimePng).split(path.sep).join("/"),
      runtimePath: `/assets/moves/skins/${cfg.move}/tier-${tier}.png`,
      runtimeWebpPath: `/assets/moves/skins/${cfg.move}/tier-${tier}.webp`,
      profilePreviewPath: `/assets/moves/skins/${cfg.move}/tier-${tier}.webp`,
      format: "PNG RGBA + WebP",
      dimensions: report?.trimmedDimensions ?? "512x512",
      sourceDimensions: report?.sourceDimensions ?? "512x512",
      fileSizeBytes: pngStat.size,
      runtimeWebpSizeBytes: webpStat.size,
      transparencyStatus: "alpha preserved",
      activeStatus: tier === 1 ? "active" : "inactive",
      defaultStatus: tier === 1 ? "default-equipped" : "locked-preview",
      practiceAvailability:
        tier === 1
          ? "available in Practice"
          : "profile preview only; future unlock",
      source: "User supplied move artwork",
      author: "Pending project verification",
      sourceUrl: null,
      license: "Pending project verification",
      attributionRequired: true,
      dateIntegrated: "2026-07-15",
      modifications:
        "Trimmed excessive transparent padding, exported PNG fallback and WebP derivative for profile unlock previews",
      approvalStatus:
        tier === 1 ? "approved" : "approved-profile-preview-locked",
      processingPerformed:
        report?.processingPerformed ??
        "Trimmed excessive transparent padding from source, exported PNG fallback and WebP derivative",
    });
  });
}

fs.writeFileSync(
  manifestPath,
  `${JSON.stringify([...filtered, ...entries], null, 2)}\n`,
);

console.log(`Added ${entries.length} move skin manifest entries.`);
