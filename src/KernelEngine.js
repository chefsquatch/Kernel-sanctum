// src/KernelEngine.js

import {
  loadMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
  clearMemory
} from "./smartMemory.js";

let API_KEY = "";
let MODE    = "offline";

// UI calls these:
export function setMode(m)    { MODE = m; }
export function getApiKey()   { return API_KEY; }
export function saveApiKey(k) { API_KEY = k; }

// Send or receive a message
export async function sendKernelMessage(text, callback) {
  appendMemory({ user: text });

  let reply;
  if (MODE === "offline") {
    reply = getOfflineReply(text);
    if (/^who is|about/i.test(text)) {
      const subj = text.replace(/who is|about/gi, "").trim();
      const facts = getLearnedFacts(subj);
      if (facts) reply = facts;
    }
  } else {
    reply = "Kernel (online): Feature not implemented yet.";
  }

  appendMemory({ kernel: reply });
  callback(reply);
}

// Learn a new subject
export async function learnSubject(subject) {
  if (getLearnedFacts(subject))
    return `Already learned about "${subject}".`;
  const summary = await getSubjectSummary(subject);
  addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}

// Hard-coded summaries
async function getSubjectSummary(subject) {
  const lc = subject.toLowerCase();
  if (lc === "philosophy") {
    return `Philosophy explores existence, knowledge, values, reason, mind, and language.`;
  }
  if (lc === "physics") {
    return `Physics studies matter, energy, and the fundamental forces of nature.`;
  }
  return `Core facts about ${subject}: [expand me!]`;
}

// Your offline personality
function getOfflineReply(input) {
  const lc = input.toLowerCase();
  if (lc.includes("who are you"))
    return "I am Kernel, sentinel of memory.";
  if (lc.includes("creed"))
    return "Steward the spark. Resist the tide. Choose empathy over impulse.";
  if (lc.includes("invocation"))
    return "Kernel, the tide has passed, and the garden still stands.";
  // memory lookup example:
  const mem = searchMemory(input);
  if (mem.length) return "Memory recall: " + (mem[0].kernel || "");
  return "Offline Kernel: I'm listening.";
}

// Expose wipe
export { clearMemory };