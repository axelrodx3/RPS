const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.join(__dirname, "..");
const manifestPath = path.join(repoRoot, "docs/asset-license-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const filtered = manifest.filter(
  (entry) =>
    ![
      "Rock move placeholder icon",
      "Paper move placeholder icon",
      "Scissors move placeholder icon",
    ].includes(entry.assetName),
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

const entries = [];

for (const cfg of configs) {
  cfg.files.forEach((sourceFile, index) => {
    const tier = index + 1;
    const runtime = path.join(
      repoRoot,
      "apps/web/public/assets/moves/skins",
      cfg.move,
      `tier-${tier}.png`,
    );
    const stat = fs.statSync(runtime);

    entries.push({
      assetName: `${cfg.move[0].toUpperCase()}${cfg.move.slice(1)} move skin tier ${tier}`,
      moveType: cfg.move,
      tier,
      sourceFile,
      sourceFolder: cfg.folder,
      filePath: path.relative(repoRoot, runtime).split(path.sep).join("/"),
      runtimePath: `/assets/moves/skins/${cfg.move}/tier-${tier}.png`,
      format: "PNG RGBA",
      dimensions: "512x512",
      fileSizeBytes: stat.size,
      transparencyStatus: "alpha preserved",
      activeStatus: tier === 1 ? "active" : "inactive",
      defaultStatus: tier === 1 ? "default" : "locked",
      practiceAvailability:
        tier === 1 ? "available in Practice" : "future unlock only",
      source: "User supplied move artwork",
      author: "Pending project verification",
      sourceUrl: null,
      license: "Pending project verification",
      attributionRequired: true,
      dateIntegrated: "2026-07-15",
      modifications:
        tier === 1
          ? "Copied source PNG to runtime skins path without distortion"
          : "Preserved for future unlock; registered but not exposed in UI",
      approvalStatus: tier === 1 ? "approved" : "preserved-future-unlock",
      processingPerformed:
        "Direct copy to public runtime path; CSS object-fit contain scaling in UI",
    });
  });
}

fs.writeFileSync(
  manifestPath,
  `${JSON.stringify([...filtered, ...entries], null, 2)}\n`,
);

console.log(`Added ${entries.length} move skin manifest entries.`);
