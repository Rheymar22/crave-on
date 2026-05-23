import { useEffect, useState, useRef } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, Search,
  Coffee, ToggleLeft, ToggleRight,
  X, Upload, Image, Loader
} from 'lucide-react';

const EMPTY_FORM = {
  name:         '',
  category_id:  '',
  description:  '',
  price:        '',
  image_url:    '',
  is_available: true,
  stock:        0,
};

export default function ProductsPage() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState('');
  const [deleting,    setDeleting]    = useState(null);

  const fetchProducts = async (q = search) => {
    setLoading(true);
    try {
      const params = q ? `?search=${q}` : '';
      const res = await api.get(`/admin/products${params}`);
      setProducts(res.data.data);
    } catch (_) {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (_) {}
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name:         product.name,
      category_id:  product.category?.id || '',
      description:  product.description  || '',
      price:        product.price,
      image_url:    product.image_url    || '',
      is_available: product.is_available,
      stock:        product.stock,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim())  newErrors.name        = 'Name is required.';
    if (!form.category_id)  newErrors.category_id = 'Category is required.';
    if (!form.price)        newErrors.price        = 'Price is required.';
    else if (isNaN(form.price) || parseFloat(form.price) < 0)
      newErrors.price = 'Enter a valid price.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
      };

      if (editProduct) {
        await api.put(`/admin/products/${editProduct.id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created!');
      }

      setShowModal(false);
      fetchProducts();
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

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    setDeleting(product.id);
    try {
      await api.delete(`/admin/products/${product.id}`);
      toast.success(`"${product.name}" deleted.`);
      fetchProducts();
    } catch (_) {
      toast.error('Failed to delete product.');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (product) => {
    try {
      await api.patch(`/admin/products/${product.id}/toggle`);
      toast.success('Availability updated.');
      fetchProducts();
    } catch (_) {
      toast.error('Failed to update availability.');
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">
            Products
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} items on menu
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300
                     text-sm focus:outline-none focus:ring-2 focus:ring-brand-500
                     focus:border-transparent bg-white"
        />
      </div>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No products found</p>
              <Button className="mt-4" onClick={openCreate}>
                Add First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Product', 'Category', 'Price',
                      'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h}
                        className="text-left py-3 px-4 text-xs font-semibold
                                   text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(product => (
                    <tr key={product.id}
                      className="hover:bg-gray-50 transition-colors">

                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 rounded-lg
                                          flex items-center justify-center
                                          flex-shrink-0 overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Coffee className="w-5 h-5 text-brand-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate
                                          max-w-[180px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {product.category?.icon} {product.category?.name}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-semibold text-brand-600">
                        ₱{parseFloat(product.price).toFixed(2)}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-gray-600">
                        {product.stock}
                      </td>

                      {/* Status toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggle(product)}
                          className="flex items-center gap-1.5"
                        >
                          {product.is_available ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">
                                Available
                              </span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                Hidden
                              </span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1.5 text-gray-400 hover:text-brand-600
                                       hover:bg-brand-50 rounded-lg
                                       transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deleting === product.id}
                            className="p-1.5 text-gray-400 hover:text-red-600
                                       hover:bg-red-50 rounded-lg transition-colors
                                       disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal */}
      {showModal && (
        <ProductModal
          title={editProduct ? 'Edit Product' : 'Add Product'}
          form={form}
          errors={errors}
          saving={saving}
          categories={categories}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          onImageUploaded={(url) =>
            setForm(prev => ({ ...prev, image_url: url }))
          }
          isEdit={!!editProduct}
        />
      )}
    </div>
  );
}

/*
|------------------------------------------------------------------
| Image Uploader Component
| Drag & drop or click to browse — uploads to Laravel storage
|------------------------------------------------------------------
*/
function ImageUploader({ currentUrl, onUploaded }) {
  const fileRef                   = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(currentUrl || null);
  const [dragOver,  setDragOver]  = useState(false);

  // Sync preview when currentUrl changes (e.g. opening edit modal)
  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleFile = async (file) => {
    if (!file) return;

    // Client-side validation
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG or WebP images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB.');
      return;
    }

    // Show instant local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to Laravel
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post(
        '/admin/products/upload-image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      onUploaded(res.data.image_url);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Image upload failed.'
      );
      // Revert preview on failure
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange  = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setPreview(null);
    onUploaded('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Product Image
      </label>

      {/* ── Preview State ─────────────────────────── */}
      {preview ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden
                        border-2 border-gray-200 group">
          <img
            src={preview}
            alt="Product preview"
            className="w-full h-full object-cover"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0
                          group-hover:opacity-100 transition-opacity
                          flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 bg-white text-gray-800
                         px-3 py-1.5 rounded-lg text-sm font-medium
                         hover:bg-gray-100 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Change Photo
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="flex items-center gap-1.5 bg-red-500 text-white
                         px-3 py-1.5 rounded-lg text-sm font-medium
                         hover:bg-red-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>

          {/* Uploading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col
                            items-center justify-center gap-2">
              <Loader className="w-7 h-7 text-brand-500 animate-spin" />
              <span className="text-sm text-gray-600 font-medium">
                Uploading...
              </span>
            </div>
          )}
        </div>

      ) : (
        /* ── Drop Zone ────────────────────────────── */
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`w-full h-48 rounded-xl border-2 border-dashed
                      cursor-pointer transition-all duration-200
                      flex flex-col items-center justify-center gap-3
                      ${dragOver
                        ? 'border-brand-500 bg-brand-50 scale-[1.01]'
                        : 'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50/40'
                      }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader className="w-8 h-8 text-brand-500 animate-spin" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-2xl flex items-center
                               justify-center transition-colors
                               ${dragOver
                                 ? 'bg-brand-100'
                                 : 'bg-gray-100'}`}>
                {dragOver
                  ? <Upload className="w-7 h-7 text-brand-500" />
                  : <Image  className="w-7 h-7 text-gray-400" />
                }
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-gray-700">
                  {dragOver
                    ? '📂 Drop image here!'
                    : 'Click to browse or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG or WebP — max 2MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}

/*
|------------------------------------------------------------------
| Product Modal
|------------------------------------------------------------------
*/
function ProductModal({
  title, form, errors, saving,
  categories, onChange, onSave,
  onClose, onImageUploaded, isEdit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full
                      max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6
                        border-b border-gray-100 sticky top-0
                        bg-white z-10">
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

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* ── Image Uploader ── replaces old URL input */}
          <ImageUploader
            currentUrl={form.image_url}
            onUploaded={onImageUploaded}
          />

          <Input
            label="Product Name"
            name="name"
            value={form.name}
            onChange={onChange}
            error={errors.name}
            placeholder="e.g. Caramel Latte"
          />

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={onChange}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm
                bg-white focus:outline-none focus:ring-2
                focus:ring-brand-500 transition-all
                ${errors.category_id
                  ? 'border-red-400'
                  : 'border-gray-300 hover:border-gray-400'}`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-xs text-red-500">
                ⚠ {errors.category_id}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={3}
              placeholder="Brief product description..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-brand-500 focus:border-transparent
                         resize-none transition-all hover:border-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₱)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={onChange}
              error={errors.price}
              placeholder="0.00"
            />
            <Input
              label="Stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={onChange}
              placeholder="0"
            />
          </div>

          {/* Availability toggle */}
          <label className="flex items-center gap-3 cursor-pointer
                             p-3 bg-gray-50 rounded-xl border
                             border-gray-200 hover:border-brand-300
                             transition-colors">
            <input
              type="checkbox"
              name="is_available"
              checked={form.is_available}
              onChange={onChange}
              className="w-4 h-4 rounded accent-brand-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Available on menu
              </span>
              <p className="text-xs text-gray-400">
                Uncheck to hide from customers
              </p>
            </div>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onSave}
              loading={saving}
              className="flex-1"
            >
              {saving
                ? 'Saving...'
                : isEdit ? 'Update Product' : 'Create Product'}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}