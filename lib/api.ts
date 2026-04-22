import Constants from "expo-constants";

function guessLanBaseUrl(): string | undefined {
  // Em Expo Go/Dev build, isso costuma conter "192.168.x.y:19000"
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any).manifest?.debuggerHost;

  if (typeof hostUri !== "string") return;

  const host = hostUri.split(":")[0];
  if (!host) return;
  return `http://${host}:3333/api`;
}

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  guessLanBaseUrl() ||
  // fallback para dev local no emulador/desktop
  "http://localhost:3333/api";

let runtimeAuthToken: string | null = null;
export function setAuthToken(token: string | null) {
  runtimeAuthToken = token;
}

export type PaymentStatus = "pago" | "pendente" | "adiantado";
export type ServiceStatus = "a_fazer" | "em_andamento" | "concluido";

export interface Client {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  cars?: Array<{ id: string }>;
}

export interface Car {
  id: string;
  name: string;
  model: string;
  plate: string;
  year: number;
  clientId: string;
  client?: Client;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  status: ServiceStatus;
  payment: PaymentStatus;
  price: number;
  dueDate: string;
  carId: string;
  clientId: string;
  car?: Car;
  client?: Client;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.EXPO_PUBLIC_API_KEY || "dev";
  const token = runtimeAuthToken || process.env.EXPO_PUBLIC_AUTH_TOKEN;
  const headers = new Headers(init?.headers);
  if (token && !headers.has("authorization")) headers.set("authorization", `Bearer ${token}`);
  if (!token && !headers.has("x-api-key")) headers.set("x-api-key", apiKey);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    throw new Error(`Falha na API (${res.status}) em ${path}`);
  }
  return (await res.json()) as T;
}

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function adminRequest<T>(path: string, adminSecret: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("x-admin-secret", adminSecret);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`Falha admin API (${res.status}) em ${path}`);
  return (await res.json()) as T;
}

export const api = {
  createShop: (data: { name: string; setupSecret: string }) =>
    request<{ id: string; name: string; apiKey: string }>("/shops", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-setup-secret": data.setupSecret, 
      },
      body: JSON.stringify({ name: data.name }),
    }),
  authRegister: (data: {
    setupSecret: string;
    shopApiKey: string;
    name: string;
    email: string;
    password: string;
  }) =>
    request<{ id: string; shopId: string; email: string; name: string }>("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-setup-secret": data.setupSecret,
      },
      body: JSON.stringify({
        shopApiKey: data.shopApiKey,
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    }),
  authLogin: (data: { email: string; password: string }) =>
    request<{
      token: string;
      user: { id: string; name: string; email: string; shopId: string };
      shop: { id: string; name: string };
    }>(
      "/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    ),
  authMe: () => request<{ user: { id: string; name: string; email: string; shopId: string }; shop: { id: string; name: string } }>("/auth/me"),
  adminListShops: (adminSecret: string) =>
    adminRequest<
      Array<{
        id: string;
        name: string;
        apiKey: string;
        isActive: boolean;
        createdAt: string;
        _count: { users: number; clients: number; cars: number; services: number };
      }>
    >("/admin/shops", adminSecret),
  adminSetShopActive: (adminSecret: string, shopId: string, isActive: boolean) =>
    adminRequest<{ id: string; isActive: boolean }>(`/admin/shops/${shopId}/active`, adminSecret, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    }),
  adminResetPassword: (adminSecret: string, shopId: string, email: string, newPassword: string) =>
    adminRequest<{ success: boolean; updated: number }>(`/admin/shops/${shopId}/reset-password`, adminSecret, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    }),
  adminCreateUser: (adminSecret: string, shopId: string, data: { name: string; email: string; password: string }) =>
    adminRequest<{ id: string; shopId: string; name: string; email: string }>(`/admin/shops/${shopId}/users`, adminSecret, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  getClients: () => request<Client[]>("/clientes"),
  getClient: (id: string) => request<Client>(`/clientes/${id}`),
  createClient: (data: Pick<Client, "name" | "phone">) =>
    request<Client>("/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateClient: (id: string, data: Pick<Client, "name" | "phone">) =>
    request<Client>(`/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteClient: (id: string) =>
    request<{ success: boolean }>(`/clientes/${id}`, { method: "DELETE" }),

  getCars: () => request<Car[]>("/cars"),
  getCar: (id: string) => request<Car>(`/cars/${id}`),
  createCar: (data: Pick<Car, "name" | "model" | "plate" | "year" | "clientId">) =>
    request<Car>("/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateCar: (id: string, data: Pick<Car, "name" | "model" | "plate" | "year" | "clientId">) =>
    request<Car>(`/cars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteCar: (id: string) => request<{ success: boolean }>(`/cars/${id}`, { method: "DELETE" }),

  getServices: () => request<Service[]>("/services"),
  getService: (id: string) => request<Service>(`/services/${id}`),
  createService: (
    data: Pick<Service, "title" | "description" | "status" | "payment" | "price" | "dueDate" | "carId" | "clientId">,
  ) =>
    request<Service>("/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateService: (
    id: string,
    data: Pick<Service, "title" | "description" | "status" | "payment" | "price" | "dueDate" | "carId" | "clientId">,
  ) =>
    request<Service>(`/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteService: (id: string) =>
    request<{ success: boolean }>(`/services/${id}`, { method: "DELETE" }),
};