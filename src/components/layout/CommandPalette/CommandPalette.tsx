"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "../SidebarContext";
import { allNavLinks, NavItem } from "../navigationData";
import {
  FaMagnifyingGlass,
  FaXmark,
  FaArrowRight,
  FaStar,
  FaRegStar,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa6";

export default function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen, isPinned, togglePin } =
    useSidebar();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isCommandPaletteOpen]);

  // Filter links
  const filteredLinks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allNavLinks;
    }
    return allNavLinks.filter(
      (link) =>
        link.link_name.toLowerCase().includes(q) ||
        link.group_name.toLowerCase().includes(q) ||
        link.path.toLowerCase().includes(q)
    );
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setCommandPaletteOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredLinks.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredLinks.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredLinks[selectedIndex];
      if (target) {
        setCommandPaletteOpen(false);
        router.push(target.path);
      }
    }
  };

  // Auto-scroll selected element into view
  useEffect(() => {
    if (listRef.current) {
      const activeElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="البحث السريع والتنقل"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-border px-4 py-3 bg-muted/20">
          <FaMagnifyingGlass className="h-4 w-4 text-primary ml-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="ابحث عن صفحة، خدمة، فندق، أو باقة... (اكتب للبحث)"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground mr-1"
            >
              <FaXmark className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground mr-2">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 [scrollbar-width:thin]">
          {filteredLinks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-foreground">
                لم يتم العثور على نتائج
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                جرّب البحث بكلمات أخرى مثل "باقات" أو "فنادق" أو "مدن"
              </p>
            </div>
          ) : (
            <ul ref={listRef} className="space-y-1">
              {filteredLinks.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                const pinned = isPinned(item.path);

                return (
                  <li
                    key={item.path}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      router.push(item.path);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#1e1742] text-white"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-white/10 text-amber-400"
                            : "bg-muted text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold truncate">
                          {item.link_name}
                        </span>
                        <span
                          className={`block text-[11px] truncate ${
                            isSelected ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          {item.group_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Pin button */}
                      <button
                        type="button"
                        title={pinned ? "إزالة من المفضلة" : "تثبيت في المفضلة"}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(item.path);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          pinned
                            ? "text-amber-400 hover:text-amber-300"
                            : isSelected
                            ? "text-white/40 hover:text-white"
                            : "text-muted-foreground/40 hover:text-foreground"
                        }`}
                      >
                        {pinned ? (
                          <FaStar className="h-3.5 w-3.5" />
                        ) : (
                          <FaRegStar className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-300 bg-white/10 px-2 py-0.5 rounded-md font-medium">
                          <span>انتقال</span>
                          <FaArrowRight className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded bg-background px-1.5 py-0.5 border border-border text-[10px]">
                <FaArrowUp className="inline h-2 w-2" />
                <FaArrowDown className="inline h-2 w-2" />
              </kbd>
              للتنقل
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded bg-background px-1.5 py-0.5 border border-border text-[10px]">
                Enter
              </kbd>
              للاختيار
            </span>
          </div>
          <span>لوحة أوامر السوبر أدمن • Tourism SaaS</span>
        </div>
      </div>
    </div>
  );
}
