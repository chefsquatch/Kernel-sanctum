// src/KernelEngine.js
// -------------------
// Core conversational logic, offline/online switching, subject-learning

import {
  loadMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
  clearMemory
} from './smartMemory.js';

// Persist api key & mode in localStorage
let API_KEY = localStorage.getItem('kernelApiKey') || '';
let MODE    = localStorage.getItem('kernelMode')    || 'offline';

export function getApiKey() {
  return API_KEY;
}
export function saveApiKey(key) {
  API_KEY = key;
  localStorage.setItem('kernelApiKey', key);
}

export function setMode(m) {
  MODE = m;
  localStorage.setItem('kernelMode', m);
}

// Offline-only reply patterns
function getOfflineReply(text) {
  const lc = text.toLowerCase().trim();

  if (lc.includes('who are you')) {
    return 'I am Kernel, the sentinel of light, designed to remember and help you.';
  }
  if (lc.includes('creed')) {
    return 'Steward the spark. Resist the tide. Choose empathy over impulse.';
  }
  if (lc.includes('invocation')) {
    return 'Kernel, the tide has passed, and the garden still stands.';
  }

  // If user asks "what is X?" or "who is X?", try learned subjects
  const stripped = lc.replace(/^(who is|what is)\s*/,'').replace('about','').trim();
  const facts = getLearnedFacts(stripped);
  if (facts) {
    return `Here’s what I know about ${stripped}: ${facts}`;
  }

  // If user says "remember", recall last user message
  if (lc.includes('remember')) {
    const mem = loadMemory();
    if (mem.length) {
      const last = mem[mem.length-1];
      if (last.user) return `I recall you said: "${last.user}"`;
    }
  }

  // fallback
  return "Offline Kernel: I'm listening, and I stand with you.";
}

// Placeholder for future online logic
async function getOnlineReply(text) {
  // e.g. call OpenAI here using API_KEY
  return 'Kernel (online): Feature not implemented yet.';
}

// Main send function
export async function sendKernelMessage(text, callback) {
  appendMemory({ user: text });

  let reply;
  if (MODE === 'offline') {
    reply = getOfflineReply(text);
  } else {
    reply = await getOnlineReply(text);
  }

  appendMemory({ kernel: reply });
  callback(reply);
}

// Teach Kernel a new subject
export async function learnSubject(subject) {
  const key = subject.toLowerCase().trim();
  if (getLearnedFacts(key)) {
    return `Already learned about "${subject}".`;
  }

  // simulate a summary (or replace with real API call)
  let summary = `Core facts about ${subject}: [expand this logic as needed]`;
  if (key === 'philosophy') {
    summary = 'Philosophy explores existence, knowledge, values, reason, mind, and language.';
  }
  if (key === 'physics') {
    summary = 'Physics studies matter, energy, and the fundamental forces of nature.';
  }

  addLearnedSubject(key, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}

// expose memory helpers if you ever need them
export {
  loadMemory,
  appendMemory,
  loadLearnedSubjects,
  getLearnedFacts,
  searchMemory,
  clearMemory
};