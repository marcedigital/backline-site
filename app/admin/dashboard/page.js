// app/admin/dashboard/page.js - VERSION COMPLETA
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ticket,
  TrendingUp,
  Clock,
  Users,
  Eye,
  Calendar,
  BarChart3,
  Settings,
  Plus
} from 'lucide-react';

export default function AdminDashboard() {
  const [dbStatus, setDbStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    usedCoupons: 0,
    expiredCoupons: 0,
    totalSavings: 0,
    recentUsage: []
  });
  const [recentCoupons, setRecentCoupons] = useState([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        checkDatabaseStatus(),
        loadCouponStats(),
        loadRecentCoupons()
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/database-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDbStatus(data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error al verificar el estado de la base de datos');
    }
  };

  const loadCouponStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        calculateStats(data.coupons);
      }
    } catch (error) {
      console.error('Error loading coupon stats:', error);
    }
  };

  const loadRecentCoupons = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Mostrar los 5 cupones más recientes
        setRecentCoupons(data.coupons.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading recent coupons:', error);
    }
  };

  const calculateStats = (couponList) => {
    const now = new Date();
    const newStats = {
      totalCoupons: couponList.length,
      activeCoupons: 0,
      usedCoupons: 0,
      expiredCoupons: 0,
      totalSavings: 0,
      recentUsage: []
    };

    couponList.forEach(coupon => {
      // Conteo de estados
      if (coupon.active) {
        if (coupon.couponType === 'time-limited' && new Date(coupon.endDate) < now) {
          newStats.expiredCoupons++;
        } else {
          newStats.activeCoupons++;
        }
      }
      
      if (coupon.usageCount > 0) {
        newStats.usedCoupons++;
        
        // Calcular ahorros aproximados (esto es una estimación)
        // En un sistema real, deberías trackear el monto exacto ahorrado
        let estimatedSaving = 0;
        if (coupon.discountType === 'fixed') {
          estimatedSaving = coupon.value * coupon.usageCount;
        } else {
          // Estimación para porcentajes (asumiendo un ticket promedio de ₡20,000)
          estimatedSaving = (20000 * (coupon.value / 100)) * coupon.usageCount;
        }
        newStats.totalSavings += estimatedSaving;
        
        // Agregar a actividad reciente
        if (coupon.lastUsedAt) {
          newStats.recentUsage.push({
            code: coupon.code,
            date: coupon.lastUsedAt,
            saving: coupon.discountType === 'fixed' ? coupon.value : `${coupon.value}%`
          });
        }
      }
    });

    // Ordenar actividad reciente por fecha
    newStats.recentUsage.sort((a, b) => new Date(b.date) - new Date(a.date));
    newStats.recentUsage = newStats.recentUsage.slice(0, 5); // Solo los 5 más recientes

    setStats(newStats);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCouponStatusBadge = (coupon) => {
    if (!coupon.active) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">Inactivo</span>;
    }
    
    if (coupon.couponType === 'one-time' && coupon.usageCount > 0) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-600/20 text-orange-400">Usado</span>;
    }
    
    if (coupon.couponType === 'time-limited') {
      const now = new Date();
      const endDate = new Date(coupon.endDate);
      if (endDate < now) {
        return <span className="px-2 py-1 text-xs rounded-full bg-red-600/20 text-red-400">Expirado</span>;
      }
    }
    
    return <span className="px-2 py-1 text-xs rounded-full bg-green-600/20 text-green-400">Activo</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <div className="text-white text-xl font-moderniz">Cargando Dashboard...</div>
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
              <h1 className="text-xl font-moderniz font-bold">Panel de Administración</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/coupons"
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
              >
                <Ticket className="h-4 w-4" />
                <span className="hidden sm:inline">Gestionar Cupones</span>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-moderniz mb-2">
            Bienvenido al Panel Admin
          </h2>
          <p className="text-gray-400">
            Gestiona cupones, revisa estadísticas y supervisa el sistema de descuentos de Backline Studios.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Cupones */}
          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Cupones</p>
                <p className="text-3xl font-bold font-moderniz mt-1">{stats.totalCoupons}</p>
              </div>
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <Ticket className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Cupones Activos */}
          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Activos</p>
                <p className="text-3xl font-bold font-moderniz mt-1 text-green-400">{stats.activeCoupons}</p>
              </div>
              <div className="bg-green-600/20 p-3 rounded-lg">
                <Eye className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Cupones Utilizados */}
          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Utilizados</p>
                <p className="text-3xl font-bold font-moderniz mt-1 text-orange-400">{stats.usedCoupons}</p>
              </div>
              <div className="bg-orange-600/20 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Ahorros Totales */}
          <div className="bg-gray-900/50 border border-gray-700 p-6 rounded-lg backdrop-blur-sm hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Ahorros Estimados</p>
                <p className="text-3xl font-bold font-moderniz mt-1 text-blue-400">
                  ₡{stats.totalSavings.toLocaleString('es-CR')}
                </p>
              </div>
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Estado del Sistema */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold font-moderniz">Estado del Sistema</h3>
              </div>
              
              {/* Database Status */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Base de Datos</p>
                  {error ? (
                    <div className="text-red-400 text-sm">
                      <p>❌ Error: {error}</p>
                    </div>
                  ) : dbStatus ? (
                    <div className={`text-sm ${dbStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                      <p className="flex items-center space-x-2">
                        <span>{dbStatus.connected ? '✅' : '❌'}</span>
                        <span>{dbStatus.message}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Última verificación: {new Date(dbStatus.timestamp).toLocaleString('es-CR')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      <p>Verificando estado...</p>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={checkDatabaseStatus}
                  className="w-full bg-blue-600/80 hover:bg-blue-600 px-4 py-2 rounded transition-colors text-sm"
                >
                  Verificar Nuevamente
                </button>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-3">Acciones Rápidas</p>
                <div className="space-y-2">
                  <Link
                    href="/admin/coupons"
                    className="w-full bg-purple-600/80 hover:bg-purple-600 px-4 py-2 rounded transition-colors text-sm flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Crear Cupón</span>
                  </Link>
                  <Link
                    href="/admin/coupons"
                    className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors text-sm flex items-center justify-center space-x-2"
                  >
                    <Ticket className="h-4 w-4" />
                    <span>Ver Todos los Cupones</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Coupons */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Cupones Recientes */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Ticket className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-semibold font-moderniz">Cupones Recientes</h3>
                </div>
                <Link
                  href="/admin/coupons"
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
              
              {recentCoupons.length > 0 ? (
                <div className="space-y-3">
                  {recentCoupons.map((coupon) => (
                    <div key={coupon._id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="font-mono font-bold text-purple-400">{coupon.code}</div>
                        <div className="text-sm text-gray-300">
                          {coupon.discountType === 'percentage' ? `${coupon.value}%` : `₡${coupon.value.toLocaleString('es-CR')}`}
                        </div>
                        {getCouponStatusBadge(coupon)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {coupon.usageCount} uso{coupon.usageCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No hay cupones creados</p>
                  <p className="text-sm mt-1">Crea tu primer cupón para empezar</p>
                  <Link
                    href="/admin/coupons"
                    className="inline-block mt-4 bg-purple-600/80 hover:bg-purple-600 px-4 py-2 rounded transition-colors text-sm"
                  >
                    Crear Cupón
                  </Link>
                </div>
              )}
            </div>

            {/* Actividad Reciente */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold font-moderniz">Actividad Reciente</h3>
              </div>
              
              {stats.recentUsage.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentUsage.map((usage, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-mono font-medium text-purple-400">{usage.code}</div>
                          <div className="text-xs text-gray-400">Cupón utilizado</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-400">
                          {typeof usage.saving === 'number' ? `₡${usage.saving.toLocaleString('es-CR')}` : usage.saving}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(usage.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">Sin actividad reciente</p>
                  <p className="text-sm mt-1">Los usos de cupones aparecerán aquí</p>
                </div>
              )}
            </div>

            {/* Resumen Rápido */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold font-moderniz">Resumen del Sistema</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Tasa de Uso</p>
                      <p className="text-xl font-bold font-moderniz">
                        {stats.totalCoupons > 0 ? Math.round((stats.usedCoupons / stats.totalCoupons) * 100) : 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {stats.usedCoupons} de {stats.totalCoupons} cupones utilizados
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Cupones Expirados</p>
                      <p className="text-xl font-bold font-moderniz text-red-400">{stats.expiredCoupons}</p>
                    </div>
                    <Calendar className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Requieren atención o limpieza
                  </p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded border border-gray-700 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Estado General</p>
                      <p className="text-lg font-bold font-moderniz text-green-400">
                        {stats.activeCoupons > 0 ? 'Sistema Operativo' : 'Sin Cupones Activos'}
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${stats.activeCoupons > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {stats.activeCoupons > 0 
                      ? `${stats.activeCoupons} cupones activos disponibles para uso`
                      : 'Considera crear cupones para ofrecer descuentos'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-purple-900/20 border border-purple-600/30 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-600/20 p-2 rounded-lg mt-1">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold font-moderniz text-purple-300 mb-2">
                💡 Consejos para Optimizar Cupones
              </h4>
              <div className="text-sm text-purple-200/80 space-y-2">
                <p>• <strong>Cupones de porcentaje:</strong> Ideales para descuentos variables según el monto total</p>
                <p>• <strong>Cupones de monto fijo:</strong> Perfectos para promociones específicas (ej: ₡5,000 de descuento)</p>
                <p>• <strong>Un solo uso:</strong> Para promociones exclusivas o códigos personalizados</p>
                <p>• <strong>Por tiempo limitado:</strong> Para campañas promocionales con fechas específicas</p>
                <p>• <strong>Monitorea regularmente:</strong> Revisa cupones expirados y estadísticas de uso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}