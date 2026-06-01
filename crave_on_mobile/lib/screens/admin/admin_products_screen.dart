import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../models/category.dart';
import '../../services/product_service.dart';
import '../../services/api_service.dart';
import '../../config/api_config.dart';

class AdminProductsScreen extends StatefulWidget {
  const AdminProductsScreen({super.key});

  @override
  State<AdminProductsScreen> createState() =>
      _AdminProductsScreenState();
}

class _AdminProductsScreenState
    extends State<AdminProductsScreen> {
  List<Product>  _products   = [];
  List<Category> _categories = [];
  bool           _loading    = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final cats = await ProductService.getCategories();
      final res  = await ApiService.get(
        ApiConfig.adminProducts,
        auth: true,
      );
      setState(() {
        _categories = cats;
        _products   = (res['data'] as List)
            .map((p) => Product.fromJson(p))
            .toList();
        _loading    = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _toggleAvailability(Product product) async {
    try {
      await ProductService.toggleAvailability(product.id);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '${product.name} availability updated',
          ),
          backgroundColor: const Color(0xFFD4820F),
        ),
      );
      _load();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  void _showEditDialog(Product product) {
    final nameCtrl  = TextEditingController(text: product.name);
    final priceCtrl = TextEditingController(
      text: product.price.toString(),
    );
    final descCtrl = TextEditingController(
      text: product.description ?? '',
    );
    int? selectedCategoryId = product.category?.id;

    showDialog(
      context: context,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title:   Text('Edit ${product.name}'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Product Name',
                    border:    OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller:   priceCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Price (₱)',
                    border:    OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<int>(
                  value: selectedCategoryId,
                  decoration: const InputDecoration(
                    labelText: 'Category',
                    border:    OutlineInputBorder(),
                  ),
                  items: _categories.map((cat) {
                    return DropdownMenuItem(
                      value: cat.id,
                      child: Text(
                        '${cat.icon ?? ''} ${cat.name}',
                      ),
                    );
                  }).toList(),
                  onChanged: (v) => setDialogState(
                    () => selectedCategoryId = v,
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  maxLines:   3,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    border:    OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child:     const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                try {
                  await ProductService.updateProduct(
                    product.id,
                    {
                      'name':        nameCtrl.text.trim(),
                      'price':       double.parse(priceCtrl.text),
                      'description': descCtrl.text.trim(),
                      if (selectedCategoryId != null)
                        'category_id': selectedCategoryId,
                    },
                  );
                  if (ctx.mounted) Navigator.pop(ctx);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content:         Text('Product updated!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                  _load();
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(e.toString())),
                    );
                  }
                }
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Products'),
        actions: [
          IconButton(
            icon:      const Icon(Icons.refresh),
            onPressed: _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFD4820F),
              ),
            )
          : _products.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
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
                  onRefresh: _load,
                  color:     const Color(0xFFD4820F),
                  child: ListView.builder(
                    padding:     const EdgeInsets.all(16),
                    itemCount:   _products.length,
                    itemBuilder: (_, i) {
                      final product = _products[i];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color:        Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(
                                alpha: 0.05,
                              ),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(12),

                          // ── Product Image ────────────
                          leading: ClipRRect(
                            borderRadius:
                                BorderRadius.circular(10),
                            child: SizedBox(
                              width:  56,
                              height: 56,
                              child: _ProductThumbnail(
                                imageUrl: product.imageUrl,
                              ),
                            ),
                          ),

                          // ── Product Name ─────────────
                          title: Text(
                            product.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),

                          // ── Price + Category ─────────
                          subtitle: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,
                            children: [
                              Text(
                                '₱${product.price.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  color:      Color(0xFFD4820F),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                '${product.category?.icon ?? '📦'} '
                                '${product.category?.name ?? ''}',
                                style: const TextStyle(
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),

                          // ── Toggle + Edit ────────────
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Switch(
                                value:    product.isAvailable,
                                onChanged: (_) =>
                                    _toggleAvailability(product),
                                activeThumbColor:
                                    const Color(0xFFD4820F),
                              ),
                              IconButton(
                                icon: const Icon(
                                  Icons.edit_outlined,
                                  color: Colors.grey,
                                ),
                                onPressed: () =>
                                    _showEditDialog(product),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}

// ── Product Thumbnail ─────────────────────────────────
// Handles image loading with fallback — no external packages
class _ProductThumbnail extends StatelessWidget {
  final String? imageUrl;

  const _ProductThumbnail({this.imageUrl});

  @override
  Widget build(BuildContext context) {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return Image.network(
        imageUrl!,
        fit:   BoxFit.cover,
        width: 56,
        height: 56,
        loadingBuilder: (_, child, progress) {
          if (progress == null) return child;
          return _fallback();
        },
        errorBuilder: (_, __, ___) => _fallback(),
      );
    }
    return _fallback();
  }

  Widget _fallback() {
    return Container(
      width:  56,
      height: 56,
      color:  const Color(0xFFFFF8E1),
      child: const Center(
        child: Text(
          '☕',
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}