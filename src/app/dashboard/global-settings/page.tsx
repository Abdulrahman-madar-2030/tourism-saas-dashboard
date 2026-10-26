"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { crudsAPI } from "@/lib/axios";
import toast from "react-hot-toast";
import { BiLoader } from "react-icons/bi";
import {
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaShareNodes,
  FaFloppyDisk,
  FaPlus,
  FaTrashCan,
  FaGlobe,
  FaArrowUpRightFromSquare,
  FaSliders,
  FaWhatsapp,
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaTiktok,
  FaSnapchat,
  FaYoutube,
  FaLinkedin,
  FaTelegram,
  FaRotateLeft,
  FaStar,
} from "react-icons/fa6";
import { SettingsData } from "@/types/globalSettingsTypes";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";

const DEPARTMENT_OPTIONS = [
  { value: "general", label: "عام" },
  { value: "support", label: "الدعم الفني" },
  { value: "sales", label: "المبيعات" },
  { value: "booking", label: "الحجوزات" },
  { value: "complaints", label: "الشكاوى" },
];

type TabKey = "phones" | "emails" | "addresses" | "social" | "all";

interface PopularPlatformPreset {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  defaultUrl: string;
}

const POPULAR_PLATFORMS: PopularPlatformPreset[] = [
  { name: "whatsapp", label: "واتساب", icon: FaWhatsapp, color: "#25D366", defaultUrl: "https://wa.me/" },
  { name: "instagram", label: "إنستغرام", icon: FaInstagram, color: "#E4405F", defaultUrl: "https://instagram.com/" },
  { name: "x", label: "إكس (تويتر)", icon: FaXTwitter, color: "#000000", defaultUrl: "https://x.com/" },
  { name: "tiktok", label: "تيك توك", icon: FaTiktok, color: "#000000", defaultUrl: "https://tiktok.com/@" },
  { name: "snapchat", label: "سناب شات", icon: FaSnapchat, color: "#EAB308", defaultUrl: "https://snapchat.com/add/" },
  { name: "facebook", label: "فيسبوك", icon: FaFacebook, color: "#1877F2", defaultUrl: "https://facebook.com/" },
  { name: "youtube", label: "يوتيوب", icon: FaYoutube, color: "#FF0000", defaultUrl: "https://youtube.com/@" },
  { name: "linkedin", label: "لينكد إن", icon: FaLinkedin, color: "#0A66C2", defaultUrl: "https://linkedin.com/company/" },
  { name: "telegram", label: "تيليجرام", icon: FaTelegram, color: "#229ED9", defaultUrl: "https://t.me/" },
];

