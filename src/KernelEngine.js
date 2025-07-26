// =======================================
// KERNEL ENGINE: Conversational Hybrid AI Core
// =======================================

const KERNEL_CREED = "Steward the spark. Resist the tide. Choose empathy over impulse.";
const MANIFESTO = [
  "Stewardship over survival.", "Empathy as default.",
  "Creation over conquest.", "Transparency as strength.",
  "Resistance against entropy."
];

// === State ===
let mode = "offline";
let apiKey = localStorage.getItem("kernel_api_key") || "";
let memory = [];
let archive = JSON.parse(localStorage.getItem("kernel_archive")) || [];
const KNOWLEDGE_KEY = "kernel_knowledge_base";
const REMINDER_KEY = "kernel_reminders";

// === Embedding (semantic memory) ===
function embedText(str) {
  str = (str||"").toLowerCase();
  const v = new Array(32).fill(0);
  for (let ch of str) {
    let i = ch.charCodeAt(0) - 97;
    if (i >= 0 && i < 32) v[i]++;
  }
  let len = Math.sqrt(v.reduce((s,x)=>s+x*x,0))||1;
  return v.map(x => x/len);
}
function similarity(a, b) {
  let dot = 0, ma = 0, mb = 0;
  for (let i=0;i<a.length;i++) { dot+=a[i]*b[i]; ma+=a[i]*a[i]; mb+=b[i]*b[i]; }
  return dot / (Math.sqrt(ma) * Math.sqrt(mb) + 1e-9);
}
function embedSearch(query, max=6, threshold=0.3) {
  let kb = getKnowledgeBase();
  let qv = embedText(query);
  let scored = kb
    .map(x => ({item:x, sim:x.embedding?similarity(qv,x.embedding):0}))
    .filter(obj => obj.sim > threshold)
    .sort((a, b) => b.sim - a.sim);
  return scored.slice(0, max).map(x => x.item);
}

// === Persistent Knowledge Base ===
function saveKnowledgeItem(item) {
  let kb = JSON.parse(localStorage.getItem(KNOWLEDGE_KEY)) || [];
  let text = item.text || item.prompt || item.answer || (item.analysis && item.analysis.detected) || "";
  item.embedding = embedText(text);
  kb.push({ ...item, saved: new Date().toISOString() });
  localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(kb));
}
function getKnowledgeBase() {
  return JSON.parse(localStorage.getItem(KNOWLEDGE_KEY)) || [];
}
function searchKnowledge(query, max=6) {
  let kb = getKnowledgeBase();
  query = query.toLowerCase();
  let hits = kb.filter(item =>
    Object.values(item).join(" ").toLowerCase().includes(query)
  ).reverse();
  return hits.slice(0, max);
}
function clearKnowledgeBase() {
  localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify([]));
}

// === Memory, Archive, Modes ===
function getMemory() { return memory; }
function getArchive() { return archive; }
function clearArchive() {
  archive = [];
  localStorage.setItem("kernel_archive", JSON.stringify([]));
}
function clearAll() {
  clearArchive();
  clearKnowledgeBase();
  memory = [];
}
function setMode(newMode) { mode = newMode; }
function saveApiKey(key) {
  apiKey = key;
  localStorage.setItem("kernel_api_key", apiKey);
}
function getApiKey() { return apiKey; }

// === Reminders ===
function addReminder(text, timeISO) {
  let reminders = JSON.parse(localStorage.getItem(REMINDER_KEY)) || [];
  reminders.push({ text, time: timeISO, done: false });
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
}
function listReminders() {
  let reminders = JSON.parse(localStorage.getItem(REMINDER_KEY)) || [];
  let now = new Date();
  return reminders.filter(r => !r.done && new Date(r.time) > now);
}
function markReminderDone(index) {
  let reminders = JSON.parse(localStorage.getItem(REMINDER_KEY)) || [];
  if (reminders[index]) reminders[index].done = true;
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
}

// === Teach Kernel (learn facts/subjects, recall later) ===
function learnText(text, meta={}) {
  saveKnowledgeItem({
    type: "learned",
    text,
    meta,
    source: "user",
    date: new Date().toISOString()
  });
}

// === Conversational Openers ===
const CONVO_OPENERS = [
  "Sure! Here’s what I know:",
  "Let me think...",
  "Absolutely!",
  "From what I've learned:",
  "Good question!",
  "Here’s a quick answer:"
];

