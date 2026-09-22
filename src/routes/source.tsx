import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { EXTENSION_FILES, type ExtensionFilePath } from "@/lib/extension-files";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/source")({ component: SourcePage });

function SourcePage() {
  const [active, setActive] = useState<ExtensionFilePath>("manifest.json");
  const [cache, setCache] = useState<Partial<Record<ExtensionFilePath, string>>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache[active]) return;
    let cancelled = false;
    fetch(`/extension/${active}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load ${active}`);
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setCache((prev) => ({ ...prev, [active]: text }));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load failed");
      });
    return () => {
      cancelled = true;
    };
  }, [active, cache]);

  const body = cache[active];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader current="source" />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Manifest V3
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Extension source</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Vanilla JavaScript. No build step. Load the folder as unpacked and it runs.
              These are the same files in the zip.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/speakx-extension.zip" download>
              Download zip
            </a>
          </Button>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-2">
            {EXTENSION_FILES.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => {
                  setError(null);
                  setActive(file.path);
                }}
                className={cn(
                  "h-9 shrink-0 rounded-full px-3 font-mono text-xs transition-colors duration-150",
                  active === file.path
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {file.label}
              </button>
            ))}
          </div>
          <pre className="max-h-[70vh] overflow-auto p-4 text-[12.5px] leading-relaxed text-foreground/90 sm:p-5">
            <code className="font-mono">
              {error ? error : (body ?? "Loading…")}
            </code>
          </pre>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
