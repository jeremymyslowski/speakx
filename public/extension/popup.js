const KEYS = [
  "enabled",
  "rate",
  "pitch",
  "voiceURI",
  "announceAuthor",
  "autoAdvance",
  "skipUrls",
  "readThread",
  "includeQuote",
];

const $ = (id) => document.getElementById(id);

function fillVoices(selected) {
  const select = $("voiceURI");
  const voices = speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("en") || v.default);
  select.innerHTML = "";
  const def = document.createElement("option");
  def.value = "";
  def.textContent = "System default";
  select.appendChild(def);
  for (const v of voices) {
    const opt = document.createElement("option");
    opt.value = v.voiceURI;
    opt.textContent = `${v.name} · ${v.lang}`;
    select.appendChild(opt);
  }
  select.value = selected || "";
}

function readForm() {
  return {
    enabled: $("enabled").checked,
    rate: Number($("rate").value),
    pitch: Number($("pitch").value),
    voiceURI: $("voiceURI").value,
    announceAuthor: $("announceAuthor").checked,
    autoAdvance: $("autoAdvance").checked,
    skipUrls: $("skipUrls").checked,
    readThread: $("readThread").checked,
    includeQuote: $("includeQuote").checked,
  };
}

function apply(settings) {
  $("enabled").checked = !!settings.enabled;
  $("rate").value = settings.rate ?? 1;
  $("pitch").value = settings.pitch ?? 1;
  $("announceAuthor").checked = !!settings.announceAuthor;
  $("autoAdvance").checked = !!settings.autoAdvance;
  $("skipUrls").checked = !!settings.skipUrls;
  $("readThread").checked = !!settings.readThread;
  $("includeQuote").checked = !!settings.includeQuote;
  $("rateVal").textContent = `${Number(settings.rate).toFixed(2)}×`;
  $("pitchVal").textContent = Number(settings.pitch).toFixed(2);
  fillVoices(settings.voiceURI);
}

function persist() {
  const settings = readForm();
  $("rateVal").textContent = `${Number(settings.rate).toFixed(2)}×`;
  $("pitchVal").textContent = Number(settings.pitch).toFixed(2);
  chrome.runtime.sendMessage({ type: "SET_SETTINGS", settings });
}

chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (settings) => {
  apply(settings || {});
});

speechSynthesis.addEventListener("voiceschanged", () => {
  fillVoices($("voiceURI").value);
});

for (const id of KEYS) {
  $(id).addEventListener("change", persist);
  $(id).addEventListener("input", persist);
}

$("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "FORWARD_ACTIVE", payload: { type: "STOP" } });
});

$("speak").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "FORWARD_ACTIVE", payload: { type: "SPEAK_CURRENT" } });
});
