// src/KernelEngine.js

import {
  loadMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  clearMemory
} from './smartMemory.js';

let API_KEY = '';
let MODE    = 'offline';

/** UI can call these: */
export function setMode(m)    { MODE = m; }
export function getApiKey()   { return API_KEY; }
export function saveApiKey(k) { API_KEY = k; }

/** Core send message */
export async function sendKernelMessage(text, cb) {
  appendMemory({ user: text });
  let reply;

  if (MODE === 'offline') {
    reply = getOfflineReply(text);
    if (/^who is|about/i.test(text)) {
      const f = getLearnedFacts(text.replace(/who is|about/gi,'').trim());
      if (f) reply = f;
    }
  } else {
    // implement your OpenAI call here
    reply = `Kernel (online): Feature not implemented yet.`;
  }

  appendMemory({ kernel: reply });
  cb(reply);
}

/** Teach offline */
export async function learnSubject(subject) {
  if (getLearnedFacts(subject))
    return `Already learned "${subject}".`;

  const summary = await getSubjectSummary(subject);
  addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}".`;
}

async function getSubjectSummary(subject) {
  if (subject.toLowerCase() === 'philosophy')
    return 'Philosophy explores…';
  if (subject.toLowerCase() === 'physics')
    return 'Physics studies…';
  return `Core facts about ${subject}: …`;
}

/** Some simple offline replies */
function getOfflineReply(input) {
  const lc = input.toLowerCase();
  if (lc.includes('who are you'))
    return 'I am Kernel…';
  if (lc.includes('creed'))
    return 'Steward the spark…';
  if (lc.includes('invocation'))
    return 'Kernel, the tide…';
  return 'Offline Kernel: standing by.';
}

export { clearMemory };