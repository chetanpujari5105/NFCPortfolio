// Builds the guide: guide/content.md → HTML book → A4 PDF (+ a GitHub Markdown version and the
// prompts as plain files). Usage: npm run guide
//   node guide/build.mjs [--keep-html] [--template <dir>] [--out <file.pdf>]
// A prompt fence names its file (```prompt 03-build-spec.md) and gets a "Copy it from" link to the
// template repo under it. With --template, the template's prompts/<file> is the source: its text
// replaces the fence's, and the build only reads that folder, never writes it. Every prompt is
// also written to guide/prompts/. --out puts the PDF somewhere else (a release asset, not git).
//
// Pass 1 renders the body with placeholder page numbers in the table of contents, reads each
// page's text with pdftotext (poppler) to find where every chapter and section landed, then
// pass 2 renders again with the real numbers. The cover is rendered on its own (no footer) and
// inserted in front with pdf-lib, which keeps Chromium's outline (bookmarks) intact.
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import { PDFDocument } from "pdf-lib";
import { createHighlighter } from "shiki";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const TITLE = "Build Your Own Pocket Portfolio with Claude Code";
const SUBTITLE = "A 3D phone-style personal website. No coding experience needed.";
const AUTHOR = "Chetan Pujari";
const VERSION = "v2.0";
const DATE = "October 2026";
const arg = (name) => (process.argv.includes(name) ? resolve(process.argv[process.argv.indexOf(name) + 1]) : null);
const OUT_PDF = arg("--out") ?? join(here, "Build-Your-Own-Pocket-Portfolio.pdf");
const OUT_MD = join(here, "Build-Your-Own-Pocket-Portfolio.md");
const tmp = join(here, ".build");
const keepHtml = process.argv.includes("--keep-html");
const templateDir = arg("--template");
const PROMPTS_URL = "https://github.com/chetanpujari5105/pocket-portfolio-template/blob/main/prompts/";
const fenceInfo = (info) => {
  const [kind, file] = info.trim().split(/\s+/);
  return { kind, file };
};

// With --template, each named prompt's text comes from the template's prompts/ (read only)
const source = await withTemplatePrompts(await readFile(join(here, "content.md"), "utf8"));

