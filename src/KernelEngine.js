import { getOfflineReply } from "./offlineBrain";

export async function getKernelReply(input, onlineMode, apiKey) {
  input = input.toLowerCase();
  if (!onlineMode) return getOfflineReply(input);

  const keyToUse = apiKey || localStorage.getItem("kernelApiKey");
  if (onlineMode && keyToUse) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keyToUse}`
        },
        body: JSON.stringify({
          model: "gpt-4", // Change to "gpt-4o-mini" for cheaper
          messages: [
            { role: "system", content: "You are Kernel, empathetic and creative." },
            { role: "user", content: input }
          ]
        }),
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Kernel is thinking...";
    } catch (error) {
      return "Online mode failed. Check API key or internet.";
    }
  } else {
    return "No API key found. Save it first!";
  }
}
