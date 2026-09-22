import { DEMO_POSTS, type DemoPost } from "@/lib/feed";
import { usePlayer, type SpeechSettings } from "@/lib/player-store";

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

export function loadVoices(): SpeechSynthesisVoice[] {
  const s = synth();
  if (!s) return [];
  return s.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en") || v.default);
}

export function composeSpeech(post: DemoPost, settings: SpeechSettings): string {
  let body = post.text;
  if (settings.skipUrls) body = body.replace(/https?:\/\/\S+/gi, " ");
  if (settings.skipHashtags) body = body.replace(/#\w+/g, " ");
  body = body.replace(/\s+/g, " ").trim();

  const parts: string[] = [];
  if (settings.announceAuthor) {
    parts.push(`${post.name}.`);
  }
  parts.push(body);
  if (settings.readThread && post.threadRest?.length) {
    for (const chunk of post.threadRest) {
      parts.push(chunk);
    }
  }
  return parts.join(" ");
}

function pickVoice(settings: SpeechSettings): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices.length) return null;
  if (settings.voiceURI) {
    const match = voices.find((v) => v.voiceURI === settings.voiceURI);
    if (match) return match;
  }
  return (
    voices.find((v) => /natural|premium|enhanced|neural/i.test(v.name)) ??
    voices.find((v) => v.default) ??
    voices[0] ??
    null
  );
}

let active: SpeechSynthesisUtterance | null = null;
let generation = 0;

function finishCurrent(advance: boolean) {
  const { status, currentId, settings } = usePlayer.getState();
  if (status === "idle") return;
  usePlayer.setState({ status: "idle", charIndex: 0 });
  if (advance && settings.autoAdvance && currentId) {
    const idx = DEMO_POSTS.findIndex((p) => p.id === currentId);
    const next = DEMO_POSTS[idx + 1];
    if (next) {
      window.setTimeout(() => {
        void speakPost(next.id);
      }, 280);
    } else {
      usePlayer.setState({ currentId: null, spokenText: "" });
    }
  } else if (!advance) {
    usePlayer.setState({ currentId: null, spokenText: "", charIndex: 0 });
  }
}

export function stopSpeaking() {
  generation += 1;
  const s = synth();
  s?.cancel();
  active = null;
  usePlayer.setState({ status: "idle", currentId: null, spokenText: "", charIndex: 0 });
}

export function pauseSpeaking() {
  const s = synth();
  const { status } = usePlayer.getState();
  if (!s || status !== "playing") return;
  s.pause();
  usePlayer.setState({ status: "paused" });
}

export function resumeSpeaking() {
  const s = synth();
  const { status } = usePlayer.getState();
  if (!s || status !== "paused") return;
  s.resume();
  usePlayer.setState({ status: "playing" });
}

export function togglePlayback() {
  const { status, currentId } = usePlayer.getState();
  if (status === "playing") pauseSpeaking();
  else if (status === "paused") resumeSpeaking();
  else if (currentId) void speakPost(currentId);
  else if (DEMO_POSTS[0]) void speakPost(DEMO_POSTS[0].id);
}

export function speakPost(id: string) {
  const post = DEMO_POSTS.find((p) => p.id === id);
  if (!post) return;
  const s = synth();
  if (!s) {
    usePlayer.setState({
      status: "idle",
      currentId: id,
      spokenText: post.text,
      unsupported: true,
    });
    return;
  }

  s.cancel();
  const token = ++generation;
  const settings = usePlayer.getState().settings;
  const text = composeSpeech(post, settings);
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = settings.rate;
  utter.pitch = settings.pitch;
  utter.volume = 1;
  const voice = pickVoice(settings);
  if (voice) utter.voice = voice;

  utter.onboundary = (event) => {
    if (token !== generation) return;
    if (event.name === "word" || event.name === "sentence") {
      usePlayer.setState({ charIndex: event.charIndex });
    }
  };
  utter.onend = () => {
    if (token !== generation) return;
    active = null;
    finishCurrent(true);
  };
  utter.onerror = () => {
    if (token !== generation) return;
    active = null;
    usePlayer.setState({ status: "idle" });
  };

  active = utter;
  usePlayer.setState({
    status: "playing",
    currentId: id,
    spokenText: text,
    charIndex: 0,
    unsupported: false,
  });
  s.speak(utter);
}

export function speakCustom(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const s = synth();
  if (!s) {
    usePlayer.setState({ unsupported: true, spokenText: trimmed, currentId: "custom" });
    return;
  }
  s.cancel();
  const token = ++generation;
  const settings = usePlayer.getState().settings;
  const utter = new SpeechSynthesisUtterance(trimmed);
  utter.rate = settings.rate;
  utter.pitch = settings.pitch;
  const voice = pickVoice(settings);
  if (voice) utter.voice = voice;
  utter.onboundary = (event) => {
    if (token !== generation) return;
    usePlayer.setState({ charIndex: event.charIndex });
  };
  utter.onend = () => {
    if (token !== generation) return;
    active = null;
    usePlayer.setState({ status: "idle", charIndex: 0 });
  };
  active = utter;
  usePlayer.setState({
    status: "playing",
    currentId: "custom",
    spokenText: trimmed,
    charIndex: 0,
    unsupported: false,
  });
  s.speak(utter);
}

export function refreshVoices() {
  usePlayer.setState({ voices: loadVoices() });
}

export function currentUtterance(): SpeechSynthesisUtterance | null {
  return active;
}
