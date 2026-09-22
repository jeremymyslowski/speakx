import { useState } from "react";
import { Button } from "@/components/ui/button";
import { speakCustom } from "@/lib/tts";

export function PasteSpeak() {
  const [value, setValue] = useState("");

  return (
    <form
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        speakCustom(value);
      }}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Any text
      </p>
      <h2 className="mt-1 font-display text-2xl tracking-tight">Paste something to hear it</h2>
      <label className="mt-4 grid gap-2">
        <span className="sr-only">Text to read</span>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          placeholder="Drop in a post, a thread, a paragraph…"
          className="w-full resize-y rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/70"
        />
      </label>
      <div className="mt-3 flex justify-end">
        <Button type="submit" size="sm" disabled={!value.trim()}>
          Speak this
        </Button>
      </div>
    </form>
  );
}
