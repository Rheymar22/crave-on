import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, statusVariant } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import { TrendingUp, ShoppingBag, Users, Coffee, RefreshCw } from 'lucide-react';

const PERIODS = [
  { value: '7',  label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState('30');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/analytics?period=${period}`);
      setData(res.data.data);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [period]);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Business performance overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-300 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500
                       bg-white"
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 text-sm text-gray-500
                       hover:text-brand-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Revenue',
            value: `₱${parseFloat(
              summary.total_revenue || 0
            ).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            sub:   'From completed orders',
            icon:  TrendingUp,
            color: 'text-brand-600 bg-brand-50',
          },
          {
            title: 'Total Orders',
            value: summary.total_orders || 0,
            sub:   `${summary.active_orders || 0} currently active`,
            icon:  ShoppingBag,
            color: 'text-blue-600 bg-blue-50',
          },
          {
            title: 'Customers',
            value: summary.total_customers || 0,
            sub:   'Registered accounts',
            icon:  Users,
            color: 'text-green-600 bg-green-50',
          },
          {
            title: 'Completed',
            value: summary.completed_orders || 0,
            sub:   `${summary.cancelled_orders || 0} cancelled`,
            icon:  Coffee,
            color: 'text-purple-600 bg-purple-50',
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

        {/* Revenue by Day */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-800">
              Revenue by Day
            </h2>
          </CardHeader>
          <CardBody>
            {data?.revenue_by_day?.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No revenue data yet
              </p>
            ) : (
              <div className="space-y-2">
                {data?.revenue_by_day?.slice(-10).map(row => {
                  const maxRevenue = Math.max(
                    ...data.revenue_by_day.map(r => r.revenue)
                  );
                  const pct = maxRevenue > 0
                    ? (row.revenue / maxRevenue) * 100
                    : 0;

                  return (
                    <div key={row.date}>
                      <div className="flex justify-between text-xs
                                      text-gray-500 mb-1">
                        <span>{new Date(row.date).toLocaleDateString(
                          'en-PH', { month: 'short', day: 'numeric' }
                        )}</span>
                        <span className="font-medium text-gray-700">
                          ₱{parseFloat(row.revenue).toLocaleString()}
                          <span className="text-gray-400 ml-1">
                            ({row.orders_count} orders)
                          </span>
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full
                                      overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full
                                     transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-800">
              Top Selling Products
            </h2>
          </CardHeader>
          <CardBody>
            {data?.top_products?.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                No sales data yet
              </p>
            ) : (
              <div className="space-y-4">
                {data?.top_products?.map((product, index) => {
                  const maxSold = Math.max(
                    ...data.top_products.map(p => p.total_sold)
                  );
                  const pct = maxSold > 0
                    ? (product.total_sold / maxSold) * 100
                    : 0;

                  return (
                    <div key={product.product_name}>
                      <div className="flex items-center justify-between
                                      mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-brand-100 text-brand-700
                                           rounded-full flex items-center
                                           justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {product.product_name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold
                                           text-brand-600">
                            ₱{parseFloat(
                              product.total_revenue
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            {product.total_sold} sold
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full
                                      overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full
                                     transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-800">
            Orders by Status
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3
                          lg:grid-cols-6 gap-4">
            {Object.entries(data?.orders_by_status || {}).map(
              ([status, count]) => (
                <div key={status}
                  className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-800">
                    {count}
                  </p>
                  <div className="mt-2 flex justify-center">
                    <Badge variant={statusVariant[status] || 'default'}>
                      {status}
                    </Badge>
                  </div>
                </div>
              )
            )}
            {Object.keys(data?.orders_by_status || {}).length === 0 && (
              <div className="col-span-6 text-center py-8 text-gray-400">
                No order data yet
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Type',
                    'Total', 'Status', 'Date'].map(h => (
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
                    <td className="py-3 px-4 font-mono text-xs font-medium
                                   text-gray-700">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.customer}
                    </td>
                    <td className="py-3 px-4 text-gray-500 capitalize text-xs">
                      {order.order_type === 'pickup' ? '🏪' : '🛵'}{' '}
                      {order.order_type}
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
                    <td colSpan={6}
                      className="py-10 text-center text-gray-400">
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