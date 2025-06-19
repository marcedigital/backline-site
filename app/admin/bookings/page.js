// app/admin/bookings/page.js - COMPLETO
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  DollarSign,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Ticket,
  RefreshCw,
  Download,
  MoreHorizontal
} from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [topCoupons, setTopCoupons] = useState([]);
  const [pagination, setPagination] = useState({});
  const router = useRouter();

  // Filtros
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    hasCoupon: 'all'
  });

  useEffect(() => {
    checkAuth();
    loadBookings();
  }, [filters]);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Construir query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value);
        }
      });
      
      const response = await fetch(`/api/admin/bookings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
        setStats(data.stats);
        setTopCoupons(data.topCoupons);
        setPagination(data.pagination);
      } else {
        console.error('Error loading bookings');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus
        })
      });

      if (response.ok) {
        loadBookings(); // Recargar lista
      } else {
        alert('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error de conexión');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30', icon: Clock, text: 'Pendiente' },
      confirmed: { color: 'bg-green-600/20 text-green-400 border-green-600/30', icon: CheckCircle, text: 'Confirmada' },
      cancelled: { color: 'bg-red-600/20 text-red-400 border-red-600/30', icon: XCircle, text: 'Cancelada' },
      completed: { color: 'bg-blue-600/20 text-blue-400 border-blue-600/30', icon: CheckCircle, text: 'Completada' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filter changes
    }));
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <div className="text-white text-xl font-moderniz">Cargando Reservas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-montserrat">
      {/* Header */}
      <header className="bg-gray-900/85 border-b border-gray-700 backdrop-blur-sm sticky top-0 z-40">
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
              <h1 className="text-xl font-moderniz font-bold">Gestión de Reservas</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/coupons"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Cupones
              </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Reservas</p>
                <p className="text-2xl font-bold font-moderniz">{stats.totalBookings || 0}</p>
              </div>
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ingresos Totales</p>
                <p className="text-2xl font-bold font-moderniz text-green-400">
                  ₡{(stats.totalRevenue || 0).toLocaleString('es-CR')}
                </p>
              </div>
              <div className="bg-green-600/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cupones Usados</p>
                <p className="text-2xl font-bold font-moderniz text-orange-400">{stats.couponsUsed || 0}</p>
              </div>
              <div className="bg-orange-600/20 p-3 rounded-lg">
                <Ticket className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Promedio por Reserva</p>
                <p className="text-2xl font-bold font-moderniz text-purple-400">
                  ₡{Math.round(stats.averageBookingValue || 0).toLocaleString('es-CR')}
                </p>
              </div>
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold font-moderniz">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Comprobante o cupón..."
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Completada</option>
              </select>
            </div>

            {/* Cupones */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cupones</label>
              <select
                value={filters.hasCoupon}
                onChange={(e) => handleFilterChange('hasCoupon', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">Todos</option>
                <option value="true">Con cupón</option>
                <option value="false">Sin cupón</option>
              </select>
            </div>

            {/* Acciones */}
            <div className="flex items-end space-x-2">
              <button
                onClick={loadBookings}
                className="flex-1 bg-purple-600/80 hover:bg-purple-600 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold font-moderniz">Reservas Recientes</h3>
              <div className="text-sm text-gray-400">
                {pagination.totalCount || 0} reservas total
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {bookings.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Comprobante</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Sesión</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Cupón</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-white">
                            {formatDate(booking.createdAt)}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {booking.ipAddress !== 'unknown' && `IP: ${booking.ipAddress}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-medium text-purple-400">
                          {booking.receiptDetail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium">{booking.hours} hrs</div>
                          <div className="text-gray-400 text-xs">
                            {booking.services.platillos && 'Platillos '}
                            {booking.services.pedalDoble && 'Pedal Doble'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {booking.couponUsed?.code ? (
                          <div className="text-sm">
                            <div className="font-mono font-medium text-green-400">
                              {booking.couponUsed.code}
                            </div>
                            <div className="text-gray-400 text-xs">
                              -₡{booking.discount.toLocaleString('es-CR')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Sin cupón</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-bold text-white">
                            ₡{booking.total.toLocaleString('es-CR')}
                          </div>
                          {booking.discount > 0 && (
                            <div className="text-gray-400 text-xs line-through">
                              ₡{booking.subtotal.toLocaleString('es-CR')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                className="text-green-400 hover:text-green-300 transition-colors p-1 hover:bg-green-400/10 rounded"
                                title="Confirmar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-400/10 rounded"
                                title="Cancelar"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'completed')}
                              className="text-blue-400 hover:text-blue-300 transition-colors p-1 hover:bg-blue-400/10 rounded"
                              title="Marcar como completada"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="space-y-3">
                  <Calendar className="h-12 w-12 mx-auto opacity-50" />
                  <p className="text-lg font-medium">No hay reservas</p>
                  <p className="text-sm">Las nuevas reservas aparecerán aquí</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Coupons Sidebar */}
        {topCoupons.length > 0 && (
          <div className="mt-8 bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold font-moderniz mb-4">Cupones Más Usados</h3>
            <div className="space-y-3">
              {topCoupons.map((coupon, index) => (
                <div key={coupon._id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-600/20 p-2 rounded">
                      <span className="text-purple-400 font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-purple-400">{coupon._id}</div>
                      <div className="text-xs text-gray-400">
                        {coupon.discountType === 'percentage' ? `${coupon.value}%` : 
                         coupon.discountType === 'fixed' ? `₡${coupon.value.toLocaleString('es-CR')}` :
                         `${coupon.value} hrs`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{coupon.usageCount} usos</div>
                    <div className="text-xs text-gray-400">
                      ₡{coupon.totalSavings.toLocaleString('es-CR')} ahorrado
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}