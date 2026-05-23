<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /*
    |------------------------------------------------------------------
    | POST /api/orders  (Customer)
    | Place a new order — wrapped in DB transaction
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

                    // Check availability before accepting order
                    if (! $product->is_available) {
                        throw new \Exception(
                            "Sorry, '{$product->name}' is currently unavailable."
                        );
                    }

                    $lineTotal  = $product->price * $item['quantity'];
                    $subtotal  += $lineTotal;

                    $lineItems[] = [
                        'product_id'    => $product->id,
                        'product_name'  => $product->name,      // price snapshot
                        'price_at_time' => $product->price,     // price snapshot
                        'quantity'      => $item['quantity'],
                        'subtotal'      => $lineTotal,
                    ];
                }

                // 12% VAT
                $tax   = round($subtotal * 0.12, 2);
                $total = round($subtotal + $tax, 2);

                // Create the order record
                $order = Order::create([
                    'user_id'          => $request->user()->id,
                    'subtotal'         => $subtotal,
                    'tax'              => $tax,
                    'total_amount'     => $total,
                    'order_type'       => $validated['order_type'],
                    'delivery_address' => $validated['delivery_address'] ?? null,
                    'notes'            => $validated['notes'] ?? null,
                    'payment_method'   => $validated['payment_method'],
                    'payment_status'   => 'paid',   // mock instant payment
                    'paid_at'          => now(),
                    'status'           => 'pending',
                ]);

                // Create all line items at once
                $order->items()->createMany($lineItems);

                return $order;
            });

            $order->load('items');

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
    | Customer's own order history — newest first
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
    | Single order detail
    |------------------------------------------------------------------
    */
    public function show(Request $request, Order $order): JsonResponse
    {
        // Customers can only view their own orders
        if ($request->user()->isCustomer() && $order->user_id !== $request->user()->id) {
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
    | Cancel only if still in pending or confirmed state
    |------------------------------------------------------------------
    */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        // Only owner can cancel
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

        return response()->json([
            'success' => true,
            'message' => "Order {$order->order_number} has been cancelled.",
            'data'    => new OrderResource($order->fresh()->load('items')),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | GET /api/admin/orders  (Admin)
    | All orders with optional status filter
    | Supports: ?status=pending  ?search=ORD-  ?per_page=15
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

        $orders = $query->paginate($request->get('per_page', 15));

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
    | Move order through the lifecycle
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

        return response()->json([
            'success' => true,
            'message' => "Order {$order->order_number} moved from '{$previousStatus}' to '{$validated['status']}'.",
            'data'    => new OrderResource($order->fresh()->load('items', 'user')),
        ]);
    }
}
