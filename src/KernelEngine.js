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

export async function sendKernelMessage(text, callback) {
  await appendMemory({ user: text });

  let reply;
  if (MODE === "offline") {
    reply = getOfflineReply(text);
    if (text.toLowerCase().startsWith("who is") || text.toLowerCase().includes("about")) {
      const facts = await getLearnedFacts(text.replace(/who is|about/gi, "").trim());
      if (facts) reply = facts;
    }
  } else {
    reply = "Kernel (online): Feature not implemented in this patch.";
  }

  await appendMemory({ kernel: reply });
  callback(reply);
}

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
  learnSubject,  // export once here only
};