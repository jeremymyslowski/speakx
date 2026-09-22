import { Bookmark, Heart, MessageCircle, Repeat2 } from "lucide-react";
import { DEMO_POSTS, TONE_CLASS, type DemoPost } from "@/lib/feed";
import { usePlayer } from "@/lib/player-store";
import { speakPost, stopSpeaking } from "@/lib/tts";
import { cn, formatCount } from "@/lib/utils";
import { Equalizer } from "@/components/mark";

export function Timeline() {
  return (
    <div
      id="demo"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Live demo
          </p>
          <p className="font-display text-xl tracking-tight">A timeline you can hear</p>
        </div>
        <p className="hidden max-w-48 text-right text-xs text-muted-foreground sm:block">
          Same Listen control the extension injects on x.com
        </p>
      </div>
      <ol className="divide-y divide-border">
        {DEMO_POSTS.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function PostCard({ post }: { post: DemoPost }) {
  const currentId = usePlayer((s) => s.currentId);
  const status = usePlayer((s) => s.status);
  const spokenText = usePlayer((s) => s.spokenText);
  const charIndex = usePlayer((s) => s.charIndex);
  const isCurrent = currentId === post.id;
  const isPlaying = isCurrent && status === "playing";

  function onListen() {
    if (isPlaying || (isCurrent && status === "paused")) {
      stopSpeaking();
      return;
    }
    speakPost(post.id);
  }

  return (
    <article
      className={cn(
        "relative px-4 py-4 transition-colors duration-200 sm:px-5 sm:py-5",
        isCurrent && "bg-secondary/60",
      )}
    >
      {isCurrent ? (
        <span className="absolute inset-y-3 left-0 w-px bg-accent" aria-hidden="true" />
      ) : null}
      <div className="flex gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-medium",
            TONE_CLASS[post.tone],
          )}
        >
          {post.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
            <span className="font-medium text-foreground">{post.name}</span>
            {post.verified ? (
              <span className="text-[11px] text-muted-foreground">Verified</span>
            ) : null}
            <span className="text-muted-foreground">@{post.handle}</span>
            <span className="text-muted-foreground">· {post.time}</span>
          </div>
          <p className="mt-1 text-[15px] leading-relaxed text-foreground/95">
            {isCurrent && spokenText ? (
              <SpokenBody text={post.text} spokenText={spokenText} charIndex={charIndex} />
            ) : (
              post.text
            )}
          </p>
          {post.threadRest?.length ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Thread · {post.threadRest.length + 1} posts
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-1 text-muted-foreground">
            <Metric icon={MessageCircle} value={formatCount(post.replies)} label="Replies" />
            <Metric icon={Repeat2} value={formatCount(post.reposts)} label="Reposts" />
            <Metric icon={Heart} value={formatCount(post.likes)} label="Likes" />
            <Metric icon={Bookmark} value={post.views} label="Views" />
            <button
              type="button"
              onClick={onListen}
              aria-pressed={isPlaying}
              aria-label={isPlaying ? `Stop reading ${post.name}` : `Listen to ${post.name}`}
              className={cn(
                "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2.5 text-sm transition-colors duration-150",
                isCurrent
                  ? "text-accent hover:bg-accent/10"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Equalizer active={isPlaying} />
              <span className="hidden text-[13px] font-medium sm:inline">
                {isPlaying ? "Stop" : isCurrent && status === "paused" ? "Stopped" : "Listen"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SpokenBody({
  text,
  spokenText,
  charIndex,
}: {
  text: string;
  spokenText: string;
  charIndex: number;
}) {
  const idx = spokenText.indexOf(text);
  const local = Math.min(text.length, Math.max(0, idx >= 0 ? charIndex - idx : charIndex));
  const lead = text.slice(0, local);
  const rest = text.slice(local);
  return (
    <>
      <span className="text-muted-foreground">{lead}</span>
      <span>{rest}</span>
    </>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Heart;
  value: string;
  label: string;
}) {
  return (
    <span className="inline-flex min-h-11 min-w-11 items-center gap-1.5 text-[13px] tabular-nums">
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <span>{value}</span>
    </span>
  );
}
