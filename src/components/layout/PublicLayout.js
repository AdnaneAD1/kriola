'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { Menu, X } from 'lucide-react';

export function PublicLayout({ children }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const isActive = (path) => pathname === path;

  // const navLinks = [
  //   { href: '/treatments', label: 'Traitements' },
  //   { href: '/diagnosis', label: 'Diagnostic' },
  //   { href: '/results', label: 'Résultats' },
  //   { href: '/testimonials', label: 'Témoignages' }
  // ];

  return (
    <div className="min-h-screen bg-background hero-pattern">
      {/* Navigation */}
      <nav className={`border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            {/* <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive(link.href) ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div> */}

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className={`btn-outline ${isActive('/login') ? 'bg-gray-50' : ''}`}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="btn-primary"
              >
                Inscription
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-gray-200">
              {/* {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))} */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block w-full px-3 py-2 text-center rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full px-3 py-2 text-center rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
