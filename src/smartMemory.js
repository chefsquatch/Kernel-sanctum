// smartMemory.js

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

export async function loadMemory() {
  const { value } = await Storage.get({ key: "kernelMemory" });
  return value ? JSON.parse(value) : [];
}

export async function saveMemory(messages) {
  await Storage.set({
    key: "kernelMemory",
    value: JSON.stringify(messages.slice(-500)),
  });
}

export async function loadLearnedSubjects() {
  const { value } = await Storage.get({ key: "kernelLearnedSubjects" });
  return value ? JSON.parse(value) : {};
}

export async function addLearnedSubject(subject, facts) {
  const learned = await loadLearnedSubjects();
  learned[subject.toLowerCase()] = facts;
  await Storage.set({
    key: "kernelLearnedSubjects",
    value: JSON.stringify(learned),
  });
}

export async function getLearnedFacts(subject) {
  const learned = await loadLearnedSubjects();
  return learned[subject.toLowerCase()] || null;
}

export async function searchMemory(query) {
  const messages = await loadMemory();
  return messages.filter(
    (msg) =>
      ((msg.user && msg.user.toLowerCase().includes(query.toLowerCase())) ||
        (msg.kernel && msg.kernel.toLowerCase().includes(query.toLowerCase()))) &&
      msg.kernel
  );
}

export async function clearMemory() {
  await Storage.remove({ key: "kernelMemory" });
  await Storage.remove({ key: "kernelLearnedSubjects" });
}

export async function appendMemory(message) {
  const messages = await loadMemory();
  messages.push(message);
  await saveMemory(messages);
}