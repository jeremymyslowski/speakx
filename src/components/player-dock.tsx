import { Pause, Play, SkipForward, Square } from "lucide-react";
import { DEMO_POSTS } from "@/lib/feed";
import { usePlayer } from "@/lib/player-store";
import { pauseSpeaking, resumeSpeaking, speakPost, stopSpeaking } from "@/lib/tts";
import { Equalizer } from "@/components/mark";
import { Button } from "@/components/ui/button";

export function PlayerDock() {
  const status = usePlayer((s) => s.status);
  const currentId = usePlayer((s) => s.currentId);
  const spokenText = usePlayer((s) => s.spokenText);
  const charIndex = usePlayer((s) => s.charIndex);
  const rate = usePlayer((s) => s.settings.rate);
  const unsupported = usePlayer((s) => s.unsupported);

  if (!currentId && status === "idle") return null;

  const post = DEMO_POSTS.find((p) => p.id === currentId);
  const title =
    currentId === "custom"
      ? "Pasted text"
      : post
        ? `${post.name} · @${post.handle}`
        : "SpeakX";
  const progress =
    spokenText.length > 0 ? Math.min(1, Math.max(0, charIndex / spokenText.length)) : 0;
  const idx = post ? DEMO_POSTS.findIndex((p) => p.id === post.id) : -1;
  const next = idx >= 0 ? DEMO_POSTS[idx + 1] : undefined;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
      <div className="pointer-events-auto mx-auto max-w-3xl overflow-hidden rounded-xl border border-border bg-card shadow-[0_-12px_40px_rgb(0_0_0_/_0.45)]">
        <div className="h-px bg-border">
          <div
            className="h-px bg-accent transition-[width] duration-150 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
          <Equalizer active={status === "playing"} className="text-accent" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {unsupported
                ? "This browser has no speech engine — the extension uses Chrome’s."
                : status === "paused"
                  ? "Paused"
                  : status === "playing"
                    ? `Reading at ${rate.toFixed(2)}×`
                    : "Ready"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={status === "playing" ? "Pause" : "Play"}
              onClick={() => {
                if (status === "playing") pauseSpeaking();
                else if (status === "paused") resumeSpeaking();
                else if (currentId && currentId !== "custom") speakPost(currentId);
              }}
            >
              {status === "playing" ? <Pause /> : <Play />}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Next post"
              disabled={!next}
              onClick={() => next && speakPost(next.id)}
            >
              <SkipForward />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Stop"
              onClick={() => stopSpeaking()}
            >
              <Square />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
