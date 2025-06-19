// components/admin/AdminNavigation.jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Ticket, Calendar } from 'lucide-react';

export default function AdminNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: BarChart3,
      current: pathname === '/admin/dashboard'
    },
    {
      name: 'Cupones',
      href: '/admin/coupons',
      icon: Ticket,
      current: pathname === '/admin/coupons'
    },
    {
      name: 'Reservas',
      href: '/admin/bookings',
      icon: Calendar,
      current: pathname === '/admin/bookings'
    }
  ];

  return (
    <div className="bg-gray-900/50 border-b border-gray-700 sticky top-[73px] z-30">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex space-x-0" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 border-transparent'
                } flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-200 relative`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
                {item.current && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}