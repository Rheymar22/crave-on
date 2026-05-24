<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function __construct(
        protected WebhookService $webhooks
    ) {}

    /*
    |------------------------------------------------------------------
    | POST /api/orders  (Customer)
    |------------------------------------------------------------------
    */
    public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'items'                  => ['required', 'array', 'min:1'],
        'items.*.product_id'     => ['required', 'integer', 'exists:products,id'],
        'items.*.quantity'       => ['required', 'integer', 'min:1', 'max:20'],
        'order_type'             => ['required', 'in:pickup,delivery'],
        'delivery_address'       => ['required_if:order_type,delivery', 'nullable', 'string'],
        'notes'                  => ['nullable', 'string', 'max:500'],
        'payment_method'         => ['required', 'string', 'in:cash,card,gcash,maya'],
    ]);

    try {
        $order = DB::transaction(function () use ($validated, $request) {
            $subtotal  = 0;
            $lineItems = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if (! $product->is_available) {
                    throw new \Exception(
                        "Sorry, '{$product->name}' is currently unavailable."
                    );
                }

                $lineTotal  = $product->price * $item['quantity'];
                $subtotal  += $lineTotal;

                $lineItems[] = [
                    'product_id'    => $product->id,
                    'product_name'  => $product->name,
                    'price_at_time' => $product->price,
                    'quantity'      => $item['quantity'],
                    'subtotal'      => $lineTotal,
                ];
            }

            $tax   = round($subtotal * 0.12, 2);
            $total = round($subtotal + $tax, 2);

            $order = Order::create([
                'user_id'          => $request->user()->id,
                'subtotal'         => $subtotal,
                'tax'              => $tax,
                'total_amount'     => $total,
                'order_type'       => $validated['order_type'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'notes'            => $validated['notes'] ?? null,
                'payment_method'   => $validated['payment_method'],
                'payment_status'   => 'paid',
                'paid_at'          => now(),
                'status'           => 'pending',
            ]);

            $order->items()->createMany($lineItems);
            return $order;
        });

        $order->load('items', 'user');

        // 🔔 Fire webhook event
        $this->webhooks->dispatch('order.created', [
            'order_number'   => $order->order_number,
            'customer'       => $order->user->name,
            'customer_email' => $order->user->email,
            'total_amount'   => $order->total_amount,
            'order_type'     => $order->order_type,
            'status'         => $order->status,
            'items_count'    => $order->items->count(),
            'created_at'     => $order->created_at->toIso8601String(),
        ]);

        // ── Forward to n8n ──
        \Illuminate\Support\Facades\Http::post('http://localhost:5678/webhook/order', [
            'order_id'       => $order->id,
            'customer_name'  => $order->user->name,
            'customer_email' => $order->user->email,
            'total_amount'   => $order->total_amount,
            'items'          => $order->items,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Order {$order->order_number} placed successfully!",
            'data'    => new OrderResource($order),
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 422);
    }
}

    /*
    |------------------------------------------------------------------
    | GET /api/orders  (Customer)
    |------------------------------------------------------------------
    */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => OrderResource::collection($orders),
            'meta'    => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    /*
    |------------------------------------------------------------------
    | GET /api/orders/{order}  (Customer + Admin)
    |------------------------------------------------------------------
    */
    public function show(Request $request, Order $order): JsonResponse
    {
        if ($request->user()->isCustomer() &&
            $order->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $order->load('items.product', 'user');

        return response()->json([
            'success' => true,
            'data'    => new OrderResource($order),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | POST /api/orders/{order}/cancel  (Customer)
    |------------------------------------------------------------------
    */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        if (! $order->isCancellable()) {
            return response()->json([
                'success' => false,
                'message' => "This order cannot be cancelled because it is already '{$order->status}'.",
            ], 409);
        }

        $order->update(['status' => 'cancelled']);

        // 🔔 Fire webhook event
        $this->webhooks->dispatch('order.cancelled', [
            'order_number' => $order->order_number,
            'customer'     => $order->user->name,
            'total_amount' => $order->total_amount,
            'cancelled_at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Order {$order->order_number} has been cancelled.",
            'data'    => new OrderResource($order->fresh()->load('items')),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | GET /api/admin/orders  (Admin)
    |------------------------------------------------------------------
    */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Order::with('items', 'user')
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('order_number', 'like', '%' . $request->search . '%');
        }

        $orders = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => OrderResource::collection($orders),
            'meta'    => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    /*
    |------------------------------------------------------------------
    | PATCH /api/admin/orders/{order}/status  (Admin)
    |------------------------------------------------------------------
    */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => [
                'required',
                'in:pending,confirmed,preparing,ready,completed,cancelled',
            ],
        ]);

        $previousStatus = $order->status;
        $order->update(['status' => $validated['status']]);
        $order->load('user');

        // 🔔 Fire webhook event
        $this->webhooks->dispatch('order.status_updated', [
            'order_number'    => $order->order_number,
            'customer'        => $order->user->name,
            'customer_email'  => $order->user->email,
            'previous_status' => $previousStatus,
            'new_status'      => $validated['status'],
            'total_amount'    => $order->total_amount,
            'updated_at'      => now()->toIso8601String(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Order {$order->order_number} moved from '{$previousStatus}' to '{$validated['status']}'.",
            'data'    => new OrderResource(
                $order->fresh()->load('items', 'user')
            ),
        ]);
    }
}
