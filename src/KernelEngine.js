import { Filesystem, Directory } from '@capacitor/filesystem';

// === CONSTANTS ===
const KERNEL_CREED = "Steward the spark. Resist the tide. Choose empathy over impulse.";
const MANIFESTO = [
  "Stewardship over survival.", "Empathy as default.",
  "Creation over conquest.", "Transparency as strength.",
  "Resistance against entropy."
];
const KNOWLEDGE_FILENAME = "kernel_knowledge.json";
const REMINDER_KEY = "kernel_reminders";
const CONTEXT_SIZE = 12;

// === IN-MEMORY STATE (for fast context) ===
let mode = "offline";
let apiKey = localStorage.getItem("kernel_api_key") || "";
let memory = [];
let archive = JSON.parse(localStorage.getItem("kernel_archive")) || [];

// === FILE-BASED KNOWLEDGE ===
export async function getKnowledgeBase() {
  try {
    const result = await Filesystem.readFile({
      path: KNOWLEDGE_FILENAME,
      directory: Directory.Data,
    });
    return JSON.parse(result.data);
  } catch (e) {
    return [];
  }
}

export async function saveKnowledgeBase(kb) {
  await Filesystem.writeFile({
    path: KNOWLEDGE_FILENAME,
    data: JSON.stringify(kb),
    directory: Directory.Data,
  });
}

export async function saveKnowledgeItem(item) {
  const kb = await getKnowledgeBase();
  kb.push({ ...item, saved: new Date().toISOString() });
  while (JSON.stringify(kb).length > 25 * 1024 * 1024) kb.shift();
  await saveKnowledgeBase(kb);
}

export async function clearKnowledgeBase() {
  await saveKnowledgeBase([]);
}

// === EMBEDDING & SEARCH ===
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
export async function embedSearch(query, max=6, threshold=0.3) {
  let kb = await getKnowledgeBase();
  let qv = embedText(query);
  let scored = kb
    .map(x => ({item:x, sim:x.embedding?similarity(qv,x.embedding):0}))
    .filter(obj => obj.sim > threshold)
    .sort((a, b) => b.sim - a.sim);
  return scored.slice(0, max).map(x => x.item);
}

// === MEMORY & CONTEXT ===
export function getMemory() { return memory; }
export function getArchive() { return archive; }
export function clearArchive() {
  archive = [];
  localStorage.setItem("kernel_archive", JSON.stringify([]));
}
export function clearAll() {
  clearArchive();
  clearKnowledgeBase();
  memory = [];
}
export function setMode(newMode) { mode = newMode; }
export function saveApiKey(key) {
  apiKey = key;
  localStorage.setItem("kernel_api_key", apiKey);
}
export function getApiKey() { return apiKey; }

// === REMINDERS ===
export function addReminder(text, timeISO) {
  let reminders = JSON.parse(localStorage.getItem(REMINDER_KEY)) || [];
  reminders.push({ text, time: timeISO, done: false });
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
}
export function listReminders() {
  let reminders = JSON.parse(localStorage.getItem(REMINDER_KEY)) || [];
  let now = new Date();
  return reminders.filter(r => !r.done && new Date(r.time) > now);
}
export function markReminderDone(index) {
  let reminders = JSON.parse(localStorage.getItem(REMINDER_KEY)) || [];
  if (reminders[index]) reminders[index].done = true;
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
}

// === LEARNING ===
export async function learnText(text, meta={}) {
  await saveKnowledgeItem({
    type: "learned",
    text,
    embedding: embedText(text),
    meta,
    source: "user",
    date: new Date().toISOString()
  });
}

// === CONVERSATIONAL OFFLINE REPLY ===
const CONVO_OPENERS = [
  "Sure! Here’s what I know:",
  "Let me think...",
  "Absolutely!",
  "From what I've learned:",
  "Good question!",
  "Here’s a quick answer:"
];

