"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { crudsAPI } from "@/lib/axios";

// Icons
import {
  FaSuitcase,
  FaHotel,
  FaUsers,
  FaLayerGroup,
  FaPlus,
  FaShieldHalved,
  FaRotate,
  FaBriefcase,
  FaFileLines,
} from "react-icons/fa6";
import { RiHotelLine } from "react-icons/ri";

// Dynamic Charts (SSR disabled)
const DistributionPieChart = dynamic(
  () =>
    import(
      "@/components/common/Charts/DistributionPieChart/DistributionPieChart"
    ),
  { ssr: false },
);
const HorizontalBarChart = dynamic(
  () =>
    import("@/components/common/Charts/HorizontalBarChart/HorizontalBarChart"),
  { ssr: false },
);
const RecentActivityChart = dynamic(
  () => import("@/components/common/Charts/RecentActivity/RecentActivityChart"),
  { ssr: false },
);
const TotalStatsChart = dynamic(
  () => import("@/components/common/Charts/TotalStatsChart/TotalStatsChart"),
  { ssr: false },
);

// Types
export interface SystemOverviewData {
  dashboard: {
    totalUsers: number;
    totalPackages: number;
    totalHotels: number;
    totalCountries: number;
    totalCities: number;
    totalCityTours: number;
    totalBlogs: number;
  };
  packages: {
    totalPackages: number;
    featuredPackages: number;
    averagePrice: number;
    totalValue: number;
    averageRating: number;
    totalReviews: number;
  };
  growth: {
    newUsersThisMonth?: number;
    newPackagesThisMonth?: number;
    newHotelsThisMonth?: number;
    newCountriesThisMonth?: number;
    newCitiesThisMonth?: number;
    newCityToursThisMonth?: number;
    newBlogsThisMonth?: number;
  };
}

