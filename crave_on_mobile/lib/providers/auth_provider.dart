import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool  _isLoading     = false;
  bool  _isInitialized = false;

  User? get user            => _user;
  bool  get isLoading       => _isLoading;
  bool  get isAuthenticated => _user != null;
  bool  get isInitialized   => _isInitialized;
  bool  get isAdmin         => _user?.isAdmin ?? false;

  Future<void> initialize() async {
    final token = await ApiService.getToken();
    if (token != null) {
      _user = await AuthService.getCurrentUser();
    }
    _isInitialized = true;
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final result = await AuthService.login(
        email:    email,
        password: password,
      );
      _user      = result['user'];
      _isLoading = false;
      notifyListeners();
      return null;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return e.toString();
    }
  }

  Future<String?> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
    String?         phone,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final result = await AuthService.register(
        name:                 name,
        email:                email,
        password:             password,
        passwordConfirmation: passwordConfirmation,
        phone:                phone,
      );
      _user      = result['user'];
      _isLoading = false;
      notifyListeners();
      return null;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return e.toString();
    }
  }

  Future<void> logout() async {
    await AuthService.logout();
    _user = null;
    notifyListeners();
  }

  void updateUser(User user) {
    _user = user;
    notifyListeners();
  }
}