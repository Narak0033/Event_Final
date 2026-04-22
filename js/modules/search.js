/**
 * search.js — Horn Narak
 * Live search (name/email) + faculty dropdown filter.
 * Works on an in-memory participants array — no extra API calls.
 */

/**
 * Filter participants by search query and/or faculty.
 * @param {Participant[]} participants — full list
 * @param {string} query — search string (name or email)
 * @param {string} faculty — selected faculty or "" for all
 * @returns {Participant[]} filtered list
 */
export function filterParticipants(participants, query = "", major = "") {
  const q = query.trim().toLowerCase();
  return participants.filter(p => {
    const fullName = `${p.givenName} ${p.familyName}`.toLowerCase();
    const matchesQuery =
      !q ||
      fullName.includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q);

    const matchesMajor = !major || p.major === major;

    return matchesQuery && matchesMajor;
  });
}

/**
 * Attach live search and filter listeners.
 * Calls renderFn(filteredParticipants) whenever query or major changes.
 *
 * @param {object} options
 * @param {HTMLInputElement} options.searchInput
 * @param {HTMLSelectElement} options.majorSelect
 * @param {() => Participant[]} options.getParticipants — returns current full list
 * @param {(list: Participant[]) => void} options.renderFn
 * @param {(count: number) => void} [options.onCountChange]
 */
export function attachSearch({ searchInput, majorSelect, getParticipants, renderFn, onCountChange }) {
  function run() {
    const query = searchInput ? searchInput.value : "";
    const major = majorSelect ? majorSelect.value : "";
    const filtered = filterParticipants(getParticipants(), query, major);
    renderFn(filtered);
    if (onCountChange) onCountChange(filtered.length);
  }

  if (searchInput) searchInput.addEventListener("input", run);
  if (majorSelect) majorSelect.addEventListener("change", run);

  // expose manual trigger
  return { run };
}

/**
 * Highlight matching text in a string for display.
 * Returns an HTML string with <mark> around matches.
 * @param {string} text
 * @param {string} query
 * @returns {string}
 */
export function highlightMatch(text, query) {
  if (!query.trim()) return escapeHtml(text);
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return escapeHtml(text).replace(regex, "<mark>$1</mark>");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
