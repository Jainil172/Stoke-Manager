const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  if (!value || !value.trim()) return "Email is required.";
  if (!emailPattern.test(value.trim())) return "Enter a valid email address.";
  return null;
}

export function validateRequired(value, fieldName = "This field") {
  if (!value || !String(value).trim()) return `${fieldName} is required.`;
  return null;
}

export function validateMinLength(value, min, fieldName = "Password") {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters.`;
  }
  return null;
}

export function validatePassword(value) {
  const required = validateRequired(value, "Password");
  if (required) return required;
  return validateMinLength(value, 6);
}

export function validateConfirmPassword(value, password) {
  if (!value) return "Please confirm your password.";
  if (value !== password) return "Passwords do not match.";
  return null;
}

export function getPasswordStrength(password = "") {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function getPasswordStrengthLabel(score) {
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  return labels[score];
}
