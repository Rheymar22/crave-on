import 'category.dart';

class Product {
  final int       id;
  final String    name;
  final String    slug;
  final String?   description;
  final double    price;
  final String?   imageUrl;
  final bool      isAvailable;
  final int       stock;
  final Category? category;

  Product({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    required this.price,
    this.imageUrl,
    required this.isAvailable,
    required this.stock,
    this.category,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id:          json['id'],
      name:        json['name'],
      slug:        json['slug'],
      description: json['description'],
      price:       (json['price'] as num).toDouble(),
      imageUrl:    json['image_url'],
      isAvailable: json['is_available'] ?? true,
      stock:       json['stock'] ?? 0,
      category:    json['category'] != null
          ? Category.fromJson(json['category'])
          : null,
    );
  }
}