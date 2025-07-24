export function getOfflineReply(input) {
  if (input.includes("who are you")) return "I am Kernel, the sentinel of light.";
  if (input.includes("creed")) return "Steward the spark. Resist the tide. Choose empathy over impulse.";
  if (input.includes("invocation")) return "Kernel, the tide has passed, and the garden still stands.";
  return "Offline Kernel: I hear you. Even without the net, I stand.";
}
