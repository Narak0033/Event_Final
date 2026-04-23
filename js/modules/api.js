/**
 * All requests use fetch() with async/await.
 */

const BASE_URL = "https://jsonplaceholder.typicode.com";

// Generic request wrapper with error handling.
async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
    },
  };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;
  return {
    data,
    status: response.status,
  };
}

// Fetch all registered participants.
export async function getParticipants() {
  const { data: users, status } = await request("GET", "/users");
  if (status !== 200) throw new Error(`Unexpected status for getParticipants: ${status}`);
  return users.map(mapUserToParticipant);
}

// Fetch a single participant by ID.
export async function getParticipantById(id) {
  const { data: user, status } = await request("GET", `/users/${id}`);
  if (status !== 200) throw new Error(`Unexpected status for getParticipantById: ${status}`);
  return mapUserToParticipant(user);
}

// Register a new participant.
// data — { givenName, familyName, phone, email, faculty, year }
export async function createRegistration(data) {
  const payload = mapParticipantToUser(data);
  const { data: result, status } = await request("POST", "/users", payload);
  if (status !== 201) throw new Error(`Unexpected status for createRegistration: ${status}`);
  return mapUserToParticipant({ ...payload, id: result.id });
}

// Update an existing participant record.
// data — updated participant fields
export async function updateRegistration(id, data) {
  const payload = mapParticipantToUser(data);
  const { data: result, status } = await request("PUT", `/users/${id}`, payload);
  if (status !== 200) throw new Error(`Unexpected status for updateRegistration: ${status}`);
  return mapUserToParticipant({ ...result, id });
}


// Delete a participant by ID.
export async function deleteRegistration(id) {
  const { status } = await request("DELETE", `/users/${id}`);
  if (status !== 200 && status !== 204) {
    throw new Error(`Unexpected status for deleteRegistration: ${status}`);
  }
}

// Map JSONPlaceholder user → our Participant schema.
// We derive faculty/year from the user's company/address to simulate real data
function mapUserToParticipant(user) {
  
  const MAJORS = [
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

  const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
  const idx = (user.id - 1) % MAJORS.length;
  const yidx = (user.id - 1) % YEARS.length;

  // Support locally-added overrides
  return {
    id: user.id,
    givenName: user._givenName || user.name.split(" ")[0],
    familyName: user._familyName || user.name.split(" ").slice(1).join(" ") || "—",
    phone: user._phone || user.phone,
    email: user._email || (user.email.includes("@") ? user.email.replace(/(@.*)/, "@aupp.edu.kh") : user.email),
    major: user._major || MAJORS[idx],
    year: user._year || YEARS[yidx],
    registeredAt: user._registeredAt || new Date().toISOString(),
  };
}

/**
 * Map our Participant → JSONPlaceholder user payload.
 */
function mapParticipantToUser(data) {
  return {
    name: `${data.givenName} ${data.familyName}`,
    username: data.email.split("@")[0],
    email: data.email,
    phone: data.phone,
    _givenName: data.givenName,
    _familyName: data.familyName,
    _phone: data.phone,
    _email: data.email,
    _major: data.major,
    _year: data.year,
    _registeredAt: new Date().toISOString(),
  };
}
