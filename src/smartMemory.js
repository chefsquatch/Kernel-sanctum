import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

/** Load the chat memory array */
export async function loadMemory() {
  const { value } = await Storage.get({ key: 'kernelMemory' });
  return value ? JSON.parse(value) : [];
}

/** Persist up to the last 500 messages */
export async function saveMemory(messages) {
  await Storage.set({
    key: 'kernelMemory',
    value: JSON.stringify(messages.slice(-500)),
  });
}

/** Load learned subjects map */
export async function loadLearnedSubjects() {
  const { value } = await Storage.get({ key: 'kernelLearnedSubjects' });
  return value ? JSON.parse(value) : {};
}

/** Add/update a learned subject */
export async function addLearnedSubject(subject, facts) {
  const learned = await loadLearnedSubjects();
  learned[subject.toLowerCase()] = facts;
  await Storage.set({
    key: 'kernelLearnedSubjects',
    value: JSON.stringify(learned),
  });
}

/** Fetch facts for one subject */
export async function getLearnedFacts(subject) {
  const learned = await loadLearnedSubjects();
  return learned[subject.toLowerCase()] || null;
}

/** Search chat memory (only messages with kernel replies) */
export async function searchMemory(query) {
  const msgs = await loadMemory();
  return msgs.filter(
    m =>
      (
        (m.user   && m.user.toLowerCase().includes(query.toLowerCase())) ||
        (m.kernel && m.kernel.toLowerCase().includes(query.toLowerCase()))
      ) &&
      m.kernel
  );
}

/** Wipe all stored memory & learned subjects */
export async function clearMemory() {
  await Storage.remove({ key: 'kernelMemory' });
  await Storage.remove({ key: 'kernelLearnedSubjects' });
}

/** Append one message object {user:…,kernel:…} */
export async function appendMemory(message) {
  const msgs = await loadMemory();
  msgs.push(message);
  await saveMemory(msgs);
}