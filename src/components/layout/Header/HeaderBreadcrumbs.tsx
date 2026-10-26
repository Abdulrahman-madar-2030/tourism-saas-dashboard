"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { findLinkByPath } from "../navigationData";

const segmentLabels: Record<string, string> = {
  dashboard: "الرئيسية",
  home: "لوحة القيادة",
  packages: "إدارة الباقات",
  "tourism-packages": "أنواع الباقات",
  hotels: "إدارة الفنادق",
  tours: "إدارة الجولات",
  "booking-issues": "مشاكل الحجز",
  "booking-content": "محتوى الحجز",
  "package-inclusions": "المشتملات والاستثناءات",
  countries: "إدارة الدول",
  cities: "إدارة المدن",
  "office-branches": "فروع المكاتب",
  users: "إدارة المستخدمين",
  clients: "إدارة العملاء",
  blogs: "إدارة المدونات",
  "global-settings": "روابط التواصل",
  "seo-pages": "SEO الصفحات",
  "pixel-tracking": "Pixel Tracking",
  other: "خيارات إضافية",
  rates: "تقييمات الباقات",
  profile: "الملف الشخصي",
  create: "إضافة جديد",
  edit: "تعديل",
  tourism: "سياحية",
  treatment: "علاجية",
  study: "دراسية",
};

export default function HeaderBreadcrumbs() {
  const pathname = usePathname() || "";
  const segments = pathname.split("/").filter(Boolean);

  // If on dashboard home or root
  if (pathname === "/dashboard" || pathname === "/dashboard/home") {
    return (
      <span className="text-sm font-bold text-foreground">
        لوحة القيادة
      </span>
    );
  }

  // Look up matching nav item to get the Group name or link name
  const matchedNav = findLinkByPath(pathname);

  // Build crumbs array
  const crumbs: { label: string; href: string; isLast: boolean }[] = [];

  let accumulatedPath = "";
  segments.forEach((seg, index) => {
    accumulatedPath += `/${seg}`;
    if (seg === "dashboard") return;

    const label =
      segmentLabels[seg] ||
      (index === segments.length - 1 && matchedNav?.link_name) ||
      decodeURIComponent(seg);

    crumbs.push({
      label,
      href: accumulatedPath,
      isLast: index === segments.length - 1,
    });
  });

  return (
    <nav
      aria-label="مسار التنقل"
      className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground select-none"
    >
      <Link
        href="/dashboard/home"
        className="hover:text-foreground transition-colors font-medium"
      >
        الرئيسية
      </Link>

      {crumbs.map((crumb) => (
        <React.Fragment key={crumb.href}>
          <span className="text-muted-foreground/40 font-light">/</span>
          {crumb.isLast ? (
            <span className="font-bold text-foreground truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors font-medium truncate max-w-[120px]"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
