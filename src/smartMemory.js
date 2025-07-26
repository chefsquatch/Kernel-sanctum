// src/smartMemory.js

// ——— Chat memory (up to 500 messages) ———
export function loadMemory() {
  const raw = localStorage.getItem("kernelMemory");
  return raw ? JSON.parse(raw) : [];
}

export function saveMemory(messages) {
  // keep only the last 500
  localStorage.setItem("kernelMemory", JSON.stringify(messages.slice(-500)));
}

export function appendMemory(message) {
  const messages = loadMemory();
  messages.push(message);
  saveMemory(messages);
}

export function clearMemory() {
  localStorage.removeItem("kernelMemory");
}

// ——— Learned subjects store ———
export function loadLearnedSubjects() {
  const raw = localStorage.getItem("kernelLearnedSubjects");
  return raw ? JSON.parse(raw) : {};
}

export function addLearnedSubject(subject, facts) {
  const learned = loadLearnedSubjects();
  learned[subject.toLowerCase()] = facts;
  localStorage.setItem("kernelLearnedSubjects", JSON.stringify(learned));
}

export function getLearnedFacts(subject) {
  const learned = loadLearnedSubjects();
  return learned[subject.toLowerCase()] || null;
}

// ——— Search chat memory (for recall) ———
export function searchMemory(query) {
  const messages = loadMemory();
  return messages.filter(
    (m) =>
      (m.user && m.user.toLowerCase().includes(query.toLowerCase())) ||
      (m.kernel && m.kernel.toLowerCase().includes(query.toLowerCase()))
  );
}