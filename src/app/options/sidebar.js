"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Stethoscope,
  ClipboardList,
  Calendar,
  Award,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  List,
  Medal,
  TrendingUp,
  FilePlus2,
  PawPrint,
  Heart,
  Shield,
  Pill,
  Syringe,
  Plus,
  ListChecks,
  Leaf,
  Scissors,
  XCircle,
  FileX,
} from "lucide-react";

export default function Sidebar({ onToggle }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const sidebarRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Auto-expand/collapse on hover
  const handleMouseEnter = () => {
    if (isCollapsed) {
      // Clear any existing timer
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }

      // Set a small delay before expanding to prevent accidental triggers
      hoverTimerRef.current = setTimeout(() => {
        setIsHovering(true);
        setIsCollapsed(false);
        if (onToggle) onToggle(false);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    // Clear any existing timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    if (isHovering) {
      // Set a small delay before collapsing to prevent flickering
      hoverTimerRef.current = setTimeout(() => {
        setIsHovering(false);
        setIsCollapsed(true);
        if (onToggle) onToggle(true);
      }, 500);
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  // Check if a nav item is active - FIXED for prophylaxie
  const isActive = (path) => {
    if (!path) return false;

    // Special case for prophylaxie to avoid path conflict
    if (
      path === "/options/prophylaxie" &&
      pathname !== path &&
      pathname.startsWith(`${path}/`)
    ) {
      return false; // Don't consider parent path active when on a sub-route
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Check if any submenu item is active
  const isSubmenuActive = (items) => {
    if (!items || !Array.isArray(items)) return false;
    return items.some((item) => isActive(item.path));
  };

  // Auto-expand menu if a submenu item is active
  useEffect(() => {
    const menuToExpand = {};

    menuItems.forEach((item) => {
      if (item.submenu && isSubmenuActive(item.submenu)) {
        menuToExpand[item.id] = true;
      }
    });

    setExpandedMenus(menuToExpand);
  }, [pathname]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) onToggle(newState);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleSubmenu = (id, event) => {
    event.preventDefault();
    event.stopPropagation();
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Menu items configuration
  const menuItems = [
    {
      id: "dashboard",
      title: "Tableau de bord",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/options/dashboard",
    },
    {
      id: "calendar",
      title: "Calendrier des Rappels",
      icon: <Calendar className="w-5 h-5" />,
      path: "/options/calander",
    },
    {
      id: "effectif",
      title: "Effectif Equin",
      icon: <PawPrint className="w-5 h-5" />,
      submenu: [
        {
          title: "Nouveau cheval",
          path: "/options/newhorse",
          icon: <FilePlus2 className="w-4 h-4" />,
        },
        {
          title: "Liste des chevaux",
          path: "/options/horses",
          icon: <List className="w-4 h-4" />,
        },
        {
          title: "Radiation du contrôle",
          path: "/options/radiation",
          icon: <XCircle className="w-4 h-4" />,
        },
        {
          title: "Mutation",
          path: "/options/mutation",
          icon: <FileX className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "medical",
      title: "Dossier Medical",
      icon: <Stethoscope className="w-5 h-5" />,
      submenu: [
        {
          title: "Suivi medical",
          path: "/options/choix",
          icon: <ClipboardList className="w-4 h-4" />,
        },
        {
          title: "Historique des consultations",
          path: "/options/doc",
          icon: <FileText className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "prophylaxie",
      title: "Prophylaxie",
      icon: <Syringe className="w-5 h-5" />,
      submenu: [
        {
          title: "Nouvelle prophylaxie",
          path: "/options/prophylaxie",
          icon: <Plus className="w-4 h-4" />,
        },
        {
          title: "Liste des prophylaxies",
          path: "/options/prophylaxie/list",
          icon: <ListChecks className="w-4 h-4" />,
        },
      ],
    },
    {
      id: "sport",
      title: "Sport Equestre Resultat",
      icon: <Award className="w-5 h-5" />,
      submenu: [
        {
          title: "Performance",
          path: "/options/performance",
          icon: <TrendingUp className="w-4 h-4" />,
        },
        {
          title: "Palmares",
          path: "/options/palmares",
          icon: <Medal className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1B4D3E] shadow-md text-white"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Collapse Button - Always visible outside sidebar */}
      <button
        onClick={toggleSidebar}
        className={`hidden lg:flex fixed z-50 left-0 top-1/2 ml-2 p-2 bg-[#1B4D3E] text-white rounded-full shadow-lg hover:bg-[#113324] transition-all duration-300 ${
          isCollapsed ? "opacity-50 hover:opacity-100" : "translate-x-64"
        }`}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-out
                  ${isCollapsed ? "w-20" : "w-72"} 
                  ${
                    isMobileOpen
                      ? "translate-x-0"
                      : "-translate-x-full lg:translate-x-0"
                  }`}
        style={{
          willChange: "transform, width",
          overflow: "hidden",
        }}
      >
        <aside
          className="h-full w-full flex flex-col bg-[#1B4D3E] shadow-lg"
          style={{ overflow: "hidden" }}
        >
          {/* Logo Section */}
          <div className="flex items-center h-20 px-5 border-b border-[#164433] flex-shrink-0">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl  flex items-center justify-center text-[#1B4D3E] font-bold text-lg mr-3 shadow-md">
                <img src="/logo.png" alt="GR Logo" className="h-12 w-auto" />
              </div>
              {!isCollapsed && (
                <div>
                  <div className="text-lg font-bold text-white">
                    Garde Royale
                  </div>
                  <div className="text-xs text-gray-300">
                    Service vétérinaire
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="px-3 py-4" style={{ overflow: "hidden" }}>
              <ul className="space-y-1">
                {menuItems.map((item, index) => (
                  <li
                    key={index}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.submenu ? (
                      // Menu with submenu
                      <div className="relative group">
                        <button
                          onClick={(e) => toggleSubmenu(item.id, e)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 select-none
                                ${
                                  isSubmenuActive(item.submenu)
                                    ? "bg-white text-[#1B4D3E]"
                                    : "text-white hover:bg-[#164433]"
                                }`}
                        >
                          <div className="flex items-center min-w-0">
                            <div
                              className={`flex-shrink-0 ${
                                isSubmenuActive(item.submenu)
                                  ? "text-[#1B4D3E]"
                                  : "text-white"
                              }`}
                            >
                              {item.icon}
                            </div>
                            {!isCollapsed && (
                              <span className="ml-3 overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                                {item.title}
                              </span>
                            )}
                          </div>
                          {!isCollapsed && (
                            <ChevronDown
                              className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                                expandedMenus[item.id] ? "rotate-180" : ""
                              } ${
                                isSubmenuActive(item.submenu)
                                  ? "text-[#1B4D3E]"
                                  : "text-white"
                              }`}
                            />
                          )}
                        </button>

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div
                            className={`absolute left-full top-0 ml-3 px-3 py-2 bg-white text-[#1B4D3E] text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none`}
                            style={{
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            {item.title}
                          </div>
                        )}

                        {/* Submenu - only render if expanded */}
                        {isCollapsed ? (
                          // Flyout menu for collapsed state
                          <div
                            className={`absolute left-full top-0 ml-3 bg-white shadow-xl rounded-lg p-3 w-60 
                                      opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                                      transition-opacity duration-200 z-50`}
                            style={{ top: "0" }}
                          >
                            <div className="pb-2 mb-2 border-b border-gray-100">
                              <div className="font-medium text-[#1B4D3E]">
                                {item.title}
                              </div>
                            </div>
                            <ul className="space-y-1">
                              {item.submenu.map((subItem, subIndex) => (
                                <li key={subIndex}>
                                  <Link
                                    href={subItem.path || "#"}
                                    className={`flex items-center p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
                                      isActive(subItem.path)
                                        ? "bg-[#1B4D3E]/10 text-[#1B4D3E] font-medium"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    <div
                                      className={`mr-2 ${
                                        isActive(subItem.path)
                                          ? "text-[#1B4D3E]"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {subItem.icon}
                                    </div>
                                    <span className="text-sm">
                                      {subItem.title}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          // Regular submenu for expanded state
                          <div
                            className={`overflow-hidden transition-all duration-200 ${
                              expandedMenus[item.id]
                                ? "max-h-64 opacity-100 mt-1 mb-1"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <ul className="pl-4 space-y-1 pt-1">
                              {item.submenu.map((subItem, subIndex) => (
                                <li key={subIndex}>
                                  <Link
                                    href={subItem.path || "#"}
                                    className={`flex items-center p-2.5 pl-5 rounded-lg transition-colors duration-200 
                                            ${
                                              isActive(subItem.path)
                                                ? "bg-white text-[#1B4D3E] font-medium"
                                                : "text-gray-200 hover:bg-[#164433]"
                                            }`}
                                  >
                                    <div
                                      className={`mr-2.5 ${
                                        isActive(subItem.path)
                                          ? "text-[#1B4D3E]"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      {subItem.icon}
                                    </div>
                                    <span className="text-sm">
                                      {subItem.title}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Regular menu item without submenu
                      <Link
                        href={item.path || "#"}
                        className={`flex items-center p-3 rounded-lg transition-colors duration-200 
                                ${
                                  isActive(item.path)
                                    ? "bg-white text-[#1B4D3E]"
                                    : "text-white hover:bg-[#164433]"
                                }`}
                      >
                        <div
                          className={`transition-colors duration-200 ${
                            isActive(item.path)
                              ? "text-[#1B4D3E]"
                              : "text-white"
                          }`}
                        >
                          {item.icon}
                        </div>
                        {!isCollapsed && (
                          <span className="ml-3 text-sm font-medium whitespace-nowrap">
                            {item.title}
                          </span>
                        )}
                        {isCollapsed && (
                          <div
                            className={`absolute left-full ml-3 px-3 py-2 bg-white text-[#1B4D3E] text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none`}
                          >
                            {item.title}
                          </div>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* User Section */}
          <div className="border-t border-[#164433] p-4 bg-[#164433] flex-shrink-0">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <User className="w-5 h-5 text-[#1B4D3E]" />
              </div>
              {!isCollapsed && (
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    Service Vétérinaire
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <button className="ml-auto p-2 rounded-full hover:bg-[#113324] transition-colors text-white">
                  <LogOut
                    onClick={() => router.push("/")}
                    className="w-5 h-5"
                  />
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
