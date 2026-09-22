import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/install")({ component: InstallPage });

const STEPS = [
  {
    n: "01",
    title: "Download the package",
    body: "Get speakx-extension.zip from this site. Unzip it. You should see a folder named speakx that contains manifest.json.",
  },
  {
    n: "02",
    title: "Open Chrome extensions",
    body: "In Chrome, go to chrome://extensions (paste that into the address bar). Turn on Developer mode in the top right.",
  },
  {
    n: "03",
    title: "Load unpacked",
    body: "Click Load unpacked and select the unzipped speakx folder — the one that holds manifest.json, not its parent.",
  },
  {
    n: "04",
    title: "Open X and listen",
    body: "Visit x.com. Each post gets a Listen control on the action bar. Click it, or press Alt+S. Pin SpeakX from the puzzle-piece menu so the popup is one click away.",
  },
];

function InstallPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader current="install" />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Chrome · Manifest V3
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Install SpeakX</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Chrome will not auto-install an extension from a website. Load it unpacked in
          Developer mode. That is the same path every unpublished extension uses.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href="/speakx-extension.zip" download>
              <Download className="size-4" />
              Download speakx-extension.zip
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/source">Read the source</Link>
          </Button>
        </div>

        <ol className="mt-12 grid gap-4">
          {STEPS.map((step) => (
            <li key={step.n} className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <p className="text-xs tabular-nums text-muted-foreground">{step.n}</p>
              <h2 className="mt-2 font-display text-2xl tracking-tight">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-xl border border-border bg-secondary/50 p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Permissions, plainly</p>
          <p className="mt-2">
            storage — remembers voice and rate. contextMenus — optional “Speak selection” on
            highlighted text. Host access is limited to x.com and twitter.com. Speech runs
            in the page via the Web Speech API; nothing is uploaded.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
