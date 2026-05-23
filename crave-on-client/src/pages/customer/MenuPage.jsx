import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [meta,        setMeta]        = useState({});
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');

  const activeCategory = searchParams.get('category') || 'all';
  const { addItem }        = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate            = useNavigate();

  // Fetch categories once
  useEffect(() => {
    api.get('/categories').then(res => {
      setCategories(res.data.data);
    });
  }, []);

  // Fetch products when filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== 'all') params.set('category', activeCategory);
        if (search) params.set('search', search);
        params.set('per_page', '12');

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.data);
        setMeta(res.data.meta || {});
      } catch (_) {
        toast.error('Failed to load menu.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, search]);

  const handleCategoryChange = (slug) => {
    if (slug === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchInput('');
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart.');
      navigate('/login');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-coffee-dark">
          Our Menu
        </h1>
        <p className="text-gray-500 mt-1">
          {meta.total
            ? `${meta.total} items available`
            : 'Explore our full menu'}
        </p>
      </div>

      {/* ── Search Bar ──────────────────────────────── */}
      <form onSubmit={handleSearch} className="relative mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300
                     text-sm focus:outline-none focus:ring-2 focus:ring-brand-500
                     focus:border-transparent bg-white"
        />
        {searchInput && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-gray-400 hover:text-gray-600 text-sm"
          >
            Clear
          </button>
        )}
      </form>

      {/* ── Category Filter Tabs ─────────────────────── */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
        <CategoryTab
          label="All Items"
          active={activeCategory === 'all'}
          onClick={() => handleCategoryChange('all')}
        />
        {categories.map(cat => (
          <CategoryTab
            key={cat.id}
            label={cat.name}
            active={activeCategory === cat.slug}
            onClick={() => handleCategoryChange(cat.slug)}
          />
        ))}
      </div>

      {/* ── Active Filters ────────────────────────────── */}
      {(search || activeCategory !== 'all') && (
        <div className="flex flex-wrap gap-2 mb-6">
          {search && (
            <span className="inline-flex items-center gap-1.5 bg-brand-100
                             text-brand-700 text-sm px-3 py-1 rounded-full">
              Search: "{search}"
              <button onClick={clearSearch} className="text-brand-500 hover:text-brand-700 text-xs">
                ✕
              </button>
            </span>
          )}
          {activeCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-brand-100
                             text-brand-700 text-sm px-3 py-1 rounded-full">
              {categories.find(c => c.slug === activeCategory)?.name}
              <button onClick={() => handleCategoryChange('all')} className="text-brand-500 hover:text-brand-700 text-xs">
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* ── Products Grid ────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-lg font-semibold text-gray-500">
            No items found
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Try a different category or search term
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              clearSearch();
              handleCategoryChange('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                        xl:grid-cols-4 gap-6">
          {products.map(product => (
            <MenuProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Category Tab ────────────────────────────────────── */
function CategoryTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm
                  font-medium whitespace-nowrap transition-all duration-200
                  ${active
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600'
                  }`}
    >
      <span>{label}</span>
    </button>
  );
}

/* ── Menu Product Card ───────────────────────────────── */
function MenuProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg
                     transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-amber-50
                      to-orange-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105
                       transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-brand-300">No Image</span>
          </div>
        )}
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm
                           text-xs font-medium text-gray-700 px-2.5 py-1
                           rounded-full shadow-sm">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-gray-800 leading-tight">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-brand-600 font-bold text-lg">
            ₱{parseFloat(product.price).toFixed(2)}
          </span>

          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                        text-sm font-medium transition-all duration-300
                        ${added
                          ? 'bg-green-500 text-white'
                          : 'bg-brand-500 hover:bg-brand-600 text-white'
                        }`}
          >
            {added ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Card>
  );
}