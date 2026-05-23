import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  ShoppingBag, MapPin, CreditCard,
  Coffee, CheckCircle, ArrowLeft
} from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'cash',  label: 'Cash on Pickup/Delivery', icon: '💵' },
  { id: 'card',  label: 'Credit / Debit Card',     icon: null, img: '/debit.jpg' },
  { id: 'gcash', label: 'GCash',                   icon: null, img: '/gcash.jpg' },
  { id: 'maya',  label: 'Maya (PayMaya)',           icon: null, img: '/paymaya.jpg' },
];

export default function CheckoutPage() {
  const navigate   = useNavigate();
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  const { user }   = useAuthStore();

  const [form, setForm] = useState({
    order_type:       'pickup',
    delivery_address: user?.address || '',
    notes:            '',
    payment_method:   'cash',
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(null);

  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (form.order_type === 'delivery' && !form.delivery_address.trim()) {
      newErrors.delivery_address = 'Delivery address is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        items: items.map(i => ({
          product_id: i.id,
          quantity:   i.quantity,
        })),
        order_type:       form.order_type,
        delivery_address: form.order_type === 'delivery'
          ? form.delivery_address
          : null,
        notes:            form.notes || null,
        payment_method:   form.payment_method,
      };

      const res = await api.post('/orders', payload);
      clearCart();
      setSuccess(res.data.data);
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center
                        justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-coffee-dark mb-2">
          Order Placed!
        </h1>
        <p className="text-gray-500 mb-2">
          Your order has been received and is being processed.
        </p>
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-8 mt-6">
          <p className="text-sm text-brand-700 font-medium">Order Number</p>
          <p className="text-2xl font-bold text-brand-600 font-mono mt-1">
            {success.order_number}
          </p>
          <p className="text-xs text-brand-600 mt-2 capitalize">
            Status: {success.status} •{' '}
            {success.order_type === 'pickup' ? '🏪 Pickup' : '🛵 Delivery'}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => navigate('/orders')}>
            <ShoppingBag className="w-4 h-4" />
            Track My Order
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/menu')}>
            <Coffee className="w-4 h-4" />
            Order Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/cart')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-coffee-dark">
            Checkout
          </h1>
          <p className="text-gray-500 mt-1">Complete your order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Type */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  Order Type
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'pickup',   label: 'Pickup',   emoji: '🏪', desc: 'Pick up at our store' },
                    { value: 'delivery', label: 'Delivery', emoji: '🛵', desc: 'Deliver to your address' },
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer
                                  transition-all ${
                        form.order_type === option.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="order_type"
                        value={option.value}
                        checked={form.order_type === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-2xl mb-2">{option.emoji}</span>
                      <span className="font-semibold text-gray-800 text-sm">{option.label}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{option.desc}</span>
                    </label>
                  ))}
                </div>

                {form.order_type === 'delivery' && (
                  <div className="mt-4">
                    <Input
                      label="Delivery Address"
                      name="delivery_address"
                      value={form.delivery_address}
                      onChange={handleChange}
                      error={errors.delivery_address}
                      placeholder="Enter your full delivery address"
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-500" />
                  Payment Method
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(method => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-3 p-3 rounded-xl
                                  border-2 cursor-pointer transition-all ${
                        form.payment_method === method.id
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={form.payment_method === method.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {method.img ? (
                        <img
                          src={method.img}
                          alt={method.label}
                          className="w-8 h-8 object-contain rounded"
                        />
                      ) : (
                        <span className="text-xl">{method.icon}</span>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {method.label}
                      </span>
                      {form.payment_method === method.id && (
                        <CheckCircle className="w-4 h-4 text-brand-500 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  🔒 Mock payment — no real charges will be made
                </p>
              </CardBody>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-800">
                  Special Instructions
                  <span className="text-gray-400 font-normal text-sm ml-2">(optional)</span>
                </h2>
              </CardHeader>
              <CardBody>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="e.g. Less ice, extra shot, no sugar..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-500 focus:border-transparent
                             resize-none transition-all"
                />
              </CardBody>
            </Card>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <h2 className="font-semibold text-gray-800">Order Summary</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center
                                      justify-center flex-shrink-0">
                        <Coffee className="w-4 h-4 text-brand-400" />
                      </div>
                      <span className="flex-1 text-gray-700 truncate">
                        {item.name}
                        <span className="text-gray-400"> × {item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-800 flex-shrink-0">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>₱{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (12%)</span>
                    <span>₱{getTax().toFixed(2)}</span>
                  </div>
                  {form.order_type === 'delivery' && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-2">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-brand-600 text-xl">
                        ₱{getTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  By placing your order you agree to our terms
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}