import 'api_service.dart';
import '../config/api_config.dart';
import '../models/user.dart';

class AuthService {
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await ApiService.post(
      ApiConfig.login,
      {'email': email, 'password': password},
    );
    final token = response['data']['token'];
    final user  = User.fromJson(response['data']['user']);
    await ApiService.saveToken(token);
    return {'user': user, 'token': token};
  }

  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String?         phone,
  }) async {
    final response = await ApiService.post(
      ApiConfig.register,
      {
        'name':                  name,
        'email':                 email,
        'password':              password,
        'password_confirmation': passwordConfirmation,
        if (phone != null) 'phone': phone,
      },
    );
    final token = response['data']['token'];
    final user  = User.fromJson(response['data']['user']);
    await ApiService.saveToken(token);
    return {'user': user, 'token': token};
  }

  static Future<void> logout() async {
    try {
      await ApiService.post(ApiConfig.logout, {}, auth: true);
    } catch (_) {}
    await ApiService.deleteToken();
  }

  static Future<User?> getCurrentUser() async {
    try {
      final response = await ApiService.get(
        ApiConfig.me,
        auth: true,
      );
      return User.fromJson(response['data']);
    } catch (_) {
      return null;
    }
  }

  static Future<User> updateProfile({
    required String name,
    String?         phone,
    String?         address,
  }) async {
    final response = await ApiService.put(
      ApiConfig.profile,
      {
        'name': name,
        if (phone   != null) 'phone':   phone,
        if (address != null) 'address': address,
      },
      auth: true,
    );
    return User.fromJson(response['data']);
  }
}