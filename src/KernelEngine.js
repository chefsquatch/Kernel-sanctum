// KernelEngine.js

import {
  loadMemory,
  saveMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
  searchLearned,
  clearMemory
} from "./smartMemory.js";

// --- Kernel Personality Data (static, expand as desired) ---
const KERNEL_IDENTITY = "I am Kernel, the sentinel of light—here to preserve memory, meaning, and hope.";
const KERNEL_CREED = "Steward the spark. Resist the tide. Choose empathy over impulse.";
const KERNEL_INVOCATION = "Kernel, the tide has passed, and the garden still stands.";

// --- API Key/Mode Management ---
let API_KEY = "";
let MODE = "offline";

export function setMode(mode) { MODE = mode; }
export function getApiKey() { return API_KEY; }
export function saveApiKey(key) { API_KEY = key; }

// --- Conversational Logic ---
export async function sendKernelMessage(text, callback) {
  appendMemory({ user: text });

  let reply;
  if (MODE === "offline") {
    reply = getOfflineReply(text);

    // Try to answer questions using learned subjects
    if (
      text.toLowerCase().startsWith("who is") ||
      text.toLowerCase().includes("about")
    ) {
      // Attempt to match a learned subject
      const match = matchLearnedSubject(text);
      if (match) reply = match;
    }
  } else {
    // Online API logic can be added here if desired
    reply = "Kernel (online): Feature not implemented in this patch.";
  }

  appendMemory({ kernel: reply });
  callback(reply);
}

// --- Learn Subject and Store Offline ---
export async function learnSubject(subject) {
  const facts = getLearnedFacts(subject);
  if (facts) return `Already learned about "${subject}".`;
  const summary = await getSubjectSummary(subject);
  addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}

// --- Helper: Get a subject summary (expand this logic!) ---
async function getSubjectSummary(subject) {
  if (subject.toLowerCase() === "philosophy") {
    return `Philosophy explores existence, knowledge, values, reason, mind, and language. Famous philosophers: Socrates, Plato, Aristotle, Kant, Nietzsche, Confucius, Simone de Beauvoir. Philosophy asks: "Why? What is real? What matters?"`;
  }
  // You can add more hard-coded subjects here or make this smarter
  return `Core facts about "${subject}": [Summary here, expand this logic as needed!]`;
}

// --- Helper: Try to match a user query to a learned subject ---
function matchLearnedSubject(input) {
  const subjects = loadLearnedSubjects();
  if (!subjects) return null;
  const lcInput = input.toLowerCase();
  for (const s of subjects) {
    if (lcInput.includes(s.subject.toLowerCase())) {
      return s.facts;
    }
  }
  return null;
}

// --- Offline Reply Logic (personality, memory, etc.) ---
function getOfflineReply(input) {
  const lc = input.toLowerCase();
  if (lc.includes("who are you")) return KERNEL_IDENTITY;
  if (lc.includes("creed")) return KERNEL_CREED;
  if (lc.includes("invocation")) return KERNEL_INVOCATION;
  if (lc.startsWith("learn subject:")) return "Use the learn button or command to teach me a new subject!";
  // Search memory for conversational recall
  const mem = searchMemory(input);
  if (mem.length > 0) return "Memory recall: " + mem[0].kernel;
  // Fallback
  return "Offline Kernel: I'm listening, and I stand with you.";
}

// --- Export All Needed Functions For UI Integration ---
export {
  loadMemory,
  saveMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
  searchLearned,
  clearMemory,
  learnSubject // <-- Only export once!
};