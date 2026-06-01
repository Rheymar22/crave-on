import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../config/api_config.dart';
import 'admin_orders_screen.dart';
import 'admin_products_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() =>
      _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    _DashboardTab(),
    AdminOrdersScreen(),
    AdminProductsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index:    _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex:        _currentIndex,
        onDestinationSelected: (i) =>
            setState(() => _currentIndex = i),
        destinations: const [
          NavigationDestination(
            icon:         Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(
              Icons.dashboard,
              color: Color(0xFFD4820F),
            ),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon:         Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(
              Icons.receipt_long,
              color: Color(0xFFD4820F),
            ),
            label: 'Orders',
          ),
          NavigationDestination(
            icon:         Icon(Icons.coffee_outlined),
            selectedIcon: Icon(
              Icons.coffee,
              color: Color(0xFFD4820F),
            ),
            label: 'Products',
          ),
        ],
      ),
    );
  }
}

class _DashboardTab extends StatefulWidget {
  const _DashboardTab();

  @override
  State<_DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<_DashboardTab> {
  Map<String, dynamic>? _summary;
  List<dynamic>         _recentOrders = [];
  List<dynamic>         _topProducts  = [];
  bool                  _loading      = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.get(
        ApiConfig.adminAnalytics,
        auth:        true,
        queryParams: {'period': '30'},
      );
      setState(() {
        _summary      = res['data']['summary'];
        _recentOrders = res['data']['recent_orders'] ?? [];
        _topProducts  = res['data']['top_products']  ?? [];
        _loading      = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            icon:      const Icon(Icons.refresh),
            onPressed: _load,
          ),
          IconButton(
            icon:      const Icon(Icons.logout),
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFD4820F),
              ),
            )
          : RefreshIndicator(
              onRefresh: _load,
              color:     const Color(0xFFD4820F),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [

                    Text(
                      'Hello, ${auth.user?.name.split(' ').first}! 👋',
                      style: const TextStyle(
                        fontSize:   22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Text(
                      'Last 30 days overview',
                      style: TextStyle(color: Colors.grey),
                    ),

                    const SizedBox(height: 16),

                    // Stats grid
                    GridView.count(
                      crossAxisCount:   2,
                      shrinkWrap:       true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing:  12,
                      childAspectRatio: 1.4,
                      children: [
                        _StatCard(
                          title: 'Revenue',
                          value: '₱${((_summary?['total_revenue'] ?? 0) as num).toStringAsFixed(0)}',
                          icon:  Icons.trending_up,
                          color: const Color(0xFFD4820F),
                        ),
                        _StatCard(
                          title: 'Orders',
                          value: '${_summary?['total_orders'] ?? 0}',
                          icon:  Icons.receipt_long,
                          color: Colors.blue,
                        ),
                        _StatCard(
                          title: 'Customers',
                          value: '${_summary?['total_customers'] ?? 0}',
                          icon:  Icons.people,
                          color: Colors.green,
                        ),
                        _StatCard(
                          title: 'Active',
                          value: '${_summary?['active_orders'] ?? 0}',
                          icon:  Icons.pending_actions,
                          color: Colors.orange,
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Top products
                    const Text(
                      'Top Products',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize:   16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color:        Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: _topProducts.isEmpty
                          ? const Padding(
                              padding: EdgeInsets.all(16),
                              child: Text(
                                'No data yet',
                                style: TextStyle(color: Colors.grey),
                              ),
                            )
                          : Column(
                              children: _topProducts
                                  .asMap()
                                  .entries
                                  .map((e) {
                                final i = e.key;
                                final p = e.value;
                                return ListTile(
                                  leading: CircleAvatar(
                                    backgroundColor:
                                        const Color(0xFFD4820F)
                                            .withValues(alpha: 0.1),
                                    child: Text(
                                      '${i + 1}',
                                      style: const TextStyle(
                                        color:      Color(0xFFD4820F),
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  title: Text(
                                    p['product_name'] ?? '',
                                  ),
                                  subtitle: Text(
                                    '${p['total_sold']} sold',
                                  ),
                                  trailing: Text(
                                    '₱${(p['total_revenue'] as num).toStringAsFixed(0)}',
                                    style: const TextStyle(
                                      color:      Color(0xFFD4820F),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                    ),

                    const SizedBox(height: 20),

                    // Recent orders
                    const Text(
                      'Recent Orders',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize:   16,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color:        Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: _recentOrders.isEmpty
                          ? const Padding(
                              padding: EdgeInsets.all(16),
                              child: Text(
                                'No orders yet',
                                style: TextStyle(color: Colors.grey),
                              ),
                            )
                          : Column(
                              children: _recentOrders.map((o) {
                                final statusColors = {
                                  'pending':   Colors.orange,
                                  'confirmed': Colors.blue,
                                  'preparing': Colors.blue,
                                  'ready':     Colors.green,
                                  'completed': Colors.green,
                                  'cancelled': Colors.red,
                                };
                                return ListTile(
                                  title: Text(
                                    o['order_number'] ?? '',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize:   13,
                                    ),
                                  ),
                                  subtitle: Text(
                                    o['customer'] ?? '',
                                  ),
                                  trailing: Column(
                                    mainAxisAlignment:
                                        MainAxisAlignment.center,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        '₱${(o['total'] as num).toStringAsFixed(2)}',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFFD4820F),
                                        ),
                                      ),
                                      Container(
                                        padding:
                                            const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical:   2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: (statusColors[
                                                      o['status']] ??
                                                  Colors.grey)
                                              .withValues(alpha: 0.1),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          o['status'] ?? '',
                                          style: TextStyle(
                                            color: statusColors[
                                                    o['status']] ??
                                                Colors.grey,
                                            fontSize: 10,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String   title;
  final String   value;
  final IconData icon;
  final Color    color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

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
          Icon(icon, color: color, size: 28),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontSize:   22,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: const TextStyle(
              color:    Colors.grey,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}