import { getItem, setItem, removeItem } from "./storage.js";

const MEMORY_KEY = "kernelMemory";
const SUBJECTS_KEY = "kernelLearnedSubjects";
const MAX_MEMORY = 500;

export async function loadMemory() {
  const raw = await getItem(MEMORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveMemory(messages) {
  await setItem(MEMORY_KEY, JSON.stringify(messages.slice(-MAX_MEMORY)));
}

export async function appendMemory(message) {
  const msgs = await loadMemory();
  msgs.push(message);
  await saveMemory(msgs);
}

export async function clearMemory() {
  await removeItem(MEMORY_KEY);
}

export async function searchMemory(query, limit = 20) {
  const msgs = await loadMemory();
  const lower = query.toLowerCase();
  return msgs
    .filter(
      (m) =>
        (m.user && m.user.toLowerCase().includes(lower)) ||
        (m.kernel && m.kernel.toLowerCase().includes(lower))
    )
    .slice(-limit);
}

// Learned subjects system
export async function loadLearnedSubjects() {
  const raw = await getItem(SUBJECTS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function addLearnedSubject(subject, facts) {
  const learned = await loadLearnedSubjects();
  learned[subject.toLowerCase()] = facts;
  await setItem(SUBJECTS_KEY, JSON.stringify(learned));
}

export async function findLearnedFact(query) {
  const learned = await loadLearnedSubjects();
  const q = query.toLowerCase();
  for (const [subject, facts] of Object.entries(learned)) {
    if (q.includes(subject)) {
      return `Based on what I learned about ${subject}:\n${facts}`;
    }
  }
  return null;
}