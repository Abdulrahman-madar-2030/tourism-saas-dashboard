"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  pinnedPaths: string[];
  togglePin: (path: string) => void;
  isPinned: (path: string) => boolean;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

const DEFAULT_PINNED = [
  "/dashboard/packages",
  "/dashboard/hotels",
  "/dashboard/countries",
];

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Always default to false (expanded) so the full sidebar is visible by default
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setMobileOpen] = useState<boolean>(false);
  const [pinnedPaths, setPinnedPaths] = useState<string[]>(DEFAULT_PINNED);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    try {
      // By default ensure it is expanded (false) to match target UI reference
      const savedCollapsed = localStorage.getItem("tourismsaas_sidebar_collapsed");
      if (savedCollapsed === "true") {
        // If it was saved as collapsed, reset to false so the user can see the full sidebar
        setIsCollapsed(false);
        localStorage.setItem("tourismsaas_sidebar_collapsed", "false");
      } else {
        setIsCollapsed(false);
      }

      const savedPinned = localStorage.getItem("tourismsaas_sidebar_pinned");
      if (savedPinned) {
        const parsed = JSON.parse(savedPinned);
        if (Array.isArray(parsed)) {
          setPinnedPaths(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load sidebar preferences from localStorage", e);
    }
  }, []);

  // Save collapsed state
  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem("tourismsaas_sidebar_collapsed", String(collapsed));
    } catch (e) {
      console.warn("Could not save collapsed state", e);
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("tourismsaas_sidebar_collapsed", String(next));
      } catch (e) {
        console.warn("Could not save collapsed state", e);
      }
      return next;
    });
  }, []);

  // Pinned paths management
  const togglePin = useCallback((path: string) => {
    setPinnedPaths((prev) => {
      let updated: string[];
      if (prev.includes(path)) {
        updated = prev.filter((p) => p !== path);
      } else {
        updated = [...prev, path];
      }
      try {
        localStorage.setItem("tourismsaas_sidebar_pinned", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save pinned state", e);
      }
      return updated;
    });
  }, []);

  const isPinned = useCallback(
    (path: string) => pinnedPaths.includes(path),
    [pinnedPaths]
  );

  // Keyboard shortcut listener for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        setCollapsed,
        isMobileOpen,
        setMobileOpen,
        pinnedPaths,
        togglePin,
        isPinned,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
