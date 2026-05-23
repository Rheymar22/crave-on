import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, statusVariant } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import {
  ShoppingBag, Users, TrendingUp,
  Coffee, ArrowRight, RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics?period=30');
      setData(res.data.data);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Last 30 days overview
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 text-sm text-gray-500
                     hover:text-brand-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Revenue',
            value: `₱${parseFloat(
              summary.total_revenue || 0
            ).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            icon:  TrendingUp,
            color: 'bg-brand-50 text-brand-600',
            sub:   'Completed orders',
          },
          {
            title: 'Total Orders',
            value: summary.total_orders || 0,
            icon:  ShoppingBag,
            color: 'bg-blue-50 text-blue-600',
            sub:   `${summary.active_orders || 0} active now`,
          },
          {
            title: 'Customers',
            value: summary.total_customers || 0,
            icon:  Users,
            color: 'bg-green-50 text-green-600',
            sub:   'Registered accounts',
          },
          {
            title: 'Completed',
            value: summary.completed_orders || 0,
            icon:  Coffee,
            color: 'bg-purple-50 text-purple-600',
            sub:   `${summary.cancelled_orders || 0} cancelled`,
          },
        ].map(card => (
          <Card key={card.title}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center
                                 justify-center ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                Top Selling Products
              </h2>
              <Link to="/admin/products"
                className="text-xs text-brand-600 hover:underline
                           flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {data?.top_products?.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                No sales data yet
              </p>
            )}
            {data?.top_products?.map((product, index) => (
              <div key={product.product_name}
                className="flex items-center gap-3">
                <div className="w-7 h-7 bg-brand-100 rounded-lg flex
                                items-center justify-center flex-shrink-0">
                  <span className="text-brand-600 font-bold text-xs">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {product.product_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {product.total_sold} sold
                  </p>
                </div>
                <span className="text-sm font-semibold text-brand-600
                                 flex-shrink-0">
                  ₱{parseFloat(product.total_revenue).toLocaleString()}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                Orders by Status
              </h2>
              <Link to="/admin/orders"
                className="text-xs text-brand-600 hover:underline
                           flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {Object.entries(data?.orders_by_status || {}).map(
              ([status, count]) => (
                <div key={status}
                  className="flex items-center justify-between">
                  <Badge variant={statusVariant[status] || 'default'}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                  <span className="font-semibold text-gray-700">
                    {count}
                  </span>
                </div>
              )
            )}
            {Object.keys(data?.orders_by_status || {}).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                No orders yet
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders"
              className="text-xs text-brand-600 hover:underline
                         flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order', 'Customer', 'Total',
                    'Status', 'Date'].map(h => (
                    <th key={h}
                      className="text-left py-3 px-4 text-xs font-semibold
                                 text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.recent_orders?.map(order => (
                  <tr key={order.order_number}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium
                                   text-gray-700 text-xs">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.customer}
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-600">
                      ₱{parseFloat(order.total).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariant[order.status] || 'default'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!data?.recent_orders ||
                  data.recent_orders.length === 0) && (
                  <tr>
                    <td colSpan={5}
                      className="py-8 text-center text-gray-400">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}