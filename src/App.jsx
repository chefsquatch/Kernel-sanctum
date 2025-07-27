import React, { useState } from "react";
import {
  sendKernelMessage,
  learnSubject,
  saveApiKey,
  getApiKey,
  setMode,
  getMode,
} from "./KernelEngine.js";
import { clearMemory, searchMemory } from "./smartMemory.js";

export default function App() {
  const [messages, setMessages] = useState([
    { kernel: "Welcome! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKeyInput] = useState(getApiKey());
  const [mode, setModeState] = useState(getMode());

  function renderChat() {
    return messages.map((m, i) => (
      <div key={i} className={`msg ${m.user ? "user-msg" : "kernel-msg"}`}>
        {m.user || m.kernel}
      </div>
    ));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    if (input.startsWith("/search ")) {
      const q = input.replace("/search ", "");
      const results = await searchMemory(q);
      setMessages([
        ...messages,
        { kernel: `Search results:\n${results.map((r) => r.user || r.kernel).join("\n")}` },
      ]);
      setInput("");
      return;
    }

    const newMsgs = [...messages, { user: input }];
    setMessages(newMsgs);
    setInput("");
    const reply = await sendKernelMessage(input);
    setMessages([...newMsgs, { kernel: reply }]);
  }

  async function saveSettings() {
    await saveApiKey(apiKey);
    await setMode(mode);
    setMessages([...messages, { kernel: "Settings updated." }]);
    setShowModal(false);
  }

  async function clearAllMemory() {
    await clearMemory();
    setMessages([{ kernel: "Memory cleared." }]);
    setShowModal(false);
  }

  return (
    <>
      <header>
        <h2>Kernel AI</h2>
        <button onClick={() => setShowModal(true)}>⚙️</button>
      </header>
      <div className="chatbox">{renderChat()}</div>
      <form className="input-row" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>

      <div className={`modal ${showModal ? "active" : ""}`}>
        <div className="modal-box">
          <h3>Settings</h3>
          <label>API Key:</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
          <label>Mode:</label>
          <select value={mode} onChange={(e) => setModeState(e.target.value)}>
            <option value="offline">Offline</option>
            <option value="online">Online (API)</option>
          </select>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={saveSettings}>Save</button>
            <button
              onClick={clearAllMemory}
              style={{ background: "#b91c1c" }}
            >
              Clear Memory
            </button>
          </div>
        </div>
      </div>
    </>
  );
}