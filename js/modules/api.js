/**
 * All requests use fetch() with async/await.
 */

const BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * Generic request wrapper with error handling.
 */
async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch all registered participants.
 */
export async function getParticipants() {
  const users = await request("GET", "/users");
  return users.map(mapUserToParticipant);
}

/**
 * Fetch a single participant by ID.
 */
export async function getParticipantById(id) {
  const user = await request("GET", `/users/${id}`);
  return mapUserToParticipant(user);
}


/**
 * Register a new participant.
 * data — { givenName, familyName, phone, email, faculty, year }
 */
export async function createRegistration(data) {
  const payload = mapParticipantToUser(data);
  const result = await request("POST", "/users", payload);
  // JSONPlaceholder echoes the body with a generated id
  return mapUserToParticipant({ ...payload, id: result.id });
}

/**
 * Update an existing participant record.
   data — updated participant fields
 */
export async function updateRegistration(id, data) {
  const payload = mapParticipantToUser(data);
  const result = await request("PUT", `/users/${id}`, payload);
  return mapUserToParticipant({ ...result, id });
}


/**
 * Delete a participant by ID.
 */
export async function deleteRegistration(id) {
  await request("DELETE", `/users/${id}`);
}

/**
 * Map JSONPlaceholder user → our Participant schema.
 * We derive faculty/year from the user's company/address to simulate real data.
 */
function mapUserToParticipant(user) {
  
  const FACULTIES = [
    "Faculty of Digital Technologies",
    "Faculty of Business and Management",
    "Faculty of Law",
    "Faculty of Social Sciences",
  ];

  const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
  const idx = (user.id - 1) % FACULTIES.length;
  const yidx = (user.id - 1) % YEARS.length;

  // Support locally-added overrides
  return {
    id: user.id,
    givenName: user._givenName || user.name.split(" ")[0],
    familyName: user._familyName || user.name.split(" ").slice(1).join(" ") || "—",
    phone: user._phone || user.phone,
    email: user._email || (user.email.includes("@") ? user.email.replace(/(@.*)/, "@aupp.edu.kh") : user.email),
    faculty: user._faculty || FACULTIES[idx],
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
    _faculty: data.faculty,
    _year: data.year,
    _registeredAt: new Date().toISOString(),
  };
}
