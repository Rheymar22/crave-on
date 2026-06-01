class ApiConfig {
  // For Flutter Web — use localhost directly
  static const String baseUrl = 'http://localhost:8000/api';

  static const String login          = '/auth/login';
  static const String register       = '/auth/register';
  static const String logout         = '/auth/logout';
  static const String me             = '/auth/me';
  static const String profile        = '/auth/profile';
  static const String products       = '/products';
  static const String categories     = '/categories';
  static const String orders         = '/orders';
  static const String adminProducts  = '/admin/products';
  static const String adminOrders    = '/admin/orders';
  static const String adminAnalytics = '/admin/analytics';
}