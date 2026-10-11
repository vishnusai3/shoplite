import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Product, Category } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ProductListPageProps {
  initialCategory?: string;
  initialSearch?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductListPage: React.FC<ProductListPageProps> = ({
  initialCategory = 'all',
  initialSearch = '',
  onNavigate,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState<string>(initialSearch);
  const [sort, setSort] = useState<string>('newest');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync props if incoming category or search changes
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearch !== undefined) setSearch(initialSearch);
  }, [initialSearch]);

  // Load Categories once
  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch products on filter changes
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await api.getProducts({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: search.trim() || undefined,
          sort,
          page,
          limit: 15,
        });
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setTotalCount(res.total);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, search, sort, page]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearch('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters = selectedCategory !== 'all' || search.trim() !== '' || sort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header and Title */}
      <div className="space-y-1.5 border-b border-stone-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-['Space_Grotesk'] tracking-tight">
          Pantry & Fresh Produce
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm max-w-2xl">
          Organic orchard fruits, wholesome slow-roasted snacks, raw honey, and cold-pressed pantry essentials.
        </p>
      </div>

      {/* Control Bar: Search, Category Pills, Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search fruits, snacks, honey, oil..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort by:</span>
          </div>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs cursor-pointer"
          >
            <option value="newest">Newest Harvest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Product Name (A-Z)</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold underline ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
          }`}
        >
          All Items ({totalCount})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.slug
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid Area */}
      {loading ? (
        <div className="py-24 text-center text-stone-400 text-xs">
          Fetching products from market inventory...
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-stone-200 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">No items match your criteria</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search terms or selecting a different aisle.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-8 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <div>
                Showing page <strong className="text-stone-900">{page}</strong> of <strong className="text-stone-900">{totalPages}</strong> ({totalCount} total items)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
                        page === p
                          ? 'bg-stone-900 text-white'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
