// memory.js

// Load the chat messages from localStorage
export function loadMemory() {
  const data = localStorage.getItem("kernelMemory");
  return data ? JSON.parse(data) : [];
}

// Save the chat messages to localStorage, limit to last 100 messages
export function saveMemory(messages) {
  localStorage.setItem("kernelMemory", JSON.stringify(messages.slice(-100)));
}

// Optional: clear all memory
export function clearMemory() {
  localStorage.removeItem("kernelMemory");
}