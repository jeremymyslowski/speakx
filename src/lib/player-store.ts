import { create } from "zustand";

export type SpeechSettings = {
  rate: number;
  pitch: number;
  voiceURI: string;
  announceAuthor: boolean;
  autoAdvance: boolean;
  skipUrls: boolean;
  skipHashtags: boolean;
  readThread: boolean;
};

export const defaultSettings: SpeechSettings = {
  rate: 1.02,
  pitch: 1,
  voiceURI: "",
  announceAuthor: true,
  autoAdvance: true,
  skipUrls: true,
  skipHashtags: false,
  readThread: true,
};

const STORAGE_KEY = "speakx-settings-v1";

export function readStoredSettings(): SpeechSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<SpeechSettings>) };
  } catch {
    return defaultSettings;
  }
}

export type PlayerStatus = "idle" | "playing" | "paused";

type PlayerState = {
  status: PlayerStatus;
  currentId: string | null;
  spokenText: string;
  charIndex: number;
  voices: SpeechSynthesisVoice[];
  settings: SpeechSettings;
  hydrated: boolean;
  unsupported: boolean;
  hydrate: () => void;
  patchSettings: (partial: Partial<SpeechSettings>) => void;
};

export const usePlayer = create<PlayerState>((set, get) => ({
  status: "idle",
  currentId: null,
  spokenText: "",
  charIndex: 0,
  voices: [],
  settings: defaultSettings,
  hydrated: false,
  unsupported: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ settings: readStoredSettings(), hydrated: true });
  },
  patchSettings: (partial) => {
    const settings = { ...get().settings, ...partial };
    set({ settings });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  },
}));
