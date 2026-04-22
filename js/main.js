import { getParticipants } from "./modules/api.js";
import {
  validateForm,
  applyFieldState,
  attachLiveValidation,
  clearValidation,
  FACULTIES,
  YEARS,
} from "./modules/validation.js";
import { openModal, closeModal, showAlert } from "./modules/dom.js";

const EVENTS = [
  {
    id: "evt-tech-summit",
    title: "AUPP Tech Summit 2026",
    date: "2026-05-08",
    location: "ATC Hall",
    seats: 120,
    description: "Talks and demos on AI, web engineering, and campus innovation.",
  },
  {
    id: "evt-career-fair",
    title: "Career Networking Fair",
    date: "2026-05-20",
    location: "Eagle Nest",
    seats: 90,
    description: "Meet recruiters, alumni, and industry mentors across faculties.",
  },
  {
    id: "evt-design-lab",
    title: "Product Design Workshop",
    date: "2026-06-03",
    location: "Lecture Hall C2",
    seats: 70,
    description: "Hands-on workshop for prototyping and UI design collaboration.",
  },
  {
    id: "evt-startup-night",
    title: "Startup Pitch Night",
    date: "2026-06-15",
    location: "Lecture Hall B1",
    seats: 100,
    description: "Student teams pitch startup ideas to judges and invited guests.",
  },
  {
    id: "evt-hackathon",
    title: "Campus Hackathon",
    date: "2026-06-25",
    location: "Innovation Lab",
    seats: 80,
    description: "Collaborative coding event focused on solving problems through rapid prototyping.",
  },
  {
    id: "evt-ai-workshop",
    title: "AI Learning Workshop",
    date: "2026-07-05",
    location: "Lecture Hall A1",
    seats: 60,
    description: "Interactive session exploring machine learning basics and practical AI applications.",
  },
];

const STORAGE_KEY        = "aupp.registrations.v2";
const USER_EMAIL_KEY     = "aupp.currentUserEmail.v2";
const ADMIN_AUTH_KEY     = "aupp.admin.auth.v1";
const ENV_PATH           = ".env";
const ADMIN_CONFIG_JSON_PATH = "admin.config.json";

const adminCredentials = { email: "", password: "" };
let adminCredentialsLoaded = false;

const ROUTE_TO_SECTION = {
  "#/user/events":        "user-events",
  "#/user/my-registrations": "user-my",
  "#/admin/login":        "admin-login",
  "#/admin/participants": "admin-registrations",
};

// ── DOM refs ────────────────────────────────────────────────
const navItems           = document.querySelectorAll(".nav-item");
const pageSections       = document.querySelectorAll(".page-section");
const topbarTitle        = document.getElementById("topbar-title");
const sidebar            = document.getElementById("sidebar");
const participantNavNodes = document.querySelectorAll('[data-nav-role="participant"]');
const adminNavNodes       = document.querySelectorAll('[data-nav-role="admin"]');

const hamburgerBtn = document.getElementById("hamburger-btn");
const navDropdown  = document.getElementById("nav-dropdown");

const eventCards   = document.getElementById("event-cards");
const userRegCards = document.getElementById("user-reg-cards");
const regAlert     = document.getElementById("reg-alert");

const statTotal = document.getElementById("stat-total");
const statSpots = document.getElementById("stat-spots");
const statMy    = document.getElementById("stat-faculties");

const myRegTbody   = document.getElementById("my-reg-tbody");
const myEmailLabel = document.getElementById("my-email-label");
const myRegAlert   = document.getElementById("reg-alert");

const adminTbody       = document.getElementById("admin-tbody");
const adminAlert       = document.getElementById("admin-alert");
const adminSearchInput = document.getElementById("admin-search");
const adminFacFilter   = document.getElementById("admin-fac-filter");
const adminEventFilter = document.getElementById("admin-event-filter");
const adminResultCount = document.getElementById("admin-result-count");
const adminBadge       = document.getElementById("admin-badge");
const refreshBtn       = document.getElementById("refresh-btn");
const addBtn           = document.getElementById("add-btn");
const adminLogoutBtn   = document.getElementById("admin-logout-btn");

const adminLoginForm  = document.getElementById("admin-login-form");
const adminLoginAlert = document.getElementById("admin-login-alert");

