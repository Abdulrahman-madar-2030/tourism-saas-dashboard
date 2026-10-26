"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import LinkGroup, { isPathActive } from "./LinkGroup";
import SignOutBtn from "@/components/common/SignOut/SignOut";
import { useSidebar } from "../SidebarContext";
import { linkGroups, allNavLinks } from "../navigationData";

// Icons
import {
  FaXmark,
  FaMagnifyingGlass,
  FaStar,
  FaAnglesRight,
  FaAnglesLeft,
  FaShieldHalved,
  FaTree,
} from "react-icons/fa6";
import { TbBeach } from "react-icons/tb";
import { IoPersonSharp } from "react-icons/io5";

interface DashboardSideBarProps {
  onClose?: () => void;
  forceExpanded?: boolean;
}

const findActiveGroup = (pathname: string) =>
  linkGroups.find((g) => g.links.some((l) => isPathActive(pathname, l.path)))
    ?.group_name ?? "التقارير والتحليلات";

export default function DashboardSideBar({
  onClose,
  forceExpanded = false,
}: DashboardSideBarProps) {
  const { data: session } = useSession();
  const pathname = usePathname() ?? "";
  const {
    isCollapsed: contextCollapsed,
    toggleCollapsed,
    pinnedPaths,
    togglePin,
    setCommandPaletteOpen,
  } = useSidebar();

  const isCollapsed = forceExpanded ? false : contextCollapsed;

  const [query, setQuery] = useState("");
  // Default open to active group or "التقارير والتحليلات" as shown in the UI reference
  const [openGroup, setOpenGroup] = useState<string | null>(() =>
    pathname === "/dashboard/home"
      ? "التقارير والتحليلات"
      : findActiveGroup(pathname)
  );

  const [hoveredLink, setHoveredLink] = useState<{
    name: string;
    badge?: string;
    top: number;
  } | null>(null);

  useEffect(() => {
    if (pathname !== "/dashboard/home") {
      setOpenGroup(findActiveGroup(pathname));
    }
  }, [pathname]);

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const visibleGroups = useMemo(() => {
    if (!isSearching) return linkGroups;
    return linkGroups
      .map((group) => ({
        ...group,
        links: group.links.filter(
          (l) =>
            l.link_name.toLowerCase().includes(normalizedQuery) ||
            group.group_name.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((group) => group.links.length > 0);
  }, [normalizedQuery, isSearching]);

  const pinnedItems = useMemo(() => {
    return allNavLinks.filter((item) => pinnedPaths.includes(item.path));
  }, [pinnedPaths]);

  // -------------------------------------------------------------
  // 1. COLLAPSED (MINI RAIL) MODE FOR DESKTOP
  // -------------------------------------------------------------
  if (isCollapsed) {
    return (
      <aside
        aria-label="القائمة الجانبية المصغرة"
        className="flex h-full w-20 flex-col border-l border-slate-200/80 bg-white text-slate-700 select-none transition-all duration-300 shadow-sm"
      >
        {/* Brand Header */}
        <div className="flex h-16 flex-shrink-0 flex-col items-center justify-center border-b border-slate-100">
          <button
            type="button"
            onClick={toggleCollapsed}
            title="انقر لتوسيع القائمة الجانبية"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 p-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            <TbBeach className="h-6 w-6 text-indigo-600" />
          </button>
        </div>

        {/* Mini Navigation Icons */}
        <nav
          aria-label="روابط سريعة مصغرة"
          className="flex-1 space-y-2 overflow-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {linkGroups.map((group) => (
            <div
              key={group.group_name}
              className="space-y-1 border-b border-slate-100 pb-2 last:border-b-0"
            >
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive = isPathActive(pathname, link.path);
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredLink({
                        name: link.link_name,
                        badge: link.badge,
                        top: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredLink(null)}
                    title={link.link_name}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Floating Tooltip in collapsed mode */}
        {hoveredLink && (
          <div
            style={{ top: `${hoveredLink.top}px` }}
            className="fixed right-22 z-50 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-xl pointer-events-none animate-fadeIn whitespace-nowrap"
          >
            {hoveredLink.name}
            {hoveredLink.badge && (
              <span className="ms-2 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px]">
                {hoveredLink.badge}
              </span>
            )}
          </div>
        )}

        {/* Mini mode bottom collapse toggle */}
        <div className="flex flex-shrink-0 flex-col items-center justify-center border-t border-slate-100 p-3 space-y-2">
          <button
            type="button"
            onClick={toggleCollapsed}
            title="توسيع القائمة الجانبية"
            aria-label="توسيع القائمة الجانبية"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
          >
            <FaAnglesLeft className="h-3.5 w-3.5 text-indigo-600" />
          </button>
        </div>
      </aside>
    );
  }

  // -------------------------------------------------------------
  // 2. EXPANDED MODE (MATCHING THE LIGHT REFERENCE DESIGN EXACTLY)
  // -------------------------------------------------------------
  return (
    <aside
      aria-label="القائمة الجانبية"
      className="flex h-full w-72 flex-col border-l border-slate-200/80 bg-white text-slate-700 select-none transition-all duration-300 shadow-sm overflow-hidden"
    >
      {/* Brand Header */}
      <div className="flex h-18 flex-shrink-0 items-center justify-between px-5 border-b border-slate-100">
        <Link
          href="/dashboard/home"
          onClick={onClose}
          className="group flex items-center gap-3 focus-visible:outline-none"
        ><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-600 shadow-xs">
            <TbBeach className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex flex-col  ">
            <span className="block text-lg font-black tracking-tight text-slate-900">
              Tourism SaaS
            </span>
            <span className="block text-[11px] font-semibold text-slate-500">
              منصة السياحة الذكية
            </span>
          </div>

          
        </Link>

        {/* Close button on mobile / Collapse on desktop */}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleCollapsed}
            title="طي القائمة الجانبية"
            aria-label="طي القائمة الجانبية"
            className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
          >
            <FaAnglesRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Optional Search / Filter box when typing */}
      {isSearching && (
        <div className="px-4 pt-3 pb-1 border-b border-slate-100">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="البحث في القائمة..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pr-3 pl-7 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => setQuery("")}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FaXmark className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Groups List */}
      <nav
        aria-label="مجموعات الروابط"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]"
      >
        {visibleGroups.map((group) => (
          <LinkGroup
            key={group.group_name}
            linkGroup={group}
            isOpen={openGroup === group.group_name}
            onToggle={() =>
              setOpenGroup((prev) =>
                prev === group.group_name ? null : group.group_name
              )
            }
            onLinkClick={onClose}
          />
        ))}

        {visibleGroups.length === 0 && (
          <div className="px-3 py-8 text-center">
            <p className="text-xs font-semibold text-slate-700">
              لا توجد نتائج مطابقة
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-2 rounded-lg px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer"
            >
              مسح البحث
            </button>
          </div>
        )}
      </nav>

      {/* Clean Mint Bottom Capsule Status (Exactly matching the reference image) */}
      <div className="p-3 border-t border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between rounded-full bg-[#e6fbf3] border border-emerald-200/80 px-3.5 py-2 text-xs shadow-2xs">
          

          {/* Tourism SaaS Super Admin on right with Palm icon */}
          <div className="flex items-center gap-1.5  ">
            <TbBeach className="h-4 w-4 text-emerald-700 flex-shrink-0" />
            <div>
              <span className="block text-[11px] font-bold text-slate-800 leading-tight">
                Tourism SaaS
              </span>
              <span className="block text-[9px] font-semibold text-slate-500 leading-tight">
                Super Admin
              </span>
            </div>
          </div>
          {/* Status on left */}
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>متصل</span>
          </div>
        </div>
      </div>
    </aside>
  );
}