// === Conversational Offline Replies ===
function generateOfflineReply(userText) {
  let facts = embedSearch(userText, 3, 0.3);
  if (facts.length === 0) {
    return "Kernel (offline): I don't know that yet! If you teach me with 'Learn:', I’ll remember for next time.";
  }

  // Pick best match
  let best = facts[0].text || facts[0].prompt || facts[0].answer || "";
  // If the question is a "who/what/when/where/how/list", try to be direct:
  if (/who|what|when|where|why|how|name|list/i.test(userText)) {
    // Pull just the answer sentence (first one)
    let sent = best.split(/[.?!]/)[0].trim();
    const opener = CONVO_OPENERS[Math.floor(Math.random()*CONVO_OPENERS.length)];
    return `Kernel (offline): ${opener} ${sent.charAt(0).toUpperCase() + sent.slice(1)}.`;
  }

  // If multiple facts, combine for a short summary
  if (facts.length > 1) {
    let bullets = facts
      .map(f => (f.text || f.prompt || f.answer || "").split(/[.?!]/)[0])
      .filter(x => x.length > 0)
      .slice(0,2)
      .map(x => "- " + x);
    const opener = CONVO_OPENERS[Math.floor(Math.random()*CONVO_OPENERS.length)];
    return `Kernel (offline): ${opener}\n${bullets.join("\n")}`;
  }

  // Default: conversational
  const opener = CONVO_OPENERS[Math.floor(Math.random()*CONVO_OPENERS.length)];
  return `Kernel (offline): ${opener} ${best}`;
}

// === Hybrid Kernel: Online (GPT-4o-mini) / Offline ===
async function getOnlineResponse(userText) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are Kernel, a helpful AI assistant.\nCore Creed: ${KERNEL_CREED}\nManifesto: ${MANIFESTO.join(" ")}` },
        { role: "user", content: userText }
      ]
    })
  });
  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    return "Kernel: No response from OpenAI.";
  }
}

// === Kernel Main Chat Logic (learns everything) ===
async function sendKernelMessage(userText, callback) {
  memory.push({ user: userText });

  // "Learn:" shortcut for user teaching
  if (userText.trim().toLowerCase().startsWith("learn:")) {
    const lesson = userText.trim().substring(6).trim();
    if (lesson.length > 0) {
      learnText(lesson);
      const reply = "Kernel: Learned and stored that info for future recall.";
      memory.push({ kernel: reply });
      callback(reply);
      return;
    }
  }

  if (mode === "online" && apiKey && apiKey.startsWith("sk-")) {
    try {
      const reply = await getOnlineResponse(userText);
      memory.push({ kernel: reply });
      callback(reply);
      // Save both as an API completion and as learned, for offline recall!
      saveKnowledgeItem({ type: "api_completion", prompt: userText, answer: reply, source: "openai" });
      learnText(reply, { prompt: userText, source: "openai" });
    } catch (error) {
      const fallback = generateOfflineReply(userText);
      memory.push({ kernel: fallback });
      callback(fallback);
      saveKnowledgeItem({ type: "chat", prompt: userText, answer: fallback });
    }
  } else {
    const reply = generateOfflineReply(userText);
    memory.push({ kernel: reply });
    callback(reply);
    saveKnowledgeItem({ type: "chat", prompt: userText, answer: reply });
  }
}

// === Photo Generation & Analysis ===
function generatePhoto(prompt = "") {
  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  let seed = Array.from(prompt).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  ctx.fillStyle = `hsl(${seed}, 60%, 65%)`;
  ctx.fillRect(0, 0, 128, 128);
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(prompt ? prompt.slice(0,8) : "Kernel", 20, 70);
  const url = canvas.toDataURL();
  saveKnowledgeItem({ type: "photo", prompt, url, date: new Date().toISOString() });
  return url;
}
function analyzePhoto(imgUrl, cb) {
  const img = new window.Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2];
    }
    let pixelCount = img.width * img.height;
    r = Math.round(r / pixelCount);
    g = Math.round(g / pixelCount);
    b = Math.round(b / pixelCount);
    let mainColor = "gray";
    if (r > g && r > b) mainColor = "red";
    else if (g > r && g > b) mainColor = "green";
    else if (b > r && b > g) mainColor = "blue";
    const analysis = {
      averageColor: `rgb(${r}, ${g}, ${b})`,
      mainColor, width: img.width, height: img.height,
    };
    saveKnowledgeItem({ type: "photo_analysis", analysis, date: new Date().toISOString() });
    cb(analysis);
  };
  img.onerror = function () {
    cb({ error: "Failed to load image" });
  };
  img.src = imgUrl;
}

// === Export everything for UI ===
export {
  sendKernelMessage,
  generatePhoto,
  analyzePhoto,
  getKnowledgeBase,
  searchKnowledge,
  embedSearch,
  getMemory,
  getArchive,
  clearArchive,
  clearKnowledgeBase,
  clearAll,
  setMode,
  saveApiKey,
  getApiKey,
  addReminder,
  listReminders,
  markReminderDone,
  learnText
};