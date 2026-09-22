import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { Timeline } from "@/components/timeline";
import { VoicePanel } from "@/components/voice-panel";
import { PlayerDock } from "@/components/player-dock";
import { PasteSpeak } from "@/components/paste-speak";
import { Button } from "@/components/ui/button";
import { Mark } from "@/components/mark";
import { usePlayer } from "@/lib/player-store";
import { refreshVoices, stopSpeaking, togglePlayback } from "@/lib/tts";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrate = usePlayer((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    refreshVoices();
    const s = window.speechSynthesis;
    const onVoices = () => refreshVoices();
    s?.addEventListener("voiceschanged", onVoices);
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayback();
      } else if (e.key === "Escape") {
        stopSpeaking();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      s?.removeEventListener("voiceschanged", onVoices);
      window.removeEventListener("keydown", onKey);
    };
  }, [hydrate]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader current="home" />
      <main className="pb-28">
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Chrome extension for X
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">
            Hear the timeline.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            SpeakX reads posts, threads, and replies on X out loud — in the voice your
            browser already has. One Listen button. A player that stays out of the way.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild>
              <a href="#demo">Try it on this page</a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/install">
                Get the Chrome extension
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Timeline />
          <div className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
            <VoicePanel />
            <PasteSpeak />
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-24 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            On X
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
            What the extension actually does
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Feature
              step="01"
              title="Pins a Listen control"
              body="A content script watches the timeline and injects a speaker control on every post — next to reply, repost, and like."
            />
            <Feature
              step="02"
              title="Reads the post, not the chrome"
              body="It pulls display name and body text, optional quoted posts and thread continuations, and skips URLs if you want."
            />
            <Feature
              step="03"
              title="Stays on the page"
              body="Playback runs in the tab with Chrome’s speech engine. Alt+S speaks the current post. Alt+Shift+S stops."
            />
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-24 sm:px-6">
          <div className="overflow-hidden rounded-xl border border-border bg-card px-5 py-8 sm:px-10 sm:py-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-foreground">
                  <Mark className="size-6" />
                  <span className="font-display text-lg">Load unpacked</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Download the package, unzip it, and point Chrome at the folder. No store
                  listing, no account. The same files are published here on Vercel.
                </p>
              </div>
              <Button asChild>
                <Link to="/install">Install instructions</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <PlayerDock />
    </div>
  );
}

function Feature({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <p className="text-xs tabular-nums text-muted-foreground">{step}</p>
      <h3 className="mt-3 font-display text-2xl tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
