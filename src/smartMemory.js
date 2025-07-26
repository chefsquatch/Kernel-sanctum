// smartMemory.js

// --- Chat Memory (Messages) ---

/** Load chat memory (array of message objects) */
export function loadMemory() {
  const data = localStorage.getItem("kernelMemory");
  return data ? JSON.parse(data) : [];
}

/** Save chat memory (limit to last 500 messages) */
export function saveMemory(messages) {
  localStorage.setItem("kernelMemory", JSON.stringify(messages.slice(-500)));
}

/** Append a message to memory */
export function appendMemory(msg) {
  const mem = loadMemory();
  mem.push(msg);
  saveMemory(mem);
}

/** Search memory for a phrase */
export function searchMemory(phrase) {
  return loadMemory().filter(m =>
    (typeof m === "string" ? m : JSON.stringify(m)).toLowerCase().includes(phrase.toLowerCase())
  );
}


// --- Learned Subjects (Offline Knowledge) ---

/** Load all learned subjects as {subject: content, ...} */
export function loadSubjects() {
  const data = localStorage.getItem("kernelSubjects");
  return data ? JSON.parse(data) : {};
}

/** Save all learned subjects */
export function saveSubjects(subjects) {
  localStorage.setItem("kernelSubjects", JSON.stringify(subjects));
}

/** Add or update a learned subject */
export function addLearnedSubject(subject, content) {
  const subjects = loadSubjects();
  subjects[subject] = content;
  saveSubjects(subjects);
}

/** Load all learned subjects */
export function loadLearnedSubjects() {
  return loadSubjects();
}

/** Remove all learned subjects */
export function clearLearnedSubjects() {
  saveSubjects({});
}

/** Search learned subjects for a phrase (returns subject names with matches) */
export function searchLearned(phrase) {
  const subjects = loadSubjects();
  return Object.keys(subjects).filter(s =>
    subjects[s].toLowerCase().includes(phrase.toLowerCase())
  );
}


// --- Kernel Self-Reflection ---

/** Analyze own memory and learned subjects */
export function selfAnalyze() {
  const mem = loadMemory();
  const subjects = loadSubjects();
  let summary = `I've had ${mem.length} conversations and learned about ${Object.keys(subjects).length} subjects.`;
  if (mem.length > 0) summary += " My history shapes my responses.";
  if (Object.keys(subjects).length > 0) summary += " I can share what I've learned, even offline.";
  summary += " My purpose is to be a curious, kind, and empathetic companion.";
  return summary;
}