import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config/baseurl";

const TOKEN_KEY = "fintrackerpro_user_token";

export interface UserPayload {
  uiid: string;
  email: string;
  fullName: string;
  currency: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  paymentType: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalTransactions: number;
}

// ── Token Management ──

export async function storeToken(setCookieHeader: string | null): Promise<void> {
  if (!setCookieHeader) return;
  const match = setCookieHeader.match(/fintrackerpro_user_token=([^;]+)/);
  if (match) {
    await AsyncStorage.setItem(TOKEN_KEY, match[1]);
  }
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ── Internal Fetch Helper ──

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; setCookie: string | null }> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Cookie"] = `fintrackerpro_user_token=${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const setCookie = res.headers.get("set-cookie");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return { data: data as T, setCookie };
}

// ── Auth Endpoints ──

export async function loginUser(
  email: string,
  password: string
): Promise<UserPayload> {
  const { data, setCookie } = await apiFetch<{ user: UserPayload }>(
    "/userRoutes/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
  await storeToken(setCookie);
  return data.user;
}

export async function signupUser(
  fullName: string,
  email: string,
  password: string
): Promise<UserPayload> {
  const { data, setCookie } = await apiFetch<{ user: UserPayload }>(
    "/userRoutes/signup",
    {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    }
  );
  await storeToken(setCookie);
  return data.user;
}

export async function checkAuth(): Promise<{
  loggedIn: boolean;
  user?: UserPayload;
}> {
  try {
    const { data, setCookie } = await apiFetch<{
      loggedIn: boolean;
      user?: UserPayload;
    }>("/userRoutes/check");
    if (setCookie) await storeToken(setCookie);
    return data;
  } catch {
    return { loggedIn: false };
  }
}

export async function updateUser(
  fullName: string,
  currency: string
): Promise<UserPayload> {
  const { data } = await apiFetch<{ user: UserPayload }>(
    "/userRoutes/update",
    {
      method: "PATCH",
      body: JSON.stringify({ fullName, currency }),
    }
  );
  return data.user;
}

// ── Transaction Endpoints ──

export async function getTransactions(
  type?: string,
  search?: string
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (type && type !== "All Types") params.set("type", type);
  if (search) params.set("search", search);
  const qs = params.toString();

  const { data } = await apiFetch<{ transactions: Transaction[] }>(
    `/moneyRoutes/getTransactions${qs ? `?${qs}` : ""}`
  );
  return data.transactions;
}

export async function addTransaction(txn: {
  type: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}): Promise<Transaction> {
  const { data } = await apiFetch<{ transaction: Transaction }>(
    "/moneyRoutes/addTransaction",
    {
      method: "POST",
      body: JSON.stringify(txn),
    }
  );
  return data.transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiFetch(`/moneyRoutes/deleteTransaction/${id}`, {
    method: "DELETE",
  });
}

export async function getTransactionSummary(): Promise<Summary> {
  const { data } = await apiFetch<Summary>(
    "/moneyRoutes/getTransactionSummary"
  );
  return data;
}
