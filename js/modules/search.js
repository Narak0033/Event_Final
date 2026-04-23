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