async function withTemplatePrompts(src) {
  if (!templateDir) return src;
  const out = [];
  let skipping = false;
  for (const line of src.split("\n")) {
    const fence = line.match(/^```prompt\s+(\S+)\s*$/);
    if (fence) {
      out.push(line, (await readFile(join(templateDir, "prompts", fence[1]), "utf8")).replace(/\n$/, ""));
      skipping = true;
      continue;
    }
    if (skipping) {
      if (/^```\s*$/.test(line)) {
        skipping = false;
        out.push(line);
      }
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

/* ───────────────────────────── Markdown → HTML ───────────────────────────── */

const highlighter = await createHighlighter({ themes: ["github-light"], langs: ["markdown", "bash", "ts"] });
const KINDS = {
  prompt: { lang: "markdown", label: "PROMPT" },
  terminal: { lang: "bash", label: "TERMINAL" },
  ts: { lang: "ts", label: "CODE" },
};
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const md = new MarkdownIt({ html: true, linkify: true, typographer: false });
// Example and placeholder addresses stay plain text, so every link in the PDF goes somewhere real
// Not linked: placeholders and local addresses, and API endpoints that only work inside a command
const isPlaceholder = (url) => /\{\{|&lt;|&#x3C;|<|%3C|YOUR-|yourname|yourdomain|example\.com|localhost|mcp\.context7\.com\/mcp/i.test(url);

md.renderer.rules.fence = (tokens, idx) => {
  const t = tokens[idx];
  const { kind: kindName, file } = fenceInfo(t.info);
  const kind = KINDS[kindName] ?? { lang: "bash", label: "CODE" };
  let html = highlighter.codeToHtml(t.content.replace(/\n$/, ""), { lang: kind.lang, theme: "github-light" });
  html = html.replace(/<pre class="shiki[^"]*"[^>]*>/, "<pre>");
  // Bare URLs inside code are clickable too (shiki keeps a URL inside one span)
  html = html.replace(/(>[^<]*?)(https?:\/\/[^\s<"'`)]+[^\s<"'`).,:;])/g, (m, pre, url) =>
    isPlaceholder(url) ? m : `${pre}<a href="${url.replace(/&amp;/g, "&")}">${url}</a>`,
  );
  const copy = file ? `<p class="copy-from">Copy it from <a class="link" href="${PROMPTS_URL}${file}">prompts/${file}</a></p>\n` : "";
  return `<div class="code" data-kind="${kindName}"><div class="code-label">${kind.label}</div>${html}</div>\n${copy}`;
};

// Images become captioned figures; a paragraph holding only images loses its <p>
md.core.ruler.push("figures", (state) => {
  const toks = state.tokens;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.type !== "inline" || !t.children?.length) continue;
    const onlyImages = t.children.every((c) => c.type === "image" || c.type === "softbreak" || (c.type === "text" && !c.content.trim()));
    if (onlyImages && toks[i - 1]?.type === "paragraph_open") {
      toks[i - 1].hidden = true;
      toks[i + 1].hidden = true;
    }
  }
});
md.renderer.rules.image = (tokens, idx) => {
  const t = tokens[idx];
  const src = t.attrGet("src");
  const caption = t.children?.map((c) => c.content).join("") ?? "";
  const tall = /mobile|journey/.test(src) ? " tall" : "";
  return `<figure class="fig${tall}"><img src="${src}" alt="${escapeHtml(caption)}"><figcaption>${md.renderInline(caption)}</figcaption></figure>`;
};
md.core.ruler.push("placeholder-links", (state) => {
  for (const t of state.tokens) {
    if (t.type !== "inline" || !t.children) continue;
    t.children.forEach((c, i) => {
      if (c.type !== "link_open" || c.markup !== "linkify" || !isPlaceholder(c.attrGet("href"))) return;
      c.hidden = true;
      const close = t.children.findIndex((x, j) => j > i && x.type === "link_close");
      t.children[close].hidden = true;
    });
  }
});
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet("class", "link");
  return self.renderToken(tokens, idx, options);
};

// Headings: chapter numbers on h1, ids for the table of contents
const headings = [];
let chapter = 0;
md.renderer.rules.heading_open = (tokens, idx) => {
  const t = tokens[idx];
  const text = tokens[idx + 1].children.map((c) => c.content).join("");
  const id = slug(text);
  if (t.tag === "h1") {
    const numbered = text !== "Quick Reference";
    if (numbered) chapter++;
    headings.push({ level: 1, text, id, chapter: numbered ? chapter : null });
    const kicker = numbered ? `<div class="kicker">Chapter ${chapter}</div>` : `<div class="kicker">One page</div>`;
    return `<header class="chapter-head" id="${id}">${kicker}<h1>`;
  }
  if (t.tag === "h2") headings.push({ level: 2, text, id, chapter });
  return `<${t.tag} id="${id}">`;
};
md.renderer.rules.heading_close = (tokens, idx) => (tokens[idx].tag === "h1" ? "</h1></header>" : `</${tokens[idx].tag}>`);

const CALLOUTS = {
  tip: ["💡", "Tip"],
  warning: ["⚠️", "Warning"],
  note: ["📝", "Note"],
  check: ["✅", "Check"],
};
for (const [name, [icon, label]] of Object.entries(CALLOUTS)) {
  md.use(container, name, {
    render: (tokens, idx) =>
      tokens[idx].nesting === 1 ? `<aside class="callout ${name}"><div class="callout-title">${icon} ${label}</div>` : "</aside>\n",
  });
}
for (const name of ["decision", "worksheet", "trouble", "quickref", "figures", "figures-3"]) {
  md.use(container, name, { render: (tokens, idx) => (tokens[idx].nesting === 1 ? `<div class="${name}">` : "</div>\n") });
}
md.use(container, "step", {
  validate: (params) => /^step\s+\d+\s*\|/.test(params.trim()),
  render: (tokens, idx) => {
    if (tokens[idx].nesting !== 1) return "</div></section>\n";
    const [, n, title] = tokens[idx].info.trim().match(/^step\s+(\d+)\s*\|\s*(.*)$/);
    return `<section class="step"><div class="step-num">${n}</div><div class="step-body"><div class="step-title">${md.renderInline(title)}</div>`;
  },
});

// "✅ ..." paragraphs become check lines
md.core.ruler.push("checks", (state) => {
  for (let i = 0; i < state.tokens.length; i++) {
    const t = state.tokens[i];
    if (t.type === "inline" && t.content.startsWith("✅") && state.tokens[i - 1]?.type === "paragraph_open")
      state.tokens[i - 1].attrJoin("class", "done");
  }
});

/* ───────────────────────────── Page shell ───────────────────────────── */

const fontUrl = (p) => pathToFileURL(join(root, "node_modules", p)).href;
const css = (await readFile(join(here, "guide.css"), "utf8"))
  .replace("%ARCHIVO%", fontUrl("@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2"))
  .replace("%INTER%", fontUrl("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"))
  .replace("%MONO%", fontUrl("@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2"));

function page(body, cls = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${TITLE}</title>
<base href="${pathToFileURL(here + "/").href}"><style>${css}</style></head><body class="${cls}">${body}</body></html>`;
}

function toc(numbers) {
  const rows = headings
    .map((h, i) => {
      const n = numbers?.[i] ?? "00";
      const label = h.level === 1 ? `${h.chapter ? `<span class="toc-num">${h.chapter}</span>` : `<span class="toc-num">·</span>`}${h.text}` : h.text;
      return `<a class="toc-row l${h.level}" href="#${h.id}"><span class="toc-text">${label}</span><span class="toc-dots"></span><span class="toc-page">${n}</span></a>`;
    })
    .join("\n");
  return `<nav class="toc"><header class="chapter-head toc-head" id="contents"><div class="kicker">Inside</div><h1>Contents</h1></header>${rows}</nav>`;
}

const bodyHtml = md.render(source);

function coverHtml() {
  return page(
    `<div class="cover">
  <div class="cover-top"><span class="cover-tag">POCKET PORTFOLIO · GUIDE ${VERSION}</span></div>
  <h1 class="cover-title">Build Your Own Pocket Portfolio <span>with Claude Code</span></h1>
  <p class="cover-sub">${SUBTITLE}</p>
  <div class="cover-shots">
    <img class="cover-hero" src="images/hero-front.jpg" alt="The 3D phone on desktop">
    <img class="cover-mobile" src="images/hero-mobile.jpg" alt="The site on a phone">
  </div>
  <div class="cover-foot"><span>by <strong>${AUTHOR}</strong></span><span>${DATE} · ${VERSION}</span></div>
</div>`,
    "cover-page",
  );
}

/* ───────────────────────────── Render ───────────────────────────── */

await rm(tmp, { recursive: true, force: true });
await mkdir(tmp, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext();

const footer = `<div style="width:100%;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:7.5px;color:#8a8f98;padding:0 18mm;display:flex;justify-content:space-between;-webkit-print-color-adjust:exact">
<span>${TITLE}</span><span><span class="pageNumber"></span></span></div>`;

async function render(html, file, opts) {
  const htmlFile = file.replace(/\.pdf$/, ".html");
  await writeFile(htmlFile, html);
  const p = await ctx.newPage();
  await p.goto(pathToFileURL(htmlFile).href, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: file, format: "A4", printBackground: true, ...opts });
  await p.close();
}

const bodyOpts = {
  margin: { top: "18mm", bottom: "20mm", left: "18mm", right: "18mm" },
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: footer,
  outline: true,
  tagged: true,
};

const pageText = (pdf, n) =>
  execFileSync("pdftotext", ["-f", String(n), "-l", String(n), "-layout", pdf, "-"], { encoding: "utf8" });
const pageCount = (pdf) => Number(execFileSync("pdfinfo", [pdf], { encoding: "utf8" }).match(/Pages:\s+(\d+)/)[1]);
// Letter-spaced kickers come out as "C H A PT E R", so compare without any whitespace
const norm = (s) => s.replace(/\s+/g, "").toLowerCase();

async function locate(pdf) {
  const pages = pageCount(pdf);
  const lines = [];
  for (let n = 1; n <= pages; n++) lines.push(pageText(pdf, n).split("\n").map(norm).filter(Boolean));
  // Chapters are found by their "Chapter N" kicker line followed by the title, so the table of
  // contents (which has no kickers) is skipped; sections are whole lines after their chapter.
  let from = 0;
  return headings.map((h) => {
    const title = norm(h.text);
    const kicker = h.level === 1 ? (h.chapter ? `chapter${h.chapter}` : "onepage") : null;
    for (let i = from; i < lines.length; i++) {
      const L = lines[i];
      const hit = kicker ? L.some((l, j) => l === kicker && (L[j + 1] ?? "").startsWith(title.slice(0, 20))) : L.some((l, j) => l === title || (title.startsWith(l) && l.length > 8 && (l + (L[j + 1] ?? "")).startsWith(title)));
      if (hit) {
        from = i;
        return String(i + 1);
      }
    }
    throw new Error(`Heading not found in PDF: ${h.text}`);
  });
}

const pass1 = join(tmp, "pass1.pdf");
await render(page(toc() + `<main>${bodyHtml}</main>`), pass1, bodyOpts);
const numbers = await locate(pass1);
const bodyPdf = join(tmp, "body.pdf");
await render(page(toc(numbers) + `<main>${bodyHtml}</main>`), bodyPdf, bodyOpts);
const check = await locate(bodyPdf);
if (check.join() !== numbers.join()) throw new Error("Table of contents moved between passes");

const coverPdf = join(tmp, "cover.pdf");
await render(coverHtml(), coverPdf, { margin: { top: "0", bottom: "0", left: "0", right: "0" } });
await browser.close();

/* ───────────────────────────── Assemble + metadata ───────────────────────────── */

const doc = await PDFDocument.load(await readFile(bodyPdf), { updateMetadata: false });
const cover = await PDFDocument.load(await readFile(coverPdf));
const [coverPage] = await doc.copyPages(cover, [0]);
doc.insertPage(0, coverPage);
doc.setTitle(TITLE, { showInWindowTitleBar: true });
doc.setAuthor(AUTHOR);
doc.setSubject("A step-by-step guide to building a 3D phone-style personal website with Claude Code, from a template or from scratch.");
doc.setKeywords(["Claude Code", "portfolio", "Next.js", "3D phone", "React Three Fiber", "Vercel", "personal website", "template"]);
doc.setCreator("guide/build.mjs (markdown-it, shiki, Playwright Chromium)");
doc.setProducer("pdf-lib");
doc.setLanguage("en");
const now = new Date();
doc.setCreationDate(now);
doc.setModificationDate(now);
await writeFile(OUT_PDF, await doc.save());

/* ───────────────────────────── Markdown version + prompt files ───────────────────────────── */

function toGithubMarkdown(src) {
  const lines = src.split("\n");
  const out = [];
  let box = null;
  let chapterNo = 0;
  let promptFile = null;
  for (const line of lines) {
    const fence = line.match(/^```(\w+)(?:\s+(\S+))?\s*$/);
    if (fence) {
      promptFile = fence[2] ?? null;
      out.push(box === "quote" ? `> \`\`\`${fence[1]}` : `\`\`\`${fence[1]}`);
      continue;
    }
    if (promptFile && /^```\s*$/.test(line)) {
      out.push(line, "", `Copy it from [prompts/${promptFile}](${PROMPTS_URL}${promptFile})`);
      promptFile = null;
      continue;
    }
    const open = line.match(/^:::\s*(\w[\w-]*)\s*(.*)$/);
    if (open) {
      const [, name, rest] = open;
      if (CALLOUTS[name]) {
        box = "quote";
        out.push(`> ${CALLOUTS[name][0]} **${CALLOUTS[name][1]}**`, ">");
      } else if (name === "step") {
        const [, n, title] = `${name} ${rest}`.match(/^step\s+(\d+)\s*\|\s*(.*)$/);
        out.push(`### Step ${n}: ${title}`);
        box = "plain";
      } else box = "plain";
      continue;
    }
    if (/^:::\s*$/.test(line)) {
      box = null;
      out.push("");
      continue;
    }
    let l = line;
    if (/^# /.test(l) && l !== "# Quick Reference") l = l.replace(/^# /, `# ${++chapterNo}. `);
    out.push(box === "quote" ? (l ? `> ${l}` : ">") : l);
  }
  return out.join("\n").replace(/\(images\//g, "(images/");
}

const tocMd = headings
  .filter((h) => h.level === 1)
  .map((h) => `- [${h.chapter ? `${h.chapter}. ` : ""}${h.text}](#${slug((h.chapter ? `${h.chapter}. ` : "") + h.text)})`)
  .join("\n");
await writeFile(
  OUT_MD,
  `# ${TITLE}\n\n*${SUBTITLE}*\n\nby **${AUTHOR}** · ${DATE} · ${VERSION}\n\n![The 3D phone on desktop](images/hero-front.jpg)\n\n## Contents\n\n${tocMd}\n\n${toGithubMarkdown(source)}`,
);

// Every named prompt as its own file in guide/prompts/ (the template's prompts/ is never written)
const promptDirs = [join(here, "prompts")];
for (const dir of promptDirs) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}
let count = 0;
for (const t of md.parse(source, {})) {
  const { kind, file } = fenceInfo(t.info ?? "");
  if (t.type !== "fence" || kind !== "prompt" || !file) continue;
  count++;
  for (const dir of promptDirs) await writeFile(join(dir, file), t.content);
}

if (!keepHtml) await rm(tmp, { recursive: true, force: true });
const size = (await readFile(OUT_PDF)).length;
console.log(`${OUT_PDF.replace(root + "/", "")}: ${pageCount(OUT_PDF)} pages, ${(size / 1024 / 1024).toFixed(2)} MB; ${count} prompts → ${promptDirs.map((d) => d.replace(root + "/", "")).join(", ")}`);
