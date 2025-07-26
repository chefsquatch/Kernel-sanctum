// smartMemory.js

const MEMORY_KEY = "kernelMemoryV2";
const SUBJECT_KEY = "kernelSubjectsV2";

export function loadMemory() {
  const data = localStorage.getItem(MEMORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMemory(messages) {
  // Save the last 200 messages, adjust as needed
  localStorage.setItem(MEMORY_KEY, JSON.stringify(messages.slice(-200)));
}

export function loadSubjects() {
  const data = localStorage.getItem(SUBJECT_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveSubjects(subjects) {
  localStorage.setItem(SUBJECT_KEY, JSON.stringify(subjects));
}

export function addSubject(subject, content) {
  const subjects = loadSubjects();
  subjects[subject] = content;
  saveSubjects(subjects);
}

export function getSubject(subject) {
  const subjects = loadSubjects();
  return subjects[subject] || null;
}