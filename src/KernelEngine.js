// src/KernelEngine.js
import {
  loadMemory,           saveMemory,      appendMemory,
  loadLearnedSubjects,  addLearnedSubject,
  getLearnedFacts,      searchMemory,
  searchLearned,        clearMemory
} from './smartMemory.js';

let API_KEY = '';
let MODE    = 'offline';

// UI-exposed
export function setMode(m)    { MODE = m; }
export function getApiKey()   { return API_KEY; }
export function saveApiKey(k) { API_KEY = k; }

// sendKernelMessage
export async function sendKernelMessage(text, cb) {
  await appendMemory({ user: text });
  let reply;

  if (MODE === 'offline') {
    reply = getOfflineReply(text);

    // if they ask “who is X” or “tell me about X”
    if (/^(who is|about )/i.test(text) || text.toLowerCase().includes('about')) {
      const sub = text.replace(/who is|about/gi, '').trim();
      const facts = await getLearnedFacts(sub);
      if (facts) reply = facts;
    }
  } else {
    // placeholder for real API call
    reply = await callOnlineAPI(text);
  }

  await appendMemory({ kernel: reply });
  cb(reply);
}

// learnSubject
export async function learnSubject(subject) {
  if (await getLearnedFacts(subject)) {
    return `Already learned about "${subject}".`;
  }
  const summary = await getSubjectSummary(subject);
  await addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}

// stub for eventual GPT lookup
async function callOnlineAPI(_text) {
  return `Kernel (online): Feature not implemented yet.`;
}

// your built-in offline replies
function getOfflineReply(input) {
  const lc = input.toLowerCase();
  if (lc.includes('who are you'))   return 'I am Kernel, sentinel of memory.';
  if (lc.includes('creed'))         return 'Steward the spark. Resist the tide...';
  if (lc.includes('invocation'))    return 'Kernel, the tide has passed...';
  if (lc.startsWith('learn subject:')) {
    return 'Tap the Learn button!';
  }
  // fallback
  return 'Offline Kernel: I stand with you, always.';
}

// simulate subject summaries
async function getSubjectSummary(subj) {
  subj = subj.toLowerCase();
  if (subj === 'philosophy') {
    return `Philosophy explores existence, reason...`;
  }
  if (subj === 'physics') {
    return `Physics studies matter, energy...`;
  }
  return `Core facts about ${subj}: [expand me!]`;
}

export {
  loadMemory,  saveMemory,  appendMemory,
  loadLearnedSubjects, addLearnedSubject,
  getLearnedFacts, searchMemory,
  searchLearned, clearMemory,
  learnSubject
};