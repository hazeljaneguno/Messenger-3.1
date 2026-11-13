export function normalizeApiUrl(value) {
  const raw = String(value || "http://localhost:5000").trim();
  if (raw.includes(",")) throw new Error("VITE_API_URL must be ONE backend URL, without commas.");
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || !["/", "/api", "/api/"].includes(url.pathname)) {
    throw new Error("VITE_API_URL must be an http(s) backend origin, for example https://api.example.com");
  }
  return url.origin;
}
