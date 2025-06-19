'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [dbStatus, setDbStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    checkDatabaseStatus();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }
  };

  const checkDatabaseStatus = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-900 border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Estado de Base de Datos */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Estado de Base de Datos</h3>
            
            {error ? (
              <div className="text-red-400">
                <p>❌ Error: {error}</p>
              </div>
            ) : dbStatus ? (
              <div className={dbStatus.connected ? 'text-green-400' : 'text-red-400'}>
                <p>
                  {dbStatus.connected ? '✅' : '❌'} {dbStatus.message}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Última verificación: {new Date(dbStatus.timestamp).toLocaleString('es-CR')}
                </p>
              </div>
            ) : (
              <div className="text-gray-400">
                <p>Verificando estado...</p>
              </div>
            )}
            
            <button
              onClick={checkDatabaseStatus}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              Verificar Nuevamente
            </button>
          </div>

          {/* Estadísticas de Cupones */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Cupones</h3>
            <p className="text-gray-400">
              Próximamente: Gestión de cupones y estadísticas
            </p>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Acciones</h3>
            <p className="text-gray-400">
              Próximamente: Crear/editar cupones
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}