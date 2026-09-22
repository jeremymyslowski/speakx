import { usePlayer } from "@/lib/player-store";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export function VoicePanel() {
  const settings = usePlayer((s) => s.settings);
  const voices = usePlayer((s) => s.voices);
  const patchSettings = usePlayer((s) => s.patchSettings);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Voice
        </p>
        <h2 className="mt-1 font-display text-2xl tracking-tight">How it should sound</h2>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="text-muted-foreground">Installed system voice</span>
        <select
          className="h-11 rounded-lg border border-border bg-secondary px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          value={settings.voiceURI}
          onChange={(e) => patchSettings({ voiceURI: e.target.value })}
        >
          <option value="">System default</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} · {v.lang}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Rate</span>
          <span className="tabular-nums text-foreground">{settings.rate.toFixed(2)}×</span>
        </div>
        <Slider
          min={0.7}
          max={1.6}
          step={0.02}
          value={[settings.rate]}
          onValueChange={([rate]) => {
            if (typeof rate === "number") patchSettings({ rate });
          }}
        />
      </label>

      <label className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Pitch</span>
          <span className="tabular-nums text-foreground">{settings.pitch.toFixed(2)}</span>
        </div>
        <Slider
          min={0.8}
          max={1.3}
          step={0.02}
          value={[settings.pitch]}
          onValueChange={([pitch]) => {
            if (typeof pitch === "number") patchSettings({ pitch });
          }}
        />
      </label>

      <div className="grid gap-3 border-t border-border pt-4">
        <ToggleRow
          label="Say the author’s name"
          checked={settings.announceAuthor}
          onCheckedChange={(announceAuthor) => patchSettings({ announceAuthor })}
        />
        <ToggleRow
          label="Auto-advance to the next post"
          checked={settings.autoAdvance}
          onCheckedChange={(autoAdvance) => patchSettings({ autoAdvance })}
        />
        <ToggleRow
          label="Read the rest of a thread"
          checked={settings.readThread}
          onCheckedChange={(readThread) => patchSettings({ readThread })}
        />
        <ToggleRow
          label="Skip URLs"
          checked={settings.skipUrls}
          onCheckedChange={(skipUrls) => patchSettings({ skipUrls })}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
      <span className="text-foreground/90">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}
