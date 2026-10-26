"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardSideBar from "@/components/layout/DashboardSideBar/DashboardSideBar";
import Header from "@/components/layout/Header/Header";
import CommandPalette from "@/components/layout/CommandPalette/CommandPalette";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import { saveAuthToken, isJwtExpired } from "@/lib/axios";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { isCollapsed, isMobileOpen, setMobileOpen } = useSidebar();

  useEffect(() => {
    const token =
      (session as any)?.user?.accessToken ||
      (session as any)?.accessToken ||
      (session as any)?.token;

    if (token && !isJwtExpired(token)) {
      saveAuthToken(token);
    }
  }, [session]);

  return (
    <>
      <div className="flex min-h-screen bg-[#fafbfc] relative selection:bg-indigo-600 selection:text-white">
        {/* Desktop Sidebar (Fixed on right for RTL) */}
        <aside
          className={`hidden lg:block h-screen fixed top-0 right-0 bottom-0 z-40 transition-[width] duration-300 ease-in-out ${
            isCollapsed ? "w-20" : "w-72"
          }`}
        >
          <DashboardSideBar />
        </aside>

        {/* Mobile Sidebar Overlay & Drawer */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
              aria-hidden="true"
            />

            {/* Slide-out Drawer */}
            <div className="fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-background shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out">
              <DashboardSideBar
                forceExpanded
                onClose={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div
          className={`flex-1 min-w-0 flex flex-col transition-[padding] duration-300 ease-in-out ${
            isCollapsed ? "lg:pr-20" : "lg:pr-72"
          }`}
        >
          {/* Top Sticky Header */}
          <Header onOpenMobileMenu={() => setMobileOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 relative overflow-hidden">
            {/* Background Grid Pattern (مربعات شبكية هندسية خفيفة وأنيقة) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 dashboard-grid-pattern opacity-45"
            />

            {/* Ambient light glow accents */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/3 left-10 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl"
            />

            <div className="container relative z-10 py-6 lg:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      <div id="modal-root" />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
