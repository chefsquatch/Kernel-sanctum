// src/smartMemory.js

const MEMORY_KEY   = "kernelMemory";
const SUBJECTS_KEY = "kernelLearnedSubjects";

// ——— Chat memory ———

export function loadMemory() {
  const json = localStorage.getItem(MEMORY_KEY);
  return json ? JSON.parse(json) : [];
}

export function saveMemory(messages) {
  localStorage.setItem(
    MEMORY_KEY,
    JSON.stringify(messages.slice(-500))  // keep last 500
  );
}

export function appendMemory(message) {
  const all = loadMemory();
  all.push(message);
  saveMemory(all);
}

// ——— Learned subjects ———

export function loadLearnedSubjects() {
  const json = localStorage.getItem(SUBJECTS_KEY);
  return json ? JSON.parse(json) : {};
}

export function addLearnedSubject(subject, facts) {
  const learned = loadLearnedSubjects();
  learned[subject.toLowerCase()] = facts;
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(learned));
}

export function getLearnedFacts(subject) {
  const learned = loadLearnedSubjects();
  return learned[subject.toLowerCase()] || null;
}

// ——— Simple memory search ———

export function searchMemory(query) {
  const lower = query.toLowerCase();
  return loadMemory().filter(
    msg =>
      (msg.user   && msg.user.toLowerCase().includes(lower)) ||
      (msg.kernel && msg.kernel.toLowerCase().includes(lower))
  );
}

// ——— Wipe everything ———

export function clearMemory() {
  localStorage.removeItem(MEMORY_KEY);
  localStorage.removeItem(SUBJECTS_KEY);
}