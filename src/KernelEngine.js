// src/KernelEngine.js
import {
  loadMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
} from "./smartMemory.js";

// ——— API key & mode ———
let API_KEY = "";
let MODE = "offline";

export function setMode(m) {
  MODE = m;
}
export function getApiKey() {
  return API_KEY;
}
export function saveApiKey(key) {
  API_KEY = key;
}
// Expose mode so UI can read it
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
  // Debug log
  console.log("▶ sendKernelMessage()", { MODE, hasApiKey: !!API_KEY, text });

  // 1) store user message
  appendMemory({ user: text });

  let reply;

  if (MODE === "offline") {
    // purely offline
    reply = getOfflineReply(text);

  } else {
    // online mode via OpenAI with robust fallback
    if (!API_KEY) {
      reply = "Error: No API key set.";
    } else {
      try {
        // build chat history for context
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
        if (!aiReply) {
          throw new Error("Empty reply from API");
        }
        reply = aiReply;

      } catch (err) {
        console.error("KernelEngine ▶ online chat error:", err);
        // fallback to offline responder
        reply = getOfflineReply(text);
      }
    }
  }

  // 2) store kernel reply
  appendMemory({ kernel: reply });
  callback(reply);
}

// ——— Teach Kernel a new subject offline ———
export async function learnSubject(subject) {
  subject = subject.trim();
  if (!subject) return "No subject supplied.";

  const existing = getLearnedFacts(subject);
  if (existing)
    return `Already learned about "${subject}".`;

  // create a simple summary
  let summary = `Core facts about ${subject}: [expand this logic as needed]`;
  if (subject.toLowerCase() === "philosophy") {
    summary = `Philosophy explores existence, knowledge, values, reason, mind, and language.`;
  }

  addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}