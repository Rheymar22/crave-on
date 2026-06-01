import 'package:flutter/material.dart';
import '../models/cart_item.dart';
import '../models/product.dart';

class CartProvider extends ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items     => _items;
  int            get itemCount =>
      _items.fold(0, (sum, i) => sum + i.quantity);

  double get subtotal =>
      _items.fold(0, (sum, i) => sum + i.subtotal);
  double get tax   =>
      double.parse((subtotal * 0.12).toStringAsFixed(2));
  double get total => subtotal + tax;

  void addItem(Product product) {
    final index = _items.indexWhere(
      (i) => i.product.id == product.id,
    );
    if (index >= 0) {
      _items[index].quantity++;
    } else {
      _items.add(CartItem(product: product));
    }
    notifyListeners();
  }

  void removeItem(int productId) {
    _items.removeWhere((i) => i.product.id == productId);
    notifyListeners();
  }

  void updateQuantity(int productId, int quantity) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    final index = _items.indexWhere(
      (i) => i.product.id == productId,
    );
    if (index >= 0) {
      _items[index].quantity = quantity;
      notifyListeners();
    }
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}