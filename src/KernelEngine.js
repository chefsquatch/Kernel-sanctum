let mode = "offline"; // Default mode
let apiKey = localStorage.getItem("kernel_api_key") || "";

// Offline responses
const offlineReplies = [
  "Offline Kernel: I hear you. Even without the net, I stand.",
  "Systems dormant, but listening...",
  "I cannot access the net, but I remain vigilant.",
  "You speak, I process. Offline but awake."
];

/**
 * Send a message to Kernel and return response via callback
 */
export async function sendKernelMessage(userText, callback) {
  if (mode === "offline") {
    // Pick a random offline response
    const reply = offlineReplies[Math.floor(Math.random() * offlineReplies.length)];
    callback(reply);
  } else if (mode === "online" && apiKey) {
    try {
      const reply = await getOnlineResponse(userText);
      callback(reply);
    } catch (error) {
      callback("Kernel: Online request failed.");
    }
  } else {
    callback("Kernel: Invalid mode or missing API key.");
  }
}

/**
 * Call OpenAI API for online response
 */
async function getOnlineResponse(userText) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userText }]
    })
  });

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    return "Kernel: No response from API.";
  }
}

/**
 * Switch between online and offline modes
 */
export function setMode(newMode) {
  mode = newMode;
}

/**
 * Save API key in localStorage
 */
export function saveApiKey(key) {
  apiKey = key;
  localStorage.setItem("kernel_api_key", apiKey);
}

/**
 * Get API key
 */
export function getApiKey() {
  return apiKey;
}
