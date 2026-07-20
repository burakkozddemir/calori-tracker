const API_BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Bir hata oluştu" }));
    throw new Error(error.detail || "Bir hata oluştu");
  }

  return res.json();
}

export const api = {
  auth: {
    me: () => request<any>("/auth/me"),
    updateProfile: (data: any) =>
      request<any>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  food: {
    analyzeText: (text: string) =>
      request<{ foods: any[] }>("/food/analyze-text", {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    analyzeImage: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<{ foods: any[] }>("/food/analyze-image", {
        method: "POST",
        body: formData,
      });
    },
    add: (data: any) =>
      request<any>("/food/add", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      request<any>(`/food/${id}`, { method: "DELETE" }),
    daily: (date?: string) =>
      request<any>(`/food/daily${date ? `?target_date=${date}` : ""}`),
    search: (query: string) =>
      request<any[]>(`/food/search?query=${encodeURIComponent(query)}`),
    addWater: (amount_ml: number, date?: string) =>
      request<any>("/food/water", {
        method: "POST",
        body: JSON.stringify({ amount_ml, date: date || null }),
      }),
  },
  weight: {
    add: (weight: number, condition: string) =>
      request<any>("/weight/add", {
        method: "POST",
        body: JSON.stringify({ weight, condition }),
      }),
    history: (days: number = 30) =>
      request<any[]>(`/weight/history?days=${days}`),
    today: () => request<any | null>("/weight/today"),
    projection: () => request<any>("/weight/projection"),
    remove: (id: number) =>
      request<any>(`/weight/${id}`, { method: "DELETE" }),
    historyAll: () =>
      request<any[]>("/weight/history?days=365"),
  },
};
