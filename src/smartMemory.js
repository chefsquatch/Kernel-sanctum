import { getItem, setItem, removeItem } from "./storage.js";

const MEMORY_KEY = "kernelMemory";
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