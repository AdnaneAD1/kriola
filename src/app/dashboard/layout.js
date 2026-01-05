'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, FileText, User, LogOut, Bell } from 'lucide-react'
import { Logo } from '../../components/ui/Logo'
import { useUsers } from '@/hooks/useUsers'
import Loading from '@/app/(auth)/Loading'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { initializeNotifications } from '@/services/firebase'

export default function DashboardLayout({ children }) {
  const { currentUser, signOutUser, loading } = useUsers()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Accueil',
      path: '/dashboard',
      showMobile: true
    },
    {
      icon: Calendar,
      label: 'Rendez-vous',
      path: '/dashboard/appointments',
      showMobile: true
    },
    {
      icon: FileText,
      label: 'Diagnostic',
      path: '/dashboard/diagnosis',
      showMobile: true
    },
    {
      icon: Bell,
      label: 'Notifications',
      path: '/dashboard/notifications',
      showMobile: false
    },
    {
      icon: User,
      label: 'Profil',
      path: '/dashboard/profile',
      showMobile: true
    }
  ]

  // useEffect(() => {
  //   if (user) {
  //     if (user.role === 'admin') {
  //       window.location.href = '/admin';
  //     }
  //   }
  // }, [user])

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutUser();
      router.replace('/login')
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Guards and redirects
  useEffect(() => {
    if (loading) return
    if (!currentUser) {
      router.replace('/login')
      return
    }
    // Only redirect to admin if the user is actually an admin
    if (currentUser.role === 'admin') {
      router.replace('/admin')
    }
  }, [currentUser, loading, router])

  // Init push notifications + save FCM token
  useEffect(() => {
    if (!currentUser) return;
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    try {
      initializeNotifications(currentUser.id).catch((e) => {
        console.error('Erreur init notifications (dashboard):', e)
      })
    } catch (e) {
      console.error('Exception init notifications (dashboard):', e)
    }
  }, [currentUser])

  if (loading || !currentUser) {
    return <Loading />
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header Mobile */}
      <header className="h-20 bg-white border-b border-gray-200 flex-shrink-0 lg:hidden">
        <div className="flex items-center justify-between px-4 h-full">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/notifications"
              className={`p-2 rounded-lg hover:bg-gray-100 ${pathname === '/dashboard/notifications' ? 'text-primary' : 'text-gray-600'}`}
            >
              <Bell className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop - Fixed, non scrollable */}
        <aside className="bg-white border-r border-gray-200 w-72 hidden lg:flex lg:flex-col flex-shrink-0">
          <div className="h-20 flex items-center px-6 border-b flex-shrink-0">
            <Logo />
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
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

          <div className="p-6 border-t flex-shrink-0">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-gray-500">Client</p>
              </div>
            </div>
            <LoadingButton
              onClick={handleLogout}
              isLoading={isLoggingOut}
              className="flex items-center w-full px-4 py-3 text-white rounded-lg hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Déconnexion</span>
            </LoadingButton>
          </div>
        </aside>

        {/* Main Content - Scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Desktop */}
          <header className="h-20 min-h-[80px] bg-white border-b border-gray-200 hidden lg:flex items-center justify-between px-6 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard/notifications"
                className={`p-2 rounded-lg hover:bg-gray-100 relative ${pathname === '/dashboard/notifications' ? 'text-primary' : 'text-gray-600'}`}
              >
                <Bell className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex items-center bg-gray-50 py-1.5 px-3 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                <p className="text-xs text-gray-500">Client</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>


      {/* Navigation Mobile - Fixed at bottom */}
      <nav className="h-16 bg-white border-t border-gray-200 lg:hidden flex-shrink-0">
        <div className="grid grid-cols-4 gap-1 h-full">
          {menuItems.filter(item => item.showMobile).map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center justify-center
                  ${isActive ? 'text-primary' : 'text-gray-600'}
                  relative
                `}
                title={item.label}
              >
                <item.icon className="w-6 h-6" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
