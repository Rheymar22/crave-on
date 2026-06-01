import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/cart_provider.dart';
import 'menu_screen.dart';
import 'cart_screen.dart';
import 'orders_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  // The 4 main screens matching the 4 navigation items below
  final List<Widget> _screens = [
    const MenuScreen(),
    const CartScreen(),
    const OrdersScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) =>
            setState(() => _currentIndex = index),
        backgroundColor: Colors.white,
        indicatorColor: const Color(0xFFD4820F).withValues(alpha: 0.2),
        destinations: [
          // 1. MENU (Now using the Coffee Icon)
          const NavigationDestination(
            icon: Icon(Icons.coffee_outlined),
            selectedIcon: Icon(
              Icons.coffee,
              color: Color(0xFFD4820F),
            ),
            label: 'Menu',
          ),
          
          // 2. CART
          NavigationDestination(
            icon: Badge(
              label: Text('${cart.itemCount}'),
              isLabelVisible: cart.itemCount > 0,
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            selectedIcon: Badge(
              label: Text('${cart.itemCount}'),
              isLabelVisible: cart.itemCount > 0,
              child: const Icon(
                Icons.shopping_cart,
                color: Color(0xFFD4820F),
              ),
            ),
            label: 'Cart',
          ),
          
          // 3. ORDERS
          const NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(
              Icons.receipt_long,
              color: Color(0xFFD4820F),
            ),
            label: 'Orders',
          ),
          
          // 4. PROFILE
          const NavigationDestination(
            icon: Icon(Icons.person_outlined),
            selectedIcon: Icon(
              Icons.person,
              color: Color(0xFFD4820F),
            ),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}