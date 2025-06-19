'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        router.push('/admin/dashboard');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-96 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Admin Panel
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent rounded"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 font-medium transition-colors rounded disabled:opacity-50"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}