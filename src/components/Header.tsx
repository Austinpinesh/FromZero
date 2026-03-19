"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/ai-tutor", label: "AI Tutor" },
    { href: "/community", label: "Community" },
  ];

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl glass-nav rounded-full">
      <div className="flex items-center justify-between px-6 py-3 w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-[#20c997] flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl font-bold">north_east</span>
          </div>
          <h2 className="text-[#34343d] text-xl font-bold tracking-tight">FromZero</h2>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-[#34343d] hover:text-[#20c997] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-sm font-bold text-[#34343d] mr-2"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-[#20c997] hover:bg-[#18a077] text-white text-sm font-bold h-10 px-6 rounded-full transition-all shadow-lg shadow-[#20c997]/20 active:scale-95 flex items-center justify-center"
          >
            Get Started
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-[#34343d] p-2"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 border-t border-gray-100">
          <div className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#34343d] hover:text-[#20c997] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
