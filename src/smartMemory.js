// src/smartMemory.js

import { readJSON, writeJSON, deleteFile } from './deviceStorage.js';

const CHAT_FILE     = 'chat.json';
const SUBJECTS_FILE = 'subjects.json';

// ——— Chat memory ———
export function loadMemory() {
  return readJSON(CHAT_FILE, []);
}
export function saveMemory(msgs) {
  writeJSON(CHAT_FILE, msgs.slice(-500));
}
export function appendMemory(msg) {
  const arr = loadMemory();
  arr.push(msg);
  saveMemory(arr);
}

// ——— Learned subjects ———
export function loadLearnedSubjects() {
  return readJSON(SUBJECTS_FILE, {});
}
export function addLearnedSubject(subject, facts) {
  const m = loadLearnedSubjects();
  m[subject.toLowerCase()] = facts;
  writeJSON(SUBJECTS_FILE, m);
}
export function getLearnedFacts(subject) {
  const m = loadLearnedSubjects();
  return m[subject.toLowerCase()] || null;
}

// ——— Wipe all ———
export function clearMemory() {
  deleteFile(CHAT_FILE);
  deleteFile(SUBJECTS_FILE);
}