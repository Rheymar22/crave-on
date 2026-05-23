import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email)    newErrors.email    = 'Email is required.';
    if (!form.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await login(form);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}! ☕`);

      if (result.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from || '/menu', { replace: true });
      }
    } else {
      toast.error(result.message || 'Login failed.');
      setErrors({ general: result.message });
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center
                    bg-gradient-to-br from-brand-50 to-amber-50 px-4">
      <div className="w-full max-w-md">

        {/* Card */}
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
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Sign in to your Crave On account
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200
                              rounded-lg text-sm text-red-600">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
                autoFocus
              />

              {/* Password with show/hide toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
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
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">⚠ {errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-brand-600 font-medium hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}