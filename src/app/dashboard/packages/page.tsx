"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import DataTable, { TableColumn } from "@/components/ui/DataTable/DataTable";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Spinner from "@/components/ui/Spinner/Spinner";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import {
  FaBox,
  FaPlus,
  FaMagnifyingGlass,
  FaTableList,
  FaGrip,
  FaPen,
  FaTrash,
  FaGlobe,
  FaCity,
  FaArrowUpRightFromSquare,
  FaRegCircleCheck,
  FaEarthAmericas,
  FaRotateLeft,
} from "react-icons/fa6";
import { useCrud } from "@/hooks/useCrudQuery";
import toast from "react-hot-toast";
import { Seo } from "@/types/seoTypes";

interface SelectOption {
  _id: string;
  name: string;
  slug?: string;
}

function PackagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlType = searchParams.get("packageType") || searchParams.get("type");
  const urlCountry = searchParams.get("country");

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState(urlType || "ALL");
  const [selectedCountryFilter, setSelectedCountryFilter] = useState(urlCountry || "ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  // SEO Modal state
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [editingSeoPackage, setEditingSeoPackage] = useState<any | null>(null);

  // 1. Package types (for filter & slug-to-id resolution)
  const { data: packageTypes } = useCrud<SelectOption[]>({
    queryKey: ["packageTypes", "packages-page"],
    endpoint: "/package-types",
    select: (res: any) => {
      const data = res?.data ?? res;
      return Array.isArray(data) ? data : [];
    },
  });

  // 2. Countries (for filter & slug-to-id resolution)
  const { data: countries } = useCrud<SelectOption[]>({
    queryKey: ["countries", "packages-page"],
    endpoint: "/countries",
    select: (res: any) => res?.data?.data ?? res?.data ?? res ?? [],
  });

  // Resolve slug/id to actual backend _id
  const effectivePackageTypeId = useMemo(() => {
    if (!selectedTypeFilter || selectedTypeFilter === "ALL") return "ALL";
    if (packageTypes && packageTypes.length > 0) {
      const matched = packageTypes.find(
        (pt) => pt.slug === selectedTypeFilter || pt._id === selectedTypeFilter
      );
      if (matched) return matched._id;
    }
    return selectedTypeFilter;
  }, [selectedTypeFilter, packageTypes]);

  const effectiveCountryId = useMemo(() => {
    if (!selectedCountryFilter || selectedCountryFilter === "ALL") return "ALL";
    if (countries && countries.length > 0) {
      const matched = countries.find(
        (c) => c.slug === selectedCountryFilter || c._id === selectedCountryFilter
      );
      if (matched) return matched._id;
    }
    return selectedCountryFilter;
  }, [selectedCountryFilter, countries]);

  const packageTypeFilterOptions = useMemo(
    () => [
      { label: "جميع الأنواع", value: "ALL" },
      ...(packageTypes || []).map((pt) => ({ label: pt.name, value: pt._id })),
    ],
    [packageTypes]
  );

  const countryFilterOptions = useMemo(
    () => [
      { label: "جميع الدول", value: "ALL" },
      ...(countries || []).map((c) => ({ label: c.name, value: c._id })),
    ],
    [countries]
  );

  const statusFilterOptions = useMemo(
    () => [
      { label: "جميع الحالات", value: "ALL" },
      { label: "نشطة فقط (isActive=true)", value: "true" },
      { label: "معطلة فقط (isActive=false)", value: "false" },
    ],
    []
  );

  const limitFilterOptions = useMemo(
    () => [
      { label: "10 باقات", value: 10 },
      { label: "20 باقة (افتراضي)", value: 20 },
      { label: "40 باقة", value: 40 },
      { label: "100 باقة", value: 100 },
    ],
    []
  );

  // Build query endpoint matching params exactly:
  // page=1&limit=20&sort=-createdAt&isActive=true&country=...&packageType=...
  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    if (selectedStatusFilter === "true" || selectedStatusFilter === "ACTIVE") {
      params.set("isActive", "true");
    } else if (
      selectedStatusFilter === "false" ||
      selectedStatusFilter === "INACTIVE"
    ) {
      params.set("isActive", "false");
    }

    if (effectiveCountryId && effectiveCountryId !== "ALL") {
      params.set("country", effectiveCountryId);
    }

    if (effectivePackageTypeId && effectivePackageTypeId !== "ALL") {
      params.set("packageType", effectivePackageTypeId);
    }

    return `/packages?${params.toString()}`;
  }, [
    page,
    limit,
    selectedStatusFilter,
    effectiveCountryId,
    effectivePackageTypeId,
  ]);

  // 3. Packages CRUD with server-side query params and pagination
  const {
    data: packageData,
    isLoading,
    isError,
    refetch,
    updateItem: updatePackage,
    deleteItem: deletePackage,
  } = useCrud<{ packages: any[]; pagination: any }>({
    queryKey: ["packages", endpoint],
    endpoint: endpoint,
    select: (res: any) => {
      let items: any[] = [];
      if (Array.isArray(res?.data)) items = res.data;
      else if (Array.isArray(res?.data?.data)) items = res.data.data;
      else if (Array.isArray(res?.data?.packages)) items = res.data.packages;
      else if (Array.isArray(res?.packages)) items = res.packages;
      else if (Array.isArray(res)) items = res;

      const pagination = res?.pagination || res?.data?.pagination || null;
      const total =
        res?.total ??
        res?.results ??
        res?.data?.total ??
        res?.data?.results ??
        items.length;

      const totalPages =
        pagination?.pages ??
        (total && limit ? Math.ceil(total / limit) : 1);

      return {
        packages: items,
        pagination: {
          page: pagination?.page ?? page,
          pages: Math.max(1, totalPages),
          limit: pagination?.limit ?? limit,
          total: total || items.length,
        },
      };
    },
    useJsonPayload: true,
  });

  const packages = useMemo(() => {
    return packageData?.packages || [];
  }, [packageData?.packages]);

  const pagination = useMemo(() => {
    return packageData?.pagination || {
      page,
      pages: 1,
      limit,
      total: packages.length,
    };
  }, [packageData?.pagination, page, limit, packages.length]);

  // ─── Sync URL query params on navigation ───
  useEffect(() => {
    const t = searchParams.get("packageType") || searchParams.get("type");
    const c = searchParams.get("country");
    if (t) setSelectedTypeFilter(t);
    if (c) setSelectedCountryFilter(c);
  }, [searchParams]);

  // ─── Filtered Packages (Ensures strict consistency on client & server) ────
  const filteredPackages = useMemo(() => {
    if (!Array.isArray(packages)) return [];

    return packages.filter((pkg) => {
      // Search filter (name, slug, description)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const nameMatch = (pkg.name || "").toLowerCase().includes(q);
        const slugMatch = (pkg.slug || "").toLowerCase().includes(q);
        const descMatch = (pkg.description || "").toLowerCase().includes(q);
        if (!nameMatch && !slugMatch && !descMatch) return false;
      }

      // Country filter fallback (supports both _id and slug)
      if (effectiveCountryId && effectiveCountryId !== "ALL") {
        const pkgCountryId =
          typeof pkg.country === "object" ? pkg.country?._id : pkg.country;
        const pkgCountrySlug =
          typeof pkg.country === "object" ? pkg.country?.slug : undefined;
        if (
          pkgCountryId !== effectiveCountryId &&
          pkgCountrySlug !== selectedCountryFilter &&
          pkgCountryId !== selectedCountryFilter
        )
          return false;
      }

      // Package type filter fallback (supports both _id and slug)
      if (effectivePackageTypeId && effectivePackageTypeId !== "ALL") {
        const pkgTypeId =
          typeof pkg.packageType === "object"
            ? pkg.packageType?._id
            : pkg.packageType;
        const pkgTypeSlug =
          typeof pkg.packageType === "object"
            ? pkg.packageType?.slug
            : undefined;
        if (
          pkgTypeId !== effectivePackageTypeId &&
          pkgTypeSlug !== selectedTypeFilter &&
          pkgTypeId !== selectedTypeFilter
        )
          return false;
      }

      // Status filter fallback (isActive)
      if (selectedStatusFilter === "true" || selectedStatusFilter === "ACTIVE") {
        if (pkg.isActive === false) return false;
      } else if (
        selectedStatusFilter === "false" ||
        selectedStatusFilter === "INACTIVE"
      ) {
        if (pkg.isActive !== false) return false;
      }

      return true;
    });
  }, [
    packages,
    searchQuery,
    selectedCountryFilter,
    selectedTypeFilter,
    selectedStatusFilter,
  ]);

  // ─── KPI Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const list = Array.isArray(packages) ? packages : [];
    const total = pagination.total || list.length;
    const active = list.filter((p) => p.isActive !== false).length;

    const distinctCountries = new Set(
      list
        .map((p) =>
          typeof p.country === "object" ? p.country?._id : p.country,
        )
        .filter(Boolean),
    ).size;

    const distinctTypes = new Set(
      list
        .map((p) =>
          typeof p.packageType === "object"
            ? p.packageType?._id
            : p.packageType,
        )
        .filter(Boolean),
    ).size;

    return { total, active, distinctCountries, distinctTypes };
  }, [packages, pagination.total]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTypeFilter("ALL");
    setSelectedCountryFilter("ALL");
    setSelectedStatusFilter("ALL");
    setLimit(20);
    setPage(1);
  };

  // SEO Submit
  const handleSeoSubmit = async (seoData: Seo) => {
    if (!editingSeoPackage?._id) return toast.error("الباقة غير محددة");

    const { keywords, ...rest } = seoData as any;
    const formattedKeywords =
      typeof keywords === "string"
        ? keywords
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean)
        : keywords || [];

    try {
      await updatePackage({
        id: editingSeoPackage._id,
        endpoint: "/packages/admin",
        body: {
          seo: {
            ...rest,
            keywords: formattedKeywords,
            noIndex: String(seoData.noIndex),
            noFollow: String(seoData.noFollow),
            noArchive: String(seoData.noArchive),
            noSnippet: String(seoData.noSnippet),
          },
        },
      });
      setShowSeoModal(false);
      setEditingSeoPackage(null);
      refetch();
    } catch {
      toast.error("فشل في تحديث إعدادات SEO");
    }
  };

  const handleDelete = async (id: string, name = "هذه الباقة") => {
    if (!confirm(`هل أنت متأكد من حذف الباقة "${name}"؟`)) return;
    try {
      await deletePackage(`/packages/admin/${id}`);
      refetch();
    } catch {
      toast.error("فشل في حذف الباقة");
    }
  };

  // Toggle active inline
  const handleToggleActive = async (pkg: any) => {
    const newStatus = pkg.isActive === false ? true : false;
    try {
      await updatePackage({
        id: pkg._id,
        endpoint: "/packages/admin",
        body: {
          isActive: newStatus,
        },
      });
      toast.success(newStatus ? "تم تفعيل الباقة" : "تم تعطيل الباقة");
      refetch();
    } catch {
      toast.error("فشل في تعديل حالة الباقة");
    }
  };

  // Table Columns
  const tableColumns: TableColumn<any>[] = [
    {
      key: "imageCover",
      label: "الصورة",
      render: (value: any) => {
        const imgUrl =
          typeof value === "string"
            ? value
            : value?.url || "/placeholder.png";
        return (
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border shadow-2xs bg-muted">
            <Image
              src={imgUrl}
              alt="cover"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        );
      },
    },
    {
      key: "name",
      label: "اسم الباقة",
      render: (_value: any, record: any) => (
        <div className="flex flex-col">
          <Link
            href={`/dashboard/packages/edit/${record._id}`}
            className="font-bold text-foreground hover:text-primary transition-colors text-sm line-clamp-1"
          >
            {record.name}
          </Link>
          {record.slug && (
            <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[200px]">
              {record.slug}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "packageType",
      label: "نوع الباقة",
      render: (value: any) => (
        <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
          {typeof value === "object" ? value?.name : value || "—"}
        </span>
      ),
    },
    {
      key: "country",
      label: "الوجهة والمدن",
      render: (value: any, record: any) => {
        const countryName = typeof value === "object" ? value?.name : value || "—";
        const cities = Array.isArray(record?.cities) ? record.cities : [];
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-xs font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
              <FaGlobe className="w-3 h-3 text-muted-foreground shrink-0" />
              <span>{countryName}</span>
            </span>
            {cities.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap max-w-[190px]">
                {cities.slice(0, 2).map((city: any, cIdx: number) => {
                  const cityName = typeof city === "object" ? city?.name : city;
                  return (
                    <span
                      key={city?._id || cIdx}
                      className="inline-flex items-center gap-1 text-[10px] bg-sky-500/10 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded font-medium"
                    >
                      <FaCity className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate max-w-[80px]">{cityName}</span>
                    </span>
                  );
                })}
                {cities.length > 2 && (
                  <span
                    className="text-[10px] text-muted-foreground font-bold bg-muted px-1.5 py-0.5 rounded"
                    title={cities
                      .slice(2)
                      .map((c: any) => (typeof c === "object" ? c?.name : c))
                      .join("، ")}
                  >
                    +{cities.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "includes",
      label: "المشتملات والخدمات",
      render: (_value: any, record: any) => {
        const includes = Array.isArray(record.includes) ? record.includes : [];
        const excludes = Array.isArray(record.excludes) ? record.excludes : [];

        if (includes.length === 0 && excludes.length === 0) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }

        return (
          <div className="flex items-center gap-1.5 flex-wrap max-w-[240px]">
            {includes.slice(0, 2).map((inc: any, idx: number) => (
              <span
                key={inc._id || idx}
                className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold"
                title={inc.method ? `${inc.name} (${inc.method})` : inc.name}
              >
                <FaRegCircleCheck className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate max-w-[90px]">{inc.name}</span>
              </span>
            ))}
            {includes.length > 2 && (
              <span
                className="text-[10px] text-muted-foreground font-bold bg-muted px-1.5 py-0.5 rounded"
                title={includes.slice(2).map((x: any) => x.name).join("، ")}
              >
                +{includes.length - 2} المزيد
              </span>
            )}
            {excludes.length > 0 && (
              <span
                className="text-[10px] text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded font-medium"
                title={excludes.map((x: any) => x.name).join("، ")}
              >
                {excludes.length} غير مشمول
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "offer",
      label: "السعر",
      render: (_value: any, record: any) => {
        const offer = record.offer;
        const newPrice = offer?.newPrice ?? record.price;
        const oldPrice = offer?.oldPrice;

        if (newPrice !== undefined && newPrice !== null && newPrice !== "") {
          return (
            <div className="flex flex-col">
              <span className="text-sm font-black text-emerald-600 font-mono">
                {Number(newPrice).toLocaleString()} ر.س
              </span>
              {oldPrice && Number(oldPrice) > Number(newPrice) && (
                <span className="text-[11px] text-muted-foreground line-through font-mono">
                  {Number(oldPrice).toLocaleString()} ر.س
                </span>
              )}
            </div>
          );
        }
        return (
          <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
            محدد بالجولات
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: "الحالة",
      render: (value: boolean, record: any) => (
        <button
          type="button"
          onClick={() => handleToggleActive(record)}
          className={`text-xs px-2.5 py-0.5 rounded-full font-bold cursor-pointer transition-all ${
            value !== false
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
              : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200"
          }`}
          title="اضغط لتغيير الحالة"
        >
          {value !== false ? "نشط" : "معطّل"}
        </button>
      ),
    },
    {
      key: "manage",
      label: "إدارة الباقة",
      render: (_value: string, record: any) => {
        const typeSlug =
          record.packageType?.slug || record.packageType?._id || "";
        const countrySlug =
          record.country?.slug || record.country?._id || "";
        const packageSlug = record.slug || record._id;

        if (!typeSlug || !countrySlug) {
          return (
            <span className="text-xs text-muted-foreground italic">
              —
            </span>
          );
        }
        return (
          <Link
            href={`/dashboard/packages/${typeSlug}/${countrySlug}?package=${encodeURIComponent(packageSlug)}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-all"
          >
            <span>التفاصيل</span>
            <FaArrowUpRightFromSquare className="w-2.5 h-2.5" />
          </Link>
        );
      },
    },
    {
      key: "actions",
      label: "الاجراءات",
      render: (_value: any, record: any) => {
        const typeSlug =
          record.packageType?.slug || record.packageType?._id || "";
        const countrySlug =
          record.country?.slug || record.country?._id || "";
        const editHref = `/dashboard/packages/edit/${record._id}${
          typeSlug && countrySlug
            ? `?type=${encodeURIComponent(typeSlug)}&country=${encodeURIComponent(countrySlug)}`
            : ""
        }`;

        return (
          <div className="flex items-center gap-2">
            <Link
              href={editHref}
              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="تعديل الباقة"
            >
              <FaPen className="w-3.5 h-3.5" />
            </Link>
          <button
            type="button"
            onClick={() => {
              setEditingSeoPackage(record);
              setShowSeoModal(true);
            }}
            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="تعديل SEO"
          >
            <FaGlobe className="w-3.5 h-3.5" />
          </button>
            <button
              type="button"
              onClick={() => handleDelete(record._id, record.name)}
              className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="حذف الباقة"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          pageName="الباقات السياحية"
          pageDescription="إدارة الباقات السياحية، الفنادق، الطيران، والعروض الترويجية"
          PageIcon={FaBox}
        />
        <div className="my-4">
          <BreadCrumb breadCrumbItems="الباقات السياحية" />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600">
        <p className="font-bold">حدث خطأ أثناء تحميل الباقات السياحية</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageHeader
            pageName="الباقات السياحية"
            pageDescription="إدارة وتخصيص الباقات السياحية، الفنادق، الطيران، والعروض الترويجية"
            PageIcon={FaBox}
          />
        </div>

        <Link
          href="/dashboard/packages/create"
          className="self-start sm:self-auto px-5 py-3 bg-gradient-to-l from-primary to-primary/90 text-white rounded-2xl font-bold text-sm shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
        >
          <FaPlus className="w-4 h-4" />
          <span>إنشاء باقة جديدة</span>
        </Link>
      </div>

      <div className="my-2">
        <BreadCrumb breadCrumbItems="الباقات السياحية" />
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-background rounded-2xl border border-border shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FaBox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">
              إجمالي الباقات
            </span>
            <span className="text-xl font-extrabold text-foreground font-mono">
              {stats.total}
            </span>
          </div>
        </div>

        <div className="p-4 bg-background rounded-2xl border border-border shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <FaRegCircleCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">
              الباقات النشطة
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-foreground font-mono">
                {stats.active}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 rounded">
                {stats.total > 0
                  ? `${Math.round((stats.active / stats.total) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-background rounded-2xl border border-border shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl">
            <FaBox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">
              أنواع الباقات
            </span>
            <span className="text-xl font-extrabold text-foreground font-mono">
              {stats.distinctTypes}
            </span>
          </div>
        </div>

        <div className="p-4 bg-background rounded-2xl border border-border shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <FaEarthAmericas className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">
              الدول والوجهات
            </span>
            <span className="text-xl font-extrabold text-foreground font-mono">
              {stats.distinctCountries}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 bg-background rounded-2xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الباقة، الرابط، أو الوصف..."
              className="w-full h-11 pr-10 pl-4 text-xs rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
            <FaMagnifyingGlass className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="عرض بطاقات كروت"
              >
                <FaGrip className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">بطاقات</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="عرض جدول مفصل"
              >
                <FaTableList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">جدول</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Matching Query Params: packageType, country, isActive, limit */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-border/60">
          <div>
            <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
              نوع الباقة
            </label>
            <SelectMenu
              value={effectivePackageTypeId}
              onChange={(val) => {
                setSelectedTypeFilter(String(val));
                setPage(1);
              }}
              options={packageTypeFilterOptions}
              searchable
              placeholder="جميع الأنواع"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
              الدولة
            </label>
            <SelectMenu
              value={effectiveCountryId}
              onChange={(val) => {
                setSelectedCountryFilter(String(val));
                setPage(1);
              }}
              options={countryFilterOptions}
              searchable
              placeholder="جميع الدول"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
              الحالة
            </label>
            <SelectMenu
              value={selectedStatusFilter}
              onChange={(val) => {
                setSelectedStatusFilter(String(val));
                setPage(1);
              }}
              options={statusFilterOptions}
              placeholder="جميع الحالات"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
              العدد لكل صفحة
            </label>
            <SelectMenu
              value={limit}
              onChange={(val) => {
                setLimit(Number(val));
                setPage(1);
              }}
              options={limitFilterOptions}
              placeholder="20 باقة"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={
                !searchQuery &&
                selectedTypeFilter === "ALL" &&
                selectedCountryFilter === "ALL" &&
                selectedStatusFilter === "ALL" &&
                limit === 20 &&
                page === 1
              }
              className="w-full h-9 px-3 rounded-xl border border-border bg-background hover:bg-muted text-xs font-bold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              title="إعادة تعيين الفلاتر"
            >
              <FaRotateLeft className="w-3 h-3 text-muted-foreground" />
              <span>إعادة ضبط</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Grid vs Table */}
      {filteredPackages.length === 0 ? (
        <div className="p-12 text-center bg-background rounded-3xl border border-dashed border-border space-y-4">
          <div className="p-4 bg-muted/50 rounded-2xl w-fit mx-auto text-muted-foreground/60">
            <FaBox className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              لا توجد باقات سياحية مطابقة
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              جرب تغيير معايير البحث أو الفلترة أو قم بإضافة باقة سياحية جديدة الآن
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-all"
            >
              إعادة تعيين الفلاتر
            </button>
            <Link
              href="/dashboard/packages/create"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-1.5"
            >
              <FaPlus className="w-3 h-3" />
              <span>إنشاء باقة جديدة</span>
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPackages.map((pkg) => {
            const coverUrl =
              typeof pkg.imageCover === "object"
                ? pkg.imageCover?.url
                : typeof pkg.imageCover === "string"
                  ? pkg.imageCover
                  : "/placeholder.png";

            const typeName =
              typeof pkg.packageType === "object"
                ? pkg.packageType?.name
                : pkg.packageType;
            const typeSlug =
              typeof pkg.packageType === "object"
                ? pkg.packageType?.slug || pkg.packageType?._id
                : pkg.packageType;

            const countryName =
              typeof pkg.country === "object"
                ? pkg.country?.name
                : pkg.country;
            const countrySlug =
              typeof pkg.country === "object"
                ? pkg.country?.slug || pkg.country?._id
                : pkg.country;

            const newPrice = pkg.offer?.newPrice ?? pkg.price;
            const oldPrice = pkg.offer?.oldPrice;
            const discount =
              newPrice && oldPrice && Number(oldPrice) > Number(newPrice)
                ? Math.round(
                    ((Number(oldPrice) - Number(newPrice)) /
                      Number(oldPrice)) *
                      100,
                  )
                : null;

            const includes = Array.isArray(pkg.includes) ? pkg.includes : [];
            const excludes = Array.isArray(pkg.excludes) ? pkg.excludes : [];

            return (
              <div
                key={pkg._id}
                className="group bg-card rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image Cover Card Top */}
                  <div className="relative h-48 w-full bg-muted overflow-hidden">
                    <Image
                      src={coverUrl || "/placeholder.png"}
                      alt={pkg.name || "package cover"}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                      {typeName && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary text-white shadow-xs">
                          {typeName}
                        </span>
                      )}
                      {countryName && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                          {countryName}
                        </span>
                      )}
                    </div>

                    {discount !== null && (
                      <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                        خصم {discount}%
                      </div>
                    )}

                    {/* Bottom overlay status */}
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                      <span className="text-xs font-mono font-medium opacity-90 truncate max-w-[200px]">
                        {pkg.slug || "بدون رابط مخصص"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(pkg)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer transition-all ${
                          pkg.isActive !== false
                            ? "bg-emerald-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                        title="تغيير الحالة"
                      >
                        {pkg.isActive !== false ? "نشطة" : "معطلة"}
                      </button>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    <Link
                      href={`/dashboard/packages/edit/${pkg._id}`}
                      className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-1 block"
                    >
                      {pkg.name}
                    </Link>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {pkg.description || "لا يوجد وصف مدخل لهذه الباقة."}
                    </p>

                    {/* Cities tags if available */}
                    {Array.isArray(pkg.cities) && pkg.cities.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                          <FaCity className="w-3 h-3 text-sky-500 shrink-0" />
                          <span>المدن:</span>
                        </span>
                        {pkg.cities.map((city: any, cIdx: number) => {
                          const cityName =
                            typeof city === "object" ? city?.name : city;
                          return (
                            <span
                              key={city?._id || cIdx}
                              className="text-[10px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-md"
                            >
                              {cityName}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Includes & Excludes pill badges */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      {includes.slice(0, 3).map((inc: any, i: number) => {
                        const isObj = typeof inc === "object" && inc !== null;
                        const name = isObj ? inc.name : inc;
                        const method = isObj ? inc.method : null;
                        return (
                          <span
                            key={inc._id || i}
                            className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold"
                            title={method ? `${name} (${method})` : name}
                          >
                            <FaRegCircleCheck className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate max-w-[110px]">{name}</span>
                          </span>
                        );
                      })}
                      {includes.length > 3 && (
                        <span
                          className="text-[10px] text-muted-foreground font-bold bg-muted px-1.5 py-0.5 rounded"
                          title={includes.slice(3).map((x: any) => typeof x === "object" ? x.name : x).join("، ")}
                        >
                          +{includes.length - 3} المزيد
                        </span>
                      )}
                      {excludes.length > 0 && (
                        <span
                          className="text-[10px] text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded font-medium"
                          title={excludes.map((x: any) => typeof x === "object" ? x.name : x).join("، ")}
                        >
                          {excludes.length} غير مشمول
                        </span>
                      )}
                      {includes.length === 0 && excludes.length === 0 && (
                        <span className="text-[11px] text-muted-foreground italic">
                          لم يتم تحديد مشتملات
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer with Price and Actions */}
                <div className="p-4 pt-3 border-t border-border/80 bg-muted/10 flex flex-col gap-3 mt-2">
                  {/* Price display row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        {newPrice ? "سعر الباقة" : "التسعير"}
                      </span>
                      {newPrice ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-emerald-600 font-mono">
                            {Number(newPrice).toLocaleString()}{" "}
                            <span className="text-xs font-normal">ر.س</span>
                          </span>
                          {oldPrice && Number(oldPrice) > Number(newPrice) && (
                            <span className="text-[11px] text-muted-foreground line-through font-mono">
                              {Number(oldPrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          محدد بالجولات
                        </span>
                      )}
                    </div>

                    {/* SEO Quick Badge Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSeoPackage(pkg);
                        setShowSeoModal(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="إعدادات محركات البحث SEO"
                    >
                      <FaGlobe className="w-3 h-3 text-blue-600" />
                      <span>SEO</span>
                    </button>
                  </div>

                  {/* Main Action Buttons with visible text */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    {typeSlug && countrySlug ? (
                      <Link
                        href={`/dashboard/packages/${typeSlug}/${countrySlug}?pkgId=${pkg._id}`}
                        className="flex-1 py-1.5 px-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                        title="عرض وإدارة فئات وجولات الباقة اليومية"
                      >
                        <FaArrowUpRightFromSquare className="w-3 h-3" />
                        <span>الجولات والفئات</span>
                      </Link>
                    ) : (
                      <div className="flex-1 text-center py-1.5 text-xs text-muted-foreground bg-muted/40 rounded-xl">
                        لا تتوفر فئات
                      </div>
                    )}

                    <Link
                      href={`/dashboard/packages/edit/${pkg._id}${
                        typeSlug && countrySlug
                          ? `?type=${encodeURIComponent(typeSlug)}&country=${encodeURIComponent(countrySlug)}`
                          : ""
                      }`}
                      className="p-2 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs"
                      title="تعديل كافة بيانات الباقة"
                    >
                      <FaPen className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">تعديل</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(pkg._id, pkg.name)}
                      className="p-2 text-rose-600 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs"
                      title="حذف هذه الباقة نهائياً"
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-background rounded-2xl border border-border shadow-xs overflow-hidden">
          <DataTable<any>
            data={filteredPackages}
            columns={tableColumns}
            onEdit={(pkg) => router.push(`/dashboard/packages/edit/${pkg._id}`)}
            onDelete={(id) => handleDelete(id)}
            onSeo={(pkg) => {
              setEditingSeoPackage(pkg);
              setShowSeoModal(true);
            }}
          />
        </div>
      )}

      {/* Server Pagination Bar */}
      {pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-background rounded-2xl border border-border shadow-xs mt-6">
          <div className="text-xs text-muted-foreground font-medium">
            عرض الصفحة <span className="font-bold text-foreground">{page}</span> من أصل{" "}
            <span className="font-bold text-foreground">{pagination.pages}</span> (إجمالي{" "}
            <span className="font-bold text-primary font-mono">{pagination.total}</span> باقة)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              السابق
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum: number;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      page === pageNum
                        ? "bg-primary text-white shadow-xs"
                        : "bg-muted/40 hover:bg-muted text-foreground border border-border"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Quick SEO Edit Modal */}
      <Modal
        isOpen={showSeoModal}
        onClose={() => {
          setShowSeoModal(false);
          setEditingSeoPackage(null);
        }}
      >
        <FormSEO
          onSubmit={handleSeoSubmit}
          defaultValues={{
            ...editingSeoPackage?.seo,
            slugUrl: editingSeoPackage?.seo?.slugUrl || editingSeoPackage?.slug,
          }}
        />
      </Modal>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      }
    >
      <PackagesPageContent />
    </Suspense>
  );
}