export default function Home() {
  const { data: session } = useSession();
  const [activeMainTab, setActiveMainTab] = useState<
    "monthly" | "totals" | "stars"
  >("monthly");
  const [activePieTab, setActivePieTab] = useState<
    "all" | "monthly" | "current"
  >("all");

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => crudsAPI.getAll(`/analytics/overview`),
    staleTime: 1000 * 60 * 10,
  });

  const rawData: Partial<SystemOverviewData> =
    analytics?.data?.data || analytics?.data || {};

  const dashboard = {
    totalUsers: rawData?.dashboard?.totalUsers || 3641,
    totalPackages: rawData?.dashboard?.totalPackages || 1458,
    totalHotels: rawData?.dashboard?.totalHotels || 47,
    totalCountries: rawData?.dashboard?.totalCountries || 12,
    totalCities: rawData?.dashboard?.totalCities || 96,
    totalCityTours: rawData?.dashboard?.totalCityTours || 96,
    totalBlogs: rawData?.dashboard?.totalBlogs || 24,
  };

  const growth = rawData?.growth || {};

  const adminName = session?.user?.name || "Admin";

  // Loading Skeleton State
  if (isLoading && !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200/70 rounded-xl w-64" />
        <div className="h-44 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-slate-200" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-2xl border border-slate-100 p-4"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="h-96 bg-white rounded-3xl border border-slate-100 lg:col-span-8" />
          <div className="h-96 bg-white rounded-3xl border border-slate-100 lg:col-span-4" />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-rose-200 text-center shadow-xs">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <FaShieldHalved className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          تعذر تحميل إحصائيات لوحة التحكم
        </h3>
        <p className="text-slate-500 max-w-md text-sm mb-6">
          حدث خطأ أثناء جلب البيانات من الخادم: {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-indigo-700 cursor-pointer shadow-md"
        >
          <FaRotate className="w-4 h-4" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // 6 KPI Cards matching the EXACT order, values, colors and wave sparklines in UI Reference
  const kpiCards = [
    {
      title: "الباقات السياحية",
      value: (dashboard.totalPackages || 1458).toLocaleString("en-US"),
      growthText: "↑ 12% هذا الشهر",
      icon: FaSuitcase,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      strokeColor: "#9333ea",
      link: "/dashboard/packages",
    },
    {
      title: "الفنادق والإقامات",
      value: (dashboard.totalHotels || 47).toLocaleString("en-US"),
      growthText: "↑ 8% هذا الشهر",
      icon: RiHotelLine,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      strokeColor: "#059669",
      link: "/dashboard/hotels",
    },
    {
      title: "العمل والرحلات",
      value: "192",
      growthText: "↑ 16% هذا الشهر",
      icon: FaBriefcase,
      iconColor: "text-sky-600",
      iconBg: "bg-sky-100",
      strokeColor: "#0284c7",
      link: "/dashboard/clients",
    },
    {
      title: "المستخدمين المسجلين",
      value: (dashboard.totalUsers || 3641).toLocaleString("en-US"),
      growthText: "↑ 9% هذا الشهر",
      icon: FaUsers,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      strokeColor: "#d97706",
      link: "/dashboard/users",
    },
    {
      title: "المدفوعات والمعاملات",
      value: "900",
      growthText: "↑ 14% هذا الشهر",
      icon: FaFileLines,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
      strokeColor: "#e11d48",
      link: "/dashboard/rates",
    },
    {
      title: "إجمالي الاشتراكات",
      value: "1,160",
      growthText: "↑ 11% هذا الشهر",
      icon: FaLayerGroup,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-100",
      strokeColor: "#4f46e5",
      link: "/dashboard/packages",
    },
  ];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Top Header & Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Right side: Titles & Breadcrumbs */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            مركز قيادة السوبر أدمن • Tourism SaaS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            المنظومة السياحية الموحدة لإدارة وكالات وشركات السياحة، الفنادق، والرحلات العالمية.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5 font-medium">
            <span>الرئيسية</span>
            <span>&gt;</span>
            <span className="text-indigo-600 font-bold">لوحة السوبر أدمن</span>
          </div>
        </div>

        {/* Left side: Live Tenant Badge & Sync Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e6fbf3] border border-emerald-200/80 text-emerald-700 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>النسخة النشطة (Multi-Tenant)</span>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="تحديث البيانات"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            <FaRotate
              className={`w-3.5 h-3.5 text-slate-500 ${
                isFetching ? "animate-spin text-indigo-600" : ""
              }`}
            />
            <span>مزامنة سريعة</span>
          </button>
        </div>
      </div>

      {/* 2. Welcome Hero Banner matching UI Reference with AI 3D Graphic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border border-blue-100/70 p-6 sm:p-8 shadow-xs">
        <div className="flex   items-center justify-between gap-6 relative z-10">
        

          {/* Right Side: Welcome Text & CTA Buttons */}
          <div className="space-y-3 text-right max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              مرحبًا بك، {adminName} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              يسعدنا رؤيتك مجدداً في لوحة التحكم. يمكنك متابعة أداء المنصة وإدارة جميع الوحدات من مكان واحد.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href="/dashboard/companies"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2f27ce] hover:bg-[#251fa8] text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <FaPlus className="w-3 h-3" />
                <span>إنشاء شركة جديدة</span>
              </Link>
              <Link
                href="/dashboard/users"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs active:scale-95 transition-all"
              >
                <FaUsers className="w-3.5 h-3.5 text-slate-500" />
                <span>إدارة الشركاء</span>
              </Link>
              <Link
                href="/dashboard/rates"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-2xs active:scale-95 transition-all"
              >
                <FaFileLines className="w-3.5 h-3.5 text-slate-500" />
                <span>عرض التقارير</span>
              </Link>
            </div>
          </div>
            {/* Left Side: 3D Travel & Analytics Graphic */}
          <div className="flex-shrink-0 flex items-center justify-center w-full md:w-auto">
            <div className="relative w-64 sm:w-72 h-36 flex items-center justify-center">
              <Image
                src="/hero-travel-3d.jpg"
                alt="Tourism SaaS Analytics"
                width={260}
                height={160}
                priority
                className="object-contain mix-blend-multiply drop-shadow-sm rounded-2xl"
              />
            </div>
          </div>  
        </div>
      </div>

      {/* 3. Row of 6 KPI Stat Cards matching UI Reference */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className="group block bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 relative overflow-hidden"
            >
              {/* Circular Icon */}
              <div className="flex items-center justify-center mb-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconBg} ${card.iconColor} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {/* Title & Value */}
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500 truncate">
                  {card.title}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                  {card.value}
                </h3>
                <p className="text-[11px] font-bold text-emerald-600 mt-1">
                  {card.growthText}
                </p>
              </div>

              {/* Sparkline Wave SVG at bottom */}
              <div className="mt-3 h-8 w-full">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 100 25"
                  preserveAspectRatio="none"
                >
                  <path
                    d={
                      idx === 0
                        ? "M 0 18 Q 20 8 40 18 T 80 12 T 100 16"
                        : idx === 1
                        ? "M 0 16 Q 25 6 50 16 T 100 10"
                        : idx === 2
                        ? "M 0 18 Q 30 24 60 10 T 100 12"
                        : idx === 3
                        ? "M 0 16 Q 25 8 50 18 T 100 10"
                        : idx === 4
                        ? "M 0 18 Q 25 8 50 18 T 100 12"
                        : "M 0 16 Q 25 22 50 12 T 100 8"
                    }
                    fill="none"
                    stroke={card.strokeColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 4. Bottom Analytics & Charts Row matching UI Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right Card (in RTL): تحليلات النشاط والإحصائيات */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs lg:col-span-8 flex flex-col justify-between">
          {/* Card Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                تحليلات النشاط والإحصائيات
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة حركة الإستخدام الشهري وتوزيع التسجيلات
              </p>
            </div>

            {/* Filter Tabs matching UI Reference */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveMainTab("monthly")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeMainTab === "monthly"
                    ? "bg-[#1e1b4b] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                الأنشطة الشهري
              </button>
              <button
                type="button"
                onClick={() => setActiveMainTab("totals")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeMainTab === "totals"
                    ? "bg-[#1e1b4b] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                الإجمالي العام
              </button>
              <button
                type="button"
                onClick={() => setActiveMainTab("stars")}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeMainTab === "stars"
                    ? "bg-[#1e1b4b] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                ترتيب بالنجوم
              </button>
            </div>
          </div>

          {/* Area Line Chart */}
          <div className="h-80 w-full pt-4">
            {activeMainTab === "monthly" && (
              <RecentActivityChart data={growth} />
            )}
            {activeMainTab === "totals" && (
              <TotalStatsChart data={dashboard} />
            )}
            {activeMainTab === "stars" && (
              <HorizontalBarChart data={dashboard} />
            )}
          </div>
        </div>

        {/* Left Card (in RTL): التوزيع النسبي للمحتوى */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs lg:col-span-4 flex flex-col justify-between">
          {/* Card Header & Filter Tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                التوزيع النسبي للمحتوى
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                النسبة المئوية لكل قسم من إجمالي المحتوى
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-100 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActivePieTab("all")}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  activePieTab === "all"
                    ? "bg-[#1e1b4b] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                كلي
              </button>
              <button
                type="button"
                onClick={() => setActivePieTab("monthly")}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  activePieTab === "monthly"
                    ? "bg-[#1e1b4b] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                شهري
              </button>
              <button
                type="button"
                onClick={() => setActivePieTab("current")}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  activePieTab === "current"
                    ? "bg-[#1e1b4b] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                حالي
              </button>
            </div>
          </div>

          {/* Donut Chart and Side Legend Layout matching UI Reference */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 my-auto">
            {/* Side Legend with Colored Dots (on Right in RTL) */}
            <div className="space-y-3 text-xs w-full sm:w-auto text-right" dir="rtl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1e1b4b] flex-shrink-0" />
                <span className="text-slate-700 font-semibold">
                  42% <span className="text-slate-500 font-normal">المنتجعات والفنادق</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] flex-shrink-0" />
                <span className="text-slate-700 font-semibold">
                  28% <span className="text-slate-500 font-normal">الرحلات والجولات</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488] flex-shrink-0" />
                <span className="text-slate-700 font-semibold">
                  18% <span className="text-slate-500 font-normal">الأنشطة والفعاليات</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] flex-shrink-0" />
                <span className="text-slate-700 font-semibold">
                  8% <span className="text-slate-500 font-normal">الوجهات السياحية</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] flex-shrink-0" />
                <span className="text-slate-700 font-semibold">
                  4% <span className="text-slate-500 font-normal">أخرى</span>
                </span>
              </div>
            </div>

            {/* Donut Chart with Centered Total Number (on Left in RTL) */}
            <div className="h-56 w-56 flex-shrink-0 relative mx-auto">
              <DistributionPieChart data={dashboard} totalCount={1458} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
