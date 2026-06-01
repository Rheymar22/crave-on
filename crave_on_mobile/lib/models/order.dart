class OrderItem {
  final int    id;
  final String productName;
  final double priceAtTime;
  final int    quantity;
  final double subtotal;

  OrderItem({
    required this.id,
    required this.productName,
    required this.priceAtTime,
    required this.quantity,
    required this.subtotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id:           json['id'],
      productName:  json['product_name'],
      priceAtTime:  (json['price_at_time'] as num).toDouble(),
      quantity:     json['quantity'],
      subtotal:     (json['subtotal'] as num).toDouble(),
    );
  }
}

class Order {
  final int            id;
  final String         orderNumber;
  final String         status;
  final double         subtotal;
  final double         tax;
  final double         totalAmount;
  final String         orderType;
  final String?        deliveryAddress;
  final String?        notes;
  final String         paymentStatus;
  final String?        paymentMethod;
  final bool           isCancellable;
  final List<OrderItem> items;
  final String         createdAt;

  Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.subtotal,
    required this.tax,
    required this.totalAmount,
    required this.orderType,
    this.deliveryAddress,
    this.notes,
    required this.paymentStatus,
    this.paymentMethod,
    required this.isCancellable,
    required this.items,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id:              json['id'],
      orderNumber:     json['order_number'],
      status:          json['status'],
      subtotal:        (json['subtotal'] as num).toDouble(),
      tax:             (json['tax'] as num).toDouble(),
      totalAmount:     (json['total_amount'] as num).toDouble(),
      orderType:       json['order_type'],
      deliveryAddress: json['delivery_address'],
      notes:           json['notes'],
      paymentStatus:   json['payment_status'],
      paymentMethod:   json['payment_method'],
      isCancellable:   json['is_cancellable'] ?? false,
      items:           (json['items'] as List? ?? [])
          .map((i) => OrderItem.fromJson(i))
          .toList(),
      createdAt:       json['created_at'],
    );
  }
}