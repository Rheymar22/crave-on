import { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Badge, statusVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw, ChevronDown,
  ChevronUp, Coffee, X
} from 'lucide-react';

const STATUSES = [
  'all', 'pending', 'confirmed',
  'preparing', 'ready', 'completed', 'cancelled'
];

const NEXT_STATUS = {
  pending:   'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready:     'completed',
};

const STATUS_LABELS = {
  pending:   'Confirm Order',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready:     'Complete Order',
};

export default function AdminOrdersPage() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');
  const [search,     setSearch]     = useState('');
  const [updating,   setUpdating]   = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (search)           params.set('search', search);
      params.set('per_page', '20');

      const res = await api.get(`/admin/orders?${params.toString()}`);
      setOrders(res.data.data);
    } catch (_) {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusUpdate = async (order, newStatus) => {
    setUpdating(order.id);
    try {
      await api.patch(`/admin/orders/${order.id}/status`, {
        status: newStatus,
      });
      toast.success(
        `Order ${order.order_number} → ${newStatus}`
      );
      fetchOrders();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to update status.'
      );
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and update order statuses
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search order number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-300
                       text-sm focus:outline-none focus:ring-2
                       focus:ring-brand-500 bg-white w-64"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                          capitalize transition-all ${
                filter === s
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <AdminOrderCard
              key={order.id}
              order={order}
              updating={updating === order.id}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Admin Order Card ────────────────────────────────── */
function AdminOrderCard({ order, updating, onStatusUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <Card className="overflow-hidden">
      <CardBody className="p-0">

        {/* Main Row */}
        <div className="p-4 flex flex-wrap items-center gap-4">

          {/* Order Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold font-mono text-gray-800 text-sm">
                {order.order_number}
              </span>
              <Badge variant={statusVariant[order.status] || 'default'}>
                {order.status}
              </Badge>
              <span className="text-xs text-gray-400">
                {order.order_type === 'pickup' ? '🏪' : '🛵'}{' '}
                {order.order_type}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{order.user?.name}</span>
              <span className="text-gray-400 mx-2">·</span>
              <span className="text-gray-400 text-xs">
                {new Date(order.created_at).toLocaleString('en-PH')}
              </span>
            </p>
          </div>

          {/* Total */}
          <div className="text-right">
            <p className="font-bold text-brand-600 text-lg">
              ₱{parseFloat(order.total_amount).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">
              {order.items?.length || 0} item(s)
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Advance status button */}
            {nextStatus && (
              <Button
                size="sm"
                loading={updating}
                onClick={() => onStatusUpdate(order, nextStatus)}
              >
                {STATUS_LABELS[order.status]}
              </Button>
            )}

            {/* Cancel (if cancellable) */}
            {order.is_cancellable && (
              <Button
                size="sm"
                variant="danger"
                loading={updating}
                onClick={() => onStatusUpdate(order, 'cancelled')}
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
            )}

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors
                         text-gray-500"
            >
              {expanded
                ? <ChevronUp className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t border-gray-100 bg-gray-50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Items */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500
                               uppercase mb-3">
                  Items Ordered
                </h4>
                <div className="space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id}
                      className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.product_name}
                        <span className="text-gray-400 ml-1">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="font-medium text-gray-800">
                        ₱{parseFloat(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-3 pt-3 border-t border-gray-200
                                space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₱{parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax</span>
                    <span>₱{parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-brand-600">
                      ₱{parseFloat(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Meta */}
              <div className="space-y-3 text-sm">
                <h4 className="text-xs font-semibold text-gray-500
                               uppercase mb-3">
                  Order Details
                </h4>

                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="font-medium text-gray-700">
                    {order.user?.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {order.user?.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Payment</p>
                  <p className="font-medium text-gray-700 capitalize">
                    {order.payment_method} —{' '}
                    <span className={
                      order.payment_status === 'paid'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }>
                      {order.payment_status}
                    </span>
                  </p>
                </div>

                {order.delivery_address && (
                  <div>
                    <p className="text-xs text-gray-400">
                      Delivery Address
                    </p>
                    <p className="font-medium text-gray-700">
                      {order.delivery_address}
                    </p>
                  </div>
                )}

                {order.notes && (
                  <div>
                    <p className="text-xs text-gray-400">
                      Special Instructions
                    </p>
                    <p className="font-medium text-gray-700">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}