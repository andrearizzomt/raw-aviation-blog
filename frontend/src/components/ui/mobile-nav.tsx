'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Burger Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
        aria-label="Toggle mobile menu"
      >
        <div className="relative w-6 h-6">
          <span
            className={`absolute left-0 w-6 h-0.5 bg-foreground transition-all duration-300 ${
              isOpen ? 'rotate-45 top-3' : 'top-1'
            }`}
          />
          <span
            className={`absolute left-0 w-6 h-0.5 bg-foreground transition-all duration-300 top-3 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute left-0 w-6 h-0.5 bg-foreground transition-all duration-300 ${
              isOpen ? '-rotate-45 top-3' : 'top-5'
            }`}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/50 backdrop-blur-[4px] z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link
              href="/"
              className="text-xl font-bold text-foreground"
              onClick={closeMenu}
            >
              Aviation Blog
            </Link>
            <button
              onClick={closeMenu}
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

          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <div className="space-y-4">
              <Link
                href="/articles"
                className="block py-3 px-4 text-foreground hover:text-primary/80 hover:bg-accent rounded-lg transition-colors"
                onClick={closeMenu}
              >
                Articles
              </Link>
              <Link
                href="/reports"
                className="block py-3 px-4 text-foreground hover:text-primary/80 hover:bg-accent rounded-lg transition-colors"
                onClick={closeMenu}
              >
                Reports
              </Link>
              <Link
                href="/galleries"
                className="block py-3 px-4 text-foreground hover:text-primary/80 hover:bg-accent rounded-lg transition-colors"
                onClick={closeMenu}
              >
                Galleries
              </Link>
            </div>
          </nav>

          {/* Footer with Theme Toggle */}
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