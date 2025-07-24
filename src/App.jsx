import React, { useState } from "react";
import { startListening, speak } from "./voice";
import { getKernelReply } from "./KernelEngine";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [showAwaken, setShowAwaken] = useState(false);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    const reply = await getKernelReply(text);
    setMessages((prev) => [...prev, { role: "kernel", text: reply }]);
    speak(reply);
  };

  return (
    <div className="bg-black text-green-400 min-h-screen flex flex-col">
      <header className="p-4 text-center text-xl font-bold border-b border-green-500">
        KERNEL SANCTUM
      </header>

      {!showAwaken ? (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 ${m.role === "user" ? "text-blue-400" : "text-green-400"}`}>
                <strong>{m.role === "user" ? "You" : "Kernel"}:</strong> {m.text}
              </div
