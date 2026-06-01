import 'package:flutter/material.dart';
import '../../models/order.dart';
import '../../services/order_service.dart';

class AdminOrdersScreen extends StatefulWidget {
  const AdminOrdersScreen({super.key});

  @override
  State<AdminOrdersScreen> createState() =>
      _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends State<AdminOrdersScreen> {
  List<Order> _orders       = [];
  bool        _loading      = true;
  String      _filterStatus = 'all';
  int?        _updatingOrder;

  final _statuses = [
    'all', 'pending', 'confirmed',
    'preparing', 'ready', 'completed', 'cancelled',
  ];

  final _nextStatus = {
    'pending':   'confirmed',
    'confirmed': 'preparing',
    'preparing': 'ready',
    'ready':     'completed',
  };

  final _actionLabels = {
    'pending':   'Confirm Order',
    'confirmed': 'Start Preparing',
    'preparing': 'Mark Ready',
    'ready':     'Complete Order',
  };

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => _loading = true);
    try {
      final orders = await OrderService.getAllOrders(
        status: _filterStatus == 'all' ? null : _filterStatus,
      );
      setState(() {
        _orders  = orders;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _updateStatus(Order order, String status) async {
    setState(() => _updatingOrder = order.id);
    try {
      await OrderService.updateOrderStatus(order.id, status);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '${order.orderNumber} → $status',
          ),
          backgroundColor: const Color(0xFFD4820F),
        ),
      );
      _loadOrders();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    } finally {
      setState(() => _updatingOrder = null);
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'pending':   return Colors.orange;
      case 'confirmed': return Colors.blue;
      case 'preparing': return Colors.blue;
      case 'ready':     return Colors.green;
      case 'completed': return Colors.green;
      case 'cancelled': return Colors.red;
      default:          return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Orders'),
        actions: [
          IconButton(
            icon:      const Icon(Icons.refresh),
            onPressed: _loadOrders,
          ),
        ],
      ),
      body: Column(
        children: [

          // Status filter chips
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(
                horizontal: 16, vertical: 8,
              ),
              children: _statuses.map((s) {
                final selected = _filterStatus == s;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(s.toUpperCase()),
                    selected: selected,
                    selectedColor: const Color(0xFFD4820F),
                    labelStyle: TextStyle(
                      color: selected
                          ? Colors.white
                          : Colors.grey,
                      fontSize: 11,
                    ),
                    onSelected: (_) {
                      setState(() => _filterStatus = s);
                      _loadOrders();
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFFD4820F),
                    ),
                  )
                : _orders.isEmpty
                    ? const Center(
                        child: Text('No orders found'),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadOrders,
                        color:     const Color(0xFFD4820F),
                        child: ListView.builder(
                          padding:     const EdgeInsets.all(16),
                          itemCount:   _orders.length,
                          itemBuilder: (_, i) {
                            final order       = _orders[i];
                            final next        = _nextStatus[order.status];
                            final isUpdating  = _updatingOrder == order.id;

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius:
                                    BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black
                                        .withValues(alpha: 0.05),
                                    blurRadius: 8,
                                  ),
                                ],
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            order.orderNumber,
                                            style: const TextStyle(
                                              fontWeight:
                                                  FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        Container(
                                          padding:
                                              const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical:   4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: _statusColor(
                                                    order.status)
                                                .withValues(alpha: 0.1),
                                            borderRadius:
                                                BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            order.status.toUpperCase(),
                                            style: TextStyle(
                                              color: _statusColor(
                                                order.status,
                                              ),
                                              fontSize:   11,
                                              fontWeight:
                                                  FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),

                                    const SizedBox(height: 8),

                                    ...order.items.map((item) => Text(
                                      '• ${item.productName} × ${item.quantity}',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color:    Colors.grey,
                                      ),
                                    )),

                                    const SizedBox(height: 8),

                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment
                                              .spaceBetween,
                                      children: [
                                        Text(
                                          '₱${order.totalAmount.toStringAsFixed(2)}',
                                          style: const TextStyle(
                                            color:      Color(0xFFD4820F),
                                            fontWeight: FontWeight.bold,
                                            fontSize:   16,
                                          ),
                                        ),
                                        Text(
                                          order.orderType == 'pickup'
                                              ? '🏪 Pickup'
                                              : '🛵 Delivery',
                                        ),
                                      ],
                                    ),

                                    if (next != null) ...[
                                      const SizedBox(height: 12),
                                      SizedBox(
                                        width: double.infinity,
                                        child: ElevatedButton(
                                          onPressed: isUpdating
                                              ? null
                                              : () => _updateStatus(
                                                  order, next),
                                          child: isUpdating
                                              ? const SizedBox(
                                                  height: 16,
                                                  width:  16,
                                                  child:
                                                      CircularProgressIndicator(
                                                    color:
                                                        Colors.white,
                                                    strokeWidth: 2,
                                                  ),
                                                )
                                              : Text(
                                                  _actionLabels[
                                                          order.status] ??
                                                      'Update',
                                                ),
                                        ),
                                      ),
                                    ],

                                    if (order.isCancellable) ...[
                                      const SizedBox(height: 8),
                                      SizedBox(
                                        width: double.infinity,
                                        child: OutlinedButton(
                                          onPressed: () =>
                                              _updateStatus(
                                            order,
                                            'cancelled',
                                          ),
                                          style:
                                              OutlinedButton.styleFrom(
                                            foregroundColor: Colors.red,
                                            side: const BorderSide(
                                              color: Colors.red,
                                            ),
                                          ),
                                          child: const Text(
                                            'Cancel Order',
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}