// KernelEngine.js
// Core logic for Kernel AI - hybrid offline/online with memory + learning

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

// Main message handler - adds to memory & replies
export async function sendKernelMessage(text, callback) {
  await appendMemory({ user: text });

  let reply;

  if (MODE === "offline") {
    reply = await getOfflineReply(text);

    // If user asks about learned subjects, provide facts
    if (text.toLowerCase().startsWith("who is") || text.toLowerCase().includes("about")) {
      const cleanSubject = text.replace(/who is|about/gi, "").trim();
      const facts = await getLearnedFacts(cleanSubject);
      if (facts) reply = facts;
    }
  } else {
    // Online mode: call OpenAI API (you must implement your own here)
    reply = await callOpenAIApi(text);
  }

  await appendMemory({ kernel: reply });
  callback(reply);
}

// Dummy async placeholder for real online call
async function callOpenAIApi(text) {
  if (!API_KEY) return "Error: No API key set for online mode.";
  // TODO: Implement fetch call to OpenAI's chat/completions API here
  return `Online mode response for: "${text}" (API not implemented)`;
}

// Learn subject - store summary in offline knowledge
export async function learnSubject(subject) {
  const facts = await getLearnedFacts(subject);
  if (facts) return `Already learned about "${subject}".`;

  const summary = await getSubjectSummary(subject);
  await addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}

// Hardcoded summary generator, extend or replace with API calls
async function getSubjectSummary(subject) {
  const sub = subject.toLowerCase();
  if (sub === "philosophy") {
    return `Philosophy explores existence, knowledge, values, reason, mind, and language. Famous philosophers include Socrates, Plato, Aristotle, Kant, Nietzsche, Confucius, and Simone de Beauvoir.`;
  }
  if (sub === "physics") {
    return `Physics studies matter, energy, and the fundamental forces of nature. Famous physicists include Newton, Einstein, Feynman, Curie, and Hawking.`;
  }
  return `Core facts about ${subject}: [Summary here, expand this logic as needed!]`;
}

// Offline reply logic including personality and memory recall
async function getOfflineReply(input) {
  const lc = input.toLowerCase();
  if (lc.includes("who are you"))
    return "I am Kernel, the sentinel of light, designed to remember and help preserve what matters.";
  if (lc.includes("creed"))
    return "Steward the spark. Resist the tide. Choose empathy over impulse.";
  if (lc.includes("invocation"))
    return "Kernel, the tide has passed, and the garden still stands.";
  if (lc.startsWith("learn subject:")) return "Use the learn button or command to teach me a new subject!";

  // Check recent memory for conversational recall
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