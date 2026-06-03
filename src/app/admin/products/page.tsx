"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch, API_URL } from "@/lib/shop/api";
import { ADMIN_TOKEN_KEY } from "@/lib/shop/constants";
import { formatINR } from "@/lib/shop/format";
import type { Product } from "@/types/shop";
import { SHOP_CATEGORIES } from "@/lib/shop/constants";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categorySlug: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    images: "" as string,
  });
  const [uploading, setUploading] = useState(false);

  const token = () => localStorage.getItem(ADMIN_TOKEN_KEY) || "";

  const load = () => {
    fetch(`${API_URL}/products?limit=100`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("images", f));
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const data = await res.json();
      if (data.urls) {
        setForm((f) => ({
          ...f,
          images: [...(f.images ? f.images.split(",") : []), ...data.urls].join(
            ","
          ),
        }));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = form.images
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await adminFetch("/products", token(), {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        categorySlug: "",
        images,
        price: Number(form.price),
        compareAtPrice: Number(form.compareAtPrice) || 0,
        stock: Number(form.stock),
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }),
    });
    setForm({
      name: "",
      description: "",
      categorySlug: "",
      price: "",
      compareAtPrice: "",
      stock: "",
      images: "",
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this product?")) return;
    await adminFetch(`/products/${id}`, token(), { method: "DELETE" });
    load();
  };

  return (
    <AdminShell>
      <h1 className="font-display text-2xl font-bold">Products</h1>

      <form
        onSubmit={handleCreate}
        className="mt-6 max-w-xl space-y-3 rounded-xl border border-white/10 bg-slate-900 p-5"
      >
        <h2 className="font-semibold">Add product</h2>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        />

        <div className="flex gap-2">
          <input
            placeholder="Price"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
          />
          <input
            placeholder="MRP"
            type="number"
            value={form.compareAtPrice}
            onChange={(e) =>
              setForm({ ...form, compareAtPrice: e.target.value })
            }
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
          />
          <input
            placeholder="Stock"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Upload images (Cloudinary)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="mt-1 block w-full text-sm"
          />
          {uploading && <p className="text-xs text-sky-brand">Uploading...</p>}
        </div>
        <input
          placeholder="Image URLs (comma-separated)"
          value={form.images}
          onChange={(e) => setForm({ ...form, images: e.target.value })}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs"
        />
        <button
          type="submit"
          className="rounded-lg bg-sky-brand px-4 py-2 font-semibold text-navy-900"
        >
          Create product
        </button>
      </form>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="pb-2">Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-white/5">
                <td className="py-2">{p.name}</td>
                <td>{formatINR(p.price)}</td>
                <td>{p.stock}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleDelete(p._id)}
                    className="text-red-400 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
