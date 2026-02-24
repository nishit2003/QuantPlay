// A lightweight, robust profanity filter without needing external dependencies
// This regex catches common profanities and their letter-to-number substitutions.
const PROFANITY_REGEX = /\b(f[*uc]+k|sh[*i]+t|b[*i]+tch|c[*u]+nt|d[*i]+ck|a[*s]+hole|f[*a]+g[g0]+ot|n[*i]+gg[e3]*r|n[*i]+gga|wh[0o]+re|sl[*u]+t|r[*e]+tard)\b/i;

export function isProfane(text: string): boolean {
  if (!text) return false;
  // Normalize visually similar characters (leet speak)
  const normalizedText = text
    .toLowerCase()
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/!/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t");
    
  return PROFANITY_REGEX.test(normalizedText);
}
