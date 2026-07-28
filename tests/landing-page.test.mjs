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

test("hero keeps one message and two actions without dense proof blocks", { skip: !productionFilesExist }, () => {
  const html = fs.readFileSync(files.html, "utf8");
  const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0];

  assert.ok(hero, "hero section should exist");
  assert.match(hero, /<h1[^>]*>\s*swagger-doc-skill\s*<\/h1>/);
  assert.match(hero, /class="hero-lede"/);
  assert.match(hero, /id="install-prompt"[^>]*hidden/);
  assert.equal((hero.match(/class="button /g) ?? []).length, 2, "hero should expose exactly two actions");

  for (const removedClass of ["hero-wash", "eyebrow", "install-line", "proof-line", "output-tool"]) {
    assert.doesNotMatch(hero, new RegExp(`class="[^"]*${removedClass}`), `${removedClass} should not remain in hero`);
  }
});

test("usage example pairs a user prompt with real fixture-backed AI output", { skip: !productionFilesExist }, () => {
  const html = fs.readFileSync(files.html, "utf8");
  const css = fs.readFileSync(files.css, "utf8");
  const example = html.match(/<section class="usage-example section-band"[\s\S]*?<\/section>/)?.[0];
  const userInput = example?.match(/<article[^>]+data-role="user-input"[\s\S]*?<\/article>/)?.[0];
  const aiOutput = example?.match(/<article[^>]+data-role="ai-output"[\s\S]*?<\/article>/)?.[0];

  assert.ok(example, "usage example should follow the hero");
  assert.ok(html.indexOf('class="usage-example section-band"') > html.indexOf('class="hero"'));
  assert.ok(html.indexOf('class="usage-example section-band"') < html.indexOf('class="workflow section-band"'));
  assert.ok(userInput, "left column should contain the user input");
  assert.ok(aiOutput, "right column should contain the AI output");
  assert.match(userInput, /class="cli-prompt"[^>]*aria-hidden="true"[^>]*>\$<\/span>/);
  assert.match(userInput, /<code class="prompt-text">/);
  assert.match(example, /POST https:\/\/api\.example\.com\/v1\/login/);
  assert.match(aiOutput, /Integration Guide/);
  assert.match(aiOutput, /POST \/login/);
  assert.match(aiOutput, /Request URL/);
  assert.match(aiOutput, /Summary:\s*Login/);
  assert.match(aiOutput, />Auth</);
  assert.match(aiOutput, />Request</);
  assert.match(aiOutput, />Response</);
  assert.match(aiOutput, /Content-Type/);
  assert.match(example, /none documented/);
  assert.match(example, /username/);
  assert.match(example, /data\.token/);
  assert.match(example, /expiresIn/);
  assert.match(example, /&quot;abc&quot;/);
  assert.match(example, /3600/);
  assert.match(example, /curl --request POST/);
  assert.match(aiOutput, />fetch</);
  assert.match(aiOutput, /await fetch/);
  assert.doesNotMatch(userInput, /typing-cursor/);
  assert.match(aiOutput, /class="typing-cursor"[^>]*aria-hidden="true"/);
  assert.match(aiOutput, /class="fixture-output-body"[^>]*role="region"[^>]*aria-label="登录接口文档输出"[^>]*tabindex="0"/);
  assert.match(css, /\.usage-example\.section-band\s*\{[^}]*width:\s*100%/);
  const usageDialogueRule = css.match(/\.usage-dialogue\s*\{[^}]*\}/)?.[0];
  assert.ok(usageDialogueRule, "usage dialogue should have a base layout rule");
  assert.match(usageDialogueRule, /gap:\s*1rem/);
  assert.match(usageDialogueRule, /background:\s*transparent/);
  assert.doesNotMatch(usageDialogueRule, /border-block/);
  assert.match(
    css,
    /\.usage-prompt,\s*\.fixture-output\s*\{[^}]*border:\s*1px solid [^;]+;[^}]*border-radius:\s*6px/,
    "input and output should be separate bordered terminal cards"
  );
  assert.match(css, /\.usage-prompt\s*\{[^}]*background:\s*var\(--terminal-raised\)/);
  assert.match(css, /\.prompt-text\s*\{[^}]*font-family:\s*var\(--font-code\)/);
  assert.match(css, /@media \(min-width: 56rem\)[\s\S]*?\.fixture-output-body\s*\{[^}]*max-height:\s*34rem;[^}]*overflow-y:\s*auto/);
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
  assert.doesNotMatch(script, /installPromptElement\.hidden = false|revealInstallPrompt/);
  assert.doesNotMatch(script, /手动复制下方提示/);
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
