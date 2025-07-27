import { appendMemory, addLearnedSubject, findLearnedFact } from "./smartMemory.js";

let API_KEY = "";
let MODE = "offline";

export function getApiKey() {
  return API_KEY;
}
export async function saveApiKey(key) {
  API_KEY = key;
}
export function getMode() {
  return MODE;
}
export async function setMode(m) {
  MODE = m;
}

export async function sendKernelMessage(text) {
  await appendMemory({ user: text });

  // 1. Check learned subjects first
  const learnedReply = await findLearnedFact(text);
  if (learnedReply) {
    await appendMemory({ kernel: learnedReply });
    return learnedReply;
  }

  // 2. Offline mode fallback
  if (MODE === "offline") {
    const reply = "Offline response: " + text;
    await appendMemory({ kernel: reply });
    return reply;
  }

  // 3. Online API call
  if (MODE === "online" && API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are Kernel AI." },
            { role: "user", content: text },
          ],
        }),
      });

      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content || "No response from API.";
      await appendMemory({ kernel: reply });
      return reply;
    } catch (err) {
      return "Error connecting to API.";
    }
  }
  return "Mode or API key not set.";
}

// Learn feature
export async function learnSubject(subject) {
  const facts = prompt(`Enter details about ${subject}`);
  if (!facts) return "Learning canceled.";
  await addLearnedSubject(subject, facts);
  return `I have learned about ${subject}.`;
}