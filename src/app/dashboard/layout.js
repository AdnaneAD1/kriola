'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, FileText, User, LogOut, Menu, Bell } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 lg:hidden">
        <div className="flex items-center justify-between px-4 h-full">
          <Logo />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside 
          className={`
            bg-white border-r border-gray-200 fixed top-0 bottom-0 left-0 z-40 w-72 
            transform transition-transform duration-200 ease-in-out lg:relative lg:transform-none
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 border-b hidden lg:flex">
              <Logo />
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`
                      flex items-center px-4 py-3 text-gray-600 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-primary/5 hover:text-primary'
                      }
                    `}
                  >
                    <item.icon className={`
                      w-5 h-5 mr-3
                      ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t mt-auto">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500">Client</p>
                </div>
              </div>
              <button
                className="flex items-center w-full px-4 py-3 text-gray-600 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay pour fermer la sidebar sur mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full pt-16 lg:pt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex flex-col items-center justify-center py-3
                  ${isActive ? 'text-primary' : 'text-gray-600'}
                `}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