const REFRESH_LOADER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`;

const userRegisterOverlay = document.getElementById("user-register-overlay");
const userRegisterForm    = document.getElementById("user-register-form");
const userRegisterAlert   = document.getElementById("user-register-alert");
const userRegisterClose   = document.getElementById("user-register-close");
const userRegisterCancel  = document.getElementById("user-register-cancel");
const selectedEventLabel  = document.getElementById("user-selected-event");

const addOverlay   = document.getElementById("add-overlay");
const addForm      = document.getElementById("add-form");
const addAlert     = document.getElementById("add-alert");
const addCloseBtn  = document.getElementById("add-close");
const addCancelBtn = document.getElementById("add-cancel");

const editOverlay   = document.getElementById("edit-overlay");
const editForm      = document.getElementById("edit-form");
const editAlert     = document.getElementById("edit-alert");
const editCloseBtn  = document.getElementById("edit-close");
const editCancelBtn = document.getElementById("edit-cancel");

const deleteOverlay     = document.getElementById("delete-overlay");
const deleteConfirmBtn  = document.getElementById("delete-confirm-btn");
const deleteCancelBtn   = document.getElementById("delete-cancel-btn");
const deleteCloseBtn    = document.getElementById("delete-close");
const deleteNameSpan    = document.getElementById("delete-name");

// ── State ───────────────────────────────────────────────────
let allRegistrations   = [];
let currentUserEmail   = localStorage.getItem(USER_EMAIL_KEY) || "";
let editingId          = null;
let deletingId         = null;
let adminQuery         = "";
let adminFaculty       = "";
let adminEvent         = "";
let isAdminAuthenticated = localStorage.getItem(ADMIN_AUTH_KEY) === "1";

// ── Env / credentials ───────────────────────────────────────
function parseEnvText(text) {
  const env = {};
  text.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    value = value.replace(/^['\"]|['\"]$/g, "");
    env[key] = value;
  });
  return env;
}

async function loadAdminCredentialsFromEnv() {
  const candidatePaths = [ENV_PATH, `./${ENV_PATH}`, `/${ENV_PATH}`];
  const applyCredentials = (emailValue, passwordValue) => {
    const envEmail    = String(emailValue    || "").trim().toLowerCase();
    const envPassword = String(passwordValue || "").trim();
    if (!envEmail || !envPassword) return false;
    adminCredentials.email    = envEmail;
    adminCredentials.password = envPassword;
    adminCredentialsLoaded = true;
    return true;
  };
  try {
    for (const path of candidatePaths) {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) continue;
      const text = await response.text();
      const env  = parseEnvText(text);
      if (applyCredentials(env.ADMIN_EMAIL, env.ADMIN_PASSWORD)) return;
    }
  } catch { /* fall through */ }
  try {
    const response = await fetch(ADMIN_CONFIG_JSON_PATH, { cache: "no-store" });
    if (!response.ok) return;
    const json = await response.json();
    applyCredentials(json.ADMIN_EMAIL, json.ADMIN_PASSWORD);
  } catch { /* credentials stay unloaded */ }
}

// ── Normalizers ─────────────────────────────────────────────
function normalizeFacultyName(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return FACULTIES[0];
  if (raw.includes("digital") || raw.includes("information technology") || raw.includes("it"))
    return "Faculty of Digital Technologies";
  if (raw.includes("business") || raw.includes("management"))
    return "Faculty of Business and Management";
  if (raw.includes("law"))    return "Faculty of Law";
  if (raw.includes("social")) return "Faculty of Social Sciences";
  return FACULTIES[0];
}

function normalizeYearName(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw)                                    return YEARS[0];
  if (raw === "year 1" || raw === "freshman")  return "Freshman";
  if (raw === "year 2" || raw === "sophomore") return "Sophomore";
  if (raw === "year 3" || raw === "junior")    return "Junior";
  if (raw === "year 4" || raw === "senior")    return "Senior";
  return YEARS[0];
}

// ── Storage ─────────────────────────────────────────────────
function saveRegistrations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allRegistrations));
}

function setCurrentUserEmail(email) {
  currentUserEmail = (email || "").trim().toLowerCase();
  if (currentUserEmail) localStorage.setItem(USER_EMAIL_KEY, currentUserEmail);
}

function loadRegistrations() {
  try {
    const raw    = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => ({
      ...item,
      faculty: normalizeFacultyName(item.faculty),
      year:    normalizeYearName(item.year),
    }));
  } catch { return []; }
}

// ── Helpers ──────────────────────────────────────────────────
function eventById(eventId) {
  return EVENTS.find(e => e.id === eventId);
}

function formatDate(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

// ── Routing & sections ───────────────────────────────────────
function showSection(sectionId) {
  // page sections
  pageSections.forEach(s => s.classList.toggle("active", s.id === sectionId));

  // old sidebar nav-items (still exist in DOM, keep in sync)
  navItems.forEach(item => item.classList.toggle("active", item.dataset.section === sectionId));

  // dropdown active state
  document.querySelectorAll("#nav-dropdown .nav-dropdown-item").forEach(item => {
    item.classList.toggle("active", item.dataset.section === sectionId);
  });

  // topbar title — read from dropdown item label
  if (topbarTitle) {
    const activeDropdown = document.querySelector(
        `#nav-dropdown .nav-dropdown-item[data-section="${sectionId}"]`
      );
      const sectionTitles = { "admin-login": "Admin Login" };
      const labelEl = activeDropdown?.querySelector(".dropdown-item-label") ?? activeDropdown;
      topbarTitle.textContent = labelEl
        ? labelEl.textContent.trim()
        : (sectionTitles[sectionId] || "Events");
  }

  // close dropdown & sidebar
  navDropdown?.classList.remove("open");
  sidebar?.classList.remove("open");
}

