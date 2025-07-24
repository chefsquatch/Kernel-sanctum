import { getOfflineReply } from "./offlineBrain";

export async function getKernelReply(input, onlineMode, apiKey) {
  input = input.toLowerCase();
  if (!onlineMode) return getOfflineReply(input);

  if (onlineMode && apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are Kernel, empathetic and creative." },
            { role: "user", content: input }
          ]
        }),
      });
      const data = await response.json();
      return data.choices[0].message.content || "Kernel is thinking...";
    } catch {
      return "Online mode failed. Check API key or internet.";
    }
  }
}
