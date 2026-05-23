<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /*
    |------------------------------------------------------------------
    | GET /api/admin/analytics  (Admin)
    | Supports: ?period=30  (days to look back, default 30)
    |------------------------------------------------------------------
    */
    public function index(Request $request): JsonResponse
    {
        $period = (int) $request->get('period', 30);
        $from   = now()->subDays($period)->startOfDay();

        // ── Summary Cards ──────────────────────────────────────────
        $totalRevenue = Order::where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->sum('total_amount');

        $totalOrders = Order::where('created_at', '>=', $from)
            ->count();

        $completedOrders = Order::where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->count();

        $cancelledOrders = Order::where('status', 'cancelled')
            ->where('created_at', '>=', $from)
            ->count();

        $totalCustomers = User::where('role', 'customer')->count();

        // Active = orders that need attention right now
        $activeOrders = Order::whereIn('status', ['pending', 'confirmed', 'preparing', 'ready'])
            ->count();

        // ── Orders Grouped by Status ───────────────────────────────
        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $from)
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // ── Revenue Per Day (for line/bar chart) ───────────────────
        $revenueByDay = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as orders_count')
            )
            ->where('status', 'completed')
            ->where('created_at', '>=', $from)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get()
            ->map(fn ($row) => [
                'date'         => $row->date,
                'revenue'      => (float) $row->revenue,
                'orders_count' => $row->orders_count,
            ]);

        // ── Top 5 Best-Selling Products ────────────────────────────
        $topProducts = OrderItem::select(
                'product_name',
                DB::raw('SUM(quantity) as total_sold'),
                DB::raw('SUM(subtotal) as total_revenue')
            )
            ->whereHas('order', fn ($q) => $q->where('created_at', '>=', $from))
            ->groupBy('product_name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'product_name'  => $row->product_name,
                'total_sold'    => (int) $row->total_sold,
                'total_revenue' => (float) $row->total_revenue,
            ]);

        // ── Recent 8 Orders for Activity Feed ─────────────────────
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get()
            ->map(fn ($order) => [
                'order_number' => $order->order_number,
                'customer'     => $order->user->name,
                'total'        => (float) $order->total_amount,
                'status'       => $order->status,
                'order_type'   => $order->order_type,
                'created_at'   => $order->created_at->toDateTimeString(),
            ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'summary' => [
                    'total_revenue'   => (float) $totalRevenue,
                    'total_orders'    => $totalOrders,
                    'completed_orders'=> $completedOrders,
                    'cancelled_orders'=> $cancelledOrders,
                    'total_customers' => $totalCustomers,
                    'active_orders'   => $activeOrders,
                ],
                'orders_by_status' => $ordersByStatus,
                'revenue_by_day'   => $revenueByDay,
                'top_products'     => $topProducts,
                'recent_orders'    => $recentOrders,
                'period_days'      => $period,
            ],
        ]);
    }
}