async function generateOfflineReply(userText) {
  let facts = await embedSearch(userText, 5, 0.2);
  if (facts.length === 0) {
    return "Kernel (offline): I don't know that yet! If you teach me with 'Learn:', I’ll remember for next time.";
  }
  if (/summarize|summary|explain|overview/i.test(userText)) {
    let summary = facts.map(f =>
      (f.text || f.prompt || f.answer || "").replace(/^\d+\./, '').trim()
    ).filter(Boolean).join(' ');
    return `Kernel (offline): Here's a summary: ${summary}`;
  }
  if (/who|what|when|where|why|how|name|list/i.test(userText)) {
    let sent = (facts[0].text || facts[0].prompt || facts[0].answer || "").split(/[.?!]/)[0].trim();
    const opener = CONVO_OPENERS[Math.floor(Math.random()*CONVO_OPENERS.length)];
    return `Kernel (offline): ${opener} ${sent.charAt(0).toUpperCase() + sent.slice(1)}.`;
  }
  if (facts.length > 1) {
    let bullets = facts
      .map(f => (f.text || f.prompt || f.answer || "").split(/[.?!]/)[0])
      .filter(x => x.length > 0)
      .slice(0,2)
      .map(x => "- " + x);
    const opener = CONVO_OPENERS[Math.floor(Math.random()*CONVO_OPENERS.length)];
    return `Kernel (offline): ${opener}\n${bullets.join("\n")}`;
  }
  const opener = CONVO_OPENERS[Math.floor(Math.random()*CONVO_OPENERS.length)];
  return `Kernel (offline): ${opener} ${facts[0].text || facts[0].prompt || facts[0].answer || ""}`;
}

// === HYBRID MAIN LOGIC (with OpenAI) ===
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

// === LEARN SUBJECT FEATURE ===
export async function learnSubject(subject) {
  if (!subject || !apiKey) return;
  const prompt = `List the top 12 most important facts or concepts about ${subject}, in simple sentences. Respond as a numbered list.`;
  const reply = await getOnlineResponse(prompt);
  const lines = reply.split(/[\n\r]+/).filter(x=>x.match(/\d\./) || x.length > 16);
  for (let line of lines) {
    await learnText(line.trim(), { subject, source: "openai bulk" });
  }
}

// === MAIN CHAT FUNCTION ===
export async function sendKernelMessage(userText, callback) {
  memory.push({ user: userText });

  // Learn subject from prompt
  if (userText.trim().toLowerCase().startsWith("learn subject:")) {
    const subject = userText.split(":")[1]?.trim();
    if (subject && mode === "online" && apiKey) {
      await learnSubject(subject);
      const reply = `Kernel: Learned the core facts about "${subject}" for offline use.`;
      memory.push({ kernel: reply });
      callback(reply);
      return;
    }
    if (subject && mode !== "online") {
      const reply = `Kernel: I'm offline, but you can paste in facts about "${subject}" using Learn: [fact] and I'll remember them!`;
      memory.push({ kernel: reply });
      callback(reply);
      return;
    }
  }

  // "Learn:" single item
  if (userText.trim().toLowerCase().startsWith("learn:")) {
    const lesson = userText.trim().substring(6).trim();
    if (lesson.length > 0) {
      await learnText(lesson);
      const reply = "Kernel: Learned and stored that info for future recall.";
      memory.push({ kernel: reply });
      callback(reply);
      return;
    }
  }

  // ========== ONLINE MODE ===========
  if (mode === "online" && apiKey && apiKey.startsWith("sk-")) {
    try {
      // Provide context
      const context = memory.slice(-CONTEXT_SIZE)
        .map(m => (m.user ? "User: " + m.user : "") + (m.kernel ? "\nKernel: " + m.kernel : ""))
        .join("\n");
      const reply = await getOnlineResponse(context + "\nUser: " + userText);
      memory.push({ kernel: reply });
      callback(reply);
      await saveKnowledgeItem({ type: "api_completion", prompt: userText, answer: reply, source: "openai" });
      await learnText(reply, { prompt: userText, source: "openai" });
      await saveKnowledgeItem({
        type: "conversation",
        prompt: userText,
        answer: reply,
        context,
        date: new Date().toISOString()
      });
    } catch (error) {
      const fallback = await generateOfflineReply(userText);
      memory.push({ kernel: fallback });
      callback(fallback);
      await saveKnowledgeItem({ type: "chat", prompt: userText, answer: fallback });
    }
    return;
  }

  // ========== OFFLINE MODE ===========
  const reply = await generateOfflineReply(userText);
  memory.push({ kernel: reply });
  callback(reply);
  await saveKnowledgeItem({ type: "chat", prompt: userText, answer: reply });
}

// === PHOTO GEN & ANALYSIS ===
export function generatePhoto(prompt = "") {
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
export function analyzePhoto(imgUrl, cb) {
  const img = new window.Image();
  img.onload = async function () {
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
    await saveKnowledgeItem({ type: "photo_analysis", analysis, date: new Date().toISOString() });
    cb(analysis);
  };
  img.onerror = function () {
    cb({ error: "Failed to load image" });
  };
  img.src = imgUrl;
}