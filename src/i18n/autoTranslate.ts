// Runtime English -> Hebrew DOM translator.
// Walks text nodes and replaces them when language is Hebrew, using a phrase dictionary.
// Skips inputs, textareas, contenteditable, code/pre, and elements with [data-no-translate].

import { hebrewDictionary } from "./hebrewDictionary";

const SKIP_TAGS = new Set([
  "INPUT", "TEXTAREA", "SCRIPT", "STYLE", "CODE", "PRE", "NOSCRIPT", "SVG",
]);

// Build a normalized lookup map (case-insensitive on first char preserved logic via two maps)
const dictMap = new Map<string, string>();
const lowerDictMap = new Map<string, string>();
for (const [en, he] of Object.entries(hebrewDictionary)) {
  dictMap.set(en, he);
  lowerDictMap.set(en.toLowerCase(), he);
}

// Build a regex that matches any phrase (longest first to prefer multi-word matches).
const sortedKeys = Object.keys(hebrewDictionary).sort((a, b) => b.length - a.length);
const escapeRe = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
let phraseRegex: RegExp | null = null;
try {
  // word-boundary-ish: not preceded/followed by alphanumeric
  phraseRegex = new RegExp(
    `(?<![A-Za-z0-9])(${sortedKeys.map(escapeRe).join("|")})(?![A-Za-z0-9])`,
    "g",
  );
} catch {
  phraseRegex = null;
}

const HEBREW_RE = /[\u0590-\u05FF]/;
const ENGLISH_RE = /[A-Za-z]/;

function shouldSkip(node: Node): boolean {
  let el: Node | null = node;
  while (el) {
    if (el.nodeType === 1) {
      const e = el as HTMLElement;
      if (SKIP_TAGS.has(e.tagName)) return true;
      if (e.isContentEditable) return true;
      if (e.hasAttribute("data-no-translate")) return true;
    }
    el = el.parentNode;
  }
  return false;
}

function translateString(text: string): string {
  if (!phraseRegex) return text;
  if (!ENGLISH_RE.test(text)) return text;
  return text.replace(phraseRegex, (match) => {
    return dictMap.get(match) ?? lowerDictMap.get(match.toLowerCase()) ?? match;
  });
}

function translateTextNode(node: Text) {
  const original = node.nodeValue;
  if (!original) return;
  if (HEBREW_RE.test(original)) return;
  if (!ENGLISH_RE.test(original)) return;
  const translated = translateString(original);
  if (translated !== original) {
    node.nodeValue = translated;
  }
}

function walk(root: Node) {
  if (shouldSkip(root)) return;
  if (root.nodeType === 3) {
    translateTextNode(root as Text);
    return;
  }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;

  // Translate placeholder/title/aria-label on element nodes
  if (root.nodeType === 1) {
    const el = root as HTMLElement;
    for (const attr of ["placeholder", "title", "aria-label"] as const) {
      const v = el.getAttribute(attr);
      if (v && ENGLISH_RE.test(v) && !HEBREW_RE.test(v)) {
        const t = translateString(v);
        if (t !== v) el.setAttribute(attr, t);
      }
    }
  }

  const children = (root as Element).childNodes;
  for (let i = 0; i < children.length; i++) {
    walk(children[i]);
  }
}

let observer: MutationObserver | null = null;
let active = false;

export function startAutoTranslate() {
  if (active || typeof document === "undefined") return;
  active = true;
  walk(document.body);
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "characterData" && m.target.nodeType === 3) {
        if (!shouldSkip(m.target)) translateTextNode(m.target as Text);
      } else if (m.type === "childList") {
        m.addedNodes.forEach((n) => walk(n));
      } else if (m.type === "attributes" && m.target.nodeType === 1) {
        const el = m.target as HTMLElement;
        const attr = m.attributeName;
        if (attr && ["placeholder", "title", "aria-label"].includes(attr)) {
          const v = el.getAttribute(attr);
          if (v && ENGLISH_RE.test(v) && !HEBREW_RE.test(v)) {
            const t = translateString(v);
            if (t !== v) el.setAttribute(attr, t);
          }
        }
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder", "title", "aria-label"],
  });
}

export function stopAutoTranslate() {
  if (!active) return;
  active = false;
  observer?.disconnect();
  observer = null;
  // Reload the page to restore original English text from React's virtual DOM.
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}
