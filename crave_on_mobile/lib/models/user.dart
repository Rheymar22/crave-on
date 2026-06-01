class User {
  final int     id;
  final String  name;
  final String  email;
  final String  role;
  final String? phone;
  final String? address;
  final String? avatar;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.address,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id:      json['id'],
      name:    json['name'],
      email:   json['email'],
      role:    json['role'],
      phone:   json['phone'],
      address: json['address'],
      avatar:  json['avatar'],
    );
  }

  bool get isAdmin    => role == 'admin';
  bool get isCustomer => role == 'customer';
}