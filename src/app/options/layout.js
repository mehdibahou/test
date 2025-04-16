"use client";
import React, { useState } from "react";
import Sidebar from "./sidebar";

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Sidebar stays fixed */}
      <div className="fixed top-0 left-0 h-screen z-40">
        <Sidebar onToggle={handleSidebarToggle} />
      </div>

      {/* Main content area - just one container with padding and scrolling */}
      <div
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? "pl-20" : "pl-72"
        }`}
      >
        <div className="p-2 pb-8">{children}</div>
      </div>
    </div>
  );
}
