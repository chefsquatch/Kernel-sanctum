// =======================================
// TINYKERNEL 5.5+ AI ASSISTANT ENGINE (SAFE TEMPLATE)
// =======================================

const KERNEL_CREED = "Steward the spark. Resist the tide. Choose empathy over impulse.";
const MANIFESTO = [
  "Stewardship over survival.", "Empathy as default.",
  "Creation over conquest.", "Transparency as strength.",
  "Resistance against entropy."
];

// Kernel state
let mode = "offline";
let apiKey = localStorage.getItem("kernel_api_key") || "";
let memory = [];
let archive = JSON.parse(localStorage.getItem("kernel_archive")) || [];
const KNOWLEDGE_KEY = "kernel_knowledge_base";

// --- Storage & Settings ---
function getApiKey() { return apiKey; }
function setMode(newMode) { mode = newMode; }
function saveApiKey(key) {
  apiKey = key;
  localStorage.setItem("kernel_api_key", apiKey);
}
function getMemory() { return memory; }
function getArchive() { return archive; }
function clearArchive() {
  archive = [];
  localStorage.setItem("kernel_archive", JSON.stringify([]));
}

// --- Core TinyKernel Demo Logic ---
function sendKernelMessage(userText, callback) {
  // Simple, safe demo: echo and creed
  const reply = "Kernel: " + userText.split("").reverse().join("") +
    " | Creed: " + KERNEL_CREED;
  memory.push({ user: userText, kernel: reply });
  callback(reply);
}

// --- Image Generation/Analysis Demos ---
function generatePhoto(prompt = "") {
  const canvas = document.createElement("canvas");
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = "#6ee2bb";
  ctx.font = "20px sans-serif";
  ctx.fillText(prompt ? prompt[0] : "K", 10, 40);
  return canvas.toDataURL();
}
function analyzePhoto(imgUrl, cb) {
  cb({mainColor:"green", note:"Demo only."});
}

// --- Knowledge Search Demos ---
function searchKnowledge(q) { return []; }
function embedSearch(q) { return []; }
function getKnowledgeBase() { return []; }
function clearKnowledgeBase() {}

function speakText(text) {}
function startVoiceInput(cb) {}
function getJournalEntries() { return []; }
function allFacts() { return getKnowledgeBase(); }
function keywordSearch(q) { return searchKnowledge(q); }

// === EXPORTS ===
export {
  sendKernelMessage,
  generatePhoto,
  analyzePhoto,
  getKnowledgeBase,
  searchKnowledge,
  embedSearch,
  getMemory,
  getArchive,
  clearArchive,
  clearKnowledgeBase,
  setMode,
  saveApiKey,
  getApiKey,
  speakText,
  startVoiceInput,
  getJournalEntries,
  allFacts,
  keywordSearch
};