import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/auth_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameCtrl    = TextEditingController();
  final _phoneCtrl   = TextEditingController();
  final _addressCtrl = TextEditingController();
  bool  _loading     = false;

  @override
  void initState() {
    super.initState();
    final user        = context.read<AuthProvider>().user;
    _nameCtrl.text    = user?.name    ?? '';
    _phoneCtrl.text   = user?.phone   ?? '';
    _addressCtrl.text = user?.address ?? '';
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _loading = true);
    try {
      final updated = await AuthService.updateProfile(
        name:    _nameCtrl.text.trim(),
        phone:   _phoneCtrl.text.trim().isEmpty
            ? null
            : _phoneCtrl.text.trim(),
        address: _addressCtrl.text.trim().isEmpty
            ? null
            : _addressCtrl.text.trim(),
      );
      context.read<AuthProvider>().updateUser(updated);
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content:         Text('Profile updated!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [

            // User info header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color:        const Color(0xFF3C1F0E),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius:          30,
                    backgroundColor: const Color(0xFFD4820F),
                    child: Text(
                      user?.name.substring(0, 1).toUpperCase() ?? 'U',
                      style: const TextStyle(
                        color:      Colors.white,
                        fontSize:   24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? '',
                          style: const TextStyle(
                            color:      Colors.white,
                            fontSize:   18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          user?.email ?? '',
                          style: const TextStyle(
                            color:    Colors.white60,
                            fontSize: 13,
                          ),
                        ),
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFFD4820F),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            user?.role.toUpperCase() ?? '',
                            style: const TextStyle(
                              color:    Colors.white,
                              fontSize: 10,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Edit form
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color:        Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Edit Profile',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize:   16,
                    ),
                  ),
                  const SizedBox(height: 16),

                  _buildField(
                    controller: _nameCtrl,
                    label:      'Full Name',
                    icon:       Icons.person_outlined,
                  ),
                  const SizedBox(height: 12),

                  // Email read-only
                  TextFormField(
                    initialValue: user?.email,
                    readOnly:     true,
                    decoration: InputDecoration(
                      labelText:  'Email (read only)',
                      prefixIcon: const Icon(Icons.email_outlined),
                      filled:     true,
                      fillColor:  Colors.grey.shade100,
                      border: const OutlineInputBorder(
                        borderRadius:
                            BorderRadius.all(Radius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  _buildField(
                    controller:   _phoneCtrl,
                    label:        'Phone Number',
                    icon:         Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _addressCtrl,
                    maxLines:   3,
                    decoration: const InputDecoration(
                      labelText:  'Delivery Address',
                      prefixIcon: Icon(Icons.location_on_outlined),
                      alignLabelWithHint: true,
                      border: OutlineInputBorder(
                        borderRadius:
                            BorderRadius.all(Radius.circular(12)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _save,
                      child: _loading
                          ? const CircularProgressIndicator(
                              color: Colors.white,
                            )
                          : const Text('Save Changes'),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Logout button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => auth.logout(),
                icon:  const Icon(Icons.logout, color: Colors.red),
                label: const Text(
                  'Logout',
                  style: TextStyle(color: Colors.red),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String                label,
    required IconData              icon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller:   controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText:  label,
        prefixIcon: Icon(icon),
        border: const OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
      ),
    );
  }
}