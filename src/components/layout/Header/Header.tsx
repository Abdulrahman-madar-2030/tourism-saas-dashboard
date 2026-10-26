"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSidebar } from "../SidebarContext";
import HeaderProfileDropdown from "./HeaderProfileDropdown";
import HeaderQuickAdd from "./HeaderQuickAdd";
import HeaderNotifications from "./HeaderNotifications";
import {
  FaBars,
  FaMagnifyingGlass,
  FaShieldHalved,
  FaChevronDown,
} from "react-icons/fa6";
import { AiFillHome } from "react-icons/ai";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const { isCollapsed, toggleCollapsed, setMobileOpen, setCommandPaletteOpen } =
    useSidebar();
  const { data: session } = useSession();

  const handleMobileMenuClick = () => {
    if (onOpenMobileMenu) {
      onOpenMobileMenu();
    } else {
      setMobileOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between transition-all select-none shadow-xs">
      {/* Right side in RTL: Toggle, Home Breadcrumb & SaaS Super Admin Scope */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={handleMobileMenuClick}
          aria-label="فتح القائمة الجانبية"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
        >
          <FaBars className="w-4 h-4" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={isCollapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
          aria-label={isCollapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
          className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          <FaBars className="w-4 h-4" />
        </button>

        {/* Dashboard Title / Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <AiFillHome className="w-4 h-4 text-indigo-600" />
          <span>لوحة القيادة</span>
        </div>

        <span className="hidden sm:inline text-slate-300">/</span>

        {/* SaaS Super Admin Scope Capsule with dropdown indicator */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 shadow-2xs">
          <FaShieldHalved className="w-3.5 h-3.5 text-indigo-500" />
          <span>SaaS Super Admin</span>
          <span className="flex items-center gap-1 text-[11px] font-normal text-slate-500 bg-white px-2 py-0.5 rounded-full border border-indigo-100">
            <span>تفعيل</span>
            <FaChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </span>
        </div>
      </div>

      {/* Left side in RTL: Quick Add, Search, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Add Pill Button */}
        <div className="hidden md:block">
          <HeaderQuickAdd />
        </div>

        {/* Quick Search bar */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2.5 h-9 px-3.5 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all text-xs cursor-pointer w-36 sm:w-48 lg:w-56"
        >
          <FaMagnifyingGlass className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate">ابحث في النظام...</span>
        </button>

        {/* Notifications Dropdown */}
        <HeaderNotifications />

        {/* Profile Dropdown */}
        <HeaderProfileDropdown />
      </div>
    </header>
  );
}
