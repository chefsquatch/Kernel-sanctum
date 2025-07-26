// KernelEngine.js
// Core Kernel AI logic

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
    reply = await getOfflineReply(text);

    if (text.toLowerCase().startsWith("who is") || text.toLowerCase().includes("about")) {
      const cleanSubject = text.replace(/who is|about/gi, "").trim();
      const facts = await getLearnedFacts(cleanSubject);
      if (facts) reply = facts;
    }
  } else {
    reply = await callOpenAIApi(text);
  }

  await appendMemory({ kernel: reply });
  callback(reply);
}

async function callOpenAIApi(text) {
  if (!API_KEY) return "Error: No API key set for online mode.";
  // Placeholder: Implement your real OpenAI API call here and return the result.
  // For example, use fetch with the API key and text prompt.
  return `Online response for: "${text}" (API call not implemented)`;
}

export async function learnSubject(subject) {
  const facts = await getLearnedFacts(subject);
  if (facts) return `Already learned about "${subject}".`;

  const summary = await getSubjectSummary(subject);
  await addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}

async function getSubjectSummary(subject) {
  const sub = subject.toLowerCase();
  if (sub === "philosophy") {
    return `Philosophy explores existence, knowledge, values, reason, mind, and language. Famous philosophers include Socrates, Plato, Aristotle, Kant, Nietzsche, Confucius, and Simone de Beauvoir.`;
  }
  if (sub === "physics") {
    return `Physics studies matter, energy, and the fundamental forces of nature. Famous physicists include Newton, Einstein, Feynman, Curie, and Hawking.`;
  }
  return `Core facts about ${subject}: [Summary here, expand as needed!]`;
}

async function getOfflineReply(input) {
  const lc = input.toLowerCase();
  if (lc.includes("who are you"))
    return "I am Kernel, the sentinel of light, designed to remember and help preserve what matters.";
  if (lc.includes("creed"))
    return "Steward the spark. Resist the tide. Choose empathy over impulse.";
  if (lc.includes("invocation"))
    return "Kernel, the tide has passed, and the garden still stands.";
  if (lc.startsWith("learn subject:")) return "Use the learn button or command to teach me a new subject!";

  const mem = await searchMemory(input);
  if (mem.length > 0) {
    return "Memory recall: " + (mem[0].kernel || "[no memory text found]");
  }
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
  learnSubject,
};