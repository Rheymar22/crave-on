import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Zap, CheckCircle,
  XCircle, X, RefreshCw, Eye, EyeOff
} from 'lucide-react';

const AVAILABLE_EVENTS = [
  { value: 'order.created',        label: '🛒 Order Created' },
  { value: 'order.status_updated', label: '🔄 Order Status Updated' },
  { value: 'order.cancelled',      label: '❌ Order Cancelled' },
  { value: 'product.created',      label: '☕ Product Created' },
  { value: 'product.updated',      label: '✏️ Product Updated' },
  { value: 'product.deleted',      label: '🗑️ Product Deleted' },
];

const EMPTY_FORM = { name: '', url: '', events: [] };

export default function WebhooksPage() {
  const [webhooks,   setWebhooks]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [testing,    setTesting]    = useState(null);
  const [deleting,   setDeleting]   = useState(null);
  const [newSecret,  setNewSecret]  = useState(null);
  const [showSecret, setShowSecret] = useState(false);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/webhooks');
      setWebhooks(res.data.data);
    } catch (_) {
      toast.error('Failed to load webhooks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWebhooks(); }, []);

  const handleEventToggle = (eventValue) => {
    setForm(prev => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue],
    }));
    if (errors.events) setErrors(prev => ({ ...prev, events: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name   = 'Name is required.';
    if (!form.url.trim())  newErrors.url    = 'URL is required.';
    else if (!form.url.startsWith('http'))
      newErrors.url = 'Must be a valid URL starting with http/https.';
    if (form.events.length === 0)
      newErrors.events = 'Select at least one event.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await api.post('/admin/webhooks', form);
      toast.success('Webhook created!');

      // Show the secret once
      setNewSecret(res.data.data.secret);
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchWebhooks();
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      const mapped = {};
      Object.entries(apiErrors).forEach(([k, msgs]) => {
        mapped[k] = msgs[0];
      });
      setErrors(mapped);
      toast.error('Failed to create webhook.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (webhook) => {
    setTesting(webhook.id);
    try {
      const res = await api.post(`/admin/webhooks/${webhook.id}/test`);
      if (res.data.success) {
        toast.success(`✅ Test delivered! (${res.data.data.duration_ms}ms)`);
      } else {
        toast.error(`❌ Test failed: ${res.data.data.error}`);
      }
      fetchWebhooks();
    } catch (_) {
      toast.error('Test failed.');
    } finally {
      setTesting(null);
    }
  };

  const handleToggleActive = async (webhook) => {
    try {
      await api.put(`/admin/webhooks/${webhook.id}`, {
        is_active: !webhook.is_active,
      });
      toast.success(`Webhook ${webhook.is_active ? 'disabled' : 'enabled'}.`);
      fetchWebhooks();
    } catch (_) {
      toast.error('Failed to update webhook.');
    }
  };

  const handleDelete = async (webhook) => {
    if (!confirm(`Delete webhook "${webhook.name}"?`)) return;
    setDeleting(webhook.id);
    try {
      await api.delete(`/admin/webhooks/${webhook.id}`);
      toast.success('Webhook deleted.');
      fetchWebhooks();
    } catch (_) {
      toast.error('Failed to delete webhook.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            Webhooks
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Get notified when events happen in Crave On
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchWebhooks}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => {
            setForm(EMPTY_FORM);
            setErrors({});
            setShowModal(true);
          }}>
            <Plus className="w-4 h-4" />
            Add Webhook
          </Button>
        </div>
      </div>

      {/* New Secret Banner */}
      {newSecret && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Webhook Created — Save Your Secret Key!
              </p>
              <p className="text-green-700 text-sm mt-1">
                This secret will only be shown once. Use it to verify
                webhook signatures.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <code className="bg-green-100 border border-green-300
                                 px-3 py-1.5 rounded-lg text-sm font-mono
                                 text-green-800 flex-1 break-all">
                  {showSecret ? newSecret : '•'.repeat(32)}
                </code>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                >
                  {showSecret
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newSecret);
                    toast.success('Secret copied!');
                  }}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs
                             rounded-lg hover:bg-green-700 font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewSecret(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* How It Works
      <Card className="bg-blue-50 border-blue-200">
        <CardBody>
          <h3 className="font-semibold text-blue-800 mb-2">
            How Webhooks Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm
                          text-blue-700">
            <div className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>An event happens in Crave On (e.g. order placed)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>We POST a JSON payload to your registered URL</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>Your server receives and processes the event</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-700 font-medium mb-1">
              Verify signatures using the header:
            </p>
            <code className="text-xs text-blue-800 font-mono">
              X-CraveOn-Signature: sha256=HMAC_SHA256(secret, body)
            </code>
          </div>
        </CardBody>
      </Card> */}

      {/* Webhooks List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center
                          justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-600 mb-2">
            No webhooks yet
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Add a webhook to get notified when events happen
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Add Your First Webhook
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              testing={testing === webhook.id}
              deleting={deleting === webhook.id}
              onTest={handleTest}
              onToggle={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center
                        justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl
                          w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6
                            border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">
                Add Webhook
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Input
                label="Webhook Name"
                name="name"
                value={form.name}
                onChange={e => {
                  setForm(prev => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                error={errors.name}
                placeholder="e.g. Slack Order Notifier"
                autoFocus
              />

              <Input
                label="Payload URL"
                name="url"
                value={form.url}
                onChange={e => {
                  setForm(prev => ({ ...prev, url: e.target.value }));
                  if (errors.url) setErrors(prev => ({ ...prev, url: '' }));
                }}
                error={errors.url}
                placeholder="https://your-server.com/webhook"
              />

              {/* Events */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Events to Subscribe
                </label>
                <div className="space-y-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <label
                      key={event.value}
                      className={`flex items-center gap-3 p-3 rounded-xl
                                  border-2 cursor-pointer transition-all
                                  ${form.events.includes(event.value)
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                  }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.events.includes(event.value)}
                        onChange={() => handleEventToggle(event.value)}
                        className="w-4 h-4 accent-brand-500"
                      />
                      <span className="text-sm text-gray-700">
                        {event.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.events && (
                  <p className="text-xs text-red-500">⚠ {errors.events}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  loading={saving}
                  className="flex-1"
                >
                  {saving ? 'Creating...' : 'Create Webhook'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Webhook Card ─────────────────────────────────────── */
function WebhookCard({
  webhook, testing, deleting, onTest, onToggle, onDelete
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`overflow-hidden transition-all
                      ${!webhook.is_active ? 'opacity-60' : ''}`}>
      <CardBody className="p-4">
        <div className="flex flex-wrap items-start gap-4">

          {/* Status indicator */}
          <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0
                           ${webhook.is_active
                             ? 'bg-green-400 animate-pulse'
                             : 'bg-gray-300'}`}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-800">
                {webhook.name}
              </h3>
              <Badge variant={webhook.is_active ? 'success' : 'default'}>
                {webhook.is_active ? 'Active' : 'Disabled'}
              </Badge>
            </div>

            <p className="text-sm text-gray-500 font-mono truncate mb-2">
              {webhook.url}
            </p>

            {/* Events */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {webhook.events?.map(event => (
                <span key={event}
                  className="text-xs bg-gray-100 text-gray-600
                             px-2 py-0.5 rounded-full">
                  {event}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {webhook.success_count} success
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-500" />
                {webhook.failure_count} failed
              </span>
              {webhook.last_triggered_at && (
                <span>
                  Last: {new Date(webhook.last_triggered_at)
                    .toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              loading={testing}
              onClick={() => onTest(webhook)}
            >
              <Zap className="w-3.5 h-3.5" />
              Test
            </Button>

            <button
              onClick={() => onToggle(webhook)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium
                          transition-colors
                          ${webhook.is_active
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
            >
              {webhook.is_active ? 'Disable' : 'Enable'}
            </button>

            <button
              onClick={() => onDelete(webhook)}
              disabled={deleting}
              className="p-1.5 text-gray-400 hover:text-red-600
                         hover:bg-red-50 rounded-lg transition-colors
                         disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-brand-600 hover:underline"
            >
              {expanded ? 'Hide logs' : 'View logs'}
            </button>
          </div>
        </div>

        {/* Recent Logs */}
        {expanded && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h4 className="text-xs font-semibold text-gray-500
                           uppercase mb-3">
              Recent Deliveries
            </h4>
            {webhook.recent_logs?.length === 0 ? (
              <p className="text-sm text-gray-400">No deliveries yet</p>
            ) : (
              <div className="space-y-2">
                {webhook.recent_logs?.map(log => (
                  <div key={log.id}
                    className="flex items-center justify-between
                               text-xs bg-gray-50 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                      <span className="font-mono text-gray-600">
                        {log.event}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <span>HTTP {log.response_status || '—'}</span>
                      <span>{log.duration_ms}ms</span>
                      <span>{new Date(log.created_at)
                        .toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}