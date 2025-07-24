let pdfjsLib = null;
let pipeline = null;

let mode = "offline";
let apiKey = localStorage.getItem("kernel_api_key") || "";
let offlineModel = null;
let loadingOfflineModel = false;

// Kernel Artifacts
let kernelArtifacts = { creed: "" };

/**
 * Dynamically load pdf.js at runtime
 */
async function loadPDFLib() {
  if (!pdfjsLib) {
    const pdfModule = await new Function("return import('pdfjs-dist/build/pdf')")();
    const workerModule = await new Function("return import('pdfjs-dist/build/pdf.worker.entry')")();
    pdfjsLib = pdfModule;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule;
  }
}

/**
 * Extract text from PDF dynamically
 */
async function extractTextFromPDF(url) {
  await loadPDFLib();
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
 * Load Kernel artifacts from PDFs
 */
export async function loadKernelArtifacts() {
  kernelArtifacts.creed = await extractTextFromPDF("/artifacts/kernel_manifesto_with_preface.pdf");
  console.log("Kernel Creed Loaded:", kernelArtifacts.creed.substring(0, 150) + "...");
}

/**
 * Dynamically load transformers.js
 */
async function loadTransformers() {
  if (!pipeline) {
    const mod = await new Function("return import('@xenova/transformers')")();
    pipeline = mod.pipeline;
  }
}

/**
 * Initialize smaller ONNX model (Distilled LLaMA)
 */
export async function initOfflineModel() {
  if (offlineModel || loadingOfflineModel) return;
  loadingOfflineModel = true;
  await loadTransformers();

  let deviceOption = "webgpu";
  if (!("gpu" in navigator)) {
    console.warn("WebGPU not supported. Falling back to WASM.");
    deviceOption = "wasm";
  }

  console.log("Loading Distilled LLaMA model from local files...");
  offlineModel = await pipeline("text-generation", "/models/distilllama/", {
    device: deviceOption
  });
  console.log("Distilled LLaMA ready for offline inference.");
  loadingOfflineModel = false;
}

/**
 * Handle message routing
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
 * Online mode using OpenAI API
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
 * Offline mode using local model
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
 * Mode + API Key Management
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
