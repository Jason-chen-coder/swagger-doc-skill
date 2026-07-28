import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = {
  html: path.join(root, "index.html"),
  css: path.join(root, "styles.css"),
  script: path.join(root, "script.js"),
  workflow: path.join(root, ".github", "workflows", "deploy-pages.yml"),
};
const productionFilesExist = [files.html, files.css, files.script].every((file) => fs.existsSync(file));

test("landing page production files exist", () => {
  for (const file of Object.values(files)) {
    assert.equal(fs.existsSync(file), true, `${path.basename(file)} should exist`);
  }
});

test("page exposes the product, install path, and real fixture output", { skip: !productionFilesExist }, () => {
  const html = fs.readFileSync(files.html, "utf8");

  assert.match(html, /<html[^>]+lang="zh-CN"/);
  assert.match(html, /<meta[^>]+name="viewport"[^>]+viewport-fit=cover/);
  assert.match(html, /<meta[^>]+name="description"/);
  assert.match(html, /<meta[^>]+property="og:title"/);
  assert.match(html, /<h1[^>]*>\s*swagger-doc-skill\s*<\/h1>/);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /<main[^>]+id="main-content"/);
  assert.match(html, /<nav[^>]+aria-label=/);
  assert.match(html, /data-copy-install/);
  assert.match(html, /aria-live="polite"/);
  assert.match(
    html,
    /https:\/\/github\.com\/Jason-chen-coder\/swagger-doc-skill\/tree\/main\/swagger-doc-skill/
  );
  assert.match(html, /href="https:\/\/github\.com\/Jason-chen-coder\/swagger-doc-skill"/);
  assert.match(html, /POST \/login/);
  assert.match(html, /GET \/profile/);
  assert.match(html, /BearerAuth/);
  assert.match(html, /originalRef/);
  assert.match(html, /id="spec-map"/);

  for (const mode of ["modules", "endpoints", "endpoint", "types", "integration", "document"]) {
    assert.match(html, new RegExp(`data-mode="${mode}"`), `missing ${mode} mode`);
  }

  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/, "site assets must work under the GitHub project subpath");
});

test("styles include keyboard, motion, and responsive safeguards", { skip: !productionFilesExist }, () => {
  const css = fs.readFileSync(files.css, "utf8");

  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media\s*\([^)]*min-width/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /min\(100%/);
});

test("script supports copying, fallback behavior, tabs, and the visual canvas", { skip: !productionFilesExist }, () => {
  const script = fs.readFileSync(files.script, "utf8");

  assert.match(script, /navigator\.clipboard/);
  assert.match(script, /execCommand\(["']copy["']\)/);
  assert.match(script, /aria-selected/);
  assert.match(script, /ArrowRight/);
  assert.match(script, /getContext\(["']2d["']\)/);
});

test("main pushes deploy the static site through GitHub Pages", () => {
  assert.equal(fs.existsSync(files.workflow), true, "deploy-pages.yml should exist");

  const workflow = fs.readFileSync(files.workflow, "utf8");
  assert.match(workflow, /push:\s*\n\s+branches:\s*\[main\]/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /actions\/checkout@v6/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path:\s*\./);
});
