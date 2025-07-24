// app/admin/bookings/page.js - RESTAURADO AL ORIGINAL + IMÁGENES
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
  MoreHorizontal,
  BarChart3,
  FileImage
} from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [topCoupons, setTopCoupons] = useState([]);
  const [pagination, setPagination] = useState({});
  const [selectedImage, setSelectedImage] = useState(null); // NUEVO: Para modal de imagen
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
      
      // IMPORTANTE: Siempre incluir imágenes para el admin
      queryParams.append('includeImages', 'true');
      
      const response = await fetch(`/api/admin/bookings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
        setStats(data.stats);
        setTopCoupons(data.topCoupons || []);
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
        body: JSON.stringify({ id: bookingId, status: newStatus })
      });

      if (response.ok) {
        await loadBookings(); // Recargar datos
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pendiente' },
      confirmed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Confirmada' },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Cancelada' },
      completed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Completada' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium border rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // NUEVA FUNCIÓN: Para descargar imagen
  const downloadImage = (imageData, booking) => {
    if (!imageData) return;

    try {
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `comprobante_${booking._id}_${new Date(booking.createdAt).toISOString().slice(0, 10)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error al descargar la imagen');
      console.error('Download error:', err);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white font-montserrat">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
            <div className="text-lg font-medium">Cargando Reservas...</div>
          </div>
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

      {/* Navigation Tabs */}
      <div className="bg-gray-900/50 border-b border-gray-700 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-0" aria-label="Admin Navigation">
            <Link
              href="/admin/dashboard"
              className="text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 border-transparent flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/coupons"
              className="text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 border-transparent flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200"
            >
              <Ticket className="h-4 w-4" />
              <span>Cupones</span>
            </Link>
            <Link
              href="/admin/bookings"
              className="bg-purple-600/20 text-purple-300 border-purple-500 flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200 relative"
            >
              <Calendar className="h-4 w-4" />
              <span>Reservas</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  placeholder="Buscar..."
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

            {/* Fechas */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Desde</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
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

          <div className="hidden md:block overflow-x-auto">
            {bookings.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Fecha de Reserva</th>
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
                            {booking.reservationDate ? 
                              (() => {
                                const date = new Date(booking.reservationDate);
                                const year = date.getUTCFullYear();
                                const month = date.getUTCMonth();
                                const day = date.getUTCDate();
                                const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                                return `${day} ${monthNames[month]} ${year}`;
                              })() : 
                              formatDate(booking.createdAt)
                            }
                          </div>
                          <div className="text-gray-400 text-xs">
                            Creada: {formatDate(booking.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {/* ARREGLADO: Mejor detección de imagen */}
                        {(booking.receiptImage && booking.receiptImage.startsWith('data:')) || booking.hasReceiptImage ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <FileImage className="h-4 w-4 text-green-400" />
                              <span className="text-xs text-green-400">
                                {booking.receiptImageSizeFormatted || 
                                 (booking.receiptImageSize ? `${(booking.receiptImageSize / 1024).toFixed(1)} KB` : '') || 
                                 'Imagen'}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedImage({
                                    src: booking.receiptImage,
                                    booking: booking
                                  });
                                }}
                                className="text-blue-400 hover:text-blue-300 p-1"
                                title="Ver imagen"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => downloadImage(booking.receiptImage, booking)}
                                className="text-green-400 hover:text-green-300 p-1"
                                title="Descargar imagen"
                              >
                                <Download className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500 text-xs">Sin imagen</span>
                          </div>
                        )}
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
                            <div className="font-mono font-medium text-green-400">{booking.couponUsed.code}</div>
                            <div className="text-gray-400 text-xs">
                              -{booking.discount > 0 ? `₡${booking.discount.toLocaleString('es-CR')}` : '0'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-bold text-white">₡{booking.total.toLocaleString('es-CR')}</div>
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
                        <div className="flex items-center space-x-1">
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

          {/* Mobile Cards */}
          <div className="md:hidden">
            {bookings.length > 0 ? (
              <div className="p-4 space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {(booking.receiptImage && booking.receiptImage.startsWith('data:')) || booking.hasReceiptImage ? (
                          <div className="flex items-center space-x-1">
                            <FileImage className="h-4 w-4 text-green-400" />
                            <span className="text-xs text-green-400">
                              {booking.receiptImageSizeFormatted || 'Imagen'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">Sin imagen</span>
                        )}
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Main Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <span className="text-gray-400">Fecha Reserva:</span>
                        <div className="font-medium">
                          {booking.reservationDate ? 
                            (() => {
                              const date = new Date(booking.reservationDate);
                              const year = date.getUTCFullYear();
                              const month = date.getUTCMonth();
                              const day = date.getUTCDate();
                              const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                              return `${day} ${monthNames[month]} ${year}`;
                            })() : 
                            formatDate(booking.createdAt)
                          }
                        </div>
                        <div className="text-xs text-gray-400">
                          Creada: {formatDate(booking.createdAt)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Sesión:</span>
                        <div className="font-medium">{booking.hours} hrs</div>
                        {(booking.services.platillos || booking.services.pedalDoble) && (
                          <div className="text-xs text-gray-400">
                            {booking.services.platillos && 'Platillos '}
                            {booking.services.pedalDoble && 'Pedal Doble'}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-400">Total:</span>
                        <div className="font-bold text-white">₡{booking.total.toLocaleString('es-CR')}</div>
                        {booking.discount > 0 && (
                          <div className="text-gray-400 text-xs line-through">
                            ₡{booking.subtotal.toLocaleString('es-CR')}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-400">Cupón:</span>
                        {booking.couponUsed?.code ? (
                          <div className="font-mono font-medium text-green-400">{booking.couponUsed.code}</div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {(booking.receiptImage && booking.receiptImage.startsWith('data:')) && (
                          <>
                            <button
                              onClick={() => setSelectedImage({
                                src: booking.receiptImage,
                                booking: booking
                              })}
                              className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Ver</span>
                            </button>
                            <button
                              onClick={() => downloadImage(booking.receiptImage, booking)}
                              className="text-green-400 hover:text-green-300 text-xs flex items-center space-x-1"
                            >
                              <Download className="h-3 w-3" />
                              <span>Descargar</span>
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                              className="text-green-400 hover:text-green-300 p-1"
                              title="Confirmar"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Cancelar"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Completar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No hay reservas</p>
                <p className="text-sm">Las nuevas reservas aparecerán aquí</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Página {pagination.currentPage} de {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed px-4 py-2 rounded text-sm transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed px-4 py-2 rounded text-sm transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NUEVO: Modal de imagen */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Comprobante de Pago</h3>
                <p className="text-gray-400 text-sm">
                  Reserva del {new Date(selectedImage.booking.createdAt).toLocaleDateString('es-CR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.src}
                alt="Comprobante"
                className="w-full h-auto max-h-[70vh] object-contain rounded"
              />
            </div>
            <div className="p-4 border-t border-gray-700 flex gap-2">
              <button
                onClick={() => downloadImage(selectedImage.src, selectedImage.booking)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                Descargar
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}