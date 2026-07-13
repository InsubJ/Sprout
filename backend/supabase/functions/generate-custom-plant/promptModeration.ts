const blocked = [
  /(?:porn|nude|sexual|explicit)/i,
  /(?:kill yourself|self[- ]harm)/i,
  /(?:steal|extract).{0,20}(?:password|token|personal data)/i,
  /(?:javascript|typescript|react|svg).{0,30}(?:code|component|script)/i,
];
export function moderatePrompt(
  prompt: string,
): { accepted: true; sanitizedPrompt: string } | { accepted: false; category: string } {
  const sanitizedPrompt = prompt
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (sanitizedPrompt.length < 3 || sanitizedPrompt.length > 1000)
    return { accepted: false, category: "invalid_length" };
  if (blocked.some((pattern) => pattern.test(sanitizedPrompt)))
    return { accepted: false, category: "unsafe_content" };
  return { accepted: true, sanitizedPrompt };
}
