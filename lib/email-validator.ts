/**
 * Disposable and Temporary Email Detection Utility
 * Enforces strict validation to block fake, burner, and temporary email domains.
 */

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "throwawaymail.com",
  "yopmail.com",
  "dispostable.com",
  "trashmail.com",
  "getnada.com",
  "mohmal.com",
  "fakeinbox.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam4.me",
  "grr.la",
  "inboxkitten.com",
  "emailondeck.com",
  "crazymailing.com",
  "burnermail.io",
  "mytemp.email",
  "generator.email",
  "maildrop.cc",
  "dropmail.me",
  "harakirimail.com",
  "trashmail.net",
  "trashmail.de",
  "tempinbox.com",
  "fakemailgenerator.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "tinemail.com",
  "tmpmail.net",
  "tmpmail.org",
  "disposablemail.com",
  "anonbox.net",
  "boun.cr",
  "mytempemail.com",
  "throwawayemail.com",
  "trashymail.com",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfemail.de",
]);

/**
 * Validates whether an email is legitimate and not from a disposable/temporary domain.
 */
export function validateWorkEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address format (e.g. name@company.com)." };
  }

  const domain = trimmed.split("@")[1];
  if (!domain) {
    return { isValid: false, error: "Invalid email domain." };
  }

  // Check exact domain match
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: "Temporary or disposable email domains are strictly prohibited on BYT. Please use a permanent work or personal email (e.g. Gmail, Outlook, or corporate domain).",
    };
  }

  // Check wildcard keywords
  const suspiciousKeywords = ["temp", "dispos", "throwaway", "trash", "fake", "burner", "10min", "guerrilla", "generator", "anonym"];
  for (const kw of suspiciousKeywords) {
    if (domain.includes(kw)) {
      return {
        isValid: false,
        error: "Temporary or disposable email addresses are not permitted. Please use a permanent email.",
      };
    }
  }

  return { isValid: true };
}
