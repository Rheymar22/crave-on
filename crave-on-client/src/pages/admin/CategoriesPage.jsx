import { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Tag, X } from 'lucide-react';

const EMPTY_FORM = { name: '', icon: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editCat,    setEditCat]    = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (_) {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditCat(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, icon: cat.icon || '' });
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Category name is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editCat) {
        await api.put(`/admin/categories/${editCat.id}`, form);
        toast.success('Category updated!');
      } else {
        await api.post('/admin/categories', form);
        toast.success('Category created!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      const mapped    = {};
      Object.entries(apiErrors).forEach(([k, msgs]) => {
        mapped[k] = msgs[0];
      });
      setErrors(mapped);
      toast.error(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    setDeleting(cat.id);
    try {
      await api.delete(`/admin/categories/${cat.id}`);
      toast.success('Category deleted.');
      fetchCategories();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to delete category.'
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            Categories
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage menu categories
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <Card key={cat.id}
              className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-50 rounded-xl
                                    flex items-center justify-center text-2xl">
                      {cat.icon || '📦'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {cat.products_count ?? 0} products
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 text-gray-400 hover:text-brand-600
                                 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deleting === cat.id}
                      className="p-2 text-gray-400 hover:text-red-600
                                 hover:bg-red-50 rounded-lg transition-colors
                                 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {categories.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No categories yet</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          title={editCat ? 'Edit Category' : 'Add Category'}
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4">
            <Input
              label="Category Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g. Hot Drinks"
              autoFocus
            />

            <Input
              label="Icon (emoji)"
              name="icon"
              value={form.icon}
              onChange={handleChange}
              placeholder="e.g. ☕"
              error={errors.icon}
            />

            {/* Preview */}
            {(form.name || form.icon) && (
              <div className="flex items-center gap-3 p-3 bg-gray-50
                              rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-brand-50 rounded-lg
                                flex items-center justify-center text-xl">
                  {form.icon || '📦'}
                </div>
                <span className="font-medium text-gray-700">
                  {form.name || 'Preview'}
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                loading={saving}
                className="flex-1"
              >
                {editCat ? 'Update' : 'Create'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl
                      w-full max-w-md">
        <div className="flex items-center justify-between p-6
                        border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}