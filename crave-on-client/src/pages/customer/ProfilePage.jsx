import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import {
  User, Lock, ShoppingBag,
  CheckCircle, Eye, EyeOff
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-coffee-dark">
          My Profile
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account settings
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-coffee-dark rounded-2xl p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center
                        justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-500
                           text-white text-xs rounded-full font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'profile',  label: 'Profile Info',    icon: User },
          { id: 'password', label: 'Change Password', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium
                         border-b-2 transition-colors -mb-px
                         ${activeTab === tab.id
                           ? 'border-brand-500 text-brand-600'
                           : 'border-transparent text-gray-500 hover:text-gray-700'
                         }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile'  && <ProfileInfoTab user={user} setUser={setUser} />}
      {activeTab === 'password' && <ChangePasswordTab />}
    </div>
  );
}

/*
|------------------------------------------------------------------
| Profile Info Tab
|------------------------------------------------------------------
*/
function ProfileInfoTab({ user, setUser }) {
  const [form, setForm]     = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setSaved(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      setUser(res.data.data);
      setSaved(true);
      toast.success('Profile updated successfully!');
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      const mapped = {};
      Object.entries(apiErrors).forEach(([key, messages]) => {
        mapped[key] = messages[0];
      });
      setErrors(mapped);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-800">Personal Information</h3>
        <p className="text-sm text-gray-500">Update your name, phone and address</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Juan dela Cruz"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200
                         bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-gray-400">
              Email cannot be changed
            </p>
          </div>

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="09XX XXX XXXX"
          />

          {/* Address textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Delivery Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              placeholder="123 Coffee Street, Cebu City"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300
                         text-sm bg-white text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-brand-500
                         focus:border-transparent transition-all duration-200
                         hover:border-gray-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              loading={loading}
              size="lg"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>

            {saved && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Saved!</span>
              </div>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

/*
|------------------------------------------------------------------
| Change Password Tab
|------------------------------------------------------------------
*/
function ChangePasswordTab() {
  const [form, setForm] = useState({
    current_password:      '',
    password:              '',
    password_confirmation: '',
  });
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.current_password)
      newErrors.current_password = 'Current password is required.';
    if (!form.password)
      newErrors.password = 'New password is required.';
    else if (form.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters.';
    if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.put('/auth/password', form);
      toast.success('Password changed successfully!');
      setForm({
        current_password:      '',
        password:              '',
        password_confirmation: '',
      });
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      const mapped = {};
      Object.entries(apiErrors).forEach(([key, messages]) => {
        mapped[key] = messages[0];
      });
      setErrors(mapped);
      toast.error(
        err.response?.data?.message || 'Failed to change password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({ label, name, show, setShow, placeholder }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 pr-10 rounded-lg border text-sm
            bg-white text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-brand-500
            focus:border-transparent transition-all duration-200
            ${errors[name]
              ? 'border-red-400'
              : 'border-gray-300 hover:border-gray-400'
            }`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-gray-600"
        >
          {show
            ? <EyeOff className="w-4 h-4" />
            : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[name] && (
        <p className="text-xs text-red-500">⚠ {errors[name]}</p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-800">Change Password</h3>
        <p className="text-sm text-gray-500">
          Choose a strong password to keep your account secure
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Current Password"
            name="current_password"
            show={showCurrent}
            setShow={setShowCurrent}
            placeholder="Enter current password"
          />
          <PasswordField
            label="New Password"
            name="password"
            show={showNew}
            setShow={setShowNew}
            placeholder="Minimum 8 characters"
          />
          <PasswordField
            label="Confirm New Password"
            name="password_confirmation"
            show={showConfirm}
            setShow={setShowConfirm}
            placeholder="Re-enter new password"
          />

          <div className="pt-2">
            <Button type="submit" loading={loading} size="lg">
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}