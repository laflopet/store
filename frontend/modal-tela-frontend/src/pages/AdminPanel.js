import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [orderSubTab, setOrderSubTab] = useState('en_gestion'); // 'en_gestion' or 'entregados'
  const [productImages, setProductImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [itemPreparationState, setItemPreparationState] = useState({});
  const [editingBrand, setEditingBrand] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantChoices, setVariantChoices] = useState({ sizes: [], colors: [] });
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState(null);
  const [variantForm, setVariantForm] = useState({
    size: '',
    color: '',
    stock: '',
    price_adjustment: 0
  });
  
  // Admin creation form state
  const [adminForm, setAdminForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'admin'
  });
  
  // Confirmation modals state
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [selectedUserForDeletion, setSelectedUserForDeletion] = useState(null);
  const [deleteUserReason, setDeleteUserReason] = useState('');
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    tracking_number: '',
    shipping_company: ''
  });
  
  const { user, isSuperAdmin } = useAuth();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    price: '',
    stock: '',
    is_featured: false,
    is_active: true
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    display_name: '',
    description: '',
    image: null,
    is_active: true
  });

  // Brand form state
  const [brandForm, setBrandForm] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
      loadCategories();
      loadBrands();
    } else if (activeTab === 'categories') {
      loadCategoriesAdmin();
    } else if (activeTab === 'brands') {
      loadBrandsAdmin();
    } else if (activeTab === 'users' && isSuperAdmin()) {
      loadUsers();
    } else if (activeTab === 'orders') {
      loadOrders();
      loadUsers(); // Cargar usuarios para asignación de pedidos
    }
    
    // Cargar choices de variantes cuando sea necesario
    if (activeTab === 'products') {
      loadVariantChoices();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products/admin/');
      setProducts(response.data.results || response.data || []);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories/');
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const loadCategoriesAdmin = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products/admin/categories/');
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await axios.get('/api/products/brands/');
      setBrands(response.data.results || response.data || []);
    } catch (error) {
      toast.error('Error al cargar marcas');
    }
  };

  const loadBrandsAdmin = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products/admin/brands/');
      setBrands(response.data.results || response.data || []);
    } catch (error) {
      toast.error('Error al cargar marcas');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/accounts/admin/users/');
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/');
      setOrders(response.data.results || response.data || []);
    } catch (error) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/products/admin/create/', productForm);
      const newProduct = response.data;
      
      // Upload images if any are selected
      if (productImages.length > 0) {
        for (let i = 0; i < productImages.length; i++) {
          const formData = new FormData();
          formData.append('image', productImages[i]);
          formData.append('is_main', i === mainImageIndex);
          
          try {
            await axios.post(`/api/products/admin/${newProduct.id}/images/upload/`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (imgError) {
            console.error('Error uploading image:', imgError);
          }
        }
      }
      
      toast.success('Producto creado exitosamente');
      setProductForm({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        brand: '',
        price: '',
        stock: '',
        is_featured: false,
        is_active: true
      });
      setProductImages([]);
      setMainImageIndex(0);
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear producto');
    }
  };

  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files);
    setProductImages(files);
    setMainImageIndex(0); // Reset main image to first one
  };

  const removeImage = (index) => {
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages);
    if (mainImageIndex >= newImages.length) {
      setMainImageIndex(Math.max(0, newImages.length - 1));
    } else if (mainImageIndex > index) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setAsMainImage = (index) => {
    setMainImageIndex(index);
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.patch(`/api/accounts/admin/users/${userId}/`, { role: newRole });
      toast.success('Rol actualizado exitosamente');
      loadUsers();
    } catch (error) {
      toast.error('Error al actualizar rol');
    }
  };

  const assignOrder = async (orderId, adminId) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const isReassignment = order && order.assigned_admin;
      
      await axios.patch(`/api/orders/${orderId}/assign/`, { admin_id: adminId });
      toast.success(isReassignment ? 'Pedido reasignado exitosamente' : 'Pedido asignado exitosamente');
      loadOrders();
    } catch (error) {
      toast.error('Error al asignar pedido');
    }
  };

  const updateOrderStatus = async (orderId, status, trackingNumber = '', shippingCompany = '', notes = '') => {
    try {
      await axios.patch(`/api/orders/${orderId}/status/`, { 
        status, 
        tracking_number: trackingNumber,
        shipping_company: shippingCompany,
        notes 
      });
      toast.success('Estado actualizado exitosamente');
      loadOrders();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const editProduct = async (product) => {
    try {
      // Fetch full product details with images
      const response = await axios.get(`/api/products/admin/${product.id}/`);
      const fullProduct = response.data;
      
      setEditingProduct(fullProduct);
      setProductForm({
        name: fullProduct.name,
        description: fullProduct.description,
        category: fullProduct.category,
        subcategory: fullProduct.subcategory || '',
        brand: fullProduct.brand || '',
        price: fullProduct.price,
        stock: fullProduct.stock,
        is_featured: fullProduct.is_featured,
        is_active: fullProduct.is_active
      });
    } catch (error) {
      toast.error('Error al cargar detalles del producto');
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/products/admin/${editingProduct.id}/`, productForm);
      toast.success('Producto actualizado exitosamente');
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        brand: '',
        price: '',
        stock: '',
        is_featured: false,
        is_active: true
      });
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar producto');
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      brand: '',
      price: '',
      stock: '',
      is_featured: false,
      is_active: true
    });
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      await axios.patch(`/api/products/admin/${productId}/`, {
        is_active: !currentStatus
      });
      toast.success(`Producto ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      loadProducts();
    } catch (error) {
      toast.error('Error al cambiar estado del producto');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !editingProduct) return;

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        await axios.post(`/api/products/admin/${editingProduct.id}/images/upload/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }
    
    // Show results
    if (successCount > 0) {
      toast.success(`${successCount} imagen${successCount > 1 ? 'es' : ''} subida${successCount > 1 ? 's' : ''} exitosamente`);
    }
    if (errorCount > 0) {
      toast.error(`Error al subir ${errorCount} imagen${errorCount > 1 ? 'es' : ''}`);
    }
    
    // Reload product to get updated images
    const productResponse = await axios.get(`/api/products/admin/${editingProduct.id}/`);
    setEditingProduct(productResponse.data);
    
    // Clear file input
    e.target.value = '';
  };

  const deleteImage = async (productId, imageId) => {
    try {
      await axios.delete(`/api/products/admin/${productId}/images/${imageId}/delete/`);
      toast.success('Imagen eliminada exitosamente');
      
      // Reload product to get updated images
      const productResponse = await axios.get(`/api/products/admin/${productId}/`);
      setEditingProduct(productResponse.data);
    } catch (error) {
      toast.error('Error al eliminar imagen');
    }
  };

  const setMainImage = async (productId, imageId) => {
    try {
      await axios.patch(`/api/products/admin/${productId}/images/${imageId}/set-main/`);
      toast.success('Imagen principal actualizada');
      
      // Reload product to get updated images
      const productResponse = await axios.get(`/api/products/admin/${productId}/`);
      setEditingProduct(productResponse.data);
    } catch (error) {
      toast.error('Error al establecer imagen principal');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    formData.append('name', categoryForm.name);
    formData.append('display_name', categoryForm.display_name);
    formData.append('description', categoryForm.description);
    formData.append('is_active', categoryForm.is_active);
    
    if (categoryForm.image) {
      formData.append('image', categoryForm.image);
    }

    try {
      if (editingCategory) {
        await axios.patch(`/api/products/admin/categories/${editingCategory.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Categoría actualizada exitosamente');
      } else {
        await axios.post('/api/products/admin/categories/create/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Categoría creada exitosamente');
      }
      
      setCategoryForm({
        name: '',
        display_name: '',
        description: '',
        image: null,
        is_active: true
      });
      setEditingCategory(null);
      loadCategoriesAdmin();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar categoría');
    }
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      display_name: category.display_name,
      description: category.description,
      image: null, // Reset file input
      is_active: category.is_active
    });
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      display_name: '',
      description: '',
      image: null,
      is_active: true
    });
  };

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      await axios.patch(`/api/products/admin/categories/${categoryId}/`, {
        is_active: !currentStatus
      });
      toast.success(`Categoría ${!currentStatus ? 'activada' : 'desactivada'} exitosamente`);
      loadCategoriesAdmin();
    } catch (error) {
      toast.error('Error al cambiar estado de la categoría');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta categoría?')) {
      try {
        await axios.delete(`/api/products/admin/categories/${categoryId}/delete/`);
        toast.success('Categoría desactivada exitosamente');
        loadCategoriesAdmin();
      } catch (error) {
        toast.error('Error al desactivar categoría');
      }
    }
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    formData.append('name', brandForm.name);
    formData.append('description', brandForm.description);
    formData.append('is_active', brandForm.is_active);
    
    if (brandForm.logo) {
      formData.append('logo', brandForm.logo);
    }

    try {
      if (editingBrand) {
        await axios.patch(`/api/products/admin/brands/${editingBrand.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Marca actualizada exitosamente');
      } else {
        await axios.post('/api/products/admin/brands/create/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Marca creada exitosamente');
      }
      
      setBrandForm({
        name: '',
        description: '',
        logo: null,
        is_active: true
      });
      setEditingBrand(null);
      loadBrandsAdmin();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar marca');
    }
  };

  const editBrand = (brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name,
      description: brand.description,
      logo: null, // Reset file input
      is_active: brand.is_active
    });
  };

  const cancelBrandEdit = () => {
    setEditingBrand(null);
    setBrandForm({
      name: '',
      description: '',
      logo: null,
      is_active: true
    });
  };

  const toggleBrandStatus = async (brandId, currentStatus) => {
    try {
      await axios.patch(`/api/products/admin/brands/${brandId}/`, {
        is_active: !currentStatus
      });
      toast.success(`Marca ${!currentStatus ? 'activada' : 'desactivada'} exitosamente`);
      loadBrandsAdmin();
    } catch (error) {
      toast.error('Error al cambiar estado de la marca');
    }
  };

  const deleteBrand = async (brandId) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta marca?')) {
      try {
        await axios.delete(`/api/products/admin/brands/${brandId}/delete/`);
        toast.success('Marca desactivada exitosamente');
        loadBrandsAdmin();
      } catch (error) {
        toast.error('Error al desactivar marca');
      }
    }
  };

  const viewOrderDetail = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/admin-detail/`);
      setSelectedOrder(response.data);
      console.log(response.data)
      
      // Initialize preparation state
      const initialState = {};
      if (response.data.items) {
        response.data.items.forEach(item => {
          initialState[item.id] = item.is_prepared || false;
        });
      }
      setItemPreparationState(initialState);
      
      setOrderDetailModalOpen(true);
    } catch (error) {
      toast.error('Error al cargar detalles del pedido');
    }
  };

  const handleItemPreparationChange = (itemId, isChecked) => {
    setItemPreparationState(prev => ({
      ...prev,
      [itemId]: isChecked
    }));
  };

  const savePreparationChanges = async () => {
    if (!selectedOrder) return;

    try {
      await axios.patch(`/api/orders/${selectedOrder.id}/preparation/`, {
        item_updates: itemPreparationState,
        notes: `Actualización de preparación de productos por ${user.first_name} ${user.last_name}`
      });
      
      toast.success('Estado de preparación actualizado');
      
      // Refresh order data
      viewOrderDetail(selectedOrder.id);
    } catch (error) {
      toast.error('Error al actualizar preparación');
    }
  };

  const rejectOrder = async () => {
    if (!selectedOrder || !rejectReason.trim()) {
      toast.error('Debes proporcionar un motivo de rechazo');
      return;
    }

    try {
      await axios.post(`/api/orders/${selectedOrder.id}/reject/`, {
        reason: rejectReason
      });
      toast.success('Pedido rechazado y reasignado al Super Admin');
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      toast.error('Error al rechazar pedido');
    }
  };

  const getOrdersByStatus = () => {
    if (orderSubTab === 'en_gestion') {
      return orders.filter(order => 
        ['pending', 'preparing', 'shipped', 'rejected'].includes(order.status)
      );
    } else {
      return orders.filter(order => 
        ['delivered', 'cancelled'].includes(order.status)
      );
    }
  };

  // Variant management functions
  const loadVariantChoices = async () => {
    try {
      const response = await axios.get('/api/products/variant-choices/');
      setVariantChoices(response.data);
    } catch (error) {
      console.error('Error loading variant choices:', error);
    }
  };

  const loadVariants = async (productId) => {
    try {
      const response = await axios.get(`/api/products/admin/${productId}/variants/`);
      setVariants(response.data.results || response.data || []);
    } catch (error) {
      toast.error('Error al cargar variantes');
    }
  };

  const openVariantsModal = (product) => {
    setSelectedProductForVariants(product);
    setShowVariantsModal(true);
    loadVariants(product.id);
  };

  const closeVariantsModal = () => {
    setShowVariantsModal(false);
    setSelectedProductForVariants(null);
    setVariants([]);
    setVariantForm({
      size: '',
      color: '',
      stock: '',
      price_adjustment: 0
    });
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/products/admin/${selectedProductForVariants.id}/variants/`, variantForm);
      toast.success('Variante agregada exitosamente');
      loadVariants(selectedProductForVariants.id);
      setVariantForm({
        size: '',
        color: '',
        stock: '',
        price_adjustment: 0
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al agregar variante');
    }
  };

  const deleteVariant = async (variantId) => {
    if (window.confirm('¿Estás seguro de eliminar esta variante?')) {
      try {
        await axios.delete(`/api/products/admin/variants/${variantId}/`);
        toast.success('Variante eliminada exitosamente');
        loadVariants(selectedProductForVariants.id);
      } catch (error) {
        toast.error('Error al eliminar variante');
      }
    }
  };

  // Admin creation functions
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/accounts/admin/create/', adminForm);
      toast.success('Usuario admin creado exitosamente');
      setAdminForm({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'admin'
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear usuario admin');
    }
  };

  // User deletion functions
  const openDeleteUserModal = (userData) => {
    setSelectedUserForDeletion(userData);
    setDeleteUserModalOpen(true);
  };

  const deleteUser = async () => {
    if (!selectedUserForDeletion || !deleteUserReason.trim()) {
      toast.error('Debes proporcionar un motivo de eliminación');
      return;
    }

    try {
      await axios.delete(`/api/accounts/admin/users/${selectedUserForDeletion.id}/`, {
        data: { reason: deleteUserReason }
      });
      toast.success('Usuario eliminado exitosamente');
      setDeleteUserModalOpen(false);
      setDeleteUserReason('');
      setSelectedUserForDeletion(null);
      loadUsers();
    } catch (error) {
      toast.error('Error al eliminar usuario');
    }
  };

  // Order status change confirmation
  const confirmStatusChange = (order, status) => {
    if (status === 'shipped') {
      setSelectedOrderForStatus(order);
      setNewOrderStatus(status);
      setShippingForm({
        tracking_number: order.tracking_number || '',
        shipping_company: order.shipping_company || ''
      });
      setShippingModalOpen(true);
    } else if (status === 'delivered' || status === 'cancelled') {
      setSelectedOrderForStatus(order);
      setNewOrderStatus(status);
      setStatusChangeModalOpen(true);
    } else {
      updateOrderStatus(order.id, status);
    }
  };

  const proceedWithStatusChange = () => {
    updateOrderStatus(selectedOrderForStatus.id, newOrderStatus);
    setStatusChangeModalOpen(false);
    setSelectedOrderForStatus(null);
    setNewOrderStatus('');
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shippingForm.tracking_number || !shippingForm.shipping_company) {
      toast.error('Número de guía y empresa transportadora son requeridos');
      return;
    }
    updateOrderStatus(
      selectedOrderForStatus.id, 
      'shipped', 
      shippingForm.tracking_number, 
      shippingForm.shipping_company
    );
    setShippingModalOpen(false);
    setSelectedOrderForStatus(null);
    setNewOrderStatus('');
    setShippingForm({ tracking_number: '', shipping_company: '' });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'preparing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rejected': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pendiente',
      'preparing': 'Preparando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'rejected': 'Rechazado'
    };
    return texts[status] || status;
  };

  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">No tienes permisos para acceder a esta página</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-20 xl:px-40 py-6">
        <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-[#3595e3] text-[#3595e3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Productos
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-[#3595e3] text-[#3595e3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Categorías
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'brands'
                  ? 'border-[#3595e3] text-[#3595e3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Marcas
            </button>
            {isSuperAdmin() && (
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-[#3595e3] text-[#3595e3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Usuarios
              </button>
            )}
            {isSuperAdmin() && (
              <button
                onClick={() => setActiveTab('add-admin')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'add-admin'
                    ? 'border-[#3595e3] text-[#3595e3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Agregar Admin
              </button>
            )}
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-[#3595e3] text-[#3595e3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pedidos
            </button>
          </nav>
        </div>

        {loading && <Loading />}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Productos</h2>
            
            {/* Add/Edit Product Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <form onSubmit={editingProduct ? updateProduct : handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.display_name || cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={productForm.brand}
                  onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Seleccionar marca</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Precio"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <textarea
                  placeholder="Descripción"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2"
                  rows="3"
                  required
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({...productForm, is_featured: e.target.checked})}
                    className="mr-2"
                  />
                  Producto destacado
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm({...productForm, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  Producto activo
                </label>
                
                {/* Image Selection Section for New Products */}
                {!editingProduct && (
                  <div className="md:col-span-2">
                    <h4 className="text-md font-semibold mb-2">Imágenes del Producto</h4>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelection}
                      className="mb-2 w-full"
                    />
                    <p className="text-sm text-gray-500 mb-4">Selecciona múltiples imágenes para el producto</p>
                    
                    {/* Image Preview */}
                    {productImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {productImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            {index === mainImageIndex && (
                              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Portada
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                              {index !== mainImageIndex && (
                                <button
                                  type="button"
                                  onClick={() => setAsMainImage(index)}
                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                                >
                                  Portada
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 md:col-span-2">
                  <button
                    type="submit"
                    className="bg-[#3595e3] text-white px-4 py-2 rounded-lg hover:bg-[#2c7fb0]"
                  >
                    {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
              
              {/* Image Management Section for Editing Products */}
              {editingProduct && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="text-md font-semibold mb-4">Gestión de Imágenes</h4>
                  
                  {/* Image Upload */}
                  <div className="mb-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-500">Sube múltiples imágenes para este producto (selecciona varios archivos a la vez)</p>
                  </div>
                  
                  {/* Image Gallery */}
                  {editingProduct.images && editingProduct.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {editingProduct.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.image}
                            alt="Product"
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          {image.is_main && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Principal
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            {!image.is_main && (
                              <button
                                onClick={() => setMainImage(editingProduct.id, image.id)}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                              >
                                Principal
                              </button>
                            )}
                            <button
                              onClick={() => deleteImage(editingProduct.id, image.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(!editingProduct.images || editingProduct.images.length === 0) && (
                    <p className="text-gray-500 text-sm">No hay imágenes para este producto</p>
                  )}
                </div>
              )}
            </div>

            {/* Products List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.main_image ? (
                          <img
                            src={product.main_image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Sin imagen</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.brand_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => editProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openVariantsModal(product)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                        >
                          Variantes
                        </button>
                        <button
                          onClick={() => toggleProductStatus(product.id, product.is_active)}
                          className={`${product.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {product.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Categorías</h2>
            
            {/* Add/Edit Category Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
              </h3>
              <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre interno (ej: hombres, mujeres)"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Nombre para mostrar (ej: Hombres, Mujeres)"
                  value={categoryForm.display_name}
                  onChange={(e) => setCategoryForm({...categoryForm, display_name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCategoryForm({...categoryForm, image: e.target.files[0]})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="Descripción"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2"
                  rows="3"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({...categoryForm, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  Categoría activa
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-[#3595e3] text-white px-4 py-2 rounded-lg hover:bg-[#2c7fb0]"
                  >
                    {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
                  </button>
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={cancelCategoryEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.display_name || category.name}
                        </div>
                        <div className="text-xs text-gray-500">ID: {category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Sin imagen</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {category.description || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => editCategory(category)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                          className={`mr-3 ${category.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {category.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Marcas</h2>
            
            {/* Add/Edit Brand Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {editingBrand ? 'Editar Marca' : 'Agregar Nueva Marca'}
              </h3>
              <form onSubmit={handleBrandSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre de la marca"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({...brandForm, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <textarea
                  placeholder="Descripción"
                  value={brandForm.description}
                  onChange={(e) => setBrandForm({...brandForm, description: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2"
                  rows="3"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={brandForm.is_active}
                    onChange={(e) => setBrandForm({...brandForm, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  Marca activa
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-[#3595e3] text-white px-4 py-2 rounded-lg hover:bg-[#2c7fb0]"
                  >
                    {editingBrand ? 'Actualizar Marca' : 'Crear Marca'}
                  </button>
                  {editingBrand && (
                    <button
                      type="button"
                      onClick={cancelBrandEdit}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Brands List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brands.map((brand) => (
                    <tr key={brand.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {brand.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {brand.description || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          brand.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {brand.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => editBrand(brand)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleBrandStatus(brand.id, brand.is_active)}
                          className={`mr-3 ${brand.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {brand.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => deleteBrand(brand.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && isSuperAdmin() && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.filter(userData => userData.role !== 'customer').map((userData) => (
                    <tr key={userData.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {userData.first_name} {userData.last_name}
                        </div>
                        <div className="text-sm text-gray-500">@{userData.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userData.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userData.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                          userData.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {userData.role === 'super_admin' ? 'Super Admin' :
                           userData.role === 'admin' ? 'Admin' : 'Cliente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {userData.role === 'customer' && (
                          <button
                            onClick={() => updateUserRole(userData.id, 'admin')}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            Hacer Admin
                          </button>
                        )}
                        {userData.role === 'admin' && (
                          <button
                            onClick={() => openDeleteUserModal(userData)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar Usuario
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Admin Tab */}
        {activeTab === 'add-admin' && isSuperAdmin() && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Crear Usuario Administrador</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg max-w-2xl">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre de Usuario</label>
                    <input
                      type="text"
                      value={adminForm.username}
                      onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="ej: juan_admin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="admin@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <input
                      type="text"
                      value={adminForm.first_name}
                      onChange={(e) => setAdminForm({...adminForm, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Apellido</label>
                    <input
                      type="text"
                      value={adminForm.last_name}
                      onChange={(e) => setAdminForm({...adminForm, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={adminForm.phone}
                      onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="3001234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rol</label>
                    <select
                      value={adminForm.role}
                      onChange={(e) => setAdminForm({...adminForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="admin">Administrador</option>
                      <option value="super_admin">Super Administrador</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                    placeholder="Mínimo 8 caracteres"
                    minLength="8"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Información importante
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc space-y-1 pl-5">
                          <li>Los administradores pueden gestionar productos, categorías, marcas y pedidos asignados</li>
                          <li>Los super administradores tienen acceso completo a todas las funciones</li>
                          <li>La contraseña debe tener al menos 8 caracteres</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#3595e3] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2c7fb0]"
                >
                  Crear Usuario Administrador
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Pedidos</h2>
            
            {/* Order Sub-tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setOrderSubTab('en_gestion')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    orderSubTab === 'en_gestion'
                      ? 'border-[#3595e3] text-[#3595e3]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  En Gestión ({orders.filter(o => ['pending', 'preparing', 'shipped', 'rejected'].includes(o.status)).length})
                </button>
                <button
                  onClick={() => setOrderSubTab('entregados')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    orderSubTab === 'entregados'
                      ? 'border-[#3595e3] text-[#3595e3]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Entregados ({orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length})
                </button>
              </nav>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asignado a
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getOrdersByStatus().map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.order_number}</div>
                        <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        {(orderSubTab === 'en_gestion' || (orderSubTab === 'entregados' && isSuperAdmin())) && (
                          <>
                            {/* Solo pueden editar pedidos que no están asignados, o que están asignados al usuario actual */}
                            {(!order.assigned_admin || order.assigned_admin === user.id) && (
                              <select
                                value={order.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  confirmStatusChange(order, newStatus);
                                }}
                                className="ml-2 text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="preparing">Preparando</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                                {isSuperAdmin() && <option value="rejected">Rechazado</option>}
                              </select>
                            )}
                            {/* Solo lectura cuando el pedido está asignado a otro usuario */}
                            {order.assigned_admin && order.assigned_admin !== user.id && (
                              <span className="ml-2 text-xs text-gray-500 italic">
                                (Solo lectura - Asignado a otro usuario)
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.assigned_admin_name || 'Sin asignar'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewOrderDetail(order.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Ver Detalle
                        </button>
                        {orderSubTab === 'en_gestion' && user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setRejectModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            Rechazar
                          </button>
                        )}
                        {isSuperAdmin() && (
                          <select
                            onChange={(e) => assignOrder(order.id, e.target.value)}
                            onFocus={() => {
                              if (users.length === 0) {
                                loadUsers();
                              }
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            value=""
                          >
                            <option value="">
                              {order.assigned_admin ? 'Reasignar' : 'Asignar admin'}
                            </option>
                            {users.filter(u => u.role === 'admin').map(admin => (
                              <option key={admin.id} value={admin.id}>
                                {admin.first_name} {admin.last_name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {getOrdersByStatus().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay pedidos en esta categoría
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {orderDetailModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Detalle del Pedido #{selectedOrder.order_number}</h3>
                <button
                  onClick={() => {
                    setOrderDetailModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-2">Información del Cliente</h4>
                  <p><strong>Nombre:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p><strong>Teléfono:</strong> {selectedOrder.billing_phone}</p>
                  <p><strong>Dirección:</strong> {selectedOrder.billing_address}</p>
                  <p><strong>Ciudad:</strong> {selectedOrder.billing_city}, {selectedOrder.billing_department}</p>
                </div>
                
                {/* Order Info */}
                <div>
                  <h4 className="font-semibold mb-2">Información del Pedido</h4>
                  <p><strong>Estado:</strong> <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span></p>
                  <p><strong>Total:</strong> ${selectedOrder.total}</p>
                  <p><strong>Asignado a:</strong> {selectedOrder.assigned_admin_name || 'Sin asignar'}</p>
                  <p><strong>Fecha:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  {selectedOrder.tracking_number && (
                    <p><strong>Número de guía:</strong> {selectedOrder.tracking_number}</p>
                  )}
                  {selectedOrder.shipping_company && (
                    <p><strong>Empresa transportadora:</strong> {selectedOrder.shipping_company}</p>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Productos</h4>
                  {orderSubTab === 'en_gestion' && (
                    <button
                      onClick={savePreparationChanges}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Guardar Preparación
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      <div className="w-16 h-16 mr-4 flex-shrink-0">
                        {item.product_main_image ? (
                          <img
                            src={item.product_main_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-grow">
                        <div className="font-medium">{item.product_name}</div>
                        {item.variant_details && (
                          <div className="text-sm text-gray-500">
                            Talla: {item.variant_details.size} - Color: {item.variant_details.color}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          Cantidad: {item.quantity} | Precio: ${item.price}
                        </div>
                      </div>
                      
                      {/* Preparation Checkbox */}
                      {orderSubTab === 'en_gestion' && (
                        <div className="flex items-center ml-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={itemPreparationState[item.id] || false}
                              onChange={(e) => handleItemPreparationChange(item.id, e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm">Preparado</span>
                          </label>
                        </div>
                      )}
                      
                      {/* Preparation Status (read-only for delivered orders) */}
                      {orderSubTab === 'entregados' && (
                        <div className="ml-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.is_prepared ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.is_prepared ? 'Preparado' : 'Pendiente'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Status History */}
              {selectedOrder.status_history && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Historial de Estados</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedOrder.status_history.map((history) => (
                      <div key={history.id} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex justify-between">
                          <span><strong>{getStatusText(history.status)}</strong></span>
                          <span>{new Date(history.created_at).toLocaleString()}</span>
                        </div>
                        <div>Por: {history.changed_by}</div>
                        {history.notes && <div className="text-gray-600">Notas: {history.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reject Order Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Rechazar Pedido</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que quieres rechazar este pedido? Se reasignará automáticamente al Super Admin.
              </p>
              <textarea
                placeholder="Motivo del rechazo (obligatorio)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                rows="3"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={rejectOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={!rejectReason.trim()}
                >
                  Rechazar Pedido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {deleteUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Eliminar Usuario</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que quieres eliminar permanentemente al usuario{' '}
                <strong>{selectedUserForDeletion?.first_name} {selectedUserForDeletion?.last_name}</strong>?
                Esta acción no se puede deshacer.
              </p>
              <textarea
                placeholder="Motivo de la eliminación (obligatorio)"
                value={deleteUserReason}
                onChange={(e) => setDeleteUserReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                rows="3"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setDeleteUserModalOpen(false);
                    setDeleteUserReason('');
                    setSelectedUserForDeletion(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={!deleteUserReason.trim()}
                >
                  Eliminar Usuario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Status Change Confirmation Modal */}
        {statusChangeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirmar Cambio de Estado</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de cambiar el estado del pedido #{selectedOrderForStatus?.order_number} a{' '}
                <strong className={`px-2 py-1 rounded text-xs ${
                  newOrderStatus === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {newOrderStatus === 'delivered' ? 'ENTREGADO' : 'CANCELADO'}
                </strong>?
              </p>
              {!isSuperAdmin() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Solo un Super Admin puede revertir esta acción.
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setStatusChangeModalOpen(false);
                    setSelectedOrderForStatus(null);
                    setNewOrderStatus('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={proceedWithStatusChange}
                  className={`px-4 py-2 text-white rounded hover:opacity-90 ${
                    newOrderStatus === 'delivered' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  Confirmar Cambio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Tracking Modal */}
        {shippingModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Información de Envío</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ingresa el número de guía y la empresa transportadora para el pedido #{selectedOrderForStatus?.order_number}
              </p>
              
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Número de Guía *</label>
                  <input
                    type="text"
                    value={shippingForm.tracking_number}
                    onChange={(e) => setShippingForm({...shippingForm, tracking_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 1234567890"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Empresa Transportadora *</label>
                  <select
                    value={shippingForm.shipping_company}
                    onChange={(e) => setShippingForm({...shippingForm, shipping_company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar empresa</option>
                    <option value="Servientrega">Servientrega</option>
                    <option value="Coordinadora">Coordinadora</option>
                    <option value="Interrapidísimo">Interrapidísimo</option>
                    <option value="TCC">TCC</option>
                    <option value="Envía">Envía</option>
                    <option value="Deprisa">Deprisa</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShippingModalOpen(false);
                      setSelectedOrderForStatus(null);
                      setNewOrderStatus('');
                      setShippingForm({ tracking_number: '', shipping_company: '' });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Marcar como Enviado
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Variants Modal */}
        {showVariantsModal && selectedProductForVariants && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Variantes de {selectedProductForVariants.name}</h3>
                <button
                  onClick={closeVariantsModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* Add Variant Form */}
              <form onSubmit={handleVariantSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-semibold mb-3">Agregar Nueva Variante</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Talla</label>
                    <select
                      value={variantForm.size}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {variantChoices.sizes.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <select
                      value={variantForm.color}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {variantChoices.colors.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <input
                      type="number"
                      value={variantForm.stock}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ajuste de Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variantForm.price_adjustment}
                      onChange={(e) => setVariantForm(prev => ({ ...prev, price_adjustment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Agregar Variante
                </button>
              </form>
              
              {/* Variants List */}
              <div>
                <h4 className="text-md font-semibold mb-3">Variantes Existentes</h4>
                {variants.length === 0 ? (
                  <p className="text-gray-500">No hay variantes para este producto</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Talla</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Final</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {variants.map((variant) => (
                          <tr key={variant.id}>
                            <td className="px-4 py-2 text-sm">{variant.size}</td>
                            <td className="px-4 py-2 text-sm capitalize">{variant.color}</td>
                            <td className="px-4 py-2 text-sm">{variant.stock}</td>
                            <td className="px-4 py-2 text-sm">${variant.final_price}</td>
                            <td className="px-4 py-2 text-sm">
                              <button
                                onClick={() => deleteVariant(variant.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;