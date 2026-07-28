const installPrompt = document.querySelector("#install-prompt")?.textContent?.trim() ?? "";
const copyButtons = [...document.querySelectorAll("[data-copy-install]")];
const copyStatus = document.querySelector("#copy-status");

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

async function copyInstallPrompt() {
  if (!installPrompt) return false;

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(installPrompt);
      return true;
    } catch {
      return fallbackCopy(installPrompt);
    }
  }

  return fallbackCopy(installPrompt);
}

for (const button of copyButtons) {
  const originalLabel = button.textContent.trim();

  button.addEventListener("click", async () => {
    const copied = await copyInstallPrompt();
    const message = copied ? "安装提示已复制，可以粘贴到 Codex。" : "复制失败，请手动选择上方安装提示。";

    if (copyStatus) copyStatus.textContent = message;
    button.textContent = copied ? "已复制" : "请手动复制";
    button.dataset.state = copied ? "success" : "error";

    window.setTimeout(() => {
      button.textContent = originalLabel;
      delete button.dataset.state;
    }, 1800);
  });
}

const tabs = [...document.querySelectorAll('[role="tab"][data-mode]')];
const panels = [...document.querySelectorAll('[role="tabpanel"][data-panel-mode]')];

function activateTab(nextTab, moveFocus = true) {
  const mode = nextTab.dataset.mode;

  for (const tab of tabs) {
    const selected = tab === nextTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }

  for (const panel of panels) {
    panel.hidden = panel.dataset.panelMode !== mode;
  }

  if (moveFocus) nextTab.focus();
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener("click", () => activateTab(tab, false));
  tab.addEventListener("keydown", (event) => {
    let nextIndex = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== index) {
      event.preventDefault();
      activateTab(tabs[nextIndex]);
    }
  });
}

const specCanvas = document.querySelector("#spec-map");
const specContext = specCanvas?.getContext("2d");

function drawSpecMap() {
  if (!specCanvas || !specContext) return;

  const rect = specCanvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  specCanvas.width = Math.max(1, Math.round(rect.width * scale));
  specCanvas.height = Math.max(1, Math.round(rect.height * scale));
  specContext.setTransform(scale, 0, 0, scale, 0, 0);
  specContext.clearRect(0, 0, rect.width, rect.height);

  specContext.strokeStyle = "rgba(36, 69, 54, 0.09)";
  specContext.lineWidth = 1;
  const gridSize = 32;
  for (let x = 0; x < rect.width; x += gridSize) {
    specContext.beginPath();
    specContext.moveTo(x, 0);
    specContext.lineTo(x, rect.height);
    specContext.stroke();
  }
  for (let y = 0; y < rect.height; y += gridSize) {
    specContext.beginPath();
    specContext.moveTo(0, y);
    specContext.lineTo(rect.width, y);
    specContext.stroke();
  }

  const desktop = rect.width >= 960;
  const originX = desktop ? rect.width * 0.54 : rect.width * 0.18;
  const originY = desktop ? rect.height * 0.16 : rect.height * 0.64;
  const mapWidth = desktop ? rect.width * 0.42 : rect.width * 0.72;
  const mapHeight = desktop ? rect.height * 0.64 : rect.height * 0.28;
  const nodes = [
    { x: 0.02, y: 0.35, label: "UI", color: "#d6a91b" },
    { x: 0.25, y: 0.12, label: "spec", color: "#16885a" },
    { x: 0.49, y: 0.42, label: "endpoint", color: "#173c2e" },
    { x: 0.72, y: 0.2, label: "schema", color: "#16885a" },
    { x: 0.94, y: 0.48, label: "curl", color: "#d6a91b" },
    { x: 0.7, y: 0.78, label: "auth", color: "#a34030" },
    { x: 0.35, y: 0.86, label: "types", color: "#537d91" },
  ].map((node) => ({
    ...node,
    px: originX + node.x * mapWidth,
    py: originY + node.y * mapHeight,
  }));

  const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [2, 6], [6, 5]];
  specContext.strokeStyle = "rgba(28, 95, 65, 0.34)";
  specContext.lineWidth = 1.5;
  for (const [from, to] of edges) {
    const a = nodes[from];
    const b = nodes[to];
    const bend = (a.px + b.px) / 2;
    specContext.beginPath();
    specContext.moveTo(a.px, a.py);
    specContext.bezierCurveTo(bend, a.py, bend, b.py, b.px, b.py);
    specContext.stroke();
  }

  specContext.font = "600 11px 'IBM Plex Sans', sans-serif";
  specContext.textAlign = "center";
  specContext.textBaseline = "middle";
  for (const node of nodes) {
    const width = Math.max(44, specContext.measureText(node.label).width + 22);
    specContext.fillStyle = "rgba(250, 248, 241, 0.92)";
    specContext.strokeStyle = node.color;
    specContext.lineWidth = 1.5;
    specContext.beginPath();
    specContext.roundRect(node.px - width / 2, node.py - 15, width, 30, 4);
    specContext.fill();
    specContext.stroke();
    specContext.fillStyle = node.color;
    specContext.fillText(node.label, node.px, node.py + 0.5);
  }
}

if (specCanvas && specContext) {
  drawSpecMap();
  if ("ResizeObserver" in window) {
    new ResizeObserver(drawSpecMap).observe(specCanvas);
  } else {
    window.addEventListener("resize", drawSpecMap, { passive: true });
  }
}
