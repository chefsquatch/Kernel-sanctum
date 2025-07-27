import { sendKernelMessage, learnSubject, saveApiKey, getApiKey, setMode, getMode } from "./KernelEngine.js";
import { clearMemory, searchMemory } from "./smartMemory.js";

const chatbox = document.getElementById("chatbox");
const inputEl = document.getElementById("input");
const modal = document.getElementById("settingsModal");

let messages = [{ kernel: "Welcome! How can I help you today?" }];

function renderChat() {
  chatbox.innerHTML = "";
  messages.forEach((m) => {
    const div = document.createElement("div");
    div.className = m.user ? "bg-blue-600 p-2 rounded" : "bg-gray-700 p-2 rounded";
    div.textContent = m.user || m.kernel;
    chatbox.appendChild(div);
  });
  chatbox.scrollTop = chatbox.scrollHeight;
}
renderChat();

// Send message
document.getElementById("chat-form").onsubmit = async (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  // Handle search command
  if (text.startsWith("/search ")) {
    const query = text.replace("/search ", "");
    const results = await searchMemory(query);
    messages.push({ kernel: `Search results:\n${results.map(r => r.user || r.kernel).join("\n")}` });
    renderChat();
    inputEl.value = "";
    return;
  }

  messages.push({ user: text });
  renderChat();
  inputEl.value = "";

  const reply = await sendKernelMessage(text);
  messages.push({ kernel: reply });
  renderChat();
};

// Settings modal
document.getElementById("settingsBtn").onclick = () => {
  document.getElementById("apiKeyInput").value = getApiKey();
  document.getElementById("modeSelect").value = getMode();
  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

document.getElementById("closeSettings").onclick = () => {
  modal.classList.add("hidden");
};

document.getElementById("saveSettings").onclick = async () => {
  await saveApiKey(document.getElementById("apiKeyInput").value);
  await setMode(document.getElementById("modeSelect").value);
  messages.push({ kernel: "Settings updated." });
  renderChat();
  modal.classList.add("hidden");
};

document.getElementById("clearMemory").onclick = async () => {
  await clearMemory();
  messages.push({ kernel: "Memory cleared." });
  renderChat();
  modal.classList.add("hidden");
};