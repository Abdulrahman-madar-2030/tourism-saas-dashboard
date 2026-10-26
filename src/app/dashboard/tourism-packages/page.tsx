"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FaBox,
  FaPlus,
  FaGlobe,
  FaPencil,
  FaTrash,
  FaArrowLeft,
  FaCopy,
  FaCheck,
  FaRoute,
  FaTableCellsLarge,
  FaTableList,
  FaMagnifyingGlass,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { TbSeo } from "react-icons/tb";
import { FiX } from "react-icons/fi";

import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Spinner from "@/components/ui/Spinner/Spinner";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import { SingleImageSelector } from "@/components/ui/ImageInput/ImageInput";
import DataTable, { TableColumn } from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import { useCrud } from "@/hooks/useCrudQuery";
import { PackageTypeForm } from "@/types/packageCategoryTypes";
import { Seo } from "@/types/seoTypes";

// Helper to strip HTML tags for clean text snippets
function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

// Helper to slugify Arabic & English text
function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove special characters but keep letters, numbers, spaces, and Arabic letters
    .replace(/[^\w\s\u0621-\u064A\u0660-\u0669]/g, "")
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove consecutive hyphens
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");
}

export default function PackageTypes() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedPackageType, setSelectedPackageType] = useState<PackageTypeForm | null>(null);
  const [editingSeoPackageType, setEditingSeo] = useState<PackageTypeForm | null>(null);

  // UI state: search, filter, view mode, workflow banner
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PackageTypeForm & { isActive?: boolean; metaTitle?: string; metaDescription?: string; slugUrl?: string }>({
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      alt: "",
      isActive: true,
      countries: [],
      metaTitle: "",
      metaDescription: "",
      slugUrl: "",
    },
  });

  const watchedName = watch("name");
  const watchedImageCover = watch("imageCover");

  // Track if user manually modified the slug field
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Auto-generate slug when name changes (unless user manually edited the slug)
  useEffect(() => {
    if (!isSlugManuallyEdited && watchedName !== undefined) {
      const generated = slugifyText(watchedName || "");
      setValue("slug", generated, { shouldValidate: true, shouldDirty: true });
      setValue("slugUrl", generated);
    }
  }, [watchedName, isSlugManuallyEdited, setValue]);

  // Fetch available countries
  const { data: availableCountries } = useCrud<any[]>({
    queryKey: ["countries", "package-types-form"],
    endpoint: "/countries",
    select: (res: any) => {
      const data = res?.data?.data ?? res?.data ?? res ?? [];
      return Array.isArray(data) ? data : [];
    },
  });

  const {
    data: packageTypes,
    createItem: createPackageType,
    updateItem: updatePackageType,
    deleteItem: deletePackageType,
    isLoading,
    isError: error,
  } = useCrud<any>({
    queryKey: ["packageTypes"],
    endpoint: "/package-types",
    select: (res: any) => {
      const data = res?.data ?? res;
      return Array.isArray(data) ? data : [];
    },
    handleCloseModal: () => {
      setShowCreateModal(false);
      setShowUpdateModal(false);
    },
  });

  const list: any[] = useMemo(() => {
    if (!packageTypes) return [];
    if (Array.isArray(packageTypes)) return packageTypes;
    if (Array.isArray(packageTypes.data)) return packageTypes.data;
    return [];
  }, [packageTypes]);

  // Filtered list
  const filteredList = useMemo(() => {
    return list.filter((pkg) => {
      const nameMatch =
        !searchTerm ||
        pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "active" && pkg.isActive !== false) ||
        (statusFilter === "inactive" && pkg.isActive === false);

      return nameMatch && statusMatch;
    });
  }, [list, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = list.length;
    const active = list.filter((item) => item.isActive !== false).length;
    const inactive = total - active;
    const hasSeo = list.filter((item) => item.seo && (item.seo.metaTitle || item.seo.keywords?.length)).length;
    return { total, active, inactive, hasSeo };
  }, [list]);

  // Handle Slug copy
  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    toast.success("تم نسخ الـ slug");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedPackageType(null);
    setIsSlugManuallyEdited(false);
    reset({
      name: "",
      slug: "",
      description: "",
      alt: "",
      isActive: true,
      imageCover: undefined,
      countries: [],
      metaTitle: "",
      metaDescription: "",
      slugUrl: "",
    });
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (pkg: any) => {
    setSelectedPackageType(pkg);
    setIsSlugManuallyEdited(true);
    const countryIds = Array.isArray(pkg.countries)
      ? pkg.countries.map((c: any) => (typeof c === "object" ? c._id || c.id : c)).filter(Boolean)
      : [];

    const existingCover =
      pkg.imageCover ||
      pkg.coverImage ||
      pkg.image ||
      (typeof pkg.photo === "string" ? pkg.photo : undefined) ||
      null;

    reset({
      _id: pkg._id,
      name: pkg.name || "",
      slug: pkg.slug || "",
      description: pkg.description || "",
      alt: pkg.alt || pkg.imageCover?.alt || pkg.coverImage?.alt || "",
      isActive: pkg.isActive !== false,
      imageCover: existingCover,
      countries: countryIds,
      metaTitle: pkg.seo?.metaTitle || "",
      metaDescription: pkg.seo?.metaDescription || "",
      slugUrl: pkg.seo?.slugUrl || pkg.slug || "",
    });
    setShowCreateModal(true);
  };

  // Open SEO Modal
  const handleOpenSeo = (pkg: any) => {
    setEditingSeo(pkg);
    setShowUpdateModal(true);
  };

  // SEO Submit
  const handleSeoSubmit = async (seoData: Seo) => {
    if (!editingSeoPackageType?._id) return toast.error("نوع الباقة غير محدد");

    const formatBoolean = (val: boolean | string) =>
      val === true || val === "true" ? "true" : "false";

    const { keywords, alt, ...rest } = seoData;
    const formattedKeywords =
      typeof keywords === "string"
        ? keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : keywords || [];

    try {
      await updatePackageType({
        id: editingSeoPackageType._id,
        endpoint: "/package-types/admin",
        body: {
          alt: alt || "no alt",
          seo: {
            ...rest,
            keywords: formattedKeywords,
            noIndex: formatBoolean(seoData.noIndex),
            noFollow: formatBoolean(seoData.noFollow),
            noArchive: formatBoolean(seoData.noArchive),
            noSnippet: formatBoolean(seoData.noSnippet),
          },
        },
      });
      setShowUpdateModal(false);
    } catch {
      // Error handled by hook
    }
  };

  // Form Submit (Create / Edit)
  async function onSubmit(formData: any) {
    const computedSlug = formData.slug || formData.slugUrl || slugifyText(formData.name || "");
    const altText = formData.alt || formData.name || "";

    // Build the updated API schema structure:
    // {
    //   "name": "...",
    //   "description": "...",
    //   "countries": ["...", "..."],
    //   "imageCover": { "url": "...", "alt": "..." },
    //   "isActive": true,
    //   "seo": { "metaTitle": "...", "metaDescription": "...", "slugUrl": "..." }
    // }
    const seoObject: any = {
      metaTitle: formData.metaTitle || formData.name,
      metaDescription: formData.metaDescription || formData.description,
      slugUrl: formData.slugUrl || computedSlug,
    };

    const countriesList = Array.isArray(formData.countries)
      ? formData.countries
      : formData.countries
        ? [formData.countries]
        : [];

    const bodyPayload: any = {
      name: formData.name,
      slug: computedSlug,
      description: formData.description,
      countries: countriesList,
      isActive: formData.isActive !== false,
      seo: seoObject,
    };

    // If imageCover is an existing URL object or string (not a newly picked File)
    if (formData.imageCover && !(formData.imageCover instanceof File)) {
      if (typeof formData.imageCover === "string") {
        bodyPayload.imageCover = {
          url: formData.imageCover,
          alt: altText,
        };
      } else if (typeof formData.imageCover === "object") {
        bodyPayload.imageCover = {
          url: formData.imageCover.url || formData.imageCover.secure_url || "",
          alt: formData.imageCover.alt || altText,
        };
      }
    }

    const payload = {
      body: bodyPayload,
      imageCover: formData.imageCover instanceof File ? formData.imageCover : undefined,
      alt: altText,
      imageCoverAlt: altText,
    };

    try {
      if (selectedPackageType?._id) {
        await updatePackageType({
          id: selectedPackageType._id,
          endpoint: "/package-types/admin",
          ...payload,
        });
      } else {
        await createPackageType({
          endpoint: "/package-types/admin",
          ...payload,
        });
      }
      setShowCreateModal(false);
    } catch {
      // Error handled by hook
    }
  }

  // Confirm and Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget?._id) return;
    setIsDeleting(true);
    try {
      await deletePackageType(`/package-types/admin/${deleteConfirmTarget._id}`);
      setDeleteConfirmTarget(null);
    } catch {
      // Error handled by hook
    } finally {
      setIsDeleting(false);
    }
  };

  // Table columns
  const tableColumns: TableColumn<any>[] = [
    {
      key: "imageCover",
      label: "الصورة",
      render: (value: any, row: any) => {
        const rawUrl =
          value?.url ||
          (typeof value === "string" ? value : "") ||
          value?.secure_url ||
          row?.coverImage?.url ||
          (typeof row?.coverImage === "string" ? row?.coverImage : "") ||
          row?.image?.url ||
          (typeof row?.image === "string" ? row?.image : "") ||
          "";
        const url = rawUrl && !rawUrl.includes("example.com") ? rawUrl : "/placeholder.png";
        return (
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted border border-border shadow-2xs">
            <Image
              src={url}
              alt={value?.alt || row?.name || "cover"}
              fill
              unoptimized
              className="object-cover"
              sizes="56px"
            />
          </div>
        );
      },
    },
    {
      key: "name",
      label: "نوع الباقة",
      render: (_: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm">{record.name}</span>
            {record.isActive !== false ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                نشط
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                معطل
              </span>
            )}
          </div>
          {record.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[260px]">
              {stripHtml(record.description)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "slug",
      label: "الـ Slug",
      render: (value: string) => (
        <button
          type="button"
          onClick={() => handleCopySlug(value)}
          title="انقر لنسخ الـ slug"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-foreground/80 hover:bg-muted/80 text-xs font-mono transition-colors group cursor-pointer"
        >
          <span>{value}</span>
          {copiedSlug === value ? (
            <FaCheck className="text-emerald-500 text-[11px]" />
          ) : (
            <FaCopy className="text-muted-foreground/60 group-hover:text-foreground text-[11px]" />
          )}
        </button>
      ),
    },
    {
      key: "_id",
      label: "الدول والباقات",
      render: (_: any, record: any) => (
        <Link
          href={`/dashboard/tourism-packages/${record.slug}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-2xs transition-all group"
        >
          <FaGlobe className="text-amber-400 group-hover:rotate-12 transition-transform text-sm" />
          <span>عرض الدول التي بها باقات</span>
          <FaArrowLeft className="text-[10px] group-hover:-translate-x-1 transition-transform" />
        </Link>
      ),
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(record)}
            title="تعديل نوع الباقة"
            className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <FaPencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenSeo(record)}
            title="تحسين محركات البحث SEO"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              record.seo?.metaTitle || record.seo?.keywords?.length
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <TbSeo size={17} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirmTarget(record)}
            title="حذف"
            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <FaTrash size={13} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <PageHeader
          pageName="الباقات السياحية"
          pageDescription="الخطوة 1: إدارة أنواع وتصنيفات الباقات واستعراض الدول التابعة لها"
          PageIcon={FaBox}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-background rounded-2xl border border-destructive/20 space-y-3" dir="rtl">
        <FaTriangleExclamation className="text-destructive text-3xl mx-auto" />
        <h3 className="text-lg font-bold text-foreground">حدث خطأ أثناء تحميل البيانات</h3>
        <p className="text-sm text-muted-foreground">تعذر جلب قائمة أنواع الباقات من السيرفر.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Page Header ── */}
      <PageHeader
        pageName="الباقات السياحية"
        pageDescription="الخطوة 1: إدارة أنواع وتصنيفات الباقات واستعراض الدول التابعة لها"
        PageIcon={FaBox}
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-sm font-bold shadow-sm active:scale-95 cursor-pointer"
          >
            <FaPlus size={13} />
            <span>إضافة نوع باقة جديد</span>
          </button>
        }
      />

      <div className="my-2">
        <BreadCrumb breadCrumbItems="الباقات السياحية" />
      </div>

      {/* ── Workflow Stepper / Guide Banner ── */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent p-4 sm:p-5 transition-all">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <FaRoute size={14} />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              مسار إدارة وتنظيم الباقات السياحية
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowWorkflowGuide(!showWorkflowGuide)}
            className="text-xs text-primary font-semibold hover:underline cursor-pointer"
          >
            {showWorkflowGuide ? "إخفاء الدليل" : "إظهار الدليل"}
          </button>
        </div>

        {showWorkflowGuide && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-background border-2 border-primary/40 shadow-xs relative overflow-hidden">
              <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-white">
                أنت هنا
              </span>
              <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[11px]">1</span>
                <span>أنواع الباقات</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                تصنيف الباقات العام (سياحية، شهر عسل، عمرة...).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-background/80 border border-border shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[11px]">2</span>
                <span className="flex items-center gap-1">
                  الدول المتاحة
                  <FaGlobe className="text-amber-500 text-[11px]" />
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                استعراض وإضافة الدول التي تحتوي على باقات تابعة لهذا النوع.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-background/80 border border-border shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[11px]">3</span>
                <span>باقات الدولة والمتغيرات</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                تفاصيل الباقة، المشمولات، والمتغيرات (الفئات والأسعار).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-background/80 border border-border shadow-2xs">
              <div className="flex items-center gap-2 text-foreground font-bold text-xs mb-1">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[11px]">4</span>
                <span>البرنامج والرحلات</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                خط سير الرحلة اليومي والجولات والأنشطة السياحية.
              </p>
            </div>
          </div>
        )}
      </div>

 
      {/* ── Controls Bar: Search, Filters, and View Switch ── */}
      <div className="p-4 rounded-2xl bg-background border border-border shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FaMagnifyingGlass className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث باسم نوع الباقة، الوصف أو الـ slug..."
            className="w-full h-10 pr-9 pl-8 text-sm rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {/* Filter by status & View toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status buttons */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/80 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-background text-emerald-600 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              نشط ({stats.active})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-background text-rose-600 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              معطل ({stats.inactive})
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/80 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="عرض البطاقات"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-background text-primary shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FaTableCellsLarge size={12} />
              <span className="hidden sm:inline">بطاقات</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="عرض الجدول"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-background text-primary shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FaTableList size={12} />
              <span className="hidden sm:inline">جدول</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Content View ── */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-background rounded-2xl border border-dashed border-border space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <FaBox size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">لم يتم العثور على أي نوع باقة</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {searchTerm
                ? "لا توجد نتائج تطابق معايير البحث الحالية."
                : "ابدأ بإضافة أول نوع باقة سياحية للمنصة."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <FaPlus size={12} />
            <span>إضافة نوع باقة جديد</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Modern Cards Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((pkg, idx) => {
            const rawCoverUrl =
              pkg.imageCover?.url ||
              pkg.coverImage?.url ||
              (typeof pkg.imageCover === "string" ? pkg.imageCover : "") ||
              (typeof pkg.coverImage === "string" ? pkg.coverImage : "") ||
              pkg.image?.url ||
              (typeof pkg.image === "string" ? pkg.image : "");
            const coverUrl =
              rawCoverUrl && !rawCoverUrl.includes("example.com")
                ? rawCoverUrl
                : "/placeholder.png";

            return (
              <div
                key={pkg._id || pkg.slug}
                className="group flex flex-col rounded-2xl bg-background border border-border shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-300 overflow-hidden"
              >
                {/* Card Image Banner */}
                <div className="relative w-full h-44 bg-muted overflow-hidden">
                  <Image
                    src={coverUrl}
                    alt={pkg.imageCover?.alt || pkg.coverImage?.alt || pkg.name}
                    fill
                    unoptimized
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Badges on Top */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                    {/* Status Badge */}
                    {pkg.isActive !== false ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        نشط
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/90 text-white backdrop-blur-md shadow-sm">
                        معطل
                      </span>
                    )}

                    {/* SEO indicator */}
                    {pkg.seo?.metaTitle || pkg.seo?.keywords?.length ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 text-[#1e1742] backdrop-blur-md">
                        <TbSeo size={14} className="text-primary" />
                        SEO
                      </span>
                    ) : null}
                  </div>

                  {/* Title overlay at bottom of image */}
                  <div className="absolute bottom-3 inset-x-3">
                    <h3 className="text-lg font-black text-white drop-shadow-md truncate">
                      {pkg.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Slug pill with copy */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopySlug(pkg.slug)}
                        title="انقر لنسخ الـ slug"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-mono transition-colors group/slug cursor-pointer"
                      >
                        <span className="truncate max-w-[200px]">{pkg.slug}</span>
                        {copiedSlug === pkg.slug ? (
                          <FaCheck className="text-emerald-500 text-[10px]" />
                        ) : (
                          <FaCopy className="text-muted-foreground/60 group-hover/slug:text-foreground text-[10px]" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    {pkg.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {stripHtml(pkg.description)}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-border/80 space-y-2">
                    {/* PRIMARY ACTION: عرض الدول التي بها باقات */}
                    <Link
                      href={`/dashboard/tourism-packages/${pkg.slug}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#1e1742] hover:bg-[#2b2160] text-white shadow-sm hover:shadow transition-all group/btn"
                    >
                      <FaGlobe className="text-amber-400 group-hover/btn:rotate-12 transition-transform text-sm" />
                      <span>عرض الدول التي بها باقات</span>
                      <FaArrowLeft className="text-xs group-hover/btn:-translate-x-1 transition-transform" />
                    </Link>

                    {/* Secondary Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(pkg)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <FaPencil size={11} />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenSeo(pkg)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <TbSeo size={14} />
                          <span>SEO</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmTarget(pkg)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <FaTrash size={11} />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table View ── */
        <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-2xs">
          <DataTable
            data={filteredList}
            columns={tableColumns}
            searchable={false}
          />
        </div>
      )}

      {/* ── Modal: Create / Edit Package Type ── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        className="max-w-2xl"
      >
        <div className="space-y-5" dir="rtl">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {selectedPackageType?._id ? "تعديل نوع الباقة" : "إضافة نوع باقة جديد"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                أدخل تفاصيل نوع الباقة وصورة الغلاف
              </p>
            </div>
        
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                اسم نوع الباقة <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("name", {
                  required: "اسم نوع الباقة مطلوب",
                })}
                placeholder="مثال: الباقات السياحية، باقات شهر العسل..."
                className="w-full h-10 px-3 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">
                  الرابط الدائم (Slug) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const generated = slugifyText(watchedName || "");
                    setValue("slug", generated, { shouldValidate: true, shouldDirty: true });
                    setValue("slugUrl", generated);
                    setIsSlugManuallyEdited(false);
                  }}
                  className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                >
                  إعادة التوليد من الاسم تلقائياً
                </button>
              </div>
              <input
                {...register("slug", {
                  required: "الـ slug مطلوب",
                  onChange: () => {
                    setIsSlugManuallyEdited(true);
                  },
                })}
                placeholder="example: tourism-packages"
                className="w-full h-10 px-3 text-sm font-mono rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {errors.slug && (
                <p className="text-xs text-rose-500 mt-1">{errors.slug.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                تفاصيل ووصف الباقة <span className="text-rose-500">*</span>
              </label>
              <textarea
                {...register("description", { required: "الوصف مطلوب" })}
                rows={3}
                placeholder="اكتب وصفاً جذاباً لنوع الباقة والمميزات التي تتضمنها..."
                className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              {errors.description && (
                <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <SingleImageSelector
                currentImage={watchedImageCover}
                onImageSelect={(file) =>
                  setValue("imageCover", file as any, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                label="صورة الغلاف"
                required
              />
            </div>

            {/* Alt text for image */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                النص البديل للصورة (Alt)
              </label>
              <input
                {...register("alt")}
                placeholder="وصف مختصر للصورة لتعزيز الـ SEO"
                className="w-full h-10 px-3 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Countries Selection */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                الدول المشمولة (Countries)
              </label>
              {availableCountries && availableCountries.length > 0 ? (
                <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2">
                  <p className="text-[11px] text-muted-foreground">
                    اختر الدول التي تتبع هذا النوع من الباقات:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto no-scrollbar pr-1">
                    {availableCountries.map((c: any) => {
                      const cId = c._id || c.id;
                      const selectedCountries: string[] = watch("countries") || [];
                      const isSelected = selectedCountries.includes(cId);

                      return (
                        <label
                          key={cId}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-all ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary font-bold"
                              : "bg-background border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setValue("countries", [...selectedCountries, cId]);
                              } else {
                                setValue(
                                  "countries",
                                  selectedCountries.filter((id) => id !== cId)
                                );
                              }
                            }}
                          />
                          <span className="truncate">{c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  جاري تحميل الدول أو لا توجد دول مضافة بعد...
                </p>
              )}
            </div>

            {/* SEO Section (Embedded in Form) */}
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <TbSeo className="text-primary text-base" />
                <h4 className="text-xs font-bold text-foreground">
                  إعدادات الـ SEO لمحركات البحث (اختياري)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Meta Title
                  </label>
                  <input
                    {...register("metaTitle")}
                    placeholder="مثال: باقات العمرة الفاخرة | بوابة السياحة والسفر"
                    className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Slug URL
                  </label>
                  <input
                    {...register("slugUrl")}
                    placeholder="مثال: umrah-packages"
                    className="w-full h-9 px-3 text-xs font-mono rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Meta Description
                  </label>
                  <textarea
                    {...register("metaDescription")}
                    rows={2}
                    placeholder="وصف مختصر لمحركات البحث (جوجل)..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Active Status */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">تفعيل نوع الباقة</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  عرض نوع الباقة للمستخدمين في الموقع العام
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <span>{selectedPackageType?._id ? "حفظ التعديلات" : "إضافة النوع"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ── Modal: SEO Configuration ── */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        className="max-w-2xl"
      >
        <FormSEO
          onSubmit={handleSeoSubmit}
          defaultValues={{
            priority: 1,
            changeFrequency: "always",
            ...editingSeoPackageType?.seo,
            keywords: Array.isArray(editingSeoPackageType?.seo?.keywords)
              ? editingSeoPackageType.seo.keywords.join(", ")
              : editingSeoPackageType?.seo?.keywords,
            slugUrl:
              editingSeoPackageType?.seo?.slugUrl ||
              editingSeoPackageType?.slug,
            alt: editingSeoPackageType?.alt || "no alt",
          }}
        />
      </Modal>

      {/* ── Modal: Delete Confirmation ── */}
      <Modal
        isOpen={!!deleteConfirmTarget}
        onClose={() => setDeleteConfirmTarget(null)}
        className="max-w-md"
      >
        <div className="space-y-4 text-center p-2" dir="rtl">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center mx-auto">
            <FaTrash size={20} />
          </div>

          <div>
            <h3 className="text-base font-bold text-foreground">
              تأكيد حذف نوع الباقة
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              هل أنت متأكد من حذف نوع الباقة{" "}
              <span className="font-bold text-foreground">
                &quot;{deleteConfirmTarget?.name}&quot;
              </span>
              ؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmTarget(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
