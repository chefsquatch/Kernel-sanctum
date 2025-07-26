// src/smartMemory.js
// ------------------
// Simple chat & subject memory via localStorage

// --- Chat memory ---
export function loadMemory() {
  const data = localStorage.getItem('kernelMemory');
  return data ? JSON.parse(data) : [];
}

export function saveMemory(messages) {
  // keep only the last 500 entries
  localStorage.setItem('kernelMemory', JSON.stringify(messages.slice(-500)));
}

export function appendMemory(message) {
  const msgs = loadMemory();
  msgs.push(message);
  saveMemory(msgs);
}

// --- Learned subjects ---
export function loadLearnedSubjects() {
  const data = localStorage.getItem('kernelLearnedSubjects');
  return data ? JSON.parse(data) : {};
}

export function addLearnedSubject(subject, facts) {
  const learned = loadLearnedSubjects();
  learned[subject.toLowerCase()] = facts;
  localStorage.setItem('kernelLearnedSubjects', JSON.stringify(learned));
}

export function getLearnedFacts(subject) {
  const learned = loadLearnedSubjects();
  return learned[subject.toLowerCase()] || null;
}

// --- Searching ---
export function searchMemory(query) {
  const msgs = loadMemory();
  const q = query.toLowerCase();
  return msgs.filter(
    m =>
      (m.user   && m.user.toLowerCase().includes(q)) ||
      (m.kernel && m.kernel.toLowerCase().includes(q))
  );
}

export function searchLearned(query) {
  const learned = loadLearnedSubjects();
  const q = query.toLowerCase();
  return Object.entries(learned)
    .filter(([subj,facts]) =>
      subj.includes(q) || facts.toLowerCase().includes(q)
    )
    .map(([subject,facts]) => ({ subject, facts }));
}

// --- Wipe everything ---
export function clearMemory() {
  localStorage.removeItem('kernelMemory');
  localStorage.removeItem('kernelLearnedSubjects');
}