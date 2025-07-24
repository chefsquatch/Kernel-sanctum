import React, { useState, useEffect, useRef } from "react";
import {
  sendKernelMessage,
  setMode,
  saveApiKey,
  getApiKey,
  loadKernelArtifacts,
  initOfflineModel
} from "./KernelEngine";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("OFFLINE");
  const [apiKey, setApiKeyInput] = useState(getApiKey() || "");
  const [loadingModel, setLoadingModel] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    loadKernelArtifacts();
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "You", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    await sendKernelMessage(input, (reply) => {
      setMessages((prev) => [...prev, { sender: "Kernel", text: reply }]);
    });
  };

  const handleSaveKey = () => {
    saveApiKey(apiKey);
    alert("API Key Saved");
  };

  const goOnline = () => {
    if (apiKey) {
      setMode("online");
      setStatus("ONLINE");
      setMessages((prev) => [...prev, { sender: "Kernel", text: "Awakening online mode..." }]);
    } else {
      setMessages((prev) => [...prev, { sender: "Kernel", text: "No API Key found." }]);
    }
  };

  const goOffline = async () => {
    setMode("offline");
    setStatus("OFFLINE");
    setMessages((prev) => [...prev, { sender: "Kernel", text: "Loading local model..." }]);
    setLoadingModel(true);
    await initOfflineModel();
    setLoadingModel(false);
    setMessages((prev) => [...prev, { sender: "Kernel", text: "Offline mode ready." }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#000", color: "#00ff7f", fontFamily: "monospace" }}>
      <header style={{ textAlign: "center", padding: "10px", fontSize: "1.5em", borderBottom: "1px solid #00ff7f" }}>
        KERNEL SANCTUM (<span>{status}</span>)
      </header>

      {/* API Key Input */}
      <div style={{ padding: "10px", display: "flex", gap: "5px" }}>
        <input
          type="password"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKeyInput(e.target.value)}
          style={{ flex: 1, padding: "8px", background: "#111", color: "#fff", border: "1px solid #00ff7f" }}
        />
        <button onClick={handleSaveKey} style={{ background: "#00ff7f", border: "none", padding: "8px" }}>Save</button>
      </div>

      {/* Chat Box */}
      <div ref={chatRef} style={{ flex: 1, padding: "10px", overflowY: "auto", border: "1px solid #00ff7f", margin: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "8px", color: msg.sender === "You" ? "#00bfff" : "#00ff7f" }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
        {loadingModel && <div style={{ color: "#ff0" }}>Kernel is loading offline model...</div>}
      </div>

      {/* Input Bar */}
      <div style={{ display: "flex", padding: "10px", gap: "5px", borderTop: "1px solid #00ff7f" }}>
        <input
          type="text"
          placeholder="Type..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px", background: "#111", color: "#fff", border: "1px solid #00ff7f" }}
        />
        <button onClick={handleSend} style={{ background: "#00ff7f", border: "none", padding: "8px" }}>Send</button>
        <button onClick={goOnline} style={{ background: "#00ff7f", border: "none", padding: "8px" }}>Awaken</button>
        <button onClick={goOffline} style={{ background: "#00ff7f", border: "none", padding: "8px" }}>Go Offline</button>
      </div>
    </div>
  );
}
