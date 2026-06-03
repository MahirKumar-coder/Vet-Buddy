"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiFilter, FiSearch, FiX } from "react-icons/fi";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { ShopHero } from "@/components/shop/ShopHero";
import { ProductCard } from "@/components/shop/ProductCard";
import { FiltersSidebar } from "@/components/shop/FiltersSidebar";
import { ProductGridSkeleton } from "@/components/shop/ProductSkeleton";
import { getProducts } from "@/lib/shop/api";
import type { Product, Pagination } from "@/types/shop";
import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [breed, setBreed] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [bestSellerOnly, setBestSellerOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const data = await getProducts({
      category: category || undefined,
      breed: breed || undefined,
      search: search || undefined,
      sort: sort as "newest" | "price_asc" | "price_desc" | "rating",
      page,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      bestSeller: bestSellerOnly || undefined,
    });
    setProducts(data.products);
    setPagination(data.pagination);
    setLoading(false);
  }, [category, breed, search, sort, page, minPrice, maxPrice, bestSellerOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setPage(1);
  }, [category, breed, search, sort, minPrice, maxPrice, bestSellerOnly]);

  return (
    <>
      <ShopNavbar onSearch={setSearch} searchValue={search} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-4 md:px-6 md:pb-12">
        <ShopHero />
        {/* Prominent Body Search Bar */}
        <div className="mx-auto mt-8 max-w-2xl w-full px-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glass backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-brand/10 blur-2xl" />
            <label htmlFor="body-search" className="block text-center font-display text-base sm:text-lg font-bold text-navy-900">
              Find everything your <span className="gradient-text">pet needs</span>
            </label>
            <p className="mt-1 text-center text-[10px] sm:text-xs text-slate-500">
              Search across medicines, premium pet food, grooming supplies, and toys
            </p>
            <div className="relative mt-4">
              <FiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="body-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type here to search (e.g., Calcium, Pedigree, Toy, Shampoo)..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm text-navy-900 placeholder:text-slate-400 shadow-sm focus:border-sky-brand focus:outline-none focus:ring-1 focus:ring-sky-brand"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-900 transition"
                  aria-label="Clear search"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div id="products" className="mt-10 flex gap-6">
          <FiltersSidebar
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPrice={setMinPrice}
            onMaxPrice={setMaxPrice}
            bestSellerOnly={bestSellerOnly}
            onBestSeller={setBestSellerOnly}
            sort={sort}
            onSort={setSort}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {pagination
                  ? `${pagination.total} products`
                  : "Loading..."}
              </p>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-900 lg:hidden"
              >
                <FiFilter /> Filters
              </button>
            </div>

            {loading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-600">
                No products found. Try adjusting filters.
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6"
              >
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </motion.div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-10 w-10 rounded-lg text-sm font-medium ${
                        page === p
                          ? "bg-sky-brand text-white"
                          : "border border-slate-200 text-navy-900"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 border-t border-white/60 py-8 text-center text-sm text-slate-600">
          <p>
            {SITE.name} Pet Shop · Need help?{" "}
            <Link href={`tel:${SITE.phoneTel}`} className="text-sky-brand">
              {SITE.phone}
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}
