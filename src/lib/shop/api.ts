import type { Product, Category, ShopFilters, Pagination } from "@/types/shop";

const API_URL = (() => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
})();

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function getProducts(filters: ShopFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, String(v));
  });
  const data = await fetchAPI<{ products: Product[]; pagination: Pagination }>(
    `/products?${params}`
  );
  if (data?.products?.length) return data;
  return {
    products: [],
    pagination: {
      page: filters.page || 1,
      limit: filters.limit || 12,
      total: 0,
      pages: 0,
    },
  };
}

export async function getProduct(slug: string): Promise<Product | null> {
  const data = await fetchAPI<Product>(`/products/${slug}`);
  if (data) return data;
  return null;
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchAPI<Category[]>("/categories");
  if (data?.length) return data;
  return [];
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string
): Promise<Product[]> {
  const { products } = await getProducts({ category: categorySlug, limit: 8 });
  return products.filter((p) => p.slug !== excludeSlug).slice(0, 4);
}

export async function createOrder(body: Record<string, unknown>) {
  return fetchAPI(`/orders`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markOrderPaid(orderId: string) {
  return fetchAPI(`/orders/${orderId}/pay`, { method: "PATCH" });
}

export async function getShopConfig() {
  const data = await fetchAPI<{ upiId: string }>("/config");
  return data || { upiId: process.env.NEXT_PUBLIC_UPI_ID || "vetbuddy@upi" };
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Login failed");
  }
  return res.json();
}

export async function adminFetch<T>(path: string, token: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json() as Promise<T>;
}

export { API_URL };