function setSidebarMode(route) {
  const isAdminRoute = route.startsWith("#/admin/");

  // legacy sidebar nodes
  participantNavNodes.forEach(node => node.classList.toggle("hidden", isAdminRoute));
  adminNavNodes.forEach(node => node.classList.toggle("hidden", !isAdminRoute));

  // swap hamburger <-> profile button
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const profileBtn   = document.getElementById("profile-btn");
  if (hamburgerBtn) hamburgerBtn.style.display = isAdminRoute ? "none" : "";
  if (profileBtn)   profileBtn.style.display   = isAdminRoute ? "flex" : "none";

  // hide dropdown on admin routes
  if (isAdminRoute) {
    document.getElementById("nav-dropdown")?.classList.remove("open");
  }
}

function normalizeRoute(hash) {
  if (!hash || hash === "#") return "#/user/events";
  return hash.toLowerCase();
}

function applyRoute() {
  const route = normalizeRoute(window.location.hash);

  if (route.startsWith("#/admin/") && route !== "#/admin/login" && !isAdminAuthenticated) {
    window.location.hash = "#/admin/login";
    return;
  }
  if (route === "#/admin/login" && isAdminAuthenticated) {
    window.location.hash = "#/admin/participants";
    return;
  }

  setSidebarMode(route);
  const sectionId = ROUTE_TO_SECTION[route] || "user-events";
  showSection(sectionId);
}

function routeTo(sectionId) {
  const dropItem = document.querySelector(`#nav-dropdown .nav-dropdown-item[data-section="${sectionId}"]`);
  const navItem  = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  const targetRoute = dropItem?.dataset.route || navItem?.dataset.route;
  if (targetRoute) window.location.hash = targetRoute;
}

// ── Build registration object ────────────────────────────────
function buildRegistration(data, eventId, existingId = null) {
  const event = eventById(eventId);
  return {
    id:           existingId || Date.now() + Math.floor(Math.random() * 10000),
    eventId,
    eventName:    event?.title || "Unknown Event",
    givenName:    data.givenName.trim(),
    familyName:   data.familyName.trim(),
    email:        data.email.trim().toLowerCase(),
    phone:        data.phone.trim(),
    faculty:      normalizeFacultyName(data.faculty),
    year:         normalizeYearName(data.year),
    status:       data.status || "Registered",
    checkedIn:    Boolean(data.checkedIn),
    registeredAt: data.registeredAt || new Date().toISOString(),
  };
}

function getFormData(form) {
  const fd = new FormData(form);
  return {
    givenName:  fd.get("givenName")  || "",
    familyName: fd.get("familyName") || "",
    phone:      fd.get("phone")      || "",
    email:      fd.get("email")      || "",
    faculty:    fd.get("faculty")    || "",
    year:       fd.get("year")       || "",
    eventId:    fd.get("eventId")    || "",
  };
}

