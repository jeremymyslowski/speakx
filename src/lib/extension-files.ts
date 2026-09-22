export const EXTENSION_FILES = [
  { path: "manifest.json", label: "manifest.json", lang: "json" },
  { path: "background.js", label: "background.js", lang: "js" },
  { path: "content.js", label: "content.js", lang: "js" },
  { path: "content.css", label: "content.css", lang: "css" },
  { path: "popup.html", label: "popup.html", lang: "html" },
  { path: "popup.css", label: "popup.css", lang: "css" },
  { path: "popup.js", label: "popup.js", lang: "js" },
] as const;

export type ExtensionFilePath = (typeof EXTENSION_FILES)[number]["path"];
