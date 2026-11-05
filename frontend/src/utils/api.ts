import { WIREFRAME_MODE } from "../config/mode";
import * as mock from "../wireframe/mockApi";

const API_URL = "http://localhost:4000";

function authHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const t = token ?? localStorage.getItem("token");
  if (t) headers.Authorization = `Bearer ${t}`;
  return headers;
}

export async function apiGet<T>(path: string, token?: string | null): Promise<T> {
  if (WIREFRAME_MODE) return mock.mockApiGet<T>(path, token);
  const response = await fetch(`${API_URL}${path}`, { headers: authHeaders(token) });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { message?: string }).message || `Request failed: ${response.status}`;
    const error = new Error(msg);
    (error as Error & { status: number }).status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  if (WIREFRAME_MODE) return mock.mockApiPost<T>(path, body, token);
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  if (WIREFRAME_MODE) return mock.mockApiPatch<T>(path, body, token);
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiPut<T>(path: string, body: unknown, token?: string | null): Promise<T> {
  if (WIREFRAME_MODE) return mock.mockApiPut<T>(path, body, token);
  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiDownloadFile(
  path: string,
  filename: string,
  token?: string | null
): Promise<void> {
  if (WIREFRAME_MODE) return mock.mockApiDownloadFile(path, filename);
  const t = token ?? localStorage.getItem("token");
  const headers: HeadersInit = {};
  if (t) headers.Authorization = `Bearer ${t}`;

  const response = await fetch(`${API_URL}${path}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed: ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function apiDelete(path: string, token?: string | null): Promise<void> {
  if (WIREFRAME_MODE) return mock.mockApiDelete(path, token);
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed: ${response.status}`);
  }
}

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  role: "student" | "admin" | "kitchen_manager";
};

export type LoginResponse = { token: string; user: AuthUser };

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  if (WIREFRAME_MODE) return mock.mockLogin(email, password);
  return apiPost<LoginResponse>("/auth/login", { email, password }, null);
}

export async function registerRequest(
  email: string,
  password: string,
  fullName: string,
  classNumber?: string
): Promise<LoginResponse> {
  if (WIREFRAME_MODE) return mock.mockRegister(email, password, fullName, classNumber);
  return apiPost<LoginResponse>("/auth/register", { email, password, fullName, classNumber }, null);
}

export async function fetchMe(token: string): Promise<AuthUser & { student?: { classNumber: string } | null }> {
  if (WIREFRAME_MODE) return mock.mockFetchMe(token);
  return apiGet("/auth/me", token);
}
