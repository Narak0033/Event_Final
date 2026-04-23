export const MAJORS = [
  "Bachelor of Science in Business Administration",
  "Bachelor of Arts in Communication",
  "Bachelor of Arts in International Relations and Diplomacy",
  "Bachelor of Science in Political Science",
  "Bachelor of Arts in Law",
  "Bachelor of Science in Artificial Intelligence",
  "Bachelor of Science in Cybersecurity",
  "Bachelor of Science in Digital Infrastructure",
  "Bachelor of Science in Information and Communications Technology",
  "Bachelor of Science in Software Development",
  "Bachelor of Science in Computer Science",
  "Bachelor of Science in Information Systems",
  "Bachelor of Science in Web and Mobile Application Development",
  "Master of Business Administration",
  "Master of Legal Studies",
  "Master of Laws in International Business and Digital Technologies",
  "Master of Laws in Cybersecurity",
  "Master of Laws in Artificial Intelligence",
  "Master of Science in Computer Science",
];

export const YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];

const RULES = {
  givenName: [
    { test: v => v.trim().length > 0, message: "Given name is required." },
    { test: v => v.trim().length >= 2, message: "Given name must be at least 2 characters." },
    { test: v => /^[a-zA-Z\s\-']+$/.test(v.trim()), message: "Given name can only contain letters, spaces, hyphens, or apostrophes." },
    { test: v => v.trim().length <= 50, message: "Given name must be 50 characters or fewer." },
  ],
  familyName: [
    { test: v => v.trim().length > 0, message: "Family name is required." },
    { test: v => v.trim().length >= 2, message: "Family name must be at least 2 characters." },
    { test: v => /^[a-zA-Z\s\-']+$/.test(v.trim()), message: "Family name can only contain letters, spaces, hyphens, or apostrophes." },
    { test: v => v.trim().length <= 50, message: "Family name must be 50 characters or fewer." },
  ],
  phone: [
    { test: v => v.trim().length > 0, message: "Phone number is required." },
    { test: v => /^[0-9+\-\s()]{7,20}$/.test(v.trim()), message: "Enter a valid phone number (7–20 digits, +, -, spaces, parentheses allowed)." },
    { test: v => (v.match(/\d/g) || []).length >= 7, message: "Phone number must contain at least 7 digits." },
  ],
  email: [
    { test: v => v.trim().length > 0, message: "Email is required." },
    {
      test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: "Enter a valid email address (e.g. name@aupp.edu.kh).",
    },
    {
      test: v => v.toLowerCase().endsWith(".edu.kh") || v.toLowerCase().endsWith("@aupp.edu.kh"),
      message: "Please use your school email (must end in @aupp.edu.kh or .edu.kh).",
    },
    { test: v => v.trim().length <= 100, message: "Email address is too long." },
  ],
  major: [
    { test: v => v.trim().length > 0, message: "Please select your major." },
    { test: v => MAJORS.includes(v.trim()), message: "Please select a valid major from the list." },
  ],
  year: [
    { test: v => v.trim().length > 0, message: "Please select your year of study." },
    { test: v => YEARS.includes(v.trim()), message: "Please select a valid year from the list." },
  ],
};

export function validateField(field, value) {
  const rules = RULES[field];
  if (!rules) return { valid: true, message: "" };
  for (const rule of rules) {
    if (!rule.test(value)) {
      return { valid: false, message: rule.message };
    }
  }
  return { valid: true, message: "" };
}

export function validateForm(data) {
  const errors = {};
  let valid = true;
  for (const field of Object.keys(RULES)) {
    const result = validateField(field, data[field] ?? "");
    if (!result.valid) {
      errors[field] = result.message;
      valid = false;
    }
  }
  return { valid, errors };
}

export function applyFieldState(input, errorEl, result) {
  if (result.valid) {
    input.classList.remove("is-invalid");
    if (errorEl) { errorEl.textContent = ""; errorEl.classList.remove("visible"); }
  } else {
    input.classList.add("is-invalid");
    if (errorEl) { errorEl.textContent = result.message; errorEl.classList.add("visible"); }
  }
}

export function attachLiveValidation(form) {
  const fields = ["givenName", "familyName", "phone", "email", "major", "year"];
  fields.forEach(field => {
    const input = form.querySelector(`[name="${field}"]`);
    const errorEl = form.querySelector(`[data-error="${field}"]`);
    if (!input) return;
    const validate = () => applyFieldState(input, errorEl, validateField(field, input.value));
    input.addEventListener("input", validate);
    input.addEventListener("change", validate);
    input.addEventListener("blur", validate);
  });
}

export function clearValidation(form) {
  form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
  form.querySelectorAll(".error-msg").forEach(el => { el.textContent = ""; el.classList.remove("visible"); });
}
