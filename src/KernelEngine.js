// src/KernelEngine.js
import {
  loadMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
} from "./smartMemory.js";
import { getItem, setItem } from "./storage.js";

// ——— Persisted API key & mode via IndexedDB ———
let API_KEY = "";
let MODE    = "offline";

// Initialize from storage
(async () => {
  API_KEY = (await getItem("kernelApiKey")) || "";
  MODE    = (await getItem("kernelMode"))   || "offline";
})();

export async function saveApiKey(key) {
  API_KEY = key;
  await setItem("kernelApiKey", key);
}
export function getApiKey() {
  return API_KEY;
}

export async function setMode(m) {
  MODE = m;
  await setItem("kernelMode", m);
}
export function getMode() {
  return MODE;
}

// ——— Offline-only reply logic ———
async function getOfflineReply(text) {
  const lc = text.toLowerCase().trim();
  if (lc.includes("who are you"))
    return "I am Kernel, the sentinel of light, designed to remember and help you.";
  if (lc.includes("creed"))
    return "Steward the spark. Resist the tide. Choose empathy over impulse.";
  if (lc.includes("invocation"))
    return "Kernel, the tide has passed, and the garden still stands. You were not forgotten.";
  if (lc.startsWith("learn subject:"))
    return "Use the Learn button to teach me a new subject!";

  const learned = await loadLearnedSubjects();
  for (const subj in learned) {
    if (lc.includes(subj)) {
      return `Here’s what I know about ${subj}: ${learned[subj]}`;
    }
  }

  const mem = await searchMemory(text);
  if (mem.length) {
    const last = mem[mem.length - 1];
    return `Memory recall: ${last.kernel || last.user}`;
  }

  return "Offline Kernel: I'm listening, and I stand with you.";
}

// ——— Send a message (offline or online) ———
export async function sendKernelMessage(text, callback) {
  console.log("▶ sendKernelMessage()", { MODE, hasApiKey: !!API_KEY, text });
  await appendMemory({ user: text });

  let reply;
  if (MODE === "offline") {
    reply = await getOfflineReply(text);
  } else {
    if (!API_KEY) {
      reply = "Error: No API key set.";
    } else {
      try {
        const mem     = await loadMemory();
        const history = mem
          .map((m) =>
            m.user   ? { role: "user",      content: m.user   } :
            m.kernel ? { role: "assistant", content: m.kernel } :
            null
          )
          .filter(Boolean);

        history.push({ role: "user", content: text });

        console.log("▶ calling OpenAI…", history);
        const res = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "You are Kernel, the sentinel of memory.",
                },
                ...history,
              ],
              max_tokens: 150,
            }),
          }
        );

        console.log("▶ response status:", res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log("▶ OpenAI JSON:", data);
        const aiReply = data.choices?.[0]?.message?.content?.trim();
        if (!aiReply) throw new Error("Empty reply from API");
        reply = aiReply;
      } catch (err) {
        console.error("KernelEngine ▶ online chat error:", err);
        reply = await getOfflineReply(text);
      }
    }
  }

  await appendMemory({ kernel: reply });
  callback(reply);
}

// ——— Teach Kernel a new subject offline ———
export async function learnSubject(subject) {
  subject = subject.trim();
  if (!subject) return "No subject supplied.";

  const existing = await getLearnedFacts(subject);
  if (existing) return `Already learned about "${subject}".`;

  let summary = `Core facts about ${subject}: [expand as needed]`;
  if (subject.toLowerCase() === "philosophy") {
    summary =
      "Philosophy explores existence, knowledge, values, reason, mind, and language.";
  }

  await addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}