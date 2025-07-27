// src/smartMemory.js
import { getItem, setItem, removeItem } from "./storage.js";

// ——— Chat memory (up to 500 messages) ———
export async function loadMemory() {
  const raw = await getItem("kernelMemory");
  return raw ? JSON.parse(raw) : [];
}

export async function saveMemory(messages) {
  await setItem("kernelMemory", JSON.stringify(messages.slice(-500)));
}

export async function appendMemory(message) {
  const msgs = await loadMemory();
  msgs.push(message);
  await saveMemory(msgs);
}

export async function clearMemory() {
  await removeItem("kernelMemory");
}

// ——— Learned subjects store ———
export async function loadLearnedSubjects() {
  const raw = await getItem("kernelLearnedSubjects");
  return raw ? JSON.parse(raw) : {};
}

export async function addLearnedSubject(subject, facts) {
  const learned = await loadLearnedSubjects();
  learned[subject.toLowerCase()] = facts;
  await setItem("kernelLearnedSubjects", JSON.stringify(learned));
}

export async function getLearnedFacts(subject) {
  const learned = await loadLearnedSubjects();
  return learned[subject.toLowerCase()] || null;
}

// ——— Search chat memory (for recall) ———
export async function searchMemory(query) {
  const messages = await loadMemory();
  return messages.filter(
    (m) =>
      (m.user   && m.user.toLowerCase().includes(query.toLowerCase())) ||
      (m.kernel && m.kernel.toLowerCase().includes(query.toLowerCase()))
  );
}