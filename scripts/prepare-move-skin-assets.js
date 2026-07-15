const fs = require("node:fs");
const path = require("node:path");

const sharp = (() => {
  try {
    return require("sharp");
  } catch {
    try {
      return require(path.join(__dirname, "../apps/web/node_modules/sharp"));
    } catch {
      console.error(
        "sharp is required to run this script. Install it with: npm install --prefix apps/web sharp",
      );
      process.exit(1);
    }
  }
})();

const repoRoot = path.join(__dirname, "..");

const CONFIGS = [
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

async function inspectAndProcess() {
  const records = [];

  for (const cfg of CONFIGS) {
    for (const [index, sourceFile] of cfg.files.entries()) {
      const tier = index + 1;
      const sourcePath = path.join(repoRoot, cfg.folder, sourceFile);
      const outDir = path.join(
        repoRoot,
        "apps/web/public/assets/moves/skins",
        cfg.move,
      );
      const pngOut = path.join(outDir, `tier-${tier}.png`);
      const webpOut = path.join(outDir, `tier-${tier}.webp`);

      fs.mkdirSync(outDir, { recursive: true });

      const input = sharp(sourcePath);
      const meta = await input.metadata();
      const sourceStat = fs.statSync(sourcePath);

      const trimmed = sharp(sourcePath).trim({
        threshold: 12,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });

      const trimmedMeta = await trimmed.clone().metadata();

      await trimmed
        .clone()
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(pngOut);

      await trimmed
        .clone()
        .webp({ quality: 92, alphaQuality: 100 })
        .toFile(webpOut);

      const pngStat = fs.statSync(pngOut);
      const webpStat = fs.statSync(webpOut);

      records.push({
        moveType: cfg.move,
        tier,
        sourceFilename: sourceFile,
        sourceFolder: cfg.folder,
        sourceDimensions: `${meta.width}x${meta.height}`,
        sourceFileSizeBytes: sourceStat.size,
        trimmedDimensions: `${trimmedMeta.width}x${trimmedMeta.height}`,
        runtimePngPath: path
          .relative(repoRoot, pngOut)
          .split(path.sep)
          .join("/"),
        runtimeWebpPath: path
          .relative(repoRoot, webpOut)
          .split(path.sep)
          .join("/"),
        runtimePngSizeBytes: pngStat.size,
        runtimeWebpSizeBytes: webpStat.size,
        transparency: meta.hasAlpha ? "alpha preserved" : "opaque",
        processingPerformed:
          "Trimmed excessive transparent padding from source, exported PNG fallback and WebP derivative",
      });

      console.log(
        `${cfg.move} tier ${tier}: ${sourceFile} (${meta.width}x${meta.height}, ${sourceStat.size}b) -> ${trimmedMeta.width}x${trimmedMeta.height} png:${pngStat.size}b webp:${webpStat.size}b`,
      );
    }
  }

  const reportPath = path.join(
    repoRoot,
    "docs/move-skin-asset-processing-report.json",
  );
  fs.writeFileSync(reportPath, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Wrote ${records.length} records to ${reportPath}`);
}

inspectAndProcess().catch((error) => {
  console.error(error);
  process.exit(1);
});
