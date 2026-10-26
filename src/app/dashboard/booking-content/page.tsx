"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import {
  BookingContent,
  BookingContentForm,
  BookingStep,
} from "@/types/bookingContentTypes";
import { useCrud } from "@/hooks/useCrudQuery";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/ui/Modal/Modal";
import Spinner from "@/components/ui/Spinner/Spinner";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import {
  FaClipboardList,
  FaPlus,
  FaPen,
  FaTrashCan,
  FaShieldHalved,
  FaCoins,
  FaBox,
  FaGlobe,
  FaArrowUp,
  FaArrowDown,
  FaRotateLeft,
  FaCheck,
  FaXmark,
} from "react-icons/fa6";

interface Package {
  _id: string;
  name?: string;
  title?: string;
}

export default function BookingContentPage() {
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState<BookingContent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DEFAULT" | "PACKAGE">("ALL");

  // Temporary benefit input for the modal
  const [newBenefitInput, setNewBenefitInput] = useState("");

  const {
    data: bookingContents,
    isLoading,
    refetch,
  } = useCrud<BookingContent[]>({
    queryKey: ["booking-content"],
    endpoint: "/booking-content/admin",
    select: (res: any) => {
      const d = res?.data?.data || res?.data || res || [];
      if (Array.isArray(d)) return d;
      if (d && typeof d === "object" && (d.steps || d._id || d.depositAmount !== undefined)) {
        return [d];
      }
      return [];
    },
  });

  const { data: packages } = useCrud<Package[]>({
    queryKey: ["packages"],
    endpoint: "/packages",
    select: (res: any) => {
      const array = res?.data?.data || res?.data || res || [];
      return Array.isArray(array) ? array : [];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingContentForm>({
    defaultValues: {
      package: "",
      depositAmount: 0,
      steps: [],
      guarantee: {
        badge: "",
        title: "",
        description: "",
        benefits: [],
      },
    },
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStepAt,
    move: moveStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  const currentBenefits = watch("guarantee.benefits") || [];

  // Helper to safely extract package ID whether package is string ID or populated object
  const getPackageId = (pkg?: any): string | undefined => {
    if (!pkg) return undefined;
    if (typeof pkg === "string") return pkg;
    return pkg._id;
  };

  // Helper to find package info object whether populated or by looking up in packages
  const getPackageInfo = (pkg?: any): Package | null => {
    if (!pkg) return null;
    if (typeof pkg === "object") return pkg;
    return packages?.find((p) => p._id === pkg) || null;
  };

  // Helper to find package title/name whether populated or by looking up in packages
  const getPackageTitle = (pkg?: any): string | undefined => {
    if (!pkg) return undefined;
    if (typeof pkg === "object") {
      return pkg.name || pkg.title;
    }
    const found = packages?.find((p) => p._id === pkg);
    return found?.name || found?.title;
  };

  const handleOpenCreateModal = () => {
    setSelectedContent(null);
    setNewBenefitInput("");
    reset({
      package: "",
      depositAmount: 0,
      steps: [],
      guarantee: {
        badge: "",
        title: "",
        description: "",
        benefits: [],
      },
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (content: BookingContent) => {
    setSelectedContent(content);
    setNewBenefitInput("");
    const pkgId = getPackageId(content.package) || "";
    reset({
      package: pkgId,
      depositAmount: content.depositAmount ?? 500,
      steps: (content.steps || []).map((st, idx) => ({
        step: st.step ?? idx + 1,
        badge: st.badge || "",
        title: st.title || "",
        description: st.description || "",
        footer: st.footer || "",
      })),
      guarantee: {
        badge: content.guarantee?.badge || "",
        title: content.guarantee?.title || "",
        description: content.guarantee?.description || "",
        benefits: Array.isArray(content.guarantee?.benefits)
          ? [...content.guarantee.benefits]
          : [],
      },
    });
    setShowModal(true);
  };

  const handleAddBenefit = () => {
    const trimmed = newBenefitInput.trim();
    if (!trimmed) return;
    if (currentBenefits.includes(trimmed)) {
      toast.error("هذه الميزة مضافة مسبقاً");
      return;
    }
    setValue("guarantee.benefits", [...currentBenefits, trimmed]);
    setNewBenefitInput("");
  };

  const handleRemoveBenefit = (index: number) => {
    const updated = currentBenefits.filter((_, i) => i !== index);
    setValue("guarantee.benefits", updated);
  };

  const handleAddStep = () => {
    appendStep({
      step: stepFields.length + 1,
      badge: "",
      title: "",
      description: "",
      footer: "",
    });
  };

  const handleRemoveStep = (index: number) => {
    if (stepFields.length <= 1) {
      toast.error("يجب الإبقاء على خطوة واحدة على الأقل");
      return;
    }
    removeStepAt(index);
    // Renumber remaining steps
    const currentSteps = watch("steps") || [];
    const renumbered = currentSteps
      .filter((_, i) => i !== index)
      .map((st, i) => ({ ...st, step: i + 1 }));
    setValue("steps", renumbered);
  };

  const handleMoveStepUp = (index: number) => {
    if (index === 0) return;
    moveStep(index, index - 1);
    // Renumber steps
    const currentSteps = [...(watch("steps") || [])];
    const temp = currentSteps[index];
    currentSteps[index] = currentSteps[index - 1];
    currentSteps[index - 1] = temp;
    const renumbered = currentSteps.map((st, i) => ({ ...st, step: i + 1 }));
    setValue("steps", renumbered);
  };

  const handleMoveStepDown = (index: number) => {
    if (index === stepFields.length - 1) return;
    moveStep(index, index + 1);
    // Renumber steps
    const currentSteps = [...(watch("steps") || [])];
    const temp = currentSteps[index];
    currentSteps[index] = currentSteps[index + 1];
    currentSteps[index + 1] = temp;
    const renumbered = currentSteps.map((st, i) => ({ ...st, step: i + 1 }));
    setValue("steps", renumbered);
  };

  const onSubmit = async (formData: BookingContentForm) => {
    // Clean & normalize steps
    const normalizedSteps: BookingStep[] = (formData.steps || []).map((s, idx) => ({
      step: idx + 1,
      badge: s.badge?.trim() || "",
      title: s.title?.trim() || "",
      description: s.description?.trim() || "",
      footer: s.footer?.trim() || "",
    }));

    if (normalizedSteps.length === 0) {
      toast.error("يرجى إضافة خطوة حجز واحدة على الأقل");
      return;
    }

    const cleanedBenefits = (formData.guarantee?.benefits || [])
      .map((b) => (typeof b === "string" ? b.trim() : ""))
      .filter(Boolean);

    const guaranteePayload = {
      badge: formData.guarantee?.badge?.trim() || "",
      title: formData.guarantee?.title?.trim() || "",
      description: formData.guarantee?.description?.trim() || "",
      benefits: cleanedBenefits,
    };

    const payload: any = {
      depositAmount: Number(formData.depositAmount) || 0,
      steps: normalizedSteps,
      guarantee: guaranteePayload,
    };

    // If a package is selected, pass package ID; otherwise omit so backend applies default
    if (formData.package && formData.package.trim()) {
      payload.package = formData.package.trim();
    }

    try {
      const res = await api.put("/booking-content/admin", payload);
      toast.success(res?.data?.message || "تم حفظ خطوات محتوى الحجز بنجاح");
      setShowModal(false);
      setSelectedContent(null);
      queryClient.invalidateQueries({ queryKey: ["booking-content"] });
      refetch();
    } catch (error: any) {
      console.error("Submission failed:", error);
      const data = error?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((err: any) => {
          if (typeof err?.message === "string") toast.error(err.message);
          else if (typeof err === "string") toast.error(err);
        });
      } else {
        const msg =
          data?.message ||
          data?.error ||
          error?.message ||
          "حدث خطأ أثناء حفظ محتوى الحجز";
        toast.error(typeof msg === "string" ? msg : "حدث خطأ أثناء حفظ محتوى الحجز");
      }
    }
  };

  // Delete package-specific booking content (DELETE /booking-content/admin/package/:packageId)
  const handleDeletePackageContent = async (content: BookingContent) => {
    const pkgId = getPackageId(content.package);
    if (!pkgId) {
      toast.error("لا يمكن حذف الإعدادات العامة الافتراضية، فقط الباقات المخصصة يمكن حذفها");
      return;
    }

    const pkgInfo = getPackageInfo(content.package);
    const contentName = pkgInfo?.name || pkgInfo?.title || "محتوى حجز الباقة";
    if (!confirm(`هل أنت متأكد من حذف محتوى الحجز الخاص بـ "${contentName}"؟`)) return;

    try {
      await api.delete(`/booking-content/admin/package/${pkgId}`);
      toast.success("تم حذف محتوى حجز الباقة بنجاح");
      setShowModal(false);
      setSelectedContent(null);
      queryClient.invalidateQueries({ queryKey: ["booking-content"] });
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "فشل في حذف محتوى حجز الباقة");
    }
  };


  // Filtered booking contents
  const filteredContents = useMemo(() => {
    if (!bookingContents) return [];
    return bookingContents.filter((item) => {
      // Type filter
      if (typeFilter === "DEFAULT" && item.package) return false;
      if (typeFilter === "PACKAGE" && !item.package) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const pkgInfo = getPackageInfo(item.package);
      const pkgName = (pkgInfo?.name || pkgInfo?.title || item.package || "").toLowerCase();
      const isDefault = !item.package && "افتراضي default عام".includes(q);

      const hasStepMatch = item.steps?.some(
        (st) =>
          st.title?.toLowerCase().includes(q) ||
          st.description?.toLowerCase().includes(q) ||
          st.badge?.toLowerCase().includes(q) ||
          st.footer?.toLowerCase().includes(q)
      );

      const hasGuaranteeMatch =
        item.guarantee?.title?.toLowerCase().includes(q) ||
        item.guarantee?.description?.toLowerCase().includes(q) ||
        item.guarantee?.badge?.toLowerCase().includes(q) ||
        item.guarantee?.benefits?.some((b) => b.toLowerCase().includes(q));

      return pkgName.includes(q) || isDefault || hasStepMatch || hasGuaranteeMatch;
    });
  }, [bookingContents, searchQuery, typeFilter, packages]);

  // Statistics
  const stats = useMemo(() => {
    const list = bookingContents || [];
    return {
      total: list.length,
    };
  }, [bookingContents]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner />
        <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل بيانات محتوى الحجز...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Breadcrumb */}
      <PageHeader
        pageName="محتوى الحجز"
        pageDescription="إدارة مسار وخطوات الحجز، مبالغ العربون، وشارات الضمان المعروضة للعملاء"
        PageIcon={FaClipboardList}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs"
              title="تحديث البيانات"
            >
              <FaRotateLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl shadow-md hover:bg-primary/90 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <FaPlus className="w-4 h-4" />
              <span>إضافة محتوى حجز</span>
            </button>
          </div>
        }
      />

      <BreadCrumb breadCrumbItems="محتوى الحجز" />

      {/* KPI Stats Overview */}
      <div className="bg-background rounded-2xl border border-border p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">إجمالي نماذج الحجز</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{stats.total}</h3>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FaClipboardList className="w-5 h-5" />
          </div>
        </div>
      </div>


      {/* Booking Content List */}
      {filteredContents.length > 0 ? (
        <div className="bg-background rounded-2xl border border-border shadow-xs overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-right px-4 py-3 text-xs font-bold text-foreground">النوع</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-foreground">العربون</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-foreground">الخطوات</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-foreground">آخر تحديث</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredContents.map((content) => {
                const pkgInfo = getPackageInfo(content.package);
                const isDefault = !content.package;
                const currency = content.currency || "ر.س";

                return (
                  <tr key={content._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isDefault ? (
                          <>
                            <FaGlobe className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-foreground">الإعدادات العامة</span>
                          </>
                        ) : (
                          <>
                            <FaBox className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-foreground">
                              {pkgInfo?.name || pkgInfo?.title || "باقة مخصصة"}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-foreground">
                        {content.depositAmount?.toLocaleString()} {currency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{content.steps?.length || 0} خطوات</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        {content.updatedAt ? new Date(content.updatedAt).toLocaleDateString("ar-SA") : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(content)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                        >
                          <FaPen className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>

                        {/* Delete button only shown for package-specific content, not the default one */}
                        {Boolean(content.package) && (
                          <button
                            onClick={() => handleDeletePackageContent(content)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all cursor-pointer"
                            title="حذف محتوى حجز الباقة"
                          >
                            <FaTrashCan className="w-3 h-3" />
                            <span>حذف</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-background rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
            <FaClipboardList className="w-8 h-8 opacity-60" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-foreground">لا يوجد محتوى حجز مطابق</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery
                ? "لم نعثر على أي نتائج تطابق عملية البحث الحالية، جرب كلمات أخرى أو أعد تعيين الفلاتر."
                : "لم يتم إنشاء أي نماذج لمحتوى الحجز حتى الآن. يمكنك البدء بإعداد النموذج الافتراضي أو تخصيص باقة."}
            </p>
          </div>
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("ALL");
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
            >
              إعادة تعيين الفلاتر
            </button>
          ) : (
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>إضافة محتوى الحجز الافتراضي</span>
            </button>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedContent(null);
        }}
      >
        <div className="flex flex-col max-h-[85vh]">
          {/* Modal Header */}
          <div className="pb-4 border-b border-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                {selectedContent ? <FaPen className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {selectedContent ? "تعديل محتوى الحجز" : "إضافة محتوى حجز جديد"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedContent
                    ? selectedContent.package
                      ? `تعديل خطوات وعربون الباقة (${getPackageInfo(selectedContent.package)?.name || selectedContent.package})`
                      : "تعديل الإعدادات العامة الافتراضية"
                    : "قم بتحديد الباقة وخطوات الحجز ومبلغ العربون والضمان"}
                </p>
              </div>
            </div>
          </div>

          {/* Form Scroll Area */}
          <form
            id="booking-content-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto pr-1 pl-1 space-y-6"
          >
            {/* Section 1: Basic Information */}
            <div className="bg-muted/20 border border-border rounded-2xl p-4.5 space-y-4">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-primary">
                <FaCoins className="w-3.5 h-3.5" />
                <span>البيانات الأساسية للباقة والعربون</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Package Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>الباقة المستهدفة</span>
                    <span className="text-[11px] font-normal text-muted-foreground">اختياري</span>
                  </label>
                  <SelectMenu
                    control={control}
                    name="package"
                    searchable
                    options={[
                      {
                        label: "الإعدادات العامة الافتراضية (بدون تخصيص لباقة)",
                        value: "",
                      },
                      ...(packages || []).map((pkg) => ({
                        label:
                          pkg.name || pkg.title || `باقة (${pkg._id.slice(-6)})`,
                        value: pkg._id,
                      })),
                    ]}
                    placeholder="الإعدادات العامة الافتراضية..."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    اتركها فارغة لتطبيق هذا المسار كإعداد افتراضي لكافة الباقات.
                  </p>
                </div>

                {/* Deposit Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>مبلغ العربون المطلوب</span>
                    <span className="text-xs text-primary font-bold">ر.س</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      {...register("depositAmount", {
                        required: "مبلغ العربون مطلوب",
                        valueAsNumber: true,
                        min: { value: 0, message: "لا يمكن أن يكون المبلغ بالسالب" },
                      })}
                      placeholder="500"
                      className="w-full pr-3.5 pl-12 py-2.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      ر.س
                    </span>
                  </div>
                  {errors.depositAmount && (
                    <span className="text-destructive text-xs font-medium block">
                      {errors.depositAmount.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Interactive Steps Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-primary">
                    <FaClipboardList className="w-3.5 h-3.5" />
                    <span>خطوات مسار الحجز ({stepFields.length})</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    الترتيب الموضح أدناه هو التسلسل الذي يظهر للمستخدم في صفحة الحجز.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddStep}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>إضافة خطوة</span>
                </button>
              </div>

              {stepFields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-background rounded-2xl border border-border p-4.5 space-y-3.5 shadow-2xs hover:border-primary/30 transition-all"
                >
                  {/* Step Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/70">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-foreground">الخطوة {index + 1}</span>
                    </div>

                    {/* Step Action Controls (Move Up, Move Down, Delete) */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveStepUp(index)}
                        disabled={index === 0}
                        title="تحريك لأعلى"
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <FaArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStepDown(index)}
                        disabled={index === stepFields.length - 1}
                        title="تحريك لأسفل"
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <FaArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(index)}
                        title="حذف هذه الخطوة"
                        className="p-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all mr-1"
                      >
                        <FaTrashCan className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Step Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Badge */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">
                        الشارة (Badge)
                      </label>
                      <input
                        {...register(`steps.${index}.badge` as const)}
                        placeholder="مثال: اختيار فوري / تأكيد آمن"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all"
                      />
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-muted-foreground">
                        عنوان الخطوة <span className="text-destructive">*</span>
                      </label>
                      <input
                        {...register(`steps.${index}.title` as const, { required: "العنوان مطلوب" })}
                        placeholder="مثال: اختيار البرنامج وتحديد التاريخ"
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">
                      تفاصيل الخطوة <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      rows={2}
                      {...register(`steps.${index}.description` as const, { required: "الوصف مطلوب" })}
                      placeholder="اشرح للعميل ما يقوم به في هذه الخطوة وما يتم إنجازه..."
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all"
                    />
                  </div>

                  {/* Footer note */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">
                      ملاحظة سفلية (Footer Note)
                    </label>
                    <input
                      {...register(`steps.${index}.footer` as const)}
                      placeholder="مثال: تأكيد فوري متاح / دعم على مدار الساعة"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Section 3: Guarantee & Benefits */}
            <div className="bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-background border border-emerald-200/80 rounded-2xl p-4.5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <FaShieldHalved className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    قسم الضمان وراحة البال
                  </h3>
                  <p className="text-[11px] text-emerald-900/70">
                    يعرض للمسافر لتشجيعه على الحجز وبث الثقة.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Guarantee Badge */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">شارة الضمان (Badge)</label>
                  <input
                    {...register("guarantee.badge")}
                    placeholder="مثال: راحة بال كاملة"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all"
                  />
                </div>

                {/* Guarantee Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground">عنوان الضمان</label>
                  <input
                    {...register("guarantee.title")}
                    placeholder="مثال: ضمان الحجز المؤكد واسترجاع فوري"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all"
                  />
                </div>
              </div>

              {/* Guarantee Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">نص توضيح الضمان</label>
                <textarea
                  rows={2}
                  {...register("guarantee.description")}
                  placeholder="وصف تفصيلي لشروط الضمان وكيفية الاسترجاع وسياسات الخدمة..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all"
                />
              </div>

              {/* Benefits (Interactive Chips) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                  <span>المزايا والنقاط المميزة (Benefits)</span>
                  <span className="text-[10px] text-muted-foreground">
                    ({currentBenefits.length} مزايا مضافة)
                  </span>
                </label>

                {/* Add Benefit Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newBenefitInput}
                    onChange={(e) => setNewBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                    placeholder="اكتب الميزة ثم اضغط إضافة أو Enter (مثال: حجز موثوق ومضمون)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 text-xs outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <FaPlus className="w-3 h-3" />
                    <span>إضافة</span>
                  </button>
                </div>

                {/* Benefits Chips List */}
                {currentBenefits.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentBenefits.map((benefit, bIndex) => (
                      <span
                        key={bIndex}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 rounded-xl text-xs font-medium text-emerald-900 shadow-2xs group"
                      >
                        <FaCheck className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{benefit}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(bIndex)}
                          className="text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors mr-1"
                        >
                          <FaXmark className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Modal Sticky Footer */}
          <div className="pt-4 border-t border-border mt-4 flex items-center justify-between gap-3">
            <div>
              {selectedContent && Boolean(selectedContent.package) && (
                <button
                  type="button"
                  onClick={() => handleDeletePackageContent(selectedContent)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <FaTrashCan className="w-3 h-3" />
                  <span>حذف محتوى الباقة</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSelectedContent(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-semibold hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                form="booking-content-form"
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <div className="spinner"></div> : "حفظ التغييرات"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
