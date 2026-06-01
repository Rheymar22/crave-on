import 'api_service.dart';
import '../config/api_config.dart';
import '../models/order.dart';
import '../models/cart_item.dart';

class OrderService {
  static Future<Order> placeOrder({
    required List<CartItem> items,
    required String         orderType,
    required String         paymentMethod,
    String?                 deliveryAddress,
    String?                 notes,
  }) async {
    final response = await ApiService.post(
      ApiConfig.orders,
      {
        'items': items.map((i) => {
          'product_id': i.product.id,
          'quantity':   i.quantity,
        }).toList(),
        'order_type':     orderType,
        'payment_method': paymentMethod,
        if (deliveryAddress != null)
          'delivery_address': deliveryAddress,
        if (notes != null) 'notes': notes,
      },
      auth: true,
    );
    return Order.fromJson(response['data']);
  }

  static Future<List<Order>> getMyOrders() async {
    final response = await ApiService.get(
      ApiConfig.orders,
      auth: true,
    );
    return (response['data'] as List)
        .map((o) => Order.fromJson(o))
        .toList();
  }

  static Future<void> cancelOrder(int orderId) async {
    await ApiService.post(
      '${ApiConfig.orders}/$orderId/cancel',
      {},
      auth: true,
    );
  }

  static Future<List<Order>> getAllOrders({String? status}) async {
    final params = <String, String>{};
    if (status != null && status != 'all') {
      params['status'] = status;
    }
    final response = await ApiService.get(
      ApiConfig.adminOrders,
      auth:        true,
      queryParams: params,
    );
    return (response['data'] as List)
        .map((o) => Order.fromJson(o))
        .toList();
  }

  static Future<Order> updateOrderStatus(
    int    orderId,
    String status,
  ) async {
    final response = await ApiService.patch(
      '${ApiConfig.adminOrders}/$orderId/status',
      {'status': status},
      auth: true,
    );
    return Order.fromJson(response['data']);
  }
}