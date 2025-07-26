// src/smartMemory.js
import * as FS from './kernelFS.js';

// Maximum chat entries to keep (prune older)
const MAX_CHAT = 500;

export async function loadMemory() {
  return await FS.loadFile(FS.CHAT_PATH, []);
}

export async function saveMemory(messages) {
  // prune to last MAX_CHAT
  const pruned = messages.slice(-MAX_CHAT);
  await FS.saveFile(FS.CHAT_PATH, pruned);
}

export async function appendMemory(entry) {
  const arr = await loadMemory();
  arr.push(entry);
  await saveMemory(arr);
}

// Learned subjects map: { [subject:string]: facts:string }
export async function loadLearnedSubjects() {
  return await FS.loadFile(FS.SUBJECTS_PATH, {});
}

export async function saveLearnedSubjects(map) {
  await FS.saveFile(FS.SUBJECTS_PATH, map);
}

export async function addLearnedSubject(subject, facts) {
  const m = await loadLearnedSubjects();
  m[subject.toLowerCase()] = facts;
  await saveLearnedSubjects(m);
}

export async function getLearnedFacts(subject) {
  const m = await loadLearnedSubjects();
  return m[subject.toLowerCase()] || null;
}

export async function searchMemory(query) {
  const arr = await loadMemory();
  return arr.filter(msg => {
    const q = query.toLowerCase();
    return (msg.user  && msg.user.toLowerCase().includes(q)) ||
           (msg.kernel && msg.kernel.toLowerCase().includes(q));
  });
}

export async function searchLearned(query) {
  const m = await loadLearnedSubjects();
  const q = query.toLowerCase();
  return Object.entries(m)
    .filter(([subj, facts]) =>
      subj.includes(q) || facts.toLowerCase().includes(q)
    )
    .map(([subject, facts]) => ({ subject, facts }));
}

export async function clearMemory() {
  await FS.removeFile(FS.CHAT_PATH);
  await FS.removeFile(FS.SUBJECTS_PATH);
}