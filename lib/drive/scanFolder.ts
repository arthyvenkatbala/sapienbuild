// Google Drive folder scanner — uses Drive REST API v3 with a service account.
// Requires GOOGLE_SERVICE_ACCOUNT_JSON env var (base64-encoded service account key).
// The service account must have "Viewer" access to the Drive folders.

export interface DriveFile {
  id: string;
  name: string;
  webViewLink: string;
  thumbnailLink: string;
  createdTime: string;
  mimeType: string;
}

const DRIVE_API = "https://www.googleapis.com/drive/v3";

// ── Token cache (in-process, refreshes on expiry) ───────────────────────────

let _accessToken: string | null = null;
let _tokenExpiry = 0;

async function getAccessToken(): Promise<string | null> {
  if (_accessToken && Date.now() < _tokenExpiry - 60_000) return _accessToken;

  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!b64) {
    console.warn("[Drive] GOOGLE_SERVICE_ACCOUNT_JSON not set — Drive scanning disabled");
    return null;
  }

  let sa: { client_email: string; private_key: string };
  try {
    sa = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  } catch {
    console.error("[Drive] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON");
    return null;
  }

  // Build JWT assertion for service account OAuth
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss:   sa.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud:   "https://oauth2.googleapis.com/token",
    iat:   now,
    exp:   now + 3600,
  })).toString("base64url");

  // Sign with private key using Web Crypto (Node.js 18+)
  const pem = sa.private_key.replace(/\\n/g, "\n");
  const keyBuf = pemToArrayBuffer(pem);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuf,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(`${header}.${payload}`),
  );
  const sig = Buffer.from(sigBuf).toString("base64url");
  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion:  jwt,
    }),
  });

  if (!res.ok) {
    console.error("[Drive] Failed to get access token:", await res.text());
    return null;
  }
  const data = await res.json() as { access_token: string; expires_in: number };
  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + data.expires_in * 1000;
  return _accessToken;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const bin = Buffer.from(b64, "base64");
  return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength) as ArrayBuffer;
}

// ── Core listing function ────────────────────────────────────────────────────

async function listFiles(
  folderId: string,
  mimeFilter: string,
  maxResults: number,
): Promise<DriveFile[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const params = new URLSearchParams({
    q:       `'${folderId}' in parents and mimeType contains '${mimeFilter}' and trashed=false`,
    fields:  "files(id,name,webViewLink,thumbnailLink,createdTime,mimeType)",
    orderBy: "createdTime desc",
    pageSize: String(maxResults),
  });

  const res = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("[Drive] listFiles error:", await res.text());
    return [];
  }
  const data = await res.json() as { files: DriveFile[] };
  return data.files ?? [];
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function scanPhotoFolder(): Promise<DriveFile[]> {
  const folderId = process.env.GOOGLE_DRIVE_PHOTOS_FOLDER_ID;
  if (!folderId) {
    console.warn("[Drive] GOOGLE_DRIVE_PHOTOS_FOLDER_ID not set");
    return [];
  }
  return listFiles(folderId, "image/", 50);
}

export async function scanVideoFolder(): Promise<DriveFile[]> {
  const folderId = process.env.GOOGLE_DRIVE_VIDEOS_FOLDER_ID;
  if (!folderId) {
    console.warn("[Drive] GOOGLE_DRIVE_VIDEOS_FOLDER_ID not set");
    return [];
  }
  return listFiles(folderId, "video/", 30);
}

export async function makeFilePublic(fileId: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) return `https://drive.google.com/uc?export=view&id=${fileId}`;

  await fetch(`${DRIVE_API}/files/${fileId}/permissions`, {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function getDriveFileUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function getDriveThumbnailUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}
