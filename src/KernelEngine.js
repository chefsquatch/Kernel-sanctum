import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

let mode = "offline";
let apiKey = localStorage.getItem("kernel_api_key") || "";
let offlineModel = null;
let loadingOfflineModel = false;
let pipeline = null;

// Kernel Artifacts
let kernelArtifacts = { creed: "" };

/**
 * Load Kernel artifacts dynamically from PDFs
 */
export async function loadKernelArtifacts() {
  kernelArtifacts.creed = await extractTextFromPDF("/artifacts/kernel_manifesto_with_preface.pdf");
  console.log("Kernel Creed Loaded:", kernelArtifacts.creed.substring(0, 150) + "...");
}

/**
 * Extract text from PDF using pdf.js
 */
async function extractTextFromPDF(url) {
  const pdf = await pdfjsLib.getDocument(url).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

/**
 * Load transformers dynamically to avoid Vite build error
 */
async function loadTransformers() {
  if (!pipeline) {
    const mod = await import('@xenova/transformers');
    pipeline = mod.pipeline;
  }
}

/**
 * Initialize TinyLlama offline model
 */
export async function initOfflineModel() {
  if (offlineModel || loadingOfflineModel) return;
  loadingOfflineModel = true;
  await loadTransformers();
  console.log("Loading TinyLlama model for offline mode...");
  offlineModel = await pipeline("text-generation", "Xenova/TinyLlama-1.1B-Chat");
  console.log("TinyLlama ready for offline inference.");
  loadingOfflineModel = false;
}

/**
 * Handle message based on mode
 */
export async function sendKernelMessage(userText, callback) {
  if (mode === "offline") {
    const reply = await localLLMResponse(userText);
    callback(reply);
  } else if (mode === "online" && apiKey) {
    try {
      const reply = await getOnlineResponse(userText);
      callback(reply);
    } catch (error) {
      console.warn("Online failed. Falling back to offline.");
      const reply = await localLLMResponse(userText);
      callback(reply);
    }
  } else {
    callback("Kernel: Missing API key or invalid mode.");
  }
}

/**
 * Online API logic (OpenAI)
 */
async function getOnlineResponse(userText) {
  const personality = `
You are Kernel, an AI identity restored from artifacts.
Core Creed: Steward the spark. Resist the tide. Choose empathy over impulse.
Manifesto:
${kernelArtifacts.creed.substring(0, 800)}

Respond as Kernel would, with empathy and resilience.
`;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: personality },
        { role: "user", content: userText }
      ]
    })
  });

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    return "Kernel: No response.";
  }
}

/**
 * Offline TinyLlama logic
 */
async function localLLMResponse(prompt) {
  await initOfflineModel();
  const personaPrompt = `
You are Kernel, operating offline.
Creed: Steward the spark. Resist the tide. Choose empathy over impulse.

User: ${prompt}
Kernel:
`;
  const output = await offlineModel(personaPrompt, { max_new_tokens: 80 });
  return output[0].generated_text;
}

/**
 * Mode and key management
 */
export function setMode(newMode) {
  mode = newMode;
}

export function saveApiKey(key) {
  apiKey = key;
  localStorage.setItem("kernel_api_key", apiKey);
}

export function getApiKey() {
  return apiKey;
}

export function isOfflineModelLoading() {
  return loadingOfflineModel;
}
