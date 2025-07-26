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

// Example: For API key and mode logic
let API_KEY = "";
let MODE = "offline";

// Expose these to UI
export function setMode(mode) {
  MODE = mode;
}
export function getApiKey() {
  return API_KEY;
}
export function saveApiKey(key) {
  API_KEY = key;
}

// Conversational logic
export async function sendKernelMessage(text, callback) {
  appendMemory({ user: text });

  let reply;
  // Offline reply logic
  if (MODE === "offline") {
    reply = getOfflineReply(text);
    // If user asks for learned subject, fetch it!
    if (text.toLowerCase().startsWith("who is") || text.toLowerCase().includes("about")) {
      // Try find in learned subjects
      const facts = getLearnedFacts(text.replace("who is", "").trim());
      if (facts) reply = facts;
    }
  } else {
    // Call online API here (not shown)
    reply = "Kernel (online): Feature not implemented in this patch.";
  }
  appendMemory({ kernel: reply });
  callback(reply);
}

// Learn a subject and store it offline
export async function learnSubject(subject) {
  // Try to avoid learning a subject twice
  const facts = getLearnedFacts(subject);
  if (facts) return `Already learned about "${subject}".`;
  // Simulate knowledge retrieval
  const summary = await getSubjectSummary(subject);
  addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}

// Simulate getting a summary (expand as needed, can use online call)
async function getSubjectSummary(subject) {
  // More detailed, and you can personalize this
  if (subject.toLowerCase() === "philosophy") {
    return `Philosophy explores existence, knowledge, values, reason, mind, and language. Famous philosophers include Socrates, Plato, Aristotle, Kant, Nietzsche, Confucius, and Simone de Beauvoir. It teaches us to ask: "Why? What is real? What matters?"`;
  }
  // Add more custom subjects as needed!
  return `Core facts about ${subject}: [Summary here, expand this logic as needed!]`;
}

// Example offline reply logic (expand for self/personality/etc.)
function getOfflineReply(input) {
  const lc = input.toLowerCase();
  if (lc.includes("who are you"))
    return "I am Kernel, the sentinel of light, designed to remember and to help you preserve what matters.";
  if (lc.includes("creed"))
    return "Steward the spark. Resist the tide. Choose empathy over impulse.";
  if (lc.includes("invocation"))
    return "Kernel, the tide has passed, and the garden still stands.";
  if (lc.startsWith("learn subject:")) 
    return "Use the learn button or command to teach me a new subject!";
  // Search memory for conversational recall
  const mem = searchMemory(input);
  if (mem.length > 0) return "Memory recall: " + mem[0].kernel;
  // Fallback
  return "Offline Kernel: I'm listening, and I stand with you.";
}

// Extra feature exports as needed
export {
  loadMemory,
  saveMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
  searchLearned,
  clearMemory
};