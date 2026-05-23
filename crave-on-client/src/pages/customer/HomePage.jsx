import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  ShoppingCart, ArrowRight, Coffee,
  Star, Clock, MapPin
} from 'lucide-react';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const { addItem }             = useCartStore();
  const { isAuthenticated }     = useAuthStore();
  const navigate                = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?per_page=4');
        setFeatured(res.data.data);
      } catch (_) {
        // silently fail on homepage
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart.');
      navigate('/login');
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart! ☕`);
  };

  return (
    <div className="flex flex-col">

      {/* ── Hero Section ─────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:    `url('/crave on bg.png')`,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
          backgroundRepeat:   'no-repeat',
        }}
      >
        {/* Dark overlay — keeps text readable over the bg pattern */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                        py-20 md:py-28">
          <div className="max-w-2xl">

            {/* Badge
            <div className="inline-flex items-center gap-2 bg-brand-500/20
                            border border-brand-400/30 rounded-full
                            px-4 py-1.5 mb-6">
              <Coffee className="w-4 h-4 text-brand-400" />
              <span className="text-brand-300 text-sm font-medium">
                Freshly Brewed Daily
              </span>
            </div> */}

            <h1 className="text-4xl md:text-6xl font-display font-bold
                           text-white leading-tight mb-6">
              Your Perfect Cup
              <span className="block text-brand-400">Awaits You</span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl mb-8
                          leading-relaxed max-w-lg">
              Handcrafted coffees, fresh pastries, and premium beans —
              all made with love at Crave On.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/menu')}
                className="gap-2 text-base"
              >
                Order Now
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/menu')}
                className="text-white border-white/30 hover:bg-white/10
                           hover:text-white text-base"
              >
                View Menu
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12">
              {[
                // { value: '10+',  label: 'Menu Items' },
                // { value: '4.9★', label: 'Rating' },
                // { value: '50+', label: 'Happy Customers' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bar ─────────────────────────────── */}
      <section className="bg-brand-500 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8
                          text-white text-sm">
            {[
              { icon: Clock,  text: 'Open 7AM – 9PM Daily' },
              { icon: MapPin, text: 'Mongpong Proper, Roxas City, Capiz' },
              { icon: Star,   text: 'Premium Quality Ingredients' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Section ───────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-coffee-dark">
              Explore Our Menu
            </h2>
            <p className="text-gray-500 mt-2">
              Something for every craving
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label:  'Hot Drinks',
                slug:   'hot-drinks',
                bg:     'bg-amber-50',
                border: 'border-amber-200',
                text:   'text-amber-800',
              },
              {
                label:  'Iced Drinks',
                slug:   'iced-drinks',
                bg:     'bg-blue-50',
                border: 'border-blue-200',
                text:   'text-blue-800',
              },
              {
                label:  'Pastries',
                slug:   'pastries',
                bg:     'bg-orange-50',
                border: 'border-orange-200',
                text:   'text-orange-800',
              },
              {
                label:  'Coffee Beans',
                slug:   'coffee-beans',
                bg:     'bg-stone-50',
                border: 'border-stone-200',
                text:   'text-stone-800',
              },
            ].map(cat => (
              <Link
                key={cat.slug}
                to={`/menu?category=${cat.slug}`}
                className={`flex flex-col items-center justify-center p-6
                            rounded-2xl border-2 ${cat.bg} ${cat.border}
                            hover:shadow-md transition-all duration-200
                            hover:-translate-y-1 group`}
              >
                <span className="text-4xl mb-3">{cat.icon}</span>
                <span className={`font-semibold text-sm ${cat.text}`}>
                  {cat.label}
                </span>
                <span className={`text-xs mt-1 ${cat.text} opacity-60
                                  group-hover:opacity-100 transition-opacity
                                  flex items-center gap-1`}>
                  View all <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-coffee-dark">
                Customer Favorites
              </h2>
              <p className="text-gray-500 mt-1">
                Our most-loved items
              </p>
            </div>
            <Link
              to="/menu"
              className="text-brand-600 hover:text-brand-700 font-medium
                         text-sm flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2
                            lg:grid-cols-4 gap-6">
              {featured.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-coffee-dark
                          to-coffee-medium">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-gray-300 mb-8">
            Browse our full menu and get your favorite delivered or
            ready for pickup.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/menu')}
            className="text-base"
          >
            Browse Full Menu
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ── Product Card Component ──────────────────────────── */
function ProductCard({ product, onAddToCart }) {
  return (
    <Card className="group overflow-hidden hover:shadow-md
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
            <Coffee className="w-16 h-16 text-brand-300" />
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm
                           text-xs font-medium text-gray-700 px-2.5 py-1
                           rounded-full">
            {product.category.icon} {product.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-3
                      leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-brand-600 font-bold text-lg">
            ₱{parseFloat(product.price).toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1.5 bg-brand-500
                       hover:bg-brand-600 text-white px-3 py-1.5
                       rounded-lg text-sm font-medium transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </Card>
  );
}