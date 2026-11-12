import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

// Bumps a sitemap <lastmod> only when that page's rendered content actually
// changed. Fingerprints live in scripts/sitemap-state.json (committed), so a
// local build before commit records the dates and CI rebuilds reproduce them.

export function pageFingerprint(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? "";
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? html;
  const normalized = body
    .replace(/\/(?:assets|delivery-assets|marketing-assets)\/[^"'\s)]+/g, "")
    .replace(/\s+/g, " ");
  return createHash("sha256").update(`${title}\n${description}\n${normalized}`).digest("hex");
}

export function updateSitemap(xml, readPage, state, today) {
  const nextState = { ...state };
  const changedLocs = [];
  const nextXml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
    const loc = inner.match(/<loc>https:\/\/varandaype\.com([^<]*)<\/loc>/)?.[1];
    if (!loc) return block;
    const html = readPage(loc);
    if (html == null) return block;
    const hash = pageFingerprint(html);
    if (nextState[loc]?.hash !== hash) {
      nextState[loc] = { hash, lastmod: today };
      changedLocs.push(loc);
    }
    return block.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${nextState[loc].lastmod}</lastmod>`);
  });
  return { xml: nextXml, state: nextState, changed: changedLocs.length > 0, changedLocs };
}

function main() {
  const root = process.cwd();
  const dist = path.join(root, "dist");
  const statePath = path.join(root, "scripts", "sitemap-state.json");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, "utf8")) : {};

  const readPage = (loc) => {
    const file = path.join(dist, loc.replace(/^\/+/, ""), "index.html");
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  };

  const xml = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
  const result = updateSitemap(xml, readPage, state, today);

  fs.writeFileSync(path.join(dist, "sitemap.xml"), result.xml);
  fs.writeFileSync(path.join(root, "public", "sitemap.xml"), result.xml);
  if (result.changed) {
    fs.writeFileSync(statePath, `${JSON.stringify(result.state, null, 2)}\n`);
  }
  const updated = result.changedLocs;
  console.log(`sitemap lastmod: ${updated.length} página(s) mudaram neste build (${today})${updated.length ? `: ${updated.join(", ")}` : ""}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
