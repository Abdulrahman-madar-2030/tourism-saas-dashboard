"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FaBell,
  FaCircleCheck,
  FaTriangleExclamation,
  FaCalendarCheck,
  FaArrowLeft,
} from "react-icons/fa6";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "booking" | "system" | "warning";
  link: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "طلب حجز جديد",
    description: "قام عميل بطلب حجز باقة جورجيا العائلية الفاخرة",
    time: "منذ 10 دقائق",
    read: false,
    type: "booking",
    link: "/dashboard/booking-issues",
  },
  {
    id: "2",
    title: "تنبيه توفر الفنادق",
    description: "فندق ماريوت كوالالمبور بحاجة لتحديث أسعار الموسم الجديد",
    time: "منذ 45 دقيقة",
    read: false,
    type: "warning",
    link: "/dashboard/hotels",
  },
  {
    id: "3",
    title: "اكتمال المزامنة السحابية",
    description: "تم تحديث جميع أسعار العملات وتتبع الزيارات بنجاح",
    time: "منذ ساعتين",
    read: false,
    type: "system",
    link: "/dashboard/rates",
  },
];

export default function HeaderNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "booking":
        return <FaCalendarCheck className="h-3.5 w-3.5 text-emerald-500" />;
      case "warning":
        return <FaTriangleExclamation className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <FaCircleCheck className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="مركز الإشعارات والتنبيهات"
        aria-label="مركز الإشعارات والتنبيهات"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/40 active:scale-95 transition-all cursor-pointer shadow-2xs"
      >
        <FaBell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-88 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl p-3 shadow-2xl z-50 animate-fadeIn select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground">
                التنبيهات والنشاطات
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                  {unreadCount} جديدة
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                تحديد كمقروء
              </button>
            )}
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto [scrollbar-width:thin]">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                لا توجد إشعارات حالياً
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => {
                    setIsOpen(false);
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === item.id ? { ...n, read: true } : n
                      )
                    );
                  }}
                  className={`flex items-start gap-2.5 rounded-xl p-2.5 transition-colors ${
                    item.read
                      ? "hover:bg-muted/50 opacity-75"
                      : "bg-muted/60 hover:bg-muted/90 font-medium"
                  }`}
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-background border border-border mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 mt-2 border-t border-border/70">
            <Link
              href="/dashboard/booking-issues"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 py-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <span>إدارة الحجوزات والمشاكل</span>
              <FaArrowLeft className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
