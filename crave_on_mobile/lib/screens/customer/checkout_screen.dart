import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/cart_provider.dart';
import '../../services/order_service.dart';
import '../../models/order.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _orderType     = 'pickup';
  String _paymentMethod = 'cash';
  bool   _loading       = false;
  Order? _placedOrder;

  final _addressCtrl = TextEditingController();
  final _notesCtrl   = TextEditingController();

  final _paymentMethods = [
    {'id': 'cash',  'label': 'Cash',  'icon': '💵'},
    {'id': 'card',  'label': 'Card',  'icon': '💳'},
    {'id': 'gcash', 'label': 'GCash', 'icon': '📱'},
    {'id': 'maya',  'label': 'Maya',  'icon': '💜'},
  ];

  @override
  void dispose() {
    _addressCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    final cart = context.read<CartProvider>();

    if (_orderType == 'delivery' &&
        _addressCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter delivery address'),
        ),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      final order = await OrderService.placeOrder(
        items:           cart.items,
        orderType:       _orderType,
        paymentMethod:   _paymentMethod,
        deliveryAddress: _orderType == 'delivery'
            ? _addressCtrl.text.trim()
            : null,
        notes: _notesCtrl.text.trim().isEmpty
            ? null
            : _notesCtrl.text.trim(),
      );

      cart.clearCart();
      setState(() {
        _placedOrder = order;
        _loading     = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:         Text(e.toString()),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    // Success screen
    if (_placedOrder != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF3C1F0E),
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.check_circle,
                    color: Colors.green,
                    size:  80,
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Order Placed!',
                    style: TextStyle(
                      color:      Colors.white,
                      fontSize:   28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD4820F).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: const Color(0xFFD4820F),
                      ),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'Order Number',
                          style: TextStyle(color: Colors.white70),
                        ),
                        Text(
                          _placedOrder!.orderNumber,
                          style: const TextStyle(
                            color:      Color(0xFFD4820F),
                            fontSize:   22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.popUntil(
                        context,
                        (r) => r.isFirst,
                      ),
                      child: const Text('Back to Menu'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // Order type
            _SectionCard(
              title: 'Order Type',
              child: Row(
                children: [
                  Expanded(
                    child: _TypeOption(
                      label:    'Pickup',
                      icon:     '🏪',
                      selected: _orderType == 'pickup',
                      onTap: () =>
                          setState(() => _orderType = 'pickup'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _TypeOption(
                      label:    'Delivery',
                      icon:     '🛵',
                      selected: _orderType == 'delivery',
                      onTap: () =>
                          setState(() => _orderType = 'delivery'),
                    ),
                  ),
                ],
              ),
            ),

            if (_orderType == 'delivery') ...[
              const SizedBox(height: 12),
              _SectionCard(
                title: 'Delivery Address',
                child: TextField(
                  controller: _addressCtrl,
                  maxLines:   3,
                  decoration: const InputDecoration(
                    hintText: 'Enter full delivery address...',
                    border: OutlineInputBorder(
                      borderRadius:
                          BorderRadius.all(Radius.circular(10)),
                    ),
                  ),
                ),
              ),
            ],

            const SizedBox(height: 12),

            // Payment method
            _SectionCard(
              title: 'Payment Method',
              child: Column(
                children: _paymentMethods.map((m) {
                  final selected = _paymentMethod == m['id'];
                  return GestureDetector(
                    onTap: () => setState(
                      () => _paymentMethod = m['id']!,
                    ),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: selected
                            ? const Color(0xFFD4820F).withValues(alpha: 0.1)
                            : Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: selected
                              ? const Color(0xFFD4820F)
                              : Colors.grey.shade300,
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(
                            m['icon']!,
                            style: const TextStyle(fontSize: 20),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            m['label']!,
                            style: const TextStyle(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const Spacer(),
                          if (selected)
                            const Icon(
                              Icons.check_circle,
                              color: Color(0xFFD4820F),
                            ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 12),

            // Notes
            _SectionCard(
              title: 'Special Instructions (optional)',
              child: TextField(
                controller: _notesCtrl,
                maxLines:   2,
                decoration: const InputDecoration(
                  hintText: 'e.g. Less ice, extra shot...',
                  border: OutlineInputBorder(
                    borderRadius:
                        BorderRadius.all(Radius.circular(10)),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Order summary
            _SectionCard(
              title: 'Order Summary',
              child: Column(
                children: [
                  ...cart.items.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment:
                          MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${item.product.name} × ${item.quantity}',
                            style: const TextStyle(fontSize: 13),
                          ),
                        ),
                        Text(
                          '₱${item.subtotal.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  )),
                  const Divider(),
                  Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Tax (12%)'),
                      Text('₱${cart.tax.toStringAsFixed(2)}'),
                    ],
                  ),
                  const Divider(),
                  Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Total',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '₱${cart.total.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color:      Color(0xFFD4820F),
                          fontWeight: FontWeight.bold,
                          fontSize:   16,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _placeOrder,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _loading
                    ? const CircularProgressIndicator(
                        color: Colors.white,
                      )
                    : const Text(
                        'Place Order',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;

  const _SectionCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color:        Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color:      Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize:   14,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _TypeOption extends StatelessWidget {
  final String       label;
  final String       icon;
  final bool         selected;
  final VoidCallback onTap;

  const _TypeOption({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected
              ? const Color(0xFFD4820F).withValues(alpha: 0.1)
              : Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected
                ? const Color(0xFFD4820F)
                : Colors.grey.shade300,
          ),
        ),
        child: Column(
          children: [
            Text(icon, style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }
}