"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCrud } from "@/hooks/useCrudQuery";
import api from "@/lib/axios";

import PageHeader from "@/components/ui/PageHeader/PageHeader";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import Spinner from "@/components/ui/Spinner/Spinner";
import Modal from "@/components/ui/Modal/Modal";

import {
  FaListCheck,
  FaPen,
  FaTrashCan,
  FaCheck,
  FaXmark,
  FaMagnifyingGlass,
  FaRotateLeft,
  FaSuitcase,
  FaArrowRightArrowLeft,
  FaBoxArchive,
} from "react-icons/fa6";

interface ContentItem {
  _id?: string;
  item: string;
  type: "include" | "exclude";
  packageId?: string;
  package?: any;
  createdAt?: string;
  updatedAt?: string;
}

export default function PackageInclusionsPage() {
  const queryClient = useQueryClient();

  // Active filters
  const [activeTab, setActiveTab] = useState<"ALL" | "include" | "exclude">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [itemText, setItemText] = useState<string>("");
  const [itemType, setItemType] = useState<"include" | "exclude">("include");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch package inclusions/exclusions content
  // Endpoint: /packages/admin/content
  const {
    data: rawContent,
    isLoading,
    refetch,
  } = useCrud<any>({
    queryKey: ["package-admin-content", "all"],
    endpoint: "/packages/admin/content",
    select: (res: any) => {
      const data = res?.data?.data ?? res?.data ?? res;
      return data;
    },
  });

  // Normalize API response into a clean ContentItem[] array
  const itemsList = useMemo<ContentItem[]>(() => {
    if (!rawContent) return [];

    let list: ContentItem[] = [];

    // Case 1: Structured object: { includes: [...], excludes: [...] } or { include: [...], exclude: [...] }
    const incArray =
      rawContent?.includes ||
      rawContent?.include ||
      rawContent?.included ||
      [];
    const excArray =
      rawContent?.excludes ||
      rawContent?.exclude ||
      rawContent?.excluded ||
      [];

    if (Array.isArray(incArray) && incArray.length > 0) {
      incArray.forEach((item: any, idx: number) => {
        if (typeof item === "string") {
          list.push({
            _id: `inc-${idx}-${item}`,
            item: item,
            type: "include",
            packageId: rawContent?.packageId || rawContent?.package?._id,
            package: rawContent?.package,
          });
        } else if (item && typeof item === "object") {
          list.push({
            _id: item._id || item.id || `inc-${idx}`,
            item: item.item || item.name || item.title || "",
            type: "include",
            packageId: item.packageId || item.package?._id || rawContent?.packageId,
            package: item.package || rawContent?.package,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          });
        }
      });
    }

    if (Array.isArray(excArray) && excArray.length > 0) {
      excArray.forEach((item: any, idx: number) => {
        if (typeof item === "string") {
          list.push({
            _id: `exc-${idx}-${item}`,
            item: item,
            type: "exclude",
            packageId: rawContent?.packageId || rawContent?.package?._id,
            package: rawContent?.package,
          });
        } else if (item && typeof item === "object") {
          list.push({
            _id: item._id || item.id || `exc-${idx}`,
            item: item.item || item.name || item.title || "",
            type: "exclude",
            packageId: item.packageId || item.package?._id || rawContent?.packageId,
            package: item.package || rawContent?.package,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          });
        }
      });
    }

    // Case 2: Array of items: [ { item: "...", type: "include" | "exclude", ... } ]
    if (list.length === 0 && Array.isArray(rawContent)) {
      list = rawContent.map((item: any, idx: number) => {
        if (typeof item === "string") {
          return {
            _id: `item-${idx}`,
            item,
            type: "include",
          };
        }
        return {
          _id: item._id || item.id || `item-${idx}`,
          item: item.item || item.name || item.title || "",
          type:
            item.type === "exclude" || item.isExclude
              ? "exclude"
              : "include",
          packageId: item.packageId || item.package?._id,
          package: item.package,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });
    }

    // Filter out empty items
    return list.filter((i) => Boolean(i.item && i.item.trim() !== ""));
  }, [rawContent]);

  // Client filtered items (Search & Type)
  const filteredItems = useMemo(() => {
    return itemsList.filter((entry) => {
      if (activeTab !== "ALL" && entry.type !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const text = (entry.item || "").toLowerCase();
        const pkgName = (entry.package?.name || "").toLowerCase();
        if (!text.includes(q) && !pkgName.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [itemsList, activeTab, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const total = itemsList.length;
    const includesCount = itemsList.filter((i) => i.type === "include").length;
    const excludesCount = itemsList.filter((i) => i.type === "exclude").length;
    return { total, includesCount, excludesCount };
  }, [itemsList]);

  // Modal Open Handlers
  const openCreateModal = (defaultType: "include" | "exclude" = "include") => {
    setEditingItem(null);
    setItemText("");
    setItemType(defaultType);
    setShowModal(true);
  };

  const openEditModal = (entry: ContentItem) => {
    setEditingItem(entry);
    setItemText(entry.item);
    setItemType(entry.type);
    setShowModal(true);
  };

  // Submit create or edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemText.trim()) {
      return toast.error("يرجى إدخال اسم البند");
    }

    setIsSubmitting(true);
    try {
      const trimmedItem = itemText.trim();
      const endpointPath = `/packages/admin/content/${itemType}`;

      if (editingItem) {
        // If type changed (e.g. from include to exclude), we delete from old and add to new
        if (editingItem.type !== itemType) {
          // Remove from old
          try {
            await api.delete(`/packages/admin/content/${editingItem.type}`, {
              data: {
                item: editingItem.item,
                items: [{ item: editingItem.item }],
              },
            });
          } catch {
            // Ignore delete error if item wasn't found
          }
          // Add to new
          await api.post(`/packages/admin/content/${itemType}`, {
            item: trimmedItem,
            items: [{ item: trimmedItem }],
          });
        } else {
          // Normal edit
          try {
            await api.patch(endpointPath, {
              item: trimmedItem,
              items: [{ item: trimmedItem, oldItem: editingItem.item !== trimmedItem ? editingItem.item : undefined }],
              oldItem: editingItem.item !== trimmedItem ? editingItem.item : undefined,
            });
          } catch {
            // Fallback for backends expecting POST
            await api.post(endpointPath, {
              item: trimmedItem,
              items: [{ item: trimmedItem }],
            });
          }
        }
        toast.success("تم تحديث البند بنجاح");
      } else {
        // Create new
        await api.post(endpointPath, {
          item: trimmedItem,
          items: [{ item: trimmedItem }],
        });
        toast.success(`تمت إضافة "${trimmedItem}" بنجاح كـ ${itemType === "include" ? "مشتمل" : "استثناء"}`);
      }

      setShowModal(false);
      setEditingItem(null);
      setItemText("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["package-admin-content"] });
    } catch (err: any) {
      console.error("Failed to save content item:", err);
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "حدث خطأ أثناء حفظ البند");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch type directly (From Include to Exclude or vice versa)
  const handleToggleType = async (entry: ContentItem) => {
    const targetType = entry.type === "include" ? "exclude" : "include";
    const targetLabel = targetType === "include" ? "مشتملات الباقة" : "الاستثناءات (غير مشمول)";

    try {
      // 1. Delete from current type
      await api.delete(`/packages/admin/content/${entry.type}`, {
        data: {
          item: entry.item,
          items: [{ item: entry.item }],
          packageId: entry.packageId || undefined,
        },
      });

      // 2. Add to target type
      await api.post(`/packages/admin/content/${targetType}`, {
        item: entry.item,
        items: [{ item: entry.item }],
        ...(entry.packageId ? { packageId: entry.packageId } : {}),
      });

      toast.success(`تم نقل "${entry.item}" إلى ${targetLabel}`);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["package-admin-content"] });
    } catch (err: any) {
      console.error("Failed to switch item type:", err);
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "فشل في تحويل نوع البند");
    }
  };

  // Delete item
  const handleDelete = async (entry: ContentItem) => {
    if (!confirm(`هل أنت متأكد من حذف "${entry.item}"؟`)) return;

    try {
      await api.delete(`/packages/admin/content/${entry.type}`, {
        data: {
          item: entry.item,
          items: [{ item: entry.item }],
          packageId: entry.packageId || undefined,
        },
      });
      toast.success("تم حذف البند بنجاح");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["package-admin-content"] });
    } catch (err: any) {
      console.error("Failed to delete content item:", err);
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "فشل في حذف البند");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageHeader
            pageName="المشتملات والاستثناءات"
            pageDescription="إدارة عناصر المشتملات (Includes) والاستثناءات (Excludes) للباقات السياحية"
            PageIcon={FaListCheck}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openCreateModal("include")}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FaCheck className="w-3.5 h-3.5" />
            <span>إضافة مشمول</span>
          </button>
          <button
            type="button"
            onClick={() => openCreateModal("exclude")}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FaXmark className="w-3.5 h-3.5" />
            <span>إضافة استثناء</span>
          </button>
        </div>
      </div>

      <BreadCrumb breadCrumbItems="لوحة التحكم / الخدمات والرحلات السياحية / المشتملات والاستثناءات" />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-2xl border border-border flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-muted-foreground font-semibold block mb-1">
              إجمالي البنود المسجلة
            </span>
            <span className="text-2xl font-black text-foreground font-mono">
              {counts.total}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FaListCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold block mb-1">
              الخدمات المشمولة (Includes)
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {counts.includesCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FaCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/20 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold block mb-1">
              الاستثناءات غير المشمولة (Excludes)
            </span>
            <span className="text-2xl font-black text-rose-600 font-mono">
              {counts.excludesCount}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <FaXmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="p-4 bg-card rounded-2xl border border-border shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tab Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              الكل ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("include")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "include"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              }`}
            >
              <FaCheck className="w-3 h-3" />
              <span>مشمول ({counts.includesCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("exclude")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "exclude"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
              }`}
            >
              <FaXmark className="w-3 h-3" />
              <span>مستبعد ({counts.excludesCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في البنود المسجلة..."
              className="w-full h-10 px-3.5 pr-9 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <FaMagnifyingGlass className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-3.5" />
          </div>
        </div>

        {/* Reset Filter Button if active */}
        {searchQuery && (
          <div className="flex items-center gap-3 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("ALL");
              }}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <FaRotateLeft className="w-3 h-3" />
              <span>إعادة ضبط البحث</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content List / Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Spinner />
          <p className="text-xs text-muted-foreground font-medium">
            جاري جلب قائمة المشتملات والاستثناءات...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border space-y-3">
          <FaBoxArchive className="w-10 h-10 mx-auto text-muted-foreground/30" />
          <h4 className="text-sm font-bold text-foreground">
            لا توجد بنود مسجلة
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? "لم يتم العثور على أي نتائج تطابق معايير البحث المحددة."
              : "لم يتم إضافة أي مشتملات أو استثناءات بعد. ابدأ بإضافة بنود جديدة للباقات."}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => openCreateModal("include")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <FaCheck className="w-3 h-3" />
              <span>إضافة أول مشمول</span>
            </button>
            <button
              type="button"
              onClick={() => openCreateModal("exclude")}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <FaXmark className="w-3 h-3" />
              <span>إضافة أول استثناء</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((entry, idx) => {
            const isInclude = entry.type === "include";
            const pkgName = entry.package?.name;

            return (
              <div
                key={entry._id || idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-xs bg-card ${
                  isInclude
                    ? "border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5"
                    : "border-rose-500/20 hover:border-rose-500/40 hover:shadow-rose-500/5"
                }`}
              >
                <div>
                  {/* Top Badge: Type & Package */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isInclude
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                      }`}
                    >
                      {isInclude ? (
                        <>
                          <FaCheck className="w-2.5 h-2.5" />
                          <span>مشمول في الباقة</span>
                        </>
                      ) : (
                        <>
                          <FaXmark className="w-2.5 h-2.5" />
                          <span>غير مشمول (استثناء)</span>
                        </>
                      )}
                    </span>

                    {pkgName && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-semibold truncate max-w-[140px] flex items-center gap-1">
                        <FaSuitcase className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{pkgName}</span>
                      </span>
                    )}
                  </div>

                  {/* Item Text */}
                  <h4 className="text-sm font-bold text-foreground leading-snug">
                    {entry.item}
                  </h4>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  {/* Toggle Type Button (Move between Include and Exclude) */}
                  <button
                    type="button"
                    onClick={() => handleToggleType(entry)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isInclude
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                    }`}
                    title={
                      isInclude
                        ? "تحويل إلى استثناء (غير مشمول)"
                        : "تحويل إلى مشمول"
                    }
                  >
                    <FaArrowRightArrowLeft className="w-3 h-3" />
                    <span>
                      {isInclude ? "تحويل لمستبعد" : "تحويل لمشمول"}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(entry)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
                      title="تعديل البند"
                    >
                      <FaPen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry)}
                      className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                      title="حذف البند"
                    >
                      <FaTrashCan className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add / Edit Item */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          if (!isSubmitting) setShowModal(false);
        }}
      >
        <div className="p-4 sm:p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground">
              {editingItem
                ? "تعديل بند المشتملات / الاستثناءات"
                : itemType === "include"
                  ? "إضافة بند مشمول جديد"
                  : "إضافة استثناء غير مشمول جديد"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              أدخل تفاصيل البند وحدد ما إذا كان مشمولاً في الباقة أو من الاستثناءات
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item text */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              اسم البند أو الخدمة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={itemText}
              onChange={(e) => setItemText(e.target.value)}
              placeholder="مثال: الإقامة في فنادق 4 نجوم، الإفطار اليومي، تذاكر الطيران..."
              className="w-full h-10 px-3.5 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              التصنيف (مشمول أم غير مشمول) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setItemType("include")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  itemType === "include"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <FaCheck className="w-3 h-3" />
                <span>مشمول في الباقة (Include)</span>
              </button>

              <button
                type="button"
                onClick={() => setItemType("exclude")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  itemType === "exclude"
                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                    : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <FaXmark className="w-3 h-3" />
                <span>غير مشمول (Exclude)</span>
              </button>
            </div>
          </div>


          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                itemType === "include"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isSubmitting ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <FaCheck className="w-3 h-3" />
                  <span>{editingItem ? "حفظ التعديلات" : "إضافة البند"}</span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </Modal>
    </div>
  );
}