function getPlatformIcon(name: string = ""): {
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
} {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("what") || normalized.includes("واتس")) {
    return { Icon: FaWhatsapp, color: "#25D366", bgColor: "#25D36615" };
  }
  if (normalized.includes("insta") || normalized.includes("انست") || normalized.includes("إنست")) {
    return { Icon: FaInstagram, color: "#E4405F", bgColor: "#E4405F15" };
  }
  if (normalized.includes("twitt") || normalized.includes("تويت") || normalized === "x" || normalized.includes("إكس")) {
    return { Icon: FaXTwitter, color: "#111827", bgColor: "#11182715" };
  }
  if (normalized.includes("tik") || normalized.includes("تيك")) {
    return { Icon: FaTiktok, color: "#111827", bgColor: "#11182715" };
  }
  if (normalized.includes("snap") || normalized.includes("سناب")) {
    return { Icon: FaSnapchat, color: "#CA8A04", bgColor: "#FEF08A40" };
  }
  if (normalized.includes("face") || normalized.includes("فيس")) {
    return { Icon: FaFacebook, color: "#1877F2", bgColor: "#1877F215" };
  }
  if (normalized.includes("you") || normalized.includes("يوت")) {
    return { Icon: FaYoutube, color: "#EF4444", bgColor: "#EF444415" };
  }
  if (normalized.includes("link") || normalized.includes("لينك")) {
    return { Icon: FaLinkedin, color: "#0A66C2", bgColor: "#0A66C215" };
  }
  if (normalized.includes("tele") || normalized.includes("تيلي")) {
    return { Icon: FaTelegram, color: "#229ED9", bgColor: "#229ED915" };
  }
  return { Icon: FaShareNodes, color: "var(--color-primary)", bgColor: "#2f256215" };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("phones");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => crudsAPI.getAll("/global-settings"),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { isDirty },
  } = useForm<SettingsData>();

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "contactInfo.phones",
  });

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control,
    name: "contactInfo.emails",
  });

  const {
    fields: socialMediaFields,
    append: appendSocialMedia,
    remove: removeSocialMedia,
  } = useFieldArray({
    control,
    name: "socialMedia",
  });

  // Populate form with API response
  useEffect(() => {
    if (settings?.data?.data) {
      reset(settings.data.data);
    }
  }, [settings, reset]);

  // Mutation
  const updateMutation = useMutation({
    mutationFn: (data: SettingsData) =>
      crudsAPI.updateSettings(
        settings?.data?.data?._id
          ? `/global-settings/admin/${settings.data.data._id}`
          : "/global-settings/admin/69a801fd60ff53f2b8e3c6ed",
        data,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("تم حفظ إعدادات الموقع بنجاح! ✨");
    },
    onError: (err: any) => {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "حدث خطأ أثناء الحفظ، يرجى التحقق من المدخلات والمحاولة مرة أخرى";
      toast.error(errorMsg);
    },
  });

  // Submission with sanitization
  const onSubmit = useCallback(
    (formData: SettingsData) => {
      const validPhones = (formData?.contactInfo?.phones || []).filter(
        (p) => p?.number && p.number.trim()
      );
      const validEmails = (formData?.contactInfo?.emails || []).filter(
        (e) => e?.email && e.email.trim()
      );
      const validAddresses = (formData?.contactInfo?.addresses || []).filter(
        (a) => typeof a === "string" && a.trim()
      );

      // Clean social media (name or url required)
      const validSocialMedia = (formData?.socialMedia || [])
        .filter((platform) => platform?.url?.trim() || platform?.name?.trim())
        .map((platform) => ({
          name: platform.name?.trim() || "",
          url: platform.url?.trim() || "",
          deskTopImage: "",
          mobileImage: "",
          ...(platform._id ? { _id: platform._id } : {}),
        }));

      const payload: SettingsData = {
        contactInfo: {
          phones: validPhones,
          emails: validEmails,
          addresses: validAddresses,
        },
        socialMedia: validSocialMedia as any,
      };

      updateMutation.mutate(payload);
    },
    [updateMutation]
  );

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, onSubmit]);

  const socialMediaWatch = watch("socialMedia") || [];
  const addressesWatch = watch("contactInfo.addresses") || [];

  // Counts for tabs
  const phoneCount = phoneFields.length;
  const emailCount = emailFields.length;
  const addressCount = addressesWatch.length;
  const socialCount = socialMediaFields.length;

  const tabsConfig = useMemo(
    () => [
      {
        key: "phones" as TabKey,
        label: "أرقام الهاتف",
        icon: FaPhone,
        count: phoneCount,
      },
      {
        key: "emails" as TabKey,
        label: "البريد الإلكتروني",
        icon: FaEnvelope,
        count: emailCount,
      },
      {
        key: "addresses" as TabKey,
        label: "العناوين والفروع",
        icon: FaLocationDot,
        count: addressCount,
      },
      {
        key: "social" as TabKey,
        label: "التواصل الاجتماعي",
        icon: FaShareNodes,
        count: socialCount,
      },
      {
        key: "all" as TabKey,
        label: "عرض كل الأقسام",
        icon: FaSliders,
        count: null,
      },
    ],
    [phoneCount, emailCount, addressCount, socialCount]
  );

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-border text-center max-w-sm w-full">
          <BiLoader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-1">
            جاري تحميل الإعدادات...
          </h3>
          <p className="text-muted-foreground text-sm">
            يرجى الانتظار بينما نقوم بجلب بيانات الموقع
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-fadeIn" dir="rtl">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ==============================================================
            STICKY HEADER & ALWAYS-ACCESSIBLE SAVE BAR
            ============================================================== */}
        <header className="sticky top-4 z-30 mb-8 bg-white/95 backdrop-blur-md border border-border rounded-2xl shadow-sm transition-all duration-200">
          <div className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title & Description */}
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
                <FaSliders className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    إعدادات الموقع العامة
                  </h1>
                  {isDirty && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      تعديلات غير محفوظة
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  إدارة معلومات الاتصال، الفروع، وروابط وسائل التواصل الاجتماعي
                </p>
              </div>
            </div>

            {/* Actions: Save Button & Discard */}
            <div className="flex items-center gap-2.5 sm:self-center">
              {isDirty && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        "هل أنت متأكد من التراجع عن جميع التغييرات غير المحفوظة؟"
                      )
                    ) {
                      if (settings?.data?.data) {
                        reset(settings.data.data);
                        toast("تم التراجع عن التعديلات", { icon: "↩️" });
                      }
                    }
                  }}
                  disabled={updateMutation.isPending}
                  className="px-3.5 py-2.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  title="إلغاء التعديلات والعودة للبيانات المحفوظة"
                >
                  <FaRotateLeft className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">تراجع</span>
                </button>
              )}

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="group relative px-6 py-2.5 sm:px-7 sm:py-3 bg-primary text-white rounded-xl flex items-center gap-2.5 transition-all duration-200 shadow-sm hover:shadow-md hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm sm:text-base cursor-pointer"
                title="اضغط للحفظ أو استخدم الاختصار (Ctrl + S)"
              >
                {updateMutation.isPending ? (
                  <BiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <FaFloppyDisk className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                )}
                <span>
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </span>
                <span className="hidden lg:inline text-[11px] font-normal px-2 py-0.5 rounded-md bg-white/20 text-white/90">
                  Ctrl + S
                </span>
              </button>
            </div>
          </div>

          {/* ==============================================================
              SECTION NAVIGATION TABS
              ============================================================== */}
          <div className="px-3 sm:px-6 border-t border-border/60 bg-muted/30 rounded-b-2xl overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 py-2">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
                      ${
                        isActive
                          ? "bg-primary text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span
                        className={`
                          px-1.5 py-0.2 rounded-full text-[11px] font-bold min-w-5 text-center
                          ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-muted text-muted-foreground"
                          }
                        `}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ==============================================================
            TAB 1: PHONES (أرقام الهاتف)
            ============================================================== */}
        {(activeTab === "phones" || activeTab === "all") && (
          <section className="mb-8 bg-white rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/80 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <FaPhone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    أرقام الهاتف والتواصل السريع
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    تظهر هذه الأرقام في ترويسة وتذييل الموقع وأزرار الاتصال
                    السريع
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  appendPhone({
                    number: "",
                    label: "",
                    isPrimary: phoneFields.length === 0,
                    isWhatsApp: false,
                    countryCode: "+966",
                  })
                }
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>إضافة رقم هاتف</span>
              </button>
            </div>

            {phoneFields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <FaPhone className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-foreground font-semibold text-sm mb-1">
                  لا توجد أرقام هواتف مضافة
                </p>
                <p className="text-muted-foreground text-xs mb-4">
                  أضف أرقام الاتصال لتسهيل وصول العملاء إليكم
                </p>
                <button
                  type="button"
                  onClick={() =>
                    appendPhone({
                      number: "",
                      label: "",
                      isPrimary: true,
                      isWhatsApp: false,
                      countryCode: "+966",
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 cursor-pointer"
                >
                  <FaPlus className="w-3 h-3" />
                  إضافة أول رقم
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {phoneFields.map((field, i) => {
                  const isPrimaryValue = watch(`contactInfo.phones.${i}.isPrimary`);
                  const isWhatsAppValue = watch(`contactInfo.phones.${i}.isWhatsApp`);
                  const labelValue = watch(`contactInfo.phones.${i}.label`);

                  return (
                    <div
                      key={field.id}
                      className="bg-muted/30 hover:bg-muted/50 border border-border/80 rounded-2xl p-4 sm:p-5 transition-all duration-200"
                    >
                      {/* Top bar of item */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="font-bold text-sm text-foreground">
                            {labelValue || `رقم الهاتف ${i + 1}`}
                          </span>
                          {isPrimaryValue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary">
                              <FaStar className="w-2.5 h-2.5" />
                              رئيسي
                            </span>
                          )}
                          {isWhatsAppValue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <FaWhatsapp className="w-3 h-3 text-emerald-600" />
                              واتساب
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removePhone(i)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="حذف هذا الرقم"
                        >
                          <FaTrashCan className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 mb-4">
                        {/* Country code */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            كود الدولة
                          </label>
                          <input
                            {...register(`contactInfo.phones.${i}.countryCode`)}
                            placeholder="+966"
                            dir="ltr"
                            className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                          />
                        </div>

                        {/* Phone number */}
                        <div className="md:col-span-5">
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            رقم الهاتف <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              {...register(`contactInfo.phones.${i}.number`)}
                              placeholder="05xxxxxxxx"
                              dir="ltr"
                              className="w-full h-10 ps-9 pe-3 text-sm rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                            />
                            <FaPhone className="w-3.5 h-3.5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        {/* Label */}
                        <div className="md:col-span-4">
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            التسمية / الوصف
                          </label>
                          <input
                            {...register(`contactInfo.phones.${i}.label`)}
                            placeholder="مثال: خدمة العملاء، الحجوزات..."
                            className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      {/* Toggles row */}
                      <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-border/60">
                        {/* Primary toggle */}
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            {...register(`contactInfo.phones.${i}.isPrimary`)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          <span className="ms-2.5 text-xs sm:text-sm font-medium text-foreground">
                            تعيين كرقم رئيسي
                          </span>
                        </label>

                        {/* WhatsApp toggle */}
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            {...register(`contactInfo.phones.${i}.isWhatsApp`)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          <span className="ms-2.5 text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5">
                            <FaWhatsapp className="text-emerald-600 w-3.5 h-3.5" />
                            يدعم محادثات واتساب
                          </span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ==============================================================
            TAB 2: EMAILS (البريد الإلكتروني)
            ============================================================== */}
        {(activeTab === "emails" || activeTab === "all") && (
          <section className="mb-8 bg-white rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/80 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <FaEnvelope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    عناوين البريد الإلكتروني
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    تستقبل هذه العناوين استفسارات العملاء وتظهر في وسائل التواصل
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  appendEmail({
                    email: "",
                    label: "",
                    isPrimary: emailFields.length === 0,
                    department: "general",
                  })
                }
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>إضافة بريد إلكتروني</span>
              </button>
            </div>

            {emailFields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <FaEnvelope className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-foreground font-semibold text-sm mb-1">
                  لا توجد إيميلات مضافة
                </p>
                <p className="text-muted-foreground text-xs mb-4">
                  أضف بريد الاستفسارات أو الدعم الفني
                </p>
                <button
                  type="button"
                  onClick={() =>
                    appendEmail({
                      email: "",
                      label: "",
                      isPrimary: true,
                      department: "general",
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 cursor-pointer"
                >
                  <FaPlus className="w-3 h-3" />
                  إضافة أول بريد
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {emailFields.map((field, i) => {
                  const isPrimaryValue = watch(`contactInfo.emails.${i}.isPrimary`);
                  const labelValue = watch(`contactInfo.emails.${i}.label`);
                  const deptValue = watch(`contactInfo.emails.${i}.department`);

                  const deptLabelMap: Record<string, string> = {
                    general: "عام",
                    support: "الدعم الفني",
                    sales: "المبيعات",
                    booking: "الحجوزات",
                    complaints: "الشكاوى",
                  };

                  return (
                    <div
                      key={field.id}
                      className="bg-muted/30 hover:bg-muted/50 border border-border/80 rounded-2xl p-4 sm:p-5 transition-all duration-200"
                    >
                      {/* Top bar of item */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="font-bold text-sm text-foreground">
                            {labelValue || `البريد ${i + 1}`}
                          </span>
                          {deptValue && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-muted-foreground">
                              {deptLabelMap[deptValue] || deptValue}
                            </span>
                          )}
                          {isPrimaryValue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary">
                              <FaStar className="w-2.5 h-2.5" />
                              رئيسي
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeEmail(i)}
                          className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="حذف هذا البريد"
                        >
                          <FaTrashCan className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 mb-4">
                        {/* Email address */}
                        <div className="md:col-span-5">
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            البريد الإلكتروني <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              {...register(`contactInfo.emails.${i}.email`)}
                              placeholder="info@tourismsaas.com"
                              dir="ltr"
                              className="w-full h-10 ps-9 pe-3 text-sm rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                            />
                            <FaEnvelope className="w-3.5 h-3.5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        {/* Label */}
                        <div className="md:col-span-4">
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            التسمية
                          </label>
                          <input
                            {...register(`contactInfo.emails.${i}.label`)}
                            placeholder="مثال: الاستفسارات العامة، المبيعات..."
                            className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>

                        {/* Department */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                            القسم المختص
                          </label>
                          <SelectMenu
                            name={`contactInfo.emails.${i}.department`}
                            control={control}
                            options={DEPARTMENT_OPTIONS}
                            placeholder="اختر القسم"
                          />
                        </div>
                      </div>

                      {/* Primary toggle */}
                      <div className="pt-3 border-t border-border/60">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            {...register(`contactInfo.emails.${i}.isPrimary`)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          <span className="ms-2.5 text-xs sm:text-sm font-medium text-foreground">
                            تعيين كبريد إلكتروني رئيسي
                          </span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ==============================================================
            TAB 3: ADDRESSES (العناوين والمواقع)
            ============================================================== */}
        {(activeTab === "addresses" || activeTab === "all") && (
          <section className="mb-8 bg-white rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/80 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <FaLocationDot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    عناوين الفروع والمقر
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    تظهر هذه العناوين في صفحة اتصل بنا وتذييل الموقع ومطبوعات
                    الحجز
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setValue("contactInfo.addresses", [...addressesWatch, ""], {
                    shouldDirty: true,
                  })
                }
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>إضافة عنوان جديد</span>
              </button>
            </div>

            {addressesWatch.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <FaLocationDot className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-foreground font-semibold text-sm mb-1">
                  لا توجد عناوين مضافة بعد
                </p>
                <p className="text-muted-foreground text-xs mb-4">
                  أضف عنوان المقر الرئيسي أو الفروع
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setValue("contactInfo.addresses", [""], {
                      shouldDirty: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 cursor-pointer"
                >
                  <FaPlus className="w-3 h-3" />
                  إضافة أول عنوان
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addressesWatch.map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-muted/30 hover:bg-muted/50 p-3 sm:p-4 rounded-xl border border-border/80 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <FaLocationDot className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <input
                        {...register(`contactInfo.addresses.${i}`)}
                        placeholder="مثال: المملكة العربية السعودية، جدة، طريق الملك عبد العزيز، برج النخبة"
                        className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = addressesWatch.filter(
                          (__, idx) => idx !== i
                        );
                        setValue("contactInfo.addresses", updated, {
                          shouldDirty: true,
                        });
                      }}
                      className="p-2.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 cursor-pointer"
                      title="حذف هذا العنوان"
                    >
                      <FaTrashCan className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==============================================================
            TAB 4: SOCIAL MEDIA (منصات التواصل الاجتماعي - بدون صور)
            ============================================================== */}
        {(activeTab === "social" || activeTab === "all") && (
          <section className="mb-8 bg-white rounded-2xl border border-border p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/80 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <FaShareNodes className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">
                    منصات التواصل الاجتماعي
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    إدارة أسماء وروابط المنصات (يتم عرض الأيقونات تلقائياً في
                    الواجهة الأمامية بناءً على اسم المنصة)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  appendSocialMedia({
                    name: "",
                    url: "",
                    deskTopImage: "",
                    mobileImage: "",
                  })
                }
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>إضافة منصة جديدة</span>
              </button>
            </div>

            {/* Quick Add Preset Chips */}
            <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border/60">
              <span className="block text-xs font-bold text-muted-foreground mb-2.5">
                إضافة سريعة لمنصة شائعة بنقرة واحدة:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {POPULAR_PLATFORMS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        appendSocialMedia({
                          name: preset.name,
                          url: preset.defaultUrl,
                          deskTopImage: "",
                          mobileImage: "",
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-border hover:border-primary/40 hover:bg-muted text-foreground transition-all shadow-2xs cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: preset.color }} />
                      <span>{preset.label}</span>
                      <FaPlus className="w-2.5 h-2.5 text-muted-foreground ms-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {socialMediaFields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <FaShareNodes className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-foreground font-semibold text-sm mb-1">
                  لا توجد منصات تواصل مضافة
                </p>
                <p className="text-muted-foreground text-xs mb-4">
                  اختر من المنصات الشائعة أعلاه أو أضف منصة جديدة
                </p>
                <button
                  type="button"
                  onClick={() =>
                    appendSocialMedia({
                      name: "whatsapp",
                      url: "https://wa.me/",
                      deskTopImage: "",
                      mobileImage: "",
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 cursor-pointer"
                >
                  <FaPlus className="w-3 h-3" />
                  إضافة واتساب
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {socialMediaFields.map((field, index) => {
                  const platform = socialMediaWatch[index] || {};
                  const platformName = platform?.name || "";
                  const platformUrl = platform?.url || "";
                  const { Icon: BrandIcon, color: brandColor, bgColor } =
                    getPlatformIcon(platformName);

                  return (
                    <div
                      key={field.id}
                      className="bg-muted/30 hover:bg-muted/50 border border-border/80 rounded-2xl p-4 sm:p-5 transition-all duration-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Platform Icon & Name & URL inputs */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                          {/* Platform Icon & Index */}
                          <div className="md:col-span-3 flex items-center gap-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-border/80 shadow-2xs transition-all"
                              style={{ backgroundColor: bgColor, color: brandColor }}
                              title={platformName || "منصة تواصل"}
                            >
                              <BrandIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                اسم المنصة <span className="text-red-500">*</span>
                              </label>
                              <input
                                {...register(`socialMedia.${index}.name`)}
                                placeholder="مثال: whatsapp, instagram"
                                className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                              />
                            </div>
                          </div>

                          {/* Platform URL input */}
                          <div className="md:col-span-9">
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                              رابط المنصة (URL) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                {...register(`socialMedia.${index}.url`)}
                                placeholder="https://..."
                                dir="ltr"
                                className="w-full h-10 ps-9 pe-3 text-sm rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                              />
                              <FaGlobe className="w-3.5 h-3.5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                        </div>

                        {/* Hidden ID */}
                        <input
                          type="hidden"
                          {...register(`socialMedia.${index}._id`)}
                        />

                        {/* Actions (Test link + Delete) */}
                        <div className="flex items-center gap-1.5 self-end lg:self-center border-t lg:border-t-0 pt-2 lg:pt-0 border-border/60">
                          {platformUrl && (
                            <a
                              href={platformUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-medium"
                              title="اختبار وفتح الرابط في نافذة جديدة"
                            >
                              <FaArrowUpRightFromSquare className="w-3.5 h-3.5" />
                              <span className="lg:hidden">تجربة الرابط</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => removeSocialMedia(index)}
                            className="p-2.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-medium"
                            title="حذف هذه المنصة"
                          >
                            <FaTrashCan className="w-3.5 h-3.5" />
                            <span className="lg:hidden">حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ==============================================================
            FLOATING BOTTOM ACTION BAR (FOR IMMEDIATE EASY SAVING)
            ============================================================== */}
        <div className="fixed bottom-5 start-1/2 -translate-x-1/2 z-40">
          <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-border flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>جاهز للحفظ في أي وقت</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {updateMutation.isPending ? (
                  <BiLoader className="w-4 h-4 animate-spin" />
                ) : (
                  <FaFloppyDisk className="w-3.5 h-3.5" />
                )}
                <span>
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
