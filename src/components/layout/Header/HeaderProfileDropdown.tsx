"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { clearAuthTokens } from "@/lib/axios";
import { FaUser, FaRightFromBracket } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";

export default function HeaderProfileDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      clearAuthTokens();
      await signOut({ redirect: false });
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      window.location.href = "/";
    }
  };

  const userName = session?.user?.name || "Admin";
  const userEmail = session?.user?.email || "superadmin@tourismsaas.com";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 p-1 sm:px-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer select-none"
      >
        <div className="relative flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-xs shadow-xs">
            <IoPersonSharp className="h-4 w-4 text-slate-200" />
          </div>
          <span className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </div>

        <div className="hidden sm:block text-right leading-tight">
          <span className="block text-xs font-bold text-slate-800">
            {userName}
          </span>
          <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
            SUPER ADMIN
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl z-50 animate-fadeIn select-none">
          {/* Header Info */}
          <div className="px-3 py-2.5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900 truncate">
                {userName}
              </p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {userEmail}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <FaUser className="h-3.5 w-3.5 text-slate-400" />
              <span>الملف الشخصي للسوبر أدمن</span>
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <FaRightFromBracket className="h-3.5 w-3.5 text-rose-500" />
              <span>{isLoggingOut ? "جارٍ الخروج..." : "تسجيل الخروج"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
