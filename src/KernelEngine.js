import { appendMemory } from "./smartMemory.js";

let API_KEY = "";
let MODE = "offline";

export function getApiKey() { return API_KEY; }
export async function saveApiKey(key) { API_KEY = key; }
export function getMode() { return MODE; }
export async function setMode(m) { MODE = m; }

export async function sendKernelMessage(text) {
  await appendMemory({ user: text });

  if (MODE === "offline") {
    const reply = "Offline mode response: " + text;
    await appendMemory({ kernel: reply });
    return reply;
  }

  if (MODE === "online" && API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: "You are Kernel AI." }, { role: "user", content: text }]
        })
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "No response from API.";
      await appendMemory({ kernel: reply });
      return reply;
    } catch (err) {
      return "Error connecting to API.";
    }
  }
  return "Mode or API key not set.";
}

export async function learnSubject(subject) {
  const reply = `Learned about: ${subject}`;
  await appendMemory({ kernel: reply });
  return reply;
}