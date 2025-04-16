"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, ChevronLeft } from "lucide-react";
import Link from "next/link";

// Navigation component
const TopNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const showBackButton = pathname !== "/";

  // Dans votre TopNavigation ou composant de navigation
  const handleBackNavigation = () => {
    // Si nous sommes sur une page de détail de cheval
    if (pathname.includes("/horse/")) {
      router.replace("/options/horses");
      return;
    }

    // Pour les autres cas
    router.back();
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className=" mx-10 px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => handleBackNavigation()}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Retour"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img src="/logo.png" alt="GR Logo" className="h-12 w-auto" />
          </div>

          {/* Right Navigation */}
          {pathname !== "/" && (
            <nav className="flex items-center gap-6">
              <Link
                href="/options"
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5" />
              </Link>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

// Client Layout Component
export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <TopNavigation />
      <main>{children}</main>
    </div>
  );
}
