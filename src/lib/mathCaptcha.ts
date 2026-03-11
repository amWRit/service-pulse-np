// Simple in-memory math captcha store (for demo; use Redis or DB for production)
const captchaStore = new Map<string, { question: string; answer: number; created: number }>();

export function generateMathCaptcha(ipOrUserKey: string) {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const answer = a + b;
  captchaStore.set(ipOrUserKey, { question: `${a} + ${b}`, answer, created: Date.now() });
  return { question: `${a} + ${b}` };
}

export function validateMathCaptcha(ipOrUserKey: string, userAnswer: string | number) {
  const entry = captchaStore.get(ipOrUserKey);
  if (!entry) return false;
  const isValid = Number(userAnswer) === entry.answer;
  if (isValid) captchaStore.delete(ipOrUserKey); // One-time use
  return isValid;
}
