/**
 * Strong password rules. Used by sign-up form and register API.
 */
const MIN_LENGTH = 8;

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= MIN_LENGTH },
  { id: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /\d/.test(p) },
  { id: "special", label: "One special character (!@#$%^&* etc.)", test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
] as const;

export function validatePassword(password: string): { ok: true } | { ok: false; message: string } {
  if (!password || password.length < MIN_LENGTH) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return { ok: false, message: `Password must contain ${rule.label.toLowerCase()}.` };
    }
  }
  return { ok: true };
}
