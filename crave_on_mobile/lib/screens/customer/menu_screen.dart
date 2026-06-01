import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/product.dart';
import '../../models/category.dart';
import '../../services/product_service.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  List<Product>  _products         = [];
  List<Category> _categories       = [];
  bool           _loading          = true;
  String         _selectedCategory = 'all';
  String         _search           = '';
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final cats  = await ProductService.getCategories();
      final prods = await ProductService.getProducts(
        category: _selectedCategory,
        search:   _search,
      );
      setState(() {
        _categories = cats;
        _products   = prods['products'];
        _loading    = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  void _addToCart(Product product) {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please login to add items'),
        ),
      );
      return;
    }
    context.read<CartProvider>().addItem(product);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content:         Text('${product.name} added! ☕'),
        backgroundColor: const Color(0xFFD4820F),
        duration:        const Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Our Menu'),
        actions: [
          IconButton(
            icon:      const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: Column(
        children: [

          // ── Search Bar ───────────────────────────────
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText:   'Search menu...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _search.isNotEmpty
                    ? IconButton(
                        icon:      const Icon(Icons.clear),
                        onPressed: () {
                          _searchCtrl.clear();
                          setState(() => _search = '');
                          _loadData();
                        },
                      )
                    : null,
                filled:    true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide:  BorderSide.none,
                ),
              ),
              onSubmitted: (v) {
                setState(() => _search = v);
                _loadData();
              },
            ),
          ),

          // ── Category Filter Chips ────────────────────
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
              ),
              children: [
                _CategoryChip(
                  label:    'All',
                  icon:     '🍽️',
                  selected: _selectedCategory == 'all',
                  onTap: () {
                    setState(() => _selectedCategory = 'all');
                    _loadData();
                  },
                ),
                ..._categories.map((cat) => _CategoryChip(
                  label:    cat.name,
                  icon:     cat.icon ?? '☕',
                  selected: _selectedCategory == cat.slug,
                  onTap: () {
                    setState(() => _selectedCategory = cat.slug);
                    _loadData();
                  },
                )),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // ── Products Grid ────────────────────────────
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFFD4820F),
                    ),
                  )
                : _products.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisAlignment:
                              MainAxisAlignment.center,
                          children: [
                            Text(
                              '☕',
                              style: TextStyle(fontSize: 64),
                            ),
                            SizedBox(height: 12),
                            Text(
                              'No products found',
                              style: TextStyle(
                                color:    Colors.grey,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadData,
                        color:     const Color(0xFFD4820F),
                        child: GridView.builder(
                          padding: const EdgeInsets.all(12),
                          gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount:   2,
                              childAspectRatio: 0.75,
                              crossAxisSpacing: 12,
                              mainAxisSpacing:  12,
                            ),
                          itemCount:   _products.length,
                          itemBuilder: (_, i) => _ProductCard(
                            product:     _products[i],
                            onAddToCart: _addToCart,
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

// ── Category Chip ─────────────────────────────────────
class _CategoryChip extends StatelessWidget {
  final String       label;
  final String       icon;
  final bool         selected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 14, vertical: 8,
          ),
          decoration: BoxDecoration(
            color: selected
                ? const Color(0xFFD4820F)
                : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: selected
                  ? const Color(0xFFD4820F)
                  : Colors.grey.shade300,
            ),
          ),
          child: Text(
            '$icon $label',
            style: TextStyle(
              color: selected
                  ? Colors.white
                  : Colors.grey.shade700,
              fontSize:   13,
              fontWeight: selected
                  ? FontWeight.w600
                  : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}

// ── Product Card ──────────────────────────────────────
class _ProductCard extends StatelessWidget {
  final Product                product;
  final void Function(Product) onAddToCart;

  const _ProductCard({
    required this.product,
    required this.onAddToCart,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color:        Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color:      Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset:     const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          // ── Product Image ──────────────────────────
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: _ProductImage(imageUrl: product.imageUrl),
            ),
          ),

          // ── Product Details ────────────────────────
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize:   13,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '₱${product.price.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color:      Color(0xFFD4820F),
                        fontWeight: FontWeight.bold,
                        fontSize:   14,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => onAddToCart(product),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD4820F),
                          borderRadius:
                              BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.add,
                          color: Colors.white,
                          size:  16,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Product Image with Fallback ───────────────────────
class _ProductImage extends StatelessWidget {
  final String? imageUrl;

  const _ProductImage({this.imageUrl});

  @override
  Widget build(BuildContext context) {
    // Has a valid image URL — try to load it
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return Image.network(
        imageUrl!,
        fit:   BoxFit.cover,
        width: double.infinity,
        loadingBuilder: (_, child, progress) {
          if (progress == null) return child;
          // Show shimmer-like loading placeholder
          return Container(
            color: const Color(0xFFFFF8E1),
            child: const Center(
              child: CircularProgressIndicator(
                color:       Color(0xFFD4820F),
                strokeWidth: 2,
              ),
            ),
          );
        },
        errorBuilder: (_, __, ___) => _fallback(),
      );
    }
    // No image — show fallback
    return _fallback();
  }

  Widget _fallback() {
    return Container(
      width:  double.infinity,
      height: double.infinity,
      color:  const Color(0xFFFFF8E1),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Text(
            '☕',
            style: TextStyle(fontSize: 40),
          ),
        ],
      ),
    );
  }
}