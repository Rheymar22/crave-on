import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class ApiService {
  static const _tokenKey = 'craveon_token';

  // ── Token management ──────────────────────────────────
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<void> deleteToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  // ── Build headers ─────────────────────────────────────
  static Future<Map<String, String>> _headers({
    bool auth = false,
  }) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    };
    if (auth) {
      final token = await getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  // ── GET ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> get(
    String endpoint, {
    bool                  auth         = false,
    Map<String, String>?  queryParams,
  }) async {
    var uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    if (queryParams != null) {
      uri = uri.replace(queryParameters: queryParams);
    }
    final response = await http.get(
      uri,
      headers: await _headers(auth: auth),
    );
    return _handleResponse(response);
  }

  // ── POST ──────────────────────────────────────────────
  static Future<Map<String, dynamic>> post(
    String               endpoint,
    Map<String, dynamic> body, {
    bool auth = false,
  }) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: await _headers(auth: auth),
      body:    json.encode(body),
    );
    return _handleResponse(response);
  }

  // ── PUT ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> put(
    String               endpoint,
    Map<String, dynamic> body, {
    bool auth = false,
  }) async {
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: await _headers(auth: auth),
      body:    json.encode(body),
    );
    return _handleResponse(response);
  }

  // ── PATCH ─────────────────────────────────────────────
  static Future<Map<String, dynamic>> patch(
    String               endpoint,
    Map<String, dynamic> body, {
    bool auth = false,
  }) async {
    final response = await http.patch(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: await _headers(auth: auth),
      body:    json.encode(body),
    );
    return _handleResponse(response);
  }

  // ── DELETE ────────────────────────────────────────────
  static Future<Map<String, dynamic>> delete(
    String endpoint, {
    bool auth = false,
  }) async {
    final response = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: await _headers(auth: auth),
    );
    return _handleResponse(response);
  }

  // ── Handle Response ───────────────────────────────────
  static Map<String, dynamic> _handleResponse(
    http.Response response,
  ) {
    final decoded = json.decode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }
    throw ApiException(
      message:    decoded['message'] ?? 'An error occurred',
      statusCode: response.statusCode,
      errors:     decoded['errors'],
    );
  }
}

class ApiException implements Exception {
  final String  message;
  final int     statusCode;
  final dynamic errors;

  ApiException({
    required this.message,
    required this.statusCode,
    this.errors,
  });

  @override
  String toString() => message;
}