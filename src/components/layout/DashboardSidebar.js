'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, FileText, User, LogOut, Bell } from 'lucide-react';
import { Logo } from '../ui/Logo';

export function DashboardSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Vue d\'ensemble', 
      path: '/dashboard' 
    },
    { 
      icon: Calendar, 
      label: 'Rendez-vous', 
      path: '/dashboard/appointments' 
    },
    { 
      icon: FileText, 
      label: 'Diagnostic', 
      path: '/dashboard/diagnosis' 
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      path: '/dashboard/notifications' 
    },
    { 
      icon: User, 
      label: 'Profil', 
      path: '/dashboard/profile' 
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Logo />
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col justify-between">
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
                  }
                `}
              >
                <item.icon className={`
                  w-5 h-5 mr-3
                  ${isActive ? 'text-primary' : 'text-gray-400'}
                `} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Client</p>
            </div>
          </div>
          <button
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
