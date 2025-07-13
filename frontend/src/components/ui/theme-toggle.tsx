"use client";

import { useTheme } from "./theme-provider";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Don't render anything until after hydration to prevent flickering
  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-lg transition-colors cursor-pointer border ${className}`.trim()}
        style={{ borderColor: '#000000' }}
        aria-label="Toggle theme"
        disabled
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const baseClasses = "p-2 rounded-lg transition-colors cursor-pointer border";
  const borderColor = theme === 'light' ? '#000000' : '#EAB308';
  const themeClasses = theme === 'light'
    ? 'hover:bg-accent'
    : 'hover:bg-accent';

  // Ensure consistent class ordering to prevent hydration mismatches
  const finalClasses = [baseClasses, themeClasses, className].filter(Boolean).join(' ');

  return (
    <button
      onClick={toggleTheme}
      className={finalClasses}
      style={{ borderColor: borderColor }}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        // Moon icon for light theme (black fill)
        <svg
          className="w-5 h-5"
          style={{ color: '#000000' }}
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      ) : (
        // Sun icon for dark theme (yellow fill)
        <svg
          className="w-5 h-5"
          style={{ color: '#EAB308' }}
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
        </svg>
      )}
    </button>
  );
} 