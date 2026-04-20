/**
 * Rothana
 * dom.js — Shared DOM utilities used across all modules.
 * Handles table rendering, modal open/close, alerts, stat card updates.
 */

import { highlightMatch } from "./search.js";

/* ── Stat Cards ────────────────────────────────────────────── */

export function updateStatCards(participants) {
  const totalEl = document.getElementById("stat-total");
  const spotsEl = document.getElementById("stat-spots");
  const facultyEl = document.getElementById("stat-faculties");

  const MAX = 50;
  const total = participants.length;
  const spots = Math.max(0, MAX - total);
  const faculties = new Set(participants.map(p => p.faculty)).size;

  if (totalEl) totalEl.textContent = total;
  if (spotsEl) spotsEl.textContent = spots;
  if (facultyEl) facultyEl.textContent = faculties;
}

/* ── Table Rendering ───────────────────────────────────────── */

/**
 * Render participants into a <tbody>.
 * @param {HTMLElement} tbody
 * @param {Participant[]} participants
 * @param {object} options
 * @param {boolean} options.adminMode — show action buttons
 * @param {string} [options.query] — for highlighting
 * @param {Function} [options.onEdit]
 * @param {Function} [options.onDelete]
 */
export function renderTable(tbody, participants, { adminMode = false, query = "", onEdit, onDelete } = {}) {
  tbody.innerHTML = "";

  if (participants.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="${adminMode ? 7 : 5}" style="text-align:center;padding:32px;color:var(--gray-400);font-style:italic;">
        No participants found.
      </td></tr>`;
    return;
  }

  participants.forEach(p => {
    const initials = `${p.givenName[0] || ""}${p.familyName[0] || ""}`.toUpperCase();
    const name = highlightMatch(`${p.givenName} ${p.familyName}`, query);
    const email = highlightMatch(p.email, query);

    const actionsHtml = adminMode
      ? `<td>
          <div class="flex gap-2 items-center">
            <button class="btn btn-outline btn-sm" onclick="window._editFn && window._editFn(${p.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="btn btn-danger btn-sm" onclick="window._deleteFn && window._deleteFn(${p.id})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              Delete
            </button>
          </div>
        </td>`
      : "";

    const row = document.createElement("tr");
    row.dataset.id = p.id;
    row.innerHTML = `
      <td>
        <div class="flex gap-2 items-center">
          <div class="avatar">${initials}</div>
          <span class="fw-600">${name}</span>
        </div>
      </td>
      <td>${email}</td>
      <td>${p.phone}</td>
      <td><span class="badge-faculty">${p.faculty.replace("Faculty of ", "")}</span></td>
      <td>${p.year}</td>
      ${actionsHtml}
    `;
    tbody.appendChild(row);
  });

  // Store callbacks globally so inline onclick can reach them
  if (onEdit) window._editFn = onEdit;
  if (onDelete) window._deleteFn = onDelete;
}

/* ── Registration Cards (user view) ────────────────────────── */

export function renderRegCards(container, participants) {
  container.innerHTML = "";
  if (participants.length === 0) {
    container.innerHTML = `<p class="text-muted text-sm" style="padding:20px 0">No registrations yet.</p>`;
    return;
  }
  participants.slice(0, 8).forEach(p => {
    const initials = `${p.givenName[0] || ""}${p.familyName[0] || ""}`.toUpperCase();
    const div = document.createElement("div");
    div.className = "reg-card";
    div.innerHTML = `
      <div class="avatar">${initials}</div>
      <div class="reg-card-info">
        <div class="reg-card-name">${p.givenName} ${p.familyName}</div>
        <div class="reg-card-meta">${p.faculty.replace("Faculty of ", "")} · ${p.year}</div>
      </div>
    `;
    container.appendChild(div);
  });
  if (participants.length > 8) {
    const more = document.createElement("p");
    more.className = "text-muted text-sm mt-4";
    more.textContent = `+${participants.length - 8} more registered`;
    container.appendChild(more);
  }
}

/* ── Modal helpers ─────────────────────────────────────────── */

export function openModal(overlay) {
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}
export function closeModal(overlay) {
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

/* ── Alert helpers ─────────────────────────────────────────── */

let alertTimeout;
export function showAlert(el, message, type = "success", duration = 4000, iconMarkup = "") {
  const defaultIcon = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      ${type === "success"
        ? '<polyline points="20 6 9 17 4 12"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>`;

  el.className = `alert alert-${type} visible`;
  el.innerHTML = `
    ${iconMarkup || defaultIcon}
    <span>${message}</span>`;
  clearTimeout(alertTimeout);
  if (duration > 0) alertTimeout = setTimeout(() => el.classList.remove("visible"), duration);
}

/* ── Loading row ────────────────────────────────────────────── */

export function showLoadingRow(tbody, cols = 5) {
  tbody.innerHTML = `<tr class="loading-row"><td colspan="${cols}">Loading participants…</td></tr>`;
}

/* ── Avatar color ───────────────────────────────────────────── */

const COLORS = ["#003070","#AD0000","#1d6a5b","#7c3aed","#b45309","#0369a1"];
export function avatarColor(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[h];
}