function validateWithEvent(form, data) {
  const { valid, errors } = validateForm(data);
  if (!data.eventId || !eventById(data.eventId)) {
    errors.eventId = "Please select a valid event.";
  }
  Object.keys(errors).forEach(field => {
    const input   = form.querySelector(`[name="${field}"]`);
    const errorEl = form.querySelector(`[data-error="${field}"]`);
    if (input || errorEl) applyFieldState(input, errorEl, { valid: false, message: errors[field] });
  });
  return { valid: valid && !errors.eventId };
}

// ── Stats ────────────────────────────────────────────────────
function statsForEvent(eventId) {
  const count      = allRegistrations.filter(r => r.eventId === eventId).length;
  const event      = eventById(eventId);
  const totalSeats = event?.seats || 0;
  return { count, available: Math.max(0, totalSeats - count) };
}

// ── Render: event cards ──────────────────────────────────────
function renderEventCards() {
  if (!eventCards) return;
  eventCards.innerHTML = "";
  EVENTS.forEach(event => {
    const { count, available } = statsForEvent(event.id);
    const card = document.createElement("article");
    card.className = "event-card";
    card.innerHTML = `
      <div class="event-card-head">
        <h3>${escapeHtml(event.title)}</h3>
        <span class="badge-faculty">${count}/${event.seats}</span>
      </div>
      <p class="event-card-desc">${escapeHtml(event.description)}</p><br/>
      <div class="event-card-meta">
        <span>${formatDate(event.date)}</span><br/>
        <span>${escapeHtml(event.location)}</span><br/>
        <span>${available} seats left</span>
      </div>
      <button class="btn btn-primary btn-sm" data-event-register="${event.id}">Register</button>
    `;
    eventCards.appendChild(card);
  });
}

// ── Render: recent cards ─────────────────────────────────────
function renderRecentCards() {
  if (!userRegCards) return;
  const recent = [...allRegistrations]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 8);

  userRegCards.innerHTML = "";
  if (recent.length === 0) {
    userRegCards.innerHTML = '<p class="text-muted text-sm" style="padding:20px 0">No registrations yet.</p>';
    return;
  }
  recent.forEach(r => {
    const initials = `${r.givenName[0] || ""}${r.familyName[0] || ""}`.toUpperCase();
    const div = document.createElement("div");
    div.className = "reg-card";
    div.innerHTML = `
      <div class="avatar">${escapeHtml(initials)}</div>
      <div class="reg-card-info">
        <div class="reg-card-name">${escapeHtml(r.givenName)} ${escapeHtml(r.familyName)}</div>
        <div class="reg-card-meta">${escapeHtml(r.eventName)} · ${escapeHtml(r.year)}</div>
      </div>
    `;
    userRegCards.appendChild(div);
  });
}

// ── Render: stats ────────────────────────────────────────────
function renderStats() {
  if (statTotal) statTotal.textContent = String(allRegistrations.length);
  if (statSpots) statSpots.textContent = String(EVENTS.length);

  const mine = currentUserEmail
    ? allRegistrations.filter(r => r.email.toLowerCase() === currentUserEmail).length
    : 0;
  if (statMy)    statMy.textContent    = String(mine);
  if (adminBadge) adminBadge.textContent = String(allRegistrations.length);

  // sync badge in dropdown
  const adminBadge2 = document.getElementById("admin-badge2");
  if (adminBadge2) adminBadge2.textContent = String(allRegistrations.length);
}

