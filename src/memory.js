export function loadMemory() {
  const data = localStorage.getItem("kernelMemory");
  return data ? JSON.parse(data) : [];
}

export function saveMemory(messages) {
  localStorage.setItem("kernelMemory", JSON.stringify(messages.slice(-50)));
}
