import 'api_service.dart';
import '../config/api_config.dart';
import '../models/product.dart';
import '../models/category.dart';

class ProductService {
  static Future<List<Category>> getCategories() async {
    final response = await ApiService.get(ApiConfig.categories);
    return (response['data'] as List)
        .map((c) => Category.fromJson(c))
        .toList();
  }

  static Future<Map<String, dynamic>> getProducts({
    String? category,
    String? search,
    int     perPage = 12,
    int     page    = 1,
  }) async {
    final params = <String, String>{
      'per_page': perPage.toString(),
      'page':     page.toString(),
    };
    if (category != null && category != 'all') {
      params['category'] = category;
    }
    if (search != null && search.isNotEmpty) {
      params['search'] = search;
    }
    final response = await ApiService.get(
      ApiConfig.products,
      queryParams: params,
    );
    return {
      'products': (response['data'] as List)
          .map((p) => Product.fromJson(p))
          .toList(),
      'meta': response['meta'],
    };
  }

  static Future<void> toggleAvailability(int productId) async {
    await ApiService.patch(
      '${ApiConfig.adminProducts}/$productId/toggle',
      {},
      auth: true,
    );
  }

  static Future<Product> updateProduct(
    int                  productId,
    Map<String, dynamic> data,
  ) async {
    final response = await ApiService.put(
      '${ApiConfig.adminProducts}/$productId',
      data,
      auth: true,
    );
    return Product.fromJson(response['data']);
  }
}