// ── Render: my registrations table ──────────────────────────
function renderMyRegistrations() {
  if (!myRegTbody) return;
  const hasUser = Boolean(currentUserEmail);
  const mine    = hasUser
    ? allRegistrations.filter(r => r.email.toLowerCase() === currentUserEmail)
    : [];

  if (myEmailLabel) myEmailLabel.textContent = hasUser ? currentUserEmail : "No user selected";

  myRegTbody.innerHTML = "";
  if (!hasUser) {
    myRegTbody.innerHTML = '<tr><td colspan="6" class="text-center">Register first to see your events here.</td></tr>';
    return;
  }
  if (mine.length === 0) {
    myRegTbody.innerHTML = '<tr><td colspan="6" class="text-center">No registrations found for this email.</td></tr>';
    return;
  }

  mine
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .forEach(r => {
      const statusBadge = r.status === "No-show"
        ? '<span class="status-badge status-noshow">No-show</span>'
        : '<span class="status-badge status-registered">Registered</span>';
      const checkText    = r.checkedIn ? "Checked In" : "Pending";
      const actionButton = r.checkedIn
        ? '<button class="btn btn-ghost btn-sm" type="button" disabled>Locked</button>'
        : `<button class="btn btn-danger btn-sm" type="button" data-my-action="unregister" data-id="${r.id}">Unregister</button>`;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(r.eventName)}</td>
        <td>${statusBadge}</td>
        <td>${escapeHtml(checkText)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(formatDateTime(r.registeredAt))}</td>
        <td>${actionButton}</td>
      `;
      myRegTbody.appendChild(row);
    });
}

function unregisterMyRegistration(id) {
  const row = allRegistrations.find(r => r.id === id);
  if (!row) return;
  if (row.email.toLowerCase() !== currentUserEmail) {
    showAlert(myRegAlert, "You can only manage your own registrations.", "error", 2200);
    return;
  }
  if (row.checkedIn) {
    showAlert(myRegAlert, "Checked-in registrations cannot be canceled.", "error", 2200);
    return;
  }
  if (!window.confirm(`Unregister from ${row.eventName}?`)) return;
  allRegistrations = allRegistrations.filter(r => r.id !== id);
  rerenderAll();
  showAlert(myRegAlert, `You have unregistered from ${row.eventName}.`, "success", 2200);
}

// ── Render: admin table ──────────────────────────────────────
function getFilteredAdminRows() {
  const q = adminQuery.trim().toLowerCase();
  return allRegistrations.filter(r => {
    const fullName = `${r.givenName} ${r.familyName}`.toLowerCase();
    const matchQ     = !q || fullName.includes(q) || r.email.toLowerCase().includes(q) || r.phone.includes(q);
    const matchFac   = !adminFaculty || r.faculty  === adminFaculty;
    const matchEvent = !adminEvent   || r.eventId  === adminEvent;
    return matchQ && matchFac && matchEvent;
  });
}

function actionMenuHtml(r) {
  const checkLabel  = r.checkedIn       ? "Undo Check-in"   : "Check In";
  const statusLabel = r.status === "No-show" ? "Mark Registered" : "Mark No-show";
  return `
    <div class="action-menu" data-row-menu="${r.id}">
      <button class="btn btn-ghost btn-sm action-menu-btn" data-action-toggle="${r.id}" aria-label="Open actions">⋮</button>
      <div class="action-menu-list" data-menu-list="${r.id}">
        <button type="button" data-action="checkin" data-id="${r.id}">${checkLabel}</button>
        <button type="button" data-action="status"  data-id="${r.id}">${statusLabel}</button>
        <button type="button" data-action="edit"    data-id="${r.id}">Edit</button>
        <button type="button" data-action="delete"  data-id="${r.id}" class="danger">Delete</button>
      </div>
    </div>
  `;
}

function renderAdminTable() {
  if (!adminTbody) return;
  const rows = getFilteredAdminRows();
  adminTbody.innerHTML = "";

  if (rows.length === 0) {
    adminTbody.innerHTML = '<tr><td colspan="9" class="text-center">No participants match this filter.</td></tr>';
  } else {
    rows.forEach(r => {
      const statusBadge = r.status === "No-show"
        ? '<span class="status-badge status-noshow">No-show</span>'
        : '<span class="status-badge status-registered">Registered</span>';
      const checkBadge = r.checkedIn
        ? '<span class="status-badge status-checkin">Checked In</span>'
        : '<span class="status-badge">Pending</span>';
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(r.givenName)} ${escapeHtml(r.familyName)}</td>
        <td>${escapeHtml(r.email)}</td>
        <td>${escapeHtml(r.eventName)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td>${escapeHtml(r.faculty.replace("Faculty of ", ""))}</td>
        <td>${escapeHtml(r.year)}</td>
        <td>${statusBadge}</td>
        <td>${checkBadge}</td>
        <td>${actionMenuHtml(r)}</td>
      `;
      adminTbody.appendChild(tr);
    });
  }

  if (adminResultCount) {
    const total = allRegistrations.length;
    adminResultCount.textContent = rows.length === total
      ? `${total} participants`
      : `${rows.length} of ${total} participants`;
  }
}

