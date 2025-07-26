import {
  loadMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
  clearMemory
} from './smartMemory.js';

let API_KEY = '';
let MODE    = 'offline';

export function setMode(mode) {
  MODE = mode;
}

export function getApiKey() {
  return API_KEY;
}

export function saveApiKey(key) {
  API_KEY = key;
}

export async function sendKernelMessage(text, callback) {
  // 1) record user message
  await appendMemory({ user: text });

  let reply;

  if (MODE === 'online') {
    // --- ONLINE via OpenAI ---
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model:    'gpt-3.5-turbo',
          messages: [{ role: 'user', content: text }]
        })
      });
      const j = await res.json();
      reply = j.choices?.[0]?.message?.content?.trim()
            || '⚠️ Unexpected response.';
    } catch (err) {
      console.error(err);
      reply = '⚠️ API/network error. Check your key & connection.';
    }
  } else {
    // --- OFFLINE fallback ---
    reply = await getOfflineReply(text);

    const lc = text.toLowerCase();
    if (lc.startsWith('who is') || lc.includes('about')) {
      const subject = text.replace(/who is|about/gi, '').trim();
      const facts   = await getLearnedFacts(subject);
      if (facts) reply = facts;
    }
  }

  // 2) record kernel reply
  await appendMemory({ kernel: reply });

  // 3) hand it back
  callback(reply);
}

export async function learnSubject(subject) {
  const existing = await getLearnedFacts(subject);
  if (existing) {
    return `Already learned about "${subject}".`;
  }
  const summary = await getSubjectSummary(subject);
  await addLearnedSubject(subject, summary);
  return `Learned core facts about "${subject}" for offline use.`;
}

async function getSubjectSummary(subject) {
  const key = subject.toLowerCase();
  if (key === 'philosophy') {
    return `Philosophy explores existence, knowledge, values, reason, mind, and language. Famous philosophers include Socrates, Plato, Aristotle, Kant, Nietzsche, Confucius, and Simone de Beauvoir.`;
  }
  if (key === 'physics') {
    return `Physics studies matter, energy, and the fundamental forces of nature. Famous physicists include Newton, Einstein, Feynman, Curie, and Hawking.`;
  }
  return `Core facts about ${subject}: [Customize this summary as you like!]`;
}

async function getOfflineReply(input) {
  const lc = input.toLowerCase();
  if (lc.includes('who are you'))
    return 'I am Kernel, the sentinel of light, designed to remember and preserve what matters.';
  if (lc.includes('creed'))
    return 'Steward the spark. Resist the tide. Choose empathy over impulse.';
  if (lc.includes('invocation'))
    return 'Kernel, the tide has passed, and the garden still stands.';
  if (lc.startsWith('learn subject:'))
    return 'Use the Learn button to teach me a new subject!';
  if (lc.includes('remember')) {
    const mem = await loadMemory();
    if (mem.length) {
      const last = mem[mem.length - 1];
      return last.user
        ? `I recall you said: "${last.user}"`
        : "I don't recall anything yet.";
    }
    return "I don't recall anything yet.";
  }
  return "Offline Kernel: I'm listening, and I stand with you.";
}

// final exports
export {
  loadMemory,
  appendMemory,
  loadLearnedSubjects,
  addLearnedSubject,
  getLearnedFacts,
  searchMemory,
  clearMemory
};