import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coffee, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    name:                  '',
    email:                 '',
    phone:                 '',
    password:              '',
    password_confirmation: '',
  });
  const [errors,      setErrors]      = useState({});
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim())
      newErrors.name = 'Full name is required.';

    if (!form.email)
      newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Please enter a valid email.';

    if (!form.password)
      newErrors.password = 'Password is required.';
    else if (form.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters.';

    if (!form.password_confirmation)
      newErrors.password_confirmation = 'Please confirm your password.';
    else if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = 'Passwords do not match.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await register(form);

    if (result.success) {
      toast.success(`Welcome to Crave On, ${result.user.name.split(' ')[0]}! ☕`);
      navigate('/menu', { replace: true });
    } else {
      // Map Laravel validation errors to fields
      if (result.errors && Object.keys(result.errors).length > 0) {
        const mapped = {};
        Object.entries(result.errors).forEach(([key, messages]) => {
          mapped[key] = messages[0];
        });
        setErrors(mapped);
      }
      toast.error(result.message || 'Registration failed.');
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)  return { label: 'Weak',   color: 'bg-red-400',    width: 'w-1/4' };
    if (p.length < 8)  return { label: 'Fair',   color: 'bg-yellow-400', width: 'w-2/4' };
    if (p.length < 12) return { label: 'Good',   color: 'bg-blue-400',   width: 'w-3/4' };
    return               { label: 'Strong', color: 'bg-green-400',  width: 'w-full' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-[90vh] flex items-center justify-center
                    bg-gradient-to-br from-brand-50 to-amber-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Top banner */}
          <div className="bg-coffee-dark px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg overflow-hidden">
              <img
                src="/crave on.jpg"
                alt="Crave On"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Join Crave On and start ordering
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-4">

              <Input
                label="Full Name"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                autoFocus
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Input
                label="Phone Number (optional)"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
              />

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-sm
                      bg-white text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-brand-500
                      focus:border-transparent transition-all duration-200
                      ${errors.password
                        ? 'border-red-400'
                        : 'border-gray-300 hover:border-gray-400'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600"
                  >
                    {showPass
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {strength && (
                  <div className="mt-1">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all
                                      ${strength.color} ${strength.width}`} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Strength: <span className="font-medium">{strength.label}</span>
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-red-500">⚠ {errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="password_confirmation"
                    placeholder="Re-enter your password"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-sm
                      bg-white text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-brand-500
                      focus:border-transparent transition-all duration-200
                      ${errors.password_confirmation
                        ? 'border-red-400'
                        : form.password_confirmation &&
                          form.password === form.password_confirmation
                          ? 'border-green-400'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>

                  {/* Match checkmark */}
                  {form.password_confirmation &&
                   form.password === form.password_confirmation && (
                    <CheckCircle className="absolute right-8 top-1/2 -translate-y-1/2
                                           w-4 h-4 text-green-500" />
                  )}
                </div>
                {errors.password_confirmation && (
                  <p className="text-xs text-red-500">
                    ⚠ {errors.password_confirmation}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                loading={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-brand-600 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}