// ── Re-render everything ─────────────────────────────────────
function rerenderAll() {
  saveRegistrations();
  renderEventCards();
  renderRecentCards();
  renderStats();
  renderMyRegistrations();
  renderAdminTable();
}

// ── Modals ───────────────────────────────────────────────────
function openUserRegisterModal(eventId) {
  const event = eventById(eventId);
  if (!event || !userRegisterForm || !userRegisterOverlay) return;
  userRegisterForm.reset();
  clearValidation(userRegisterForm);
  userRegisterAlert?.classList.remove("visible");
  userRegisterForm.querySelector('[name="eventId"]').value = event.id;
  if (selectedEventLabel) selectedEventLabel.textContent = event.title;
  openModal(userRegisterOverlay);
}

function openEditModal(id) {
  const row = allRegistrations.find(r => r.id === id);
  if (!row || !editForm) return;
  editingId = id;
  ["givenName","familyName","phone","email","faculty","year","eventId"].forEach(field => {
    const el = editForm.querySelector(`[name="${field}"]`);
    if (el) el.value = row[field] || "";
  });
  clearValidation(editForm);
  editAlert?.classList.remove("visible");
  openModal(editOverlay);
}

function openDeleteModal(id) {
  const row = allRegistrations.find(r => r.id === id);
  if (!row) return;
  deletingId = id;
  if (deleteNameSpan) deleteNameSpan.textContent = `${row.givenName} ${row.familyName} (${row.eventName})`;
  openModal(deleteOverlay);
}

function toggleCheckIn(id) {
  const row = allRegistrations.find(r => r.id === id);
  if (!row) return;
  row.checkedIn = !row.checkedIn;
  rerenderAll();
  showAlert(adminAlert, row.checkedIn ? "Participant checked in." : "Check-in was undone.", "success");
}

function toggleStatus(id) {
  const row = allRegistrations.find(r => r.id === id);
  if (!row) return;
  row.status = row.status === "No-show" ? "Registered" : "No-show";
  rerenderAll();
  showAlert(adminAlert, `Status updated to ${row.status}.`, "success");
}

function closeAllActionMenus() {
  document.querySelectorAll(".action-menu-list.open").forEach(m => m.classList.remove("open"));
}

// ── Populate dropdowns ───────────────────────────────────────
function populateFacultyDropdowns() {
  document.querySelectorAll("select[name='faculty']").forEach(sel => {
    FACULTIES.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f; opt.textContent = f;
      sel.appendChild(opt);
    });
  });
  if (adminFacFilter) {
    FACULTIES.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f; opt.textContent = f.replace("Faculty of ", "");
      adminFacFilter.appendChild(opt);
    });
  }
}

function populateYearDropdowns() {
  document.querySelectorAll("select[name='year']").forEach(sel => {
    YEARS.forEach(y => {
      const opt = document.createElement("option");
      opt.value = y; opt.textContent = y;
      sel.appendChild(opt);
    });
  });
}

function populateEventDropdowns() {
  document.querySelectorAll("select[name='eventId']").forEach(sel => {
    EVENTS.forEach(e => {
      const opt = document.createElement("option");
      opt.value = e.id; opt.textContent = `${e.title} (${formatDate(e.date)})`;
      sel.appendChild(opt);
    });
  });
  if (adminEventFilter) {
    EVENTS.forEach(e => {
      const opt = document.createElement("option");
      opt.value = e.id; opt.textContent = e.title;
      adminEventFilter.appendChild(opt);
    });
  }
}

// ── Seed data ────────────────────────────────────────────────
async function seedIfNeeded() {
  allRegistrations = loadRegistrations();
  if (allRegistrations.length > 0) return;
  try {
    const sample   = await getParticipants();
    allRegistrations = sample.slice(0, 8).map((p, idx) => {
      const event = EVENTS[idx % EVENTS.length];
      return {
        id: Date.now() + idx,
        eventId:      event.id,
        eventName:    event.title,
        givenName:    p.givenName,
        familyName:   p.familyName,
        email:        p.email.toLowerCase(),
        phone:        p.phone,
        faculty:      p.faculty,
        year:         p.year,
        status:       "Registered",
        checkedIn:    false,
        registeredAt: new Date(Date.now() - idx * 86400000).toISOString(),
      };
    });
    saveRegistrations();
  } catch { allRegistrations = []; }
}

