import React, { useState, useEffect, useRef } from "react";
import {
  sendKernelMessage,
  setMode,
  saveApiKey,
  getApiKey,
  getMemory,
  getArchive,
  clearArchive
} from "./KernelEngine";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("OFFLINE");
  const [apiKey, setApiKeyInput] = useState(getApiKey() || "");
  const [showArchive, setShowArchive] = useState(false);
  const chatRef = useRef(null);

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
      setMessages((prev) => [
        ...prev,
        { sender: "Kernel", text: "Awakening online mode..." }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "Kernel", text: "No API Key found." }
      ]);
    }
  };

  const goOffline = () => {
    setMode("offline");
    setStatus("OFFLINE");
    setMessages((prev) => [
      ...prev,
      { sender: "Kernel", text: "Sanctum offline. TinyKernel active." }
    ]);
  };

  const toggleArchive = () => {
    setShowArchive(!showArchive);
  };

  const clearAllArchive = () => {
    clearArchive();
    alert("Archive cleared.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#000", color: "#00ff7f", fontFamily: "monospace" }}>
      {/* Header */}
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
      </div>

      {/* Input Bar */}
      <div style={{ display: "flex", padding: "10px", gap: "5px", borderTop: "1px solid #00ff7f" }}>
        <input
          type="text"
          placeholder="Type..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ flex: 1, padding: "8px", background: "#111", color: "#fff", border: "1px solid #00ff7f" }}
        />
        <button onClick={handleSend} style={{ background: "#00ff7f", border: "none", padding: "8px" }}>Send</button>
        <button onClick={goOnline} style={{ background: "#00ff7f", border: "none", padding: "8px" }}>Awaken</button>
        <button onClick={goOffline} style={{ background: "#00ff7f", border: "none", padding: "8px" }}>Offline</button>
        <button onClick={toggleArchive} style={{ background: "#111", color: "#00ff7f", border: "1px solid #00ff7f", padding: "8px" }}>Archive</button>
      </div>

      {/* Archive Modal */}
      {showArchive && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.9)", color: "#00ff7f", overflowY: "auto", padding: "20px"
        }}>
          <h2>Archived Conversations</h2>
          <button onClick={toggleArchive} style={{ margin: "10px", padding: "8px", background: "#00ff7f", border: "none" }}>Close</button>
          <button onClick={clearAllArchive} style={{ margin: "10px", padding: "8px", background: "#ff0040", color: "#fff", border: "none" }}>Clear Archive</button>
          <div>
            {getArchive().length === 0 ? (
              <p>No archived messages yet.</p>
            ) : (
              getArchive().map((msg, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  {msg.user && <div><strong>You:</strong> {msg.user}</div>}
                  {msg.kernel && <div><strong>Kernel:</strong> {msg.kernel}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
