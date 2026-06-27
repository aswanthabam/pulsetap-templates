const fs = require("fs");
const path = require("path");

// --- Config ---
const COMMON_FOLDER = "common";

// Single timestamp for this entire deploy run
const VERSION = Date.now().toString(36); // e.g. "lf3k2z1m"

console.log(`Deploy version stamp: ${VERSION}`);

// --- Read changed folders from changes.json ---
const changesRaw = fs.readFileSync("changes.json", "utf8");
const changedFolders = JSON.parse(changesRaw);

if (!Array.isArray(changedFolders) || changedFolders.length === 0) {
  console.log("No changed folders in changes.json, skipping.");
  process.exit(0);
}

console.log(`Templates to update: ${changedFolders.join(", ")}`);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// --- Build list of asset ref paths to stamp ---
// Each entry is the path as it appears in href/src in the HTML
const refPaths = [];

// Template-local assets (bare filename e.g. "style.css")
for (const folder of changedFolders) {
  if (!fs.existsSync(folder)) {
    console.warn(`  [SKIP] Folder not found: ${folder}`);
    continue;
  }
  const assets = fs.readdirSync(folder).filter((f) => /\.(js|css)$/.test(f));
  for (const asset of assets) {
    if (!refPaths.includes(asset)) refPaths.push(asset);
  }
}

// Common folder assets (referenced as "../common/filename")
if (fs.existsSync(COMMON_FOLDER)) {
  const commonAssets = fs
    .readdirSync(COMMON_FOLDER)
    .filter((f) => /\.(js|css)$/.test(f));
  for (const asset of commonAssets) {
    const refPath = `../${COMMON_FOLDER}/${asset}`;
    if (!refPaths.includes(refPath)) refPaths.push(refPath);
  }
} else {
  console.warn(`  [WARN] Common folder not found: ${COMMON_FOLDER}`);
}

console.log(`  Asset refs to stamp: ${refPaths.join(", ")}`);

// --- Rewrite index.html in each changed template folder ---
for (const folder of changedFolders) {
  if (!fs.existsSync(folder)) continue;

  const htmlFile = path.join(folder, "index.html");
  if (!fs.existsSync(htmlFile)) {
    console.warn(`  [SKIP] No index.html in: ${folder}`);
    continue;
  }

  let html = fs.readFileSync(htmlFile, "utf8");
  let modified = false;

  for (const refPath of refPaths) {
    const pattern = new RegExp(
      `((?:src|href)=["'])([^"']*?${escapeRegex(refPath)})(\\?v=[a-z0-9]+)?(["'])`,
      "g"
    );
    const updated = html.replace(
      pattern,
      (_, attr, filePath, _oldQuery, quote) =>
        `${attr}${filePath}?v=${VERSION}${quote}`
    );
    if (updated !== html) {
      html = updated;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(htmlFile, html, "utf8");
    console.log(`  ✓ Updated: ${htmlFile}`);
  } else {
    console.log(`  ~ No changes needed: ${htmlFile}`);
  }
}
