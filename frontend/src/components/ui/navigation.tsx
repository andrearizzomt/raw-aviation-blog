'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleNavigationClick = (path: string) => {
    closeMobileMenu();
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

            <div className="flex items-center space-x-4">
              {/* Desktop Navigation Links */}
              <div className="hidden md:flex space-x-6">
                <Link 
                  href="/articles" 
                  className="text-foreground hover:text-primary/80 transition-colors" 
                  prefetch={false}
                >
                  Articles
                </Link>
                <Link 
                  href="/reports" 
                  className="text-foreground hover:text-primary/80 transition-colors" 
                  prefetch={false}
                >
                  Reports
                </Link>
                <Link 
                  href="/galleries" 
                  className="text-foreground hover:text-primary/80 transition-colors" 
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
                className="block py-3 px-4 text-foreground hover:text-primary/80 hover:bg-accent rounded-lg transition-colors"
                onClick={() => handleNavigationClick('/articles')}
                prefetch={false}
              >
                Articles
              </Link>
              <Link
                href="/reports"
                className="block py-3 px-4 text-foreground hover:text-primary/80 hover:bg-accent rounded-lg transition-colors"
                onClick={() => handleNavigationClick('/reports')}
                prefetch={false}
              >
                Reports
              </Link>
              <Link
                href="/galleries"
                className="block py-3 px-4 text-foreground hover:text-primary/80 hover:bg-accent rounded-lg transition-colors"
                onClick={() => handleNavigationClick('/galleries')}
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