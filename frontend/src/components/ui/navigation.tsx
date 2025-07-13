'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Prevent hydration mismatch by only rendering active states after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigationClick = () => {
    closeMobileMenu();
  };

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (!mounted) return false; // Return false during SSR to prevent hydration mismatch
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Helper function to get active classes
  const getActiveClasses = (path: string, isMobile = false) => {
    const active = isActive(path);
    if (isMobile) {
      return active 
        ? 'block py-3 px-4 text-primary border-l-4 border-primary bg-primary/10 rounded-lg transition-colors'
        : 'block py-3 px-4 text-foreground hover:text-primary/80 hover:bg-accent rounded-lg transition-colors';
    }
    return active
      ? 'text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:origin-left after:scale-x-100 after:transition-transform after:duration-300 after:ease-out'
      : 'text-foreground relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-out';
  };

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-foreground" prefetch={false}>
              Aviation Blog
            </Link>

            <div className="flex items-center gap-6">
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex gap-6">
                <Link 
                  href="/articles" 
                  className={getActiveClasses('/articles')}
                  prefetch={false}
                >
                  Articles
                </Link>
                <Link 
                  href="/reports" 
                  className={getActiveClasses('/reports')}
                  prefetch={false}
                >
                  Reports
                </Link>
                <Link 
                  href="/galleries" 
                  className={getActiveClasses('/galleries')}
                  prefetch={false}
                >
                  Galleries
                </Link>
              </div>
              
              {/* Desktop Theme Toggle */}
              <ThemeToggle className="hidden md:block" />
              
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
                aria-label="Toggle mobile menu"
              >
                <div className="relative w-6 h-6">
                  <span
                    className={`absolute left-0 w-6 h-0.5 bg-foreground transition-all duration-300 ${
                      isMobileMenuOpen ? 'rotate-45 top-3' : 'top-1'
                    }`}
                  />
                  <span
                    className={`absolute left-0 w-6 h-0.5 bg-foreground transition-all duration-300 top-3 ${
                      isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <span
                    className={`absolute left-0 w-6 h-0.5 bg-foreground transition-all duration-300 ${
                      isMobileMenuOpen ? '-rotate-45 top-3' : 'top-5'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/50 backdrop-blur-[4px] z-50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-[60] transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link
              href="/"
              className="text-xl font-bold text-foreground"
              onClick={closeMobileMenu}
              prefetch={false}
            >
              Aviation Blog
            </Link>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1 p-4">
            <div className="space-y-4">
              <Link
                href="/articles"
                className={getActiveClasses('/articles', true)}
                onClick={handleNavigationClick}
                prefetch={false}
              >
                Articles
              </Link>
              <Link
                href="/reports"
                className={getActiveClasses('/reports', true)}
                onClick={handleNavigationClick}
                prefetch={false}
              >
                Reports
              </Link>
              <Link
                href="/galleries"
                className={getActiveClasses('/galleries', true)}
                onClick={handleNavigationClick}
                prefetch={false}
              >
                Galleries
              </Link>
            </div>
          </nav>

          {/* Mobile Theme Toggle */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-end">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 