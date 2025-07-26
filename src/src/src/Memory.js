export function loadMemory() {
  try {
    const data = localStorage.getItem("kernelMemory");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error parsing kernelMemory from localStorage:", error);
    // If corrupted, clear memory and start fresh
    localStorage.removeItem("kernelMemory");
    return [];
  }
}

export function saveMemory(messages) {
  try {
    // Store only the last 50 messages to keep size manageable
    const toSave = messages.slice(-50);
    localStorage.setItem("kernelMemory", JSON.stringify(toSave));
  } catch (error) {
    console.error("Error saving kernelMemory to localStorage:", error);
  }
}