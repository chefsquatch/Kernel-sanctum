// smartMemory.js
// Pure localStorage-based persistent memory for chat and learned subjects.

export async function loadMemory() {
  try {
    const data = localStorage.getItem("kernelMemory");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveMemory(messages) {
  try {
    localStorage.setItem("kernelMemory", JSON.stringify(messages.slice(-500)));
  } catch {
    // ignore silently
  }
}

export async function loadLearnedSubjects() {
  try {
    const data = localStorage.getItem("kernelLearnedSubjects");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export async function addLearnedSubject(subject, facts) {
  try {
    const learned = await loadLearnedSubjects();
    learned[subject.toLowerCase()] = facts;
    localStorage.setItem("kernelLearnedSubjects", JSON.stringify(learned));
  } catch {
    // ignore silently
  }
}

export async function getLearnedFacts(subject) {
  try {
    const learned = await loadLearnedSubjects();
    return learned[subject.toLowerCase()] || null;
  } catch {
    return null;
  }
}

export async function searchMemory(query) {
  try {
    const messages = await loadMemory();
    return messages.filter(
      (msg) =>
        ((msg.user && msg.user.toLowerCase().includes(query.toLowerCase())) ||
          (msg.kernel && msg.kernel.toLowerCase().includes(query.toLowerCase()))) &&
        msg.kernel
    );
  } catch {
    return [];
  }
}

export async function clearMemory() {
  try {
    localStorage.removeItem("kernelMemory");
    localStorage.removeItem("kernelLearnedSubjects");
  } catch {
    // ignore silently
  }
}

export async function appendMemory(message) {
  try {
    const messages = await loadMemory();
    messages.push(message);
    await saveMemory(messages);
  } catch {
    // ignore silently
  }
}