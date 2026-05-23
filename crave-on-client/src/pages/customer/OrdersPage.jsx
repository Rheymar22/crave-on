import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Badge, statusVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  ShoppingBag, Coffee, ChevronDown,
  ChevronUp, RefreshCw, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Maps status to user-friendly step indicator
const STATUS_STEPS = [
  'pending', 'confirmed', 'preparing', 'ready', 'completed'
];

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch (_) {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(orderId);
    try {
      await api.post(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully.');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order.');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-coffee-dark">
            My Orders
          </h1>
          <p className="text-gray-500 mt-1">
            Track your current and past orders
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center
                          justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-400 mb-8">
            Start browsing our menu and place your first order!
          </p>
          <Button size="lg" onClick={() => navigate('/menu')}>
            <Coffee className="w-4 h-4" />
            Browse Menu
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={handleCancel}
              cancelling={cancelling === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Order Card ──────────────────────────────────────── */
function OrderCard({ order, onCancel, cancelling }) {
  const [expanded, setExpanded] = useState(false);
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'completed';
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <Card className={`overflow-hidden transition-all duration-200
                      ${isCancelled ? 'opacity-75' : ''}`}>

      {/* ── Card Header ─────────────────────────────── */}
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">

          {/* Order info */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-gray-800 font-mono">
                {order.order_number}
              </span>
              <Badge variant={statusVariant[order.status] || 'default'}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <span className="text-xs text-gray-400">
                {order.order_type === 'pickup' ? '🏪 Pickup' : '🛵 Delivery'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.created_at).toLocaleDateString('en-PH', {
                year:  'numeric',
                month: 'long',
                day:   'numeric',
                hour:  '2-digit',
                minute:'2-digit',
              })}
            </p>
          </div>

          {/* Price + Actions */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-brand-600 text-lg">
              ₱{parseFloat(order.total_amount).toFixed(2)}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-gray-100 rounded-lg
                         transition-colors text-gray-500"
            >
              {expanded
                ? <ChevronUp className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Progress Tracker ─────────────────────── */}
        {!isCancelled && (
          <div className="mt-4">
            <div className="flex items-center">
              {STATUS_STEPS.map((step, index) => {
                const isActive   = index <= currentStep;
                const isCurrent  = index === currentStep;
                const isLast     = index === STATUS_STEPS.length - 1;

                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    {/* Circle */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center
                                       justify-center text-xs font-bold
                                       transition-all duration-300 ${
                        isActive
                          ? isCurrent
                            ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                            : 'bg-brand-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isActive && !isCurrent ? '✓' : index + 1}
                      </div>
                      <span className={`text-xs mt-1 capitalize hidden sm:block
                                        ${isActive
                                          ? 'text-brand-600 font-medium'
                                          : 'text-gray-400'
                                        }`}>
                        {step}
                      </span>
                    </div>
                    {/* Line between circles */}
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mx-1 transition-all duration-300
                                       ${index < currentStep
                                         ? 'bg-brand-500'
                                         : 'bg-gray-200'
                                       }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancel button */}
        {order.is_cancellable && (
          <div className="mt-4">
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(order.id)}
              loading={cancelling}
              className="gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel Order
            </Button>
          </div>
        )}
      </div>

      {/* ── Expanded Details ─────────────────────────── */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-5">

          {/* Items */}
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Items Ordered
          </h4>
          <div className="space-y-2 mb-4">
            {order.items?.map(item => (
              <div key={item.id}
                className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center
                                  justify-center">
                    <Coffee className="w-4 h-4 text-brand-400" />
                  </div>
                  <span className="text-gray-700">
                    {item.product_name}
                    <span className="text-gray-400"> × {item.quantity}</span>
                  </span>
                </div>
                <span className="font-medium text-gray-800">
                  ₱{parseFloat(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₱{parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (12%)</span>
              <span>₱{parseFloat(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900
                            border-t pt-2">
              <span>Total</span>
              <span className="text-brand-600">
                ₱{parseFloat(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-3 text-sm text-gray-500">
              <span className="font-medium">Notes:</span> {order.notes}
            </div>
          )}

          {/* Payment */}
          <div className="mt-3 flex gap-4 text-sm text-gray-500">
            <span>
              <span className="font-medium">Payment:</span>{' '}
              {order.payment_method?.toUpperCase()} —{' '}
              <span className={order.payment_status === 'paid'
                ? 'text-green-600 font-medium'
                : 'text-yellow-600'}>
                {order.payment_status}
              </span>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}