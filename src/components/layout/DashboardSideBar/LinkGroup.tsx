"use client";

import { SideBarLinkGroup } from "@/types/SideBarTypes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useId } from "react";
import { FaChevronDown, FaStar, FaRegStar } from "react-icons/fa6";
import { AiFillHome } from "react-icons/ai";
import {
  FaTableCellsLarge,
  FaUserGroup,
  FaSuitcase,
  FaBullhorn,
  FaChartLine,
  FaGear,
  FaHeadset,
} from "react-icons/fa6";
import { RiHotelLine } from "react-icons/ri";
import { isPathActive } from "../navigationData";
import { useSidebar } from "../SidebarContext";

interface LinkGroupProps {
  linkGroup: SideBarLinkGroup;
  onLinkClick?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export { isPathActive };

// Map group name to its reference icon
const getGroupIcon = (name: string) => {
  switch (name) {
    case "الرئيسية":
      return AiFillHome;
    case "إدارة المنصة":
      return FaTableCellsLarge;
    case "إدارة الشركاء":
      return FaUserGroup;
    case "إدارة الفنادق":
      return RiHotelLine;
    case "إدارة الجولات والرحلات":
      return FaSuitcase;
    case "المحتوى والتسويق":
      return FaBullhorn;
    case "التقارير والتحليلات":
      return FaChartLine;
    case "الإعدادات":
      return FaGear;
    case "الدعم والمساعدة":
      return FaHeadset;
    default:
      return FaTableCellsLarge;
  }
};

const LinkGroup = React.memo(function LinkGroup({
  linkGroup,
  onLinkClick,
  isOpen,
  onToggle,
}: LinkGroupProps) {
  const pathname = usePathname() ?? "";
  const panelId = useId();
  const { isPinned, togglePin } = useSidebar();

  const GroupIcon = getGroupIcon(linkGroup.group_name);
  const isDashboardHome = linkGroup.group_name === "الرئيسية";
  const hasActive = linkGroup.links.some((l) => isPathActive(pathname, l.path));

  // If this is the "الرئيسية" single item group, render it directly as a top-level link
  if (isDashboardHome && linkGroup.links.length === 1) {
    const singleLink = linkGroup.links[0];
    const isActive = isPathActive(pathname, singleLink.path);

    return (
      <div className="py-0.5">
        <Link
          href={singleLink.path}
          onClick={onLinkClick}
          className={`flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
            isActive
              ? "bg-[#eef2ff] text-indigo-600 shadow-2xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <AiFillHome className="h-3.5 w-3.5" />
            </span>
            <span className="truncate">{linkGroup.group_name}</span>
          </div>

          <FaChevronDown
            className={`h-2.5 w-2.5 transition-transform duration-200 ${
              isActive ? "text-indigo-600 rotate-180" : "text-slate-400"
            }`}
          />
        </Link>
      </div>
    );
  }

  return (
    <section aria-label={linkGroup.group_name} className="py-0.5">
      {/* Accordion Group Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`group/header flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 cursor-pointer ${
          isOpen || hasActive
            ? "text-indigo-600 bg-indigo-50/50"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
              isOpen || hasActive
                ? "text-indigo-600"
                : "text-slate-400 group-hover/header:text-slate-600"
            }`}
          >
            <GroupIcon className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">{linkGroup.group_name}</span>
        </span>

        <span className="flex flex-shrink-0 items-center gap-2">
          <FaChevronDown
            aria-hidden="true"
            className={`h-2.5 w-2.5 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-indigo-600" : "rotate-0 text-slate-400"
            }`}
          />
        </span>
      </button>

      {/* Accordion panel */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div
          className={`overflow-hidden transition-[visibility] duration-200 ${
            isOpen ? "visible" : "invisible"
          }`}
        >
          <ul className="flex flex-col gap-0.5 pr-4 pl-1 pt-1 pb-1">
            {linkGroup.links.map((link) => {
              const Icon = link.icon;
              const isActive = isPathActive(pathname, link.path);
              const pinned = isPinned(link.path);

              return (
                <li key={link.path + link.link_name}>
                  <div
                    className={`group/item relative flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 font-bold shadow-2xs"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <Link
                      href={link.path}
                      onClick={onLinkClick}
                      aria-current={isActive ? "page" : undefined}
                      className="flex min-w-0 flex-1 items-center gap-2 focus-visible:outline-none"
                    >
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md ${
                          isActive
                            ? "text-indigo-600"
                            : "text-slate-400 group-hover/item:text-slate-600"
                        }`}
                      >
                        <Icon aria-hidden="true" className="h-3 w-3" />
                      </span>
                      <span className="truncate">{link.link_name}</span>
                    </Link>

                    {/* Actions on left in RTL: Pin & Badge */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {link.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                            link.badgeColor ||
                            "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(link.path);
                        }}
                        title={
                          pinned ? "إزالة من المفضلة" : "تثبيت في الروابط السريعة"
                        }
                        aria-label={
                          pinned ? "إزالة من المفضلة" : "تثبيت في الروابط السريعة"
                        }
                        className={`p-1 rounded-md transition-all cursor-pointer ${
                          pinned
                            ? "text-amber-500 opacity-100 hover:scale-110"
                            : "text-slate-400 opacity-0 group-hover/item:opacity-100 hover:text-amber-500 hover:scale-110"
                        }`}
                      >
                        {pinned ? (
                          <FaStar className="h-3 w-3" />
                        ) : (
                          <FaRegStar className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
});

export default LinkGroup;