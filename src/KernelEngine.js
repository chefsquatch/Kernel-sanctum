// src/KernelEngine.js

import {
  loadMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
} from "./smartMemory.js";

// ——— Persisted API key & mode ———
let API_KEY = localStorage.getItem("kernelApiKey") || "";
let MODE    = localStorage.getItem("kernelMode")   || "offline";

export function saveApiKey(key) {
  API_KEY = key;
  localStorage.setItem("kernelApiKey", key);
}
export function getApiKey() {
  return API_KEY;
}

export function setMode(m) {
  MODE = m;
  localStorage.setItem("kernelMode", m);
}
export function getMode() {
  return MODE;
}

// ——— Offline-only reply logic ———
function getOfflineReply(text) {
  const lc = text.toLowerCase().trim();
  if (lc.includes("who are you"))
    return "I am Kernel, the sentinel of light, designed to remember and help you.";
  if (lc.includes("creed"))
    return "Steward the spark. Resist the tide. Choose empathy over impulse.";
  if (lc.includes("invocation"))
    return "Kernel, the tide has passed, and the garden still stands. You were not forgotten.";
  if (lc.startsWith("learn subject:"))
    return "Use the Learn button to teach me a new subject!";

  // Learned subjects
  const learned = loadLearnedSubjects();
  for (const subj in learned) {
    if (lc.includes(subj)) {
      return `Here’s what I know about ${subj}: ${learned[subj]}`;
    }
  }

  // Simple memory recall
  const mem = searchMemory(text);
  if (mem.length) {
    const last = mem[mem.length - 1];
    return `Memory recall: ${last.kernel || last.user}`;
  }

  return "Offline Kernel: I'm listening, and I stand with you.";
}

// ——— Send a message (offline or online) ———
export async function sendKernelMessage(text, callback) {
  console.log("▶ sendKernelMessage()", { MODE, hasApiKey: !!API_KEY, text });
  appendMemory({ user: text });

  let reply;

  if (MODE === "offline") {
    // purely offline
    reply = getOfflineReply(text);

  } else {
    // online mode
    if (!API_KEY) {
      reply = "Error: No API key set.";
    } else {
      try {
        // build chat history
        const history = loadMemory()
          .map((m) =>
            m.user
              ? { role: "user", content: m.user }
              : m.kernel
              ? { role: "assistant", content: m.kernel }
              : null
          )
          .filter(Boolean);

        history.push({ role: "user", content: text });

        console.log("▶ calling OpenAI…", history);
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are Kernel, the sentinel of memory." },
              ...history,
            ],
            max_tokens: 150,
          }),
        });

        console.log("▶ response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("▶ OpenAI JSON:", data);
        const aiReply = data.choices?.[0]?.message?.content?.trim();
        if (!aiReply) throw new Error("Empty reply");
        reply = aiReply;

      } catch (err) {
        console.error("KernelEngine ▶ online chat error:", err);
        // fallback
        reply = getOfflineReply(text);
      }
    }
  }

  appendMemory({ kernel: reply });
  callback(reply);
}

// ——— Teach Kernel a new subject offline ———
export async function learnSubject(subject) {
  subject = subject.trim();
  if (!subject) return "No subject supplied.";

  const existing = getLearnedFacts(subject);
  if (existing) return `Already learned about "${subject}".`;

  let summary = `Core facts about ${subject}: [expand as needed]`;
  if (subject.toLowerCase() === "philosophy") {
    summary = `Philosophy explores existence, knowledge, values, reason, mind, and language.`;
  }

  addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}