// ── Bind all events ──────────────────────────────────────────
function bindEvents() {

  // ── Hamburger toggle ───────────────────────────────────────
  hamburgerBtn?.addEventListener("click", e => {
    e.stopPropagation();
    navDropdown?.classList.toggle("open");
  });

  // ── Dropdown nav item clicks ───────────────────────────────
  document.querySelectorAll("#nav-dropdown .nav-dropdown-item").forEach(item => {
    item.addEventListener("click", () => {
      let route = item.dataset.route;
      if (route?.startsWith("#/admin/") && !isAdminAuthenticated) route = "#/admin/login";
      if (route) window.location.hash = route;
      navDropdown?.classList.remove("open");
    });
  });

  // ── Close dropdown when clicking outside ──────────────────
  document.addEventListener("click", e => {
    if (navDropdown && !navDropdown.contains(e.target) && e.target !== hamburgerBtn) {
      navDropdown.classList.remove("open");
    }
    // close action menus too
    if (!e.target.closest(".action-menu")) closeAllActionMenus();
  });

  // ── Hash routing ───────────────────────────────────────────
  window.addEventListener("hashchange", applyRoute);

  // ── Event card register buttons ────────────────────────────
  eventCards?.addEventListener("click", e => {
    const btn = e.target.closest("[data-event-register]");
    if (btn) openUserRegisterModal(btn.dataset.eventRegister);
  });

  // ── My registrations unregister ────────────────────────────
  myRegTbody?.addEventListener("click", e => {
    const btn = e.target.closest("[data-my-action='unregister']");
    if (btn) unregisterMyRegistration(Number(btn.dataset.id));
  });

  // ── User register modal ────────────────────────────────────
  userRegisterClose?.addEventListener("click",  () => closeModal(userRegisterOverlay));
  userRegisterCancel?.addEventListener("click", () => closeModal(userRegisterOverlay));

  if (userRegisterForm) {
    attachLiveValidation(userRegisterForm);
    userRegisterForm.addEventListener("submit", e => {
      e.preventDefault();
      const data = getFormData(userRegisterForm);
      const { valid } = validateWithEvent(userRegisterForm, data);
      if (!valid) { showAlert(userRegisterAlert, "Please complete all required fields.", "error"); return; }
      const row = buildRegistration(data, data.eventId);
      allRegistrations.unshift(row);
      setCurrentUserEmail(row.email);
      rerenderAll();
      closeModal(userRegisterOverlay);
      showAlert(regAlert, `Registered for ${row.eventName} successfully.`, "success");
      routeTo("user-my");
    });
  }

  // ── Admin filters ──────────────────────────────────────────
  adminSearchInput?.addEventListener("input",  () => { adminQuery   = adminSearchInput.value; renderAdminTable(); });
  adminFacFilter?.addEventListener("change",   () => { adminFaculty = adminFacFilter.value;   renderAdminTable(); });
  adminEventFilter?.addEventListener("change", () => { adminEvent   = adminEventFilter.value; renderAdminTable(); });

  refreshBtn?.addEventListener("click", async () => {
    showAlert(adminAlert, "Refreshing sample data...", "info", 1200, REFRESH_LOADER_ICON);
    await seedIfNeeded();
    rerenderAll();
  });

  // ── Admin login ────────────────────────────────────────────
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", e => {
      e.preventDefault();
      const fd       = new FormData(adminLoginForm);
      const email    = String(fd.get("email")    || "").trim().toLowerCase();
      const password = String(fd.get("password") || "").trim();
      if (!adminCredentialsLoaded) {
        showAlert(adminLoginAlert, "Admin credentials not loaded. Use .env or admin.config.json, then reload.", "error", 3200);
        return;
      }
      if (email === adminCredentials.email && password === adminCredentials.password) {
        isAdminAuthenticated = true;
        localStorage.setItem(ADMIN_AUTH_KEY, "1");
        adminLoginForm.reset();
        showAlert(adminLoginAlert, "Login successful. Redirecting...", "success", 900);
        window.location.hash = "#/admin/participants";
      } else {
        showAlert(adminLoginAlert, "Invalid staff credentials.", "error", 2200);
      }
    });
  }

  // ── Admin logout ───────────────────────────────────────────
  adminLogoutBtn?.addEventListener("click", () => {
    isAdminAuthenticated = false;
    localStorage.removeItem(ADMIN_AUTH_KEY);
    window.location.hash = "#/admin/login";
  });

  // ── Add participant modal ──────────────────────────────────
  addBtn?.addEventListener("click", () => {
    addForm?.reset();
    clearValidation(addForm);
    addAlert?.classList.remove("visible");
    openModal(addOverlay);
  });
  addCloseBtn?.addEventListener("click",  () => closeModal(addOverlay));
  addCancelBtn?.addEventListener("click", () => closeModal(addOverlay));

  if (addForm) {
    attachLiveValidation(addForm);
    addForm.addEventListener("submit", e => {
      e.preventDefault();
      const data = getFormData(addForm);
      const { valid } = validateWithEvent(addForm, data);
      if (!valid) return;
      const row = buildRegistration(data, data.eventId);
      allRegistrations.unshift(row);
      rerenderAll();
      closeModal(addOverlay);
      showAlert(adminAlert, `${row.givenName} ${row.familyName} added successfully.`, "success");
    });
  }

  // ── Edit modal ─────────────────────────────────────────────
  editCloseBtn?.addEventListener("click",  () => closeModal(editOverlay));
  editCancelBtn?.addEventListener("click", () => closeModal(editOverlay));

  if (editForm) {
    attachLiveValidation(editForm);
    editForm.addEventListener("submit", e => {
      e.preventDefault();
      const data = getFormData(editForm);
      const { valid } = validateWithEvent(editForm, data);
      if (!valid || editingId === null) return;
      const idx = allRegistrations.findIndex(r => r.id === editingId);
      if (idx === -1) return;
      const original = allRegistrations[idx];
      allRegistrations[idx] = buildRegistration(
        { ...data, status: original.status, checkedIn: original.checkedIn, registeredAt: original.registeredAt },
        data.eventId,
        editingId,
      );
      rerenderAll();
      closeModal(editOverlay);
      showAlert(adminAlert, "Participant updated.", "success");
      editingId = null;
    });
  }

  // ── Delete modal ───────────────────────────────────────────
  deleteCloseBtn?.addEventListener("click",  () => closeModal(deleteOverlay));
  deleteCancelBtn?.addEventListener("click", () => closeModal(deleteOverlay));
  deleteConfirmBtn?.addEventListener("click", () => {
    if (deletingId === null) return;
    allRegistrations = allRegistrations.filter(r => r.id !== deletingId);
    rerenderAll();
    closeModal(deleteOverlay);
    showAlert(adminAlert, "Participant deleted.", "success");
    deletingId = null;
  });

  // ── Admin table action menus ───────────────────────────────
  adminTbody?.addEventListener("click", e => {
    const toggleBtn = e.target.closest("[data-action-toggle]");
    if (toggleBtn) {
      const id   = toggleBtn.dataset.actionToggle;
      const list = adminTbody.querySelector(`[data-menu-list="${id}"]`);
      const isOpen = list?.classList.contains("open");
      closeAllActionMenus();
      if (!isOpen) list?.classList.add("open");
      return;
    }
    const actionBtn = e.target.closest("[data-action]");
    if (!actionBtn) return;
    const id     = Number(actionBtn.dataset.id);
    const action = actionBtn.dataset.action;
    closeAllActionMenus();
    if (action === "checkin") toggleCheckIn(id);
    if (action === "status")  toggleStatus(id);
    if (action === "edit")    openEditModal(id);
    if (action === "delete")  openDeleteModal(id);
  });
}

// ── Init ─────────────────────────────────────────────────────
async function init() {
  await loadAdminCredentialsFromEnv();
  populateFacultyDropdowns();
  populateYearDropdowns();
  populateEventDropdowns();
  bindEvents();
  await seedIfNeeded();
  rerenderAll();
  if (!window.location.hash) window.location.hash = "#/user/events";
  applyRoute();
}

init();