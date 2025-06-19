// app/admin/coupons/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Percent,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Ticket
} from 'lucide-react';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    used: 0
  });
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    value: '',
    couponType: 'one-time',
    startDate: '',
    endDate: '',
    active: true
  });

  useEffect(() => {
    checkAuth();
    loadCoupons();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
  };

  const loadCoupons = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons);
        calculateStats(data.coupons);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (couponList) => {
    const now = new Date();
    const stats = {
      total: couponList.length,
      active: 0,
      expired: 0,
      used: 0
    };

    couponList.forEach(coupon => {
      if (coupon.active) {
        if (coupon.couponType === 'time-limited' && new Date(coupon.endDate) < now) {
          stats.expired++;
        } else {
          stats.active++;
        }
      }
      if (coupon.usageCount > 0) {
        stats.used++;
      }
    });

    setStats(stats);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingCoupon 
        ? '/api/admin/coupons'
        : '/api/admin/coupons';
      
      const method = editingCoupon ? 'PUT' : 'POST';
      const submitData = editingCoupon 
        ? { id: editingCoupon._id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        loadCoupons();
        resetForm();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al guardar cupón');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar cupón');
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cupón?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: coupon._id,
          active: !coupon.active
        })
      });

      if (response.ok) {
        loadCoupons();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const editCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value.toString(),
      couponType: coupon.couponType,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      active: coupon.active
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      value: '',
      couponType: 'one-time',
      startDate: '',
      endDate: '',
      active: true
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.active) return { text: 'Inactivo', color: 'text-gray-500' };
    
    if (coupon.couponType === 'one-time' && coupon.usageCount > 0) {
      return { text: 'Usado', color: 'text-orange-500' };
    }
    
    if (coupon.couponType === 'time-limited') {
      const now = new Date();
      const endDate = new Date(coupon.endDate);
      if (endDate < now) {
        return { text: 'Expirado', color: 'text-red-500' };
      }
    }
    
    return { text: 'Activo', color: 'text-green-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl font-moderniz">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-montserrat">
      {/* Header */}
      <header className="bg-gray-900/85 border-b border-gray-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/logo.png"
                alt="Backline Studios"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
              <div className="hidden sm:block w-px h-8 bg-gray-600"></div>
              <h1 className="text-xl font-moderniz font-bold">Panel Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded transition-colors text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Cupones</p>
                <p className="text-2xl font-bold font-moderniz">{stats.total}</p>
              </div>
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Activos</p>
                <p className="text-2xl font-bold font-moderniz text-green-400">{stats.active}</p>
              </div>
              <div className="bg-green-600/20 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Utilizados</p>
                <p className="text-2xl font-bold font-moderniz text-orange-400">{stats.used}</p>
              </div>
              <div className="bg-orange-600/20 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Expirados</p>
                <p className="text-2xl font-bold font-moderniz text-red-400">{stats.expired}</p>
              </div>
              <div className="bg-red-600/20 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold font-moderniz">Gestión de Cupones</h2>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-purple-600/85 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Cupón</span>
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold font-moderniz">
                  {editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Código del cupón */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Código del Cupón *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="DESCUENTO20"
                    required
                  />
                </div>

                {/* Tipo de descuento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Descuento *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto Fijo (₡)</option>
                      <option value="hours">Cantidad de Horas</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valor *
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder={
                        formData.discountType === 'percentage' ? '20' : 
                        formData.discountType === 'fixed' ? '5000' : '2'
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Tipo de cupón */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Cupón *
                  </label>
                  <select
                    value={formData.couponType}
                    onChange={(e) => setFormData({...formData, couponType: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="one-time">Un solo uso</option>
                    <option value="time-limited">Por tiempo limitado</option>
                  </select>
                </div>

                {/* Fechas (solo para time-limited) */}
                {formData.couponType === 'time-limited' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha de Inicio *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fecha de Fin *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Estado - Toggle Button */}
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Estado del Cupón
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.active ? 'El cupón está activo y puede ser usado' : 'El cupón está inactivo y no puede ser usado'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, active: !formData.active})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                      formData.active ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600/85 hover:bg-purple-600 text-white py-3 rounded-lg transition-colors font-medium"
                  >
                    {editingCoupon ? 'Actualizar' : 'Crear'} Cupón
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Coupons Table */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Código</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Descuento</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Vigencia</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Usos</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-purple-400">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          {coupon.discountType === 'percentage' ? (
                            <Percent className="h-4 w-4 text-green-400" />
                          ) : coupon.discountType === 'fixed' ? (
                            <DollarSign className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-400" />
                          )}
                          <span className="font-medium">
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.value}%` 
                              : coupon.discountType === 'fixed'
                              ? `₡${coupon.value.toLocaleString('es-CR')}`
                              : `${coupon.value} hrs`
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                          {coupon.couponType === 'one-time' ? 'Un uso' : 'Por tiempo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {coupon.couponType === 'time-limited' ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span>{formatDate(coupon.startDate)}</span>
                            </div>
                            <div className="text-gray-400">hasta {formatDate(coupon.endDate)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{coupon.usageCount}</div>
                          {coupon.lastUsedAt && (
                            <div className="text-gray-400 text-xs">
                              Último: {formatDate(coupon.lastUsedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleCouponStatus(coupon)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                              coupon.active ? 'bg-green-600' : 'bg-gray-600'
                            }`}
                            title={coupon.active ? 'Desactivar cupón' : 'Activar cupón'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                coupon.active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`ml-3 text-sm font-medium ${coupon.active ? 'text-green-400' : 'text-gray-500'}`}>
                            {coupon.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => editCoupon(coupon)}
                            className="text-blue-400 hover:text-blue-300 transition-colors p-1 hover:bg-blue-400/10 rounded"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon._id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-400/10 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {coupons.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="space-y-3">
                  <div className="text-4xl">🎫</div>
                  <p className="text-lg font-medium">No hay cupones creados</p>
                  <p className="text-sm">Crea tu primer cupón para empezar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}