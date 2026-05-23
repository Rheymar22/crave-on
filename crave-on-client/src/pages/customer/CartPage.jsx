import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus,
  ArrowRight, Coffee, ArrowLeft
} from 'lucide-react';

export default function CartPage() {
  const {
    items, removeItem, updateQuantity,
    clearCart, getSubtotal, getTax, getTotal,
  } = useCartStore();

  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center
                        justify-center mx-auto mb-6">
          <ShoppingCart className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Button size="lg" onClick={() => navigate('/menu')}>
          <Coffee className="w-4 h-4" />
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-coffee-dark">
            Your Cart
          </h1>
          <p className="text-gray-500 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600
                     flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Cart Items ────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}

          {/* Back to menu */}
          <Link
            to="/menu"
            className="flex items-center gap-2 text-brand-600 hover:text-brand-700
                       text-sm font-medium mt-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* ── Order Summary ─────────────────────────── */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <h2 className="font-semibold text-gray-800">Order Summary</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₱{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (12% VAT)</span>
                <span>₱{getTax().toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-brand-600 text-lg">
                    ₱{getTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items breakdown */}
              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Items
                </p>
                {items.map(item => (
                  <div key={item.id}
                    className="flex justify-between text-xs text-gray-600 py-0.5">
                    <span className="truncate mr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="flex-shrink-0">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Cart Item Component ─────────────────────────────── */
function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <Card className="p-4">
      <div className="flex gap-4">

        {/* Image */}
        <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-100
                        rounded-xl flex items-center justify-center flex-shrink-0
                        overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Coffee className="w-8 h-8 text-brand-300" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-800 truncate">
                {item.name}
              </h3>
              {item.category && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.category.name}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-gray-400 hover:text-red-500
                         transition-colors flex-shrink-0 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center
                           rounded-md hover:bg-white text-gray-600
                           hover:text-gray-900 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-sm font-semibold
                               text-gray-800">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center
                           rounded-md hover:bg-white text-gray-600
                           hover:text-gray-900 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="font-bold text-brand-600">
                ₱{(item.price * item.quantity).toFixed(2)}
              </p>
              {item.quantity > 1 && (
                <p className="text-xs text-gray-400">
                  ₱{parseFloat(item.price).toFixed(2)} each
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}