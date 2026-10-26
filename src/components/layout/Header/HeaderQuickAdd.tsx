"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FaPlus,
  FaChevronDown,
  FaSuitcase,
  FaBuilding,
  FaMapLocationDot,
  FaNewspaper,
  FaRegFlag,
} from "react-icons/fa6";

export default function HeaderQuickAdd() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const quickActions = [
    {
      title: "إدارة وإنشاء باقة",
      desc: "باقة سياحية، علاجية أو دراسية",
      href: "/dashboard/packages",
      icon: FaSuitcase,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "إضافة فندق",
      desc: "فندق أو منتجع جديد",
      href: "/dashboard/hotels",
      icon: FaBuilding,
      color: "text-sky-600 bg-sky-50",
    },
    {
      title: "إضافة جولة سياحية",
      desc: "جولة يومية أو نشاط في مدينة",
      href: "/dashboard/tours",
      icon: FaMapLocationDot,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "إضافة تدوينة / مقال",
      desc: "مقال سياحي في المدونة",
      href: "/dashboard/blogs",
      icon: FaNewspaper,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "إضافة وجهة أو دولة",
      desc: "دولة أو مدينة جديدة",
      href: "/dashboard/countries",
      icon: FaRegFlag,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2f27ce] text-white hover:bg-[#251fa8] active:scale-95 transition-all text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
      >
        <FaPlus className="h-3 w-3" />
        <span>إنشاء سريع</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl z-50 animate-fadeIn select-none">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 mb-1">
            إجراءات الإضافة السريعة
          </div>

          <div className="space-y-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 transition-colors group"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${action.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                      {action.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
