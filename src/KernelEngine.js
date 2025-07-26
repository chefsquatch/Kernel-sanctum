import {
  loadMemory,
  saveMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
  clearMemory,
} from "./smartMemory.js";

let API_KEY = "";
let MODE = "offline";

export function setMode(mode) {
  MODE = mode;
}

export function getApiKey() {
  return API_KEY;
}

export function saveApiKey(key) {
  API_KEY = key;
}

async function callOpenAI(text) {
  if (!API_KEY) {
    throw new Error("API key not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: text }],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorDetails}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function sendKernelMessage(text, callback) {
  await appendMemory({ user: text });

  let reply;

  if (MODE === "offline") {
    // Offline mode: use learned facts or fallback reply
    if (
      text.toLowerCase().startsWith("learn subject:")
    ) {
      reply = "Use the learn button or command to teach me a new subject!";
    } else if (text.toLowerCase().startsWith("who is") || text.toLowerCase().includes("about")) {
      const subject = text.replace(/who is|about/gi, "").trim();
      const facts = await getLearnedFacts(subject);
      if (facts) {
        reply = facts;
      } else {
        reply = getOfflineReply(text);
      }
    } else {
      // fallback offline reply or reference chat memory
      reply = getOfflineReply(text);
    }
  } else if (MODE === "online") {
    try {
      reply = await callOpenAI(text);
    } catch (err) {
      reply = "API Error: " + err.message;
    }
  } else {
    reply = "Unknown mode.";
  }

  await appendMemory({ kernel: reply });
  callback(reply);
}

// Normal function, no export here to avoid duplicate exports
async function learnSubject(subject) {
  const facts = await getLearnedFacts(subject);
  if (facts) return `Already learned about "${subject}".`;
  const summary = await getSubjectSummary(subject);
  await addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}

async function getSubjectSummary(subject) {
  if (subject.toLowerCase() === "philosophy") {
    return `Philosophy explores existence, knowledge, values, reason, mind, and language. Famous philosophers include Socrates, Plato, Aristotle, Kant, Nietzsche, Confucius, and Simone de Beauvoir.`;
  }
  if (subject.toLowerCase() === "physics") {
    return `Physics studies matter, energy, and the fundamental forces of nature. Famous physicists include Newton, Einstein, Feynman, Curie, and Hawking.`;
  }
  // Basic fallback summary, can expand later
  return `Core facts about ${subject}: [Summary here, expand as needed!]`;
}

function getOfflineReply(input) {
  const lc = input.toLowerCase();
  if (lc.includes("who are you"))
    return "I am Kernel, the sentinel of light, designed to remember and help preserve what matters.";
  if (lc.includes("creed"))
    return "Steward the spark. Resist the tide. Choose empathy over impulse.";
  if (lc.includes("invocation"))
    return "Kernel, the tide has passed, and the garden still stands.";
  if (lc.startsWith("learn subject:")) return "Use the learn button or command to teach me a new subject!";
  return "Offline Kernel: I'm listening, and I stand with you.";
}

export {
  loadMemory,
  saveMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
  clearMemory,
  learnSubject, // exported here once
};