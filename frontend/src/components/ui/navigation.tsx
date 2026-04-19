'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

const FOUNDING_YEAR = 2025;

const navLinks = [
  { href: '/articles', label: 'Articles' },
  { href: '/reports', label: 'Reports' },
  { href: '/galleries', label: 'Galleries' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const socialLinks = [
  {
    href: 'https://www.instagram.com',
    label: 'Instagram',
    external: true,
    colorClasses: 'text-pink-500 hover:text-pink-600',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    href: 'https://www.facebook.com',
    label: 'Facebook',
    external: true,
    colorClasses: 'text-blue-600 hover:text-blue-700',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    href: '/contact',
    label: 'Contact',
    external: false,
    colorClasses: 'text-gray-600 hover:text-gray-700',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const currentYear = new Date().getFullYear();
  const yearDisplay =
    currentYear > FOUNDING_YEAR
      ? `${FOUNDING_YEAR} - ${currentYear}`
      : `${FOUNDING_YEAR}`;

  const hamburgerButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Focus management: move focus to the first drawer link on open,
  // and return it to the hamburger on close.
  useEffect(() => {
    if (isMobileMenuOpen) {
      wasOpenRef.current = true;
      const t = window.setTimeout(() => {
        const firstLink = panelRef.current?.querySelector<HTMLElement>('a[href]');
        firstLink?.focus();
      }, 50);
      return () => window.clearTimeout(t);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      hamburgerButtonRef.current?.focus();
    }
  }, [isMobileMenuOpen]);

  // ESC closes the menu + Tab / Shift+Tab traps focus inside
  // [hamburger, ...drawer focusables] while open.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        return;
      }

      if (e.key === 'Tab' && panelRef.current && hamburgerButtonRef.current) {
        const panelFocusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const focusable: HTMLElement[] = [
          hamburgerButtonRef.current,
          ...Array.from(panelFocusables),
        ];
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        const inGroup = focusable.includes(active as HTMLElement);

        if (e.shiftKey) {
          if (active === first || !inGroup) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !inGroup) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path: string) => {
    if (!mounted) return false;
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const getDesktopClasses = (path: string) => {
    const active = isActive(path);
    return active
      ? 'text-primary relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:origin-left after:scale-x-100 after:transition-transform after:duration-300 after:ease-out'
      : 'text-foreground relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-out';
  };

  const getMobileClasses = (path: string) => {
    const active = isActive(path);
    const base = 'block py-3 px-4 rounded-lg font-medium transition-colors';
    return active
      ? `${base} bg-primary text-primary-foreground`
      : `${base} text-foreground hover:bg-accent`;
  };

  return (
    <>
      {/* Main Navigation Bar — sits above the backdrop and drawer so the hamburger stays interactive */}
      <nav className="fixed top-0 left-0 right-0 z-[70] border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-foreground" prefetch={false}>
              RAW Aviation
            </Link>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex gap-6">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={getDesktopClasses(l.href)}
                    prefetch={false}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <ThemeToggle className="hidden md:block" />

              <button
                ref={hamburgerButtonRef}
                onClick={toggleMobileMenu}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu-panel"
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

      {/* Backdrop — always rendered so opacity can transition */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-[4px] z-50 md:hidden transition-opacity duration-300 ease-out ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Drawer — slides from the right, sits below the nav bar */}
      <div
        id="mobile-menu-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-[85vw] max-w-xs bg-background border-l border-border z-[60] transform transition-transform duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer links */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={getMobileClasses(l.href)}
                  onClick={closeMobileMenu}
                  prefetch={false}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Drawer footer: socials + theme + copyright */}
          <div className="p-4 border-t border-border space-y-4">
            <div className="flex items-center gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  {...(s.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  onClick={!s.external ? closeMobileMenu : undefined}
                  aria-label={s.label}
                  title={s.label}
                  className={`${s.colorClasses} transition-colors`}
                >
                  {s.icon}
                </a>
              ))}
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              © {yearDisplay} RAW Aviation
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
