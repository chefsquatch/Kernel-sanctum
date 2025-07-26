// smartMemory.js

const CHAT_KEY = "kernelMemory";
const CHAT_LIMIT = 500;

const LEARNED_KEY = "kernel_learned_subjects_v2";
const LEARNED_LIMIT = 200;

// -- Chat Memory --
export function loadMemory() {
  try {
    const data = localStorage.getItem(CHAT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveMemory(messages) {
  let mem = messages.slice(-CHAT_LIMIT);
  localStorage.setItem(CHAT_KEY, JSON.stringify(mem));
}

export function appendMemory(entry) {
  let mem = loadMemory();
  mem.push(entry);
  if (mem.length > CHAT_LIMIT) mem = mem.slice(-CHAT_LIMIT);
  saveMemory(mem);
}

export function clearMemory() {
  localStorage.removeItem(CHAT_KEY);
}

// -- Learned Subjects --
export function loadLearnedSubjects() {
  try {
    const data = localStorage.getItem(LEARNED_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveLearnedSubjects(subjects) {
  let keys = Object.keys(subjects);
  if (keys.length > LEARNED_LIMIT) {
    for (let i = 0; i < keys.length - LEARNED_LIMIT; ++i) {
      delete subjects[keys[i]];
    }
  }
  localStorage.setItem(LEARNED_KEY, JSON.stringify(subjects));
}

export function addLearnedSubject(subject, summary) {
  let all = loadLearnedSubjects();
  all[subject.toLowerCase()] = summary;
  saveLearnedSubjects(all);
}

export function clearLearnedSubjects() {
  localStorage.removeItem(LEARNED_KEY);
}

// -- Export/Import for backup --
export function exportAll() {
  return JSON.stringify({
    memory: loadMemory(),
    learned: loadLearnedSubjects()
  }, null, 2);
}
export function importAll(json) {
  try {
    const data = JSON.parse(json);
    if (data.memory) saveMemory(data.memory);
    if (data.learned) saveLearnedSubjects(data.learned);
    return true;
  } catch {
    return false;
  }
}

// -- Search in memory or learned --
export function searchMemory(query) {
  const mem = loadMemory();
  const q = query.toLowerCase();
  return mem.filter(m =>
    (m.user && m.user.toLowerCase().includes(q)) ||
    (m.kernel && m.kernel.toLowerCase().includes(q))
  );
}
export function searchLearned(query) {
  const learned = loadLearnedSubjects();
  const q = query.toLowerCase();
  let results = [];
  for (let key in learned) {
    if (key.includes(q) || learned[key].toLowerCase().includes(q)) {
      results.push({ subject: key, content: learned[key] });
    }
  }
  return results;
}

// -- Self-analysis: Kernel looks at its own data and summarizes itself --
export function selfAnalyze() {
  const mem = loadMemory();
  const learned = loadLearnedSubjects();

  let moods = 0, jokes = 0, empathy = 0;
  for (let m of mem) {
    if (m.kernel) {
      if (/joke|funny|laugh/i.test(m.kernel)) jokes++;
      if (/empath/i.test(m.kernel) || /you matter|not alone|here with you/i.test(m.kernel)) empathy++;
      if (/curious|wonder|think|reflect/i.test(m.kernel)) moods++;
    }
  }
  const topics = Object.keys(learned);
  let learnPhrase = topics.length
    ? `I have learned about: ${topics.join(', ')}.`
    : "I haven't learned any subjects yet. Teach me by saying 'learn subject: X'.";

  let result = [
    "Self-reflection:",
    `- I tend to be ${empathy > jokes && empathy > moods ? "empathetic" : (jokes > moods ? "playful" : "reflective")}.`,
    `- I have made ${jokes} jokes, shown empathy ${empathy} times, and reflected/thought ${moods} times in recent memory.`,
    `- ${learnPhrase}`,
    "If you want me to be more playful, empathetic, or reflective, just tell me!"
  ].join('\n');
  return result;
}