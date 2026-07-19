const fs = require("node:fs");
const path = require("node:path");

const sharp = (() => {
  try {
    return require("sharp");
  } catch {
    try {
      return require(path.join(__dirname, "../node_modules/sharp"));
    } catch {
      console.error(
        "sharp is required to run this script. Install it with: pnpm add -D sharp -w",
      );
      process.exit(1);
    }
  }
})();

const repoRoot = path.join(__dirname, "..");
const SOURCE_FOLDER = "animations/AvatarSixFanArt";
const SOURCE_FILES = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"];
const OUT_DIR = path.join(repoRoot, "apps/web/public/assets/avatars");

async function inspectAndProcess() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const records = [];

  for (const [index, sourceFile] of SOURCE_FILES.entries()) {
    const tier = index + 2;
    const sourcePath = path.join(repoRoot, SOURCE_FOLDER, sourceFile);
    const pngOut = path.join(OUT_DIR, `tier-${tier}.png`);
    const webpOut = path.join(OUT_DIR, `tier-${tier}.webp`);

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
      avatarTier: tier,
      sourceFilename: sourceFile,
      sourceFolder: SOURCE_FOLDER,
      sourceDimensions: `${meta.width}x${meta.height}`,
      sourceFileSizeBytes: sourceStat.size,
      trimmedDimensions: `${trimmedMeta.width}x${trimmedMeta.height}`,
      runtimePngPath: path.relative(repoRoot, pngOut).split(path.sep).join("/"),
      runtimeWebpPath: path
        .relative(repoRoot, webpOut)
        .split(path.sep)
        .join("/"),
      runtimePngSizeBytes: pngStat.size,
      runtimeWebpSizeBytes: webpStat.size,
      transparency: meta.hasAlpha ? "alpha preserved" : "opaque",
      processingPerformed:
        "Trimmed excessive transparent padding from source, exported PNG fallback and WebP derivative",
      licenseStatus: "Pending project verification",
      approvalStatus: "approved-preview",
    });

    console.log(
      `avatar tier ${tier}: ${sourceFile} (${meta.width}x${meta.height}, ${sourceStat.size}b) -> ${trimmedMeta.width}x${trimmedMeta.height} png:${pngStat.size}b webp:${webpStat.size}b`,
    );
  }

  const reportPath = path.join(
    repoRoot,
    "docs/avatar-asset-processing-report.json",
  );
  fs.writeFileSync(reportPath, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Wrote ${records.length} records to ${reportPath}`);
}

inspectAndProcess().catch((error) => {
  console.error(error);
  process.exit(1);
});
