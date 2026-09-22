(() => {
  const ARTICLE = 'article[data-testid="tweet"]';
  const TWEET_TEXT = '[data-testid="tweetText"]';
  const USER_NAME = '[data-testid="User-Name"]';
  const REPLY = '[data-testid="reply"]';
  const BOUND = "data-speakx-bound";
  const PLAYER_ID = "speakx-player";

  const DEFAULTS = {
    enabled: true,
    rate: 1.02,
    pitch: 1,
    voiceURI: "",
    announceAuthor: true,
    autoAdvance: false,
    skipUrls: true,
    skipHashtags: false,
    readThread: true,
    includeQuote: true,
  };

  let settings = { ...DEFAULTS };
  let status = "idle";
  let currentArticle = null;
  let currentLabel = "";
  let currentText = "";
  let generation = 0;
  let scanTimer = 0;

  const speakerSvg = `
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M5.2 9.2h2.5L12 6v12l-4.3-3.2H5.2A1.2 1.2 0 0 1 4 13.6V10.4A1.2 1.2 0 0 1 5.2 9.2Z"/>
      <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M15.1 9.2a3.3 3.3 0 0 1 0 5.6"/>
      <path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity=".7" d="M17.5 7.1a6 6 0 0 1 0 9.8"/>
    </svg>`;

  function loadSettings() {
    return new Promise((resolve) => {
      if (!chrome.runtime?.id) {
        resolve(settings);
        return;
      }
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (res) => {
        if (chrome.runtime.lastError) {
          resolve(settings);
          return;
        }
        settings = { ...DEFAULTS, ...(res || {}) };
        resolve(settings);
      });
    });
  }

  function getVoices() {
    const list = speechSynthesis.getVoices();
    return list.filter((v) => v.lang.toLowerCase().startsWith("en") || v.default);
  }

  function pickVoice() {
    const voices = getVoices();
    if (!voices.length) return null;
    if (settings.voiceURI) {
      const match = voices.find((v) => v.voiceURI === settings.voiceURI);
      if (match) return match;
    }
    return (
      voices.find((v) => /natural|premium|enhanced|neural/i.test(v.name)) ||
      voices.find((v) => v.default) ||
      voices[0]
    );
  }

  function clean(text) {
    let t = text || "";
    if (settings.skipUrls) t = t.replace(/https?:\/\/\S+/gi, " ");
    if (settings.skipHashtags) t = t.replace(/#\w+/g, " ");
    return t.replace(/\s+/g, " ").trim();
  }

  function authorOf(article) {
    const root = article.querySelector(USER_NAME);
    if (!root) return { name: "", handle: "" };
    const bits = [...root.querySelectorAll("span, a")]
      .map((el) => (el.textContent || "").trim())
      .filter(Boolean);
    const handle = bits.find((s) => s.startsWith("@")) || "";
    const name =
      bits.find((s) => s && !s.startsWith("@") && s !== "·" && !/^\d/.test(s) && s !== "Verified") ||
      "";
    return { name, handle };
  }

  function textsOf(article) {
    const nodes = [...article.querySelectorAll(TWEET_TEXT)];
    const main = nodes[0] ? nodes[0].innerText : "";
    const quoted = nodes.length > 1 ? nodes[1].innerText : "";
    return { main: clean(main), quoted: clean(quoted) };
  }

  function isStatusPage() {
    return /\/status\/\d+/.test(location.pathname);
  }

  function composeFromArticle(article) {
    const { name, handle } = authorOf(article);
    const { main, quoted } = textsOf(article);
    const parts = [];
    if (settings.announceAuthor && name) parts.push(`${name}.`);
    if (main) parts.push(main);
    if (settings.includeQuote && quoted && quoted !== main) {
      parts.push("Quoted post.");
      parts.push(quoted);
    }
    if (settings.readThread && isStatusPage() && article === primaryArticle()) {
      const rest = [...document.querySelectorAll(ARTICLE)].slice(1);
      for (const next of rest) {
        const t = textsOf(next).main;
        if (t) parts.push(t);
      }
    }
    return {
      text: parts.join(" ").trim(),
      label: name ? `${name} ${handle}`.trim() : handle || "Post",
    };
  }

  function primaryArticle() {
    return document.querySelector(ARTICLE);
  }

  function visibleArticles() {
    return [...document.querySelectorAll(ARTICLE)].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 40;
    });
  }

  function currentViewportArticle() {
    const mid = window.innerHeight * 0.35;
    let best = null;
    let bestDist = Infinity;
    for (const el of visibleArticles()) {
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.top - mid);
      if (r.bottom > 80 && r.top < window.innerHeight && dist < bestDist) {
        best = el;
        bestDist = dist;
      }
    }
    return best || primaryArticle();
  }

  function stop() {
    generation += 1;
    speechSynthesis.cancel();
    status = "idle";
    currentArticle = null;
    currentLabel = "";
    currentText = "";
    document.querySelectorAll(".speakx-btn.is-active").forEach((b) => b.classList.remove("is-active"));
    renderPlayer();
  }

  function speakText(text, label, article) {
    const cleaned = clean(text);
    if (!cleaned) return;
    speechSynthesis.cancel();
    const token = ++generation;
    const utter = new SpeechSynthesisUtterance(cleaned);
    utter.rate = Number(settings.rate) || 1;
    utter.pitch = Number(settings.pitch) || 1;
    const voice = pickVoice();
    if (voice) utter.voice = voice;
    utter.onend = () => {
      if (token !== generation) return;
      const just = currentArticle;
      status = "idle";
      currentArticle = null;
      document.querySelectorAll(".speakx-btn.is-active").forEach((b) => b.classList.remove("is-active"));
      renderPlayer();
      if (settings.autoAdvance && just) {
        const list = visibleArticles();
        const idx = list.indexOf(just);
        const next = list[idx + 1];
        if (next) window.setTimeout(() => speakArticle(next), 240);
      }
    };
    utter.onerror = () => {
      if (token !== generation) return;
      status = "idle";
      renderPlayer();
    };
    currentArticle = article || null;
    currentLabel = label || "SpeakX";
    currentText = cleaned;
    status = "playing";
    if (article) {
      const btn = article.querySelector(".speakx-btn");
      document.querySelectorAll(".speakx-btn.is-active").forEach((b) => b.classList.remove("is-active"));
      btn?.classList.add("is-active");
    }
    renderPlayer();
    speechSynthesis.speak(utter);
  }

  function speakArticle(article) {
    if (!settings.enabled) return;
    const { text, label } = composeFromArticle(article);
    if (!text) return;
    speakText(text, label, article);
  }

  function pauseOrResume() {
    if (status === "playing") {
      speechSynthesis.pause();
      status = "paused";
      renderPlayer();
      return;
    }
    if (status === "paused") {
      speechSynthesis.resume();
      status = "playing";
      renderPlayer();
    }
  }

  function findActionBar(article) {
    const reply = article.querySelector(REPLY);
    if (reply) return reply.closest('[role="group"]') || reply.parentElement;
    const groups = article.querySelectorAll('[role="group"]');
    return groups[groups.length - 1] || null;
  }

  function injectButton(article) {
    if (article.getAttribute(BOUND) === "1") {
      if (!article.querySelector(".speakx-action")) article.removeAttribute(BOUND);
      else return;
    }
    const bar = findActionBar(article);
    if (!bar) return;
    article.setAttribute(BOUND, "1");

    const wrap = document.createElement("div");
    wrap.className = "speakx-action";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "speakx-btn";
    btn.setAttribute("aria-label", "Listen to this post");
    btn.title = "Listen with SpeakX";
    btn.innerHTML = speakerSvg;
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (currentArticle === article && status !== "idle") {
        stop();
        return;
      }
      speakArticle(article);
    });
    wrap.appendChild(btn);
    bar.appendChild(wrap);
  }

  function scan() {
    if (!settings.enabled) return;
    document.querySelectorAll(ARTICLE).forEach(injectButton);
  }

  function scheduleScan() {
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(scan, 120);
  }

  function ensurePlayer() {
    if (document.getElementById(PLAYER_ID)) return;
    const root = document.createElement("div");
    root.id = PLAYER_ID;
    root.hidden = true;
    root.innerHTML = `
      <div class="speakx-player-inner">
        <div class="speakx-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <div class="speakx-player-copy">
          <div class="speakx-player-title"></div>
          <div class="speakx-player-sub">SpeakX</div>
        </div>
        <div class="speakx-player-actions">
          <button type="button" class="speakx-pbtn" data-act="toggle" aria-label="Pause or resume">Pause</button>
          <button type="button" class="speakx-pbtn" data-act="stop" aria-label="Stop">Stop</button>
        </div>
      </div>`;
    document.documentElement.appendChild(root);
    root.addEventListener("click", (event) => {
      const act = event.target.closest("[data-act]")?.getAttribute("data-act");
      if (act === "toggle") pauseOrResume();
      if (act === "stop") stop();
    });
  }

  function renderPlayer() {
    const root = document.getElementById(PLAYER_ID);
    if (!root) return;
    const show = status !== "idle";
    root.hidden = !show;
    root.classList.toggle("is-playing", status === "playing");
    if (!show) return;
    const title = root.querySelector(".speakx-player-title");
    const sub = root.querySelector(".speakx-player-sub");
    const toggle = root.querySelector('[data-act="toggle"]');
    if (title) title.textContent = currentLabel || "SpeakX";
    if (sub) {
      sub.textContent =
        status === "paused" ? "Paused" : `Reading at ${Number(settings.rate).toFixed(2)}×`;
    }
    if (toggle) toggle.textContent = status === "paused" ? "Resume" : "Pause";
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (!message || !message.type) return;
    if (message.type === "SETTINGS_UPDATED") {
      loadSettings().then(() => {
        if (!settings.enabled) stop();
      });
      return;
    }
    if (message.type === "STOP") {
      stop();
      return;
    }
    if (message.type === "SPEAK_TEXT") {
      speakText(message.text || "", "Selection", null);
      return;
    }
    if (message.type === "SPEAK_CURRENT") {
      const el = currentViewportArticle();
      if (el) speakArticle(el);
      return;
    }
    if (message.type === "GET_STATE") {
      chrome.runtime.sendMessage({
        type: "STATE",
        payload: { status, label: currentLabel },
      });
    }
  });

  loadSettings().then(() => {
    ensurePlayer();
    scan();
    const obs = new MutationObserver(scheduleScan);
    obs.observe(document.body, { childList: true, subtree: true });
    speechSynthesis.addEventListener("voiceschanged", () => {});
  });
})();
