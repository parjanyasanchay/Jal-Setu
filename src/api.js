const API_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : (typeof window !== "undefined" && window.location.port === "5173"
        ? "http://127.0.0.1:8000"
        : "");

async function request(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // normal error message
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getDashboard() {
  return request(`${API_URL}/api/dashboard`);
}

export async function chatWithJalSetu({
  question,
  watershedId,
  interventionId,
  language = "English",
}) {
  return request(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      watershed_id: watershedId || null,
      intervention_id: interventionId || null,
      language,
    }),
  });
}

export async function getWatersheds() {
  return request(`${API_URL}/api/watersheds`);
}

export async function getTemporalComparison(watershedId) {
  return request(`${API_URL}/api/watershed/${encodeURIComponent(watershedId)}/temporal-comparison`);
}

export async function getAnalysisTrends({
  watershedId,
  indicator = "ndvi",
  startDate,
  endDate,
  season = "ALL",
  interventionType = "ALL",
} = {}) {
  const params = new URLSearchParams();
  if (watershedId) params.append("watershed_id", watershedId);
  if (indicator) params.append("indicator", indicator);
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (season && season !== "ALL") params.append("season", season);
  if (interventionType && interventionType !== "ALL") {
    params.append("intervention_type", interventionType);
  }
  return request(`${API_URL}/api/analysis/trends?${params.toString()}`);
}

export async function getAnalysisSummary({
  watershedId,
  interventionType = "ALL",
  season = "ALL",
} = {}) {
  const params = new URLSearchParams();
  if (watershedId) params.append("watershed_id", watershedId);
  if (interventionType && interventionType !== "ALL") {
    params.append("intervention_type", interventionType);
  }
  if (season && season !== "ALL") params.append("season", season);
  return request(`${API_URL}/api/analysis/summary?${params.toString()}`);
}

export async function getEvidence() {
  return request(`${API_URL}/api/evidence`);
}

export async function uploadEvidence({
  file,
  title,
  watershedId,
  interventionType,
  latitude,
  longitude,
}) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("title", title || "Field Evidence");
  formData.append("watershed_id", watershedId);
  formData.append("intervention_type", interventionType || "Other");
  formData.append("latitude", latitude || "");
  formData.append("longitude", longitude || "");

  return request(`${API_URL}/api/evidence/upload`, {
    method: "POST",
    body: formData,
  });
}

export async function loginUser(email, password) {
  return request(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser({
  fullName,
  email,
  password,
  role = "Project Officer",
  department = "Department of Water Resources & Watershed Development",
}) {
  return request(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
      role,
      department,
    }),
  });
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("jalsetu_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(user, token) {
  try {
    if (user) localStorage.setItem("jalsetu_user", JSON.stringify(user));
    if (token) localStorage.setItem("jalsetu_token", token);
  } catch (e) {
    console.error("Failed to store session in localStorage", e);
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem("jalsetu_user");
    localStorage.removeItem("jalsetu_token");
  } catch (e) {
    console.error("Failed to clear session", e);
  }
}