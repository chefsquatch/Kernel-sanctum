// smartMemory.js

// Memory for chat messages
export function loadMemory() {
  const data = localStorage.getItem("kernelMemory");
  return data ? JSON.parse(data) : [];
}

export function saveMemory(messages) {
  // Store up to 500 messages (adjust as needed)
  localStorage.setItem("kernelMemory", JSON.stringify(messages.slice(-500)));
}

// Learned subjects (offline knowledge)
export function loadLearnedSubjects() {
  const data = localStorage.getItem("kernelLearnedSubjects");
  return data ? JSON.parse(data) : {};
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

// Search chat memory for user queries
export function searchMemory(query) {
  const messages = loadMemory();
  return messages.filter(
    msg =>
      (msg.user && msg.user.toLowerCase().includes(query.toLowerCase())) ||
      (msg.kernel && msg.kernel.toLowerCase().includes(query.toLowerCase()))
  );
}

// Search learned subjects for info
export function searchLearned(query) {
  const learned = loadLearnedSubjects();
  const results = [];
  Object.entries(learned).forEach(([subj, facts]) => {
    if (subj.includes(query.toLowerCase()) || facts.toLowerCase().includes(query.toLowerCase())) {
      results.push({ subject: subj, facts });
    }
  });
  return results;
}

// Wipe memory
export function clearMemory() {
  localStorage.removeItem("kernelMemory");
  localStorage.removeItem("kernelLearnedSubjects");
}

// Append a message to chat memory
export function appendMemory(message) {
  const messages = loadMemory();
  messages.push(message);
  saveMemory(messages);
}