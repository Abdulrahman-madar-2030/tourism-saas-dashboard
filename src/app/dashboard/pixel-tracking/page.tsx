"use client";
import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import toast from "react-hot-toast";

// Common UI Components
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import DataTable from "@/components/ui/DataTable/DataTable";
import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import Modal from "@/components/ui/Modal/Modal";
import Spinner from "@/components/ui/Spinner/Spinner";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";

// Types
import {
  PixelConfig,
  PixelConfigForm,
  PixelTrackingStats,
  PixelCampaign,
} from "@/types/pixelTrackingTypes";

// Icons
import {
  FaChartLine,
  FaCopy,
  FaCheck,
  FaBullhorn,
  FaTrashCan,
  FaRotate,
  FaCode,
  FaCircleCheck,
  FaCircleXmark,
  FaSliders,
  FaCartShopping,
  FaCircleInfo,
  FaFlask,
} from "react-icons/fa6";

import {
  SiFacebook,
  SiTiktok,
  SiLinkedin,
  SiSnapchat,
} from "react-icons/si";

// Dedicated Official Brand Logo Component (Uses authentic SVG illustrations & official brand icons)
export function PlatformBrandLogo({
  platform,
  className = "w-4 h-4",
}: {
  platform: string;
  className?: string;
}) {
  const norm = platform?.toLowerCase().trim() || "";

  // 1. Google Ads - Authentic Multi-color Official Vector Logo
  if (norm === "google-ads" || norm.includes("google-ad")) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`${className} flex-shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.5 13.9L8.3 5.6C9.1 4.2 10.9 3.7 12.3 4.5C13.7 5.3 14.2 7.1 13.4 8.5L8.6 16.8C7.8 18.2 6 18.7 4.6 17.9C3.2 17.1 2.7 15.3 3.5 13.9Z"
          fill="#FBBC04"
        />
        <path
          d="M20.5 13.9L15.7 5.6C14.9 4.2 13.1 3.7 11.7 4.5C10.3 5.3 9.8 7.1 10.6 8.5L15.4 16.8C16.2 18.2 18 18.7 19.4 17.9C20.8 17.1 21.3 15.3 20.5 13.9Z"
          fill="#4285F4"
        />
        <circle cx="6.5" cy="16.5" r="3" fill="#34A853" />
      </svg>
    );
  }

  // 2. Google Analytics (GA4) - Official Multi-color Vector Logo
  if (norm === "google-analytics" || norm.includes("analytics")) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`${className} flex-shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2.5" y="13.5" width="4" height="7.5" rx="2" fill="#F9AB00" />
        <rect x="10" y="8" width="4" height="13" rx="2" fill="#E37400" />
        <rect x="17.5" y="3" width="4" height="18" rx="2" fill="#E37400" />
      </svg>
    );
  }

  // 3. Facebook / Meta - Official Brand Logo
  if (norm === "facebook" || norm === "meta" || norm.includes("fb")) {
    return (
      <SiFacebook
        className={`${className} flex-shrink-0`}
        style={{ color: "#1877F2" }}
      />
    );
  }

  // 4. TikTok - Official Brand Logo
  if (norm === "tiktok") {
    return (
      <SiTiktok
        className={`${className} flex-shrink-0 text-foreground`}
      />
    );
  }

  // 5. LinkedIn - Official Brand Logo
  if (norm === "linkedin") {
    return (
      <SiLinkedin
        className={`${className} flex-shrink-0`}
        style={{ color: "#0A66C2" }}
      />
    );
  }

  // 6. Snapchat - Official Yellow Brand Logo
  if (norm === "snapchat" || norm.includes("snap")) {
    return (
      <SiSnapchat
        className={`${className} flex-shrink-0 text-amber-400`}
      />
    );
  }

  return <FaBullhorn className={`${className} flex-shrink-0 text-primary`} />;
}

// Platform Definitions (Strictly matches backend validation enum)
const PLATFORMS_CONFIG = [
  {
    id: "google-ads",
    name: "Google Ads",
    color: "#4285F4",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
    borderColor: "border-blue-500/20",
    trackingPlaceholder: "AW-123456789",
    purchasePlaceholder: "AW-123456789/abcDEF",
    leadPlaceholder: "AW-123456789/leadXYZ",
  },
  {
    id: "facebook",
    name: "Facebook (Meta Pixel)",
    color: "#1877F2",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
    borderColor: "border-blue-500/20",
    trackingPlaceholder: "123456789012345",
    purchasePlaceholder: "Purchase",
    leadPlaceholder: "Lead",
  },
  {
    id: "tiktok",
    name: "TikTok Pixel",
    color: "#111827",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-800 dark:text-slate-200",
    borderColor: "border-slate-500/20",
    trackingPlaceholder: "C1234567890ABCDEF",
    purchasePlaceholder: "CompletePayment",
    leadPlaceholder: "Contact",
  },
  {
    id: "linkedin",
    name: "LinkedIn Insight Tag",
    color: "#0A66C2",
    bgColor: "bg-blue-600/10",
    textColor: "text-blue-700",
    borderColor: "border-blue-600/20",
    trackingPlaceholder: "1234567",
    purchasePlaceholder: "conversion_id_purchase",
    leadPlaceholder: "conversion_id_lead",
  },
  {
    id: "google-analytics",
    name: "Google Analytics (GA4)",
    color: "#E37400",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    borderColor: "border-amber-500/20",
    trackingPlaceholder: "G-XXXXXXXXXX",
    purchasePlaceholder: "purchase",
    leadPlaceholder: "generate_lead",
  },
];

const PLATFORM_OPTIONS = PLATFORMS_CONFIG.map((p) => ({
  value: p.id,
  label: p.name,
}));

const TRIGGER_LABELS: Record<string, { label: string; en: string }> = {
  pageView: { label: "عرض الصفحة", en: "PageView" },
  viewContent: { label: "مشاهدة المحتوى", en: "ViewContent" },
  search: { label: "البحث", en: "Search" },
  lead: { label: "عميل محتمل", en: "Lead" },
  completeRegistration: { label: "إتمام التسجيل", en: "CompleteRegistration" },
  addToCart: { label: "إضافة للسلة", en: "AddToCart" },
  initiateCheckout: { label: "بدء الدفع", en: "InitiateCheckout" },
  purchase: { label: "إتمام الشراء", en: "Purchase" },
};

function getPlatformMeta(platformId: string = "") {
  const norm = platformId.toLowerCase().trim();
  if (norm === "meta") {
    return PLATFORMS_CONFIG.find((p) => p.id === "facebook")!;
  }
  const found = PLATFORMS_CONFIG.find(
    (p) => p.id === norm || norm.includes(p.id)
  );
  if (found) return found;
  return {
    id: norm || "google-ads",
    name: platformId || "منصة إعلانية",
    color: "#2f2562",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    borderColor: "border-primary/20",
    trackingPlaceholder: "ID-12345",
    purchasePlaceholder: "purchase",
    leadPlaceholder: "lead",
  };
}

export default function PixelTrackingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"configs" | "campaigns">("configs");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<PixelConfig | null>(null);
  const [detailsModalConfig, setDetailsModalConfig] = useState<PixelConfig | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>("all");

  // React Hook Form for Pixel Configuration
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<PixelConfigForm>({
    defaultValues: {
      name: "",
      platform: "google-ads",
      trackingId: "",
      description: "",
      isActive: true,
      isTestMode: false,
      events: {
        purchase: "",
        lead: "",
      },
      triggers: {
        pageView: true,
        viewContent: true,
        search: true,
        lead: true,
        completeRegistration: true,
        addToCart: true,
        initiateCheckout: true,
        purchase: true,
      },
      targetPages: [],
      excludePages: [],
    },
  });

  const selectedFormPlatform = watch("platform") || "google-ads";
  const currentPlatformInfo = getPlatformMeta(selectedFormPlatform);

  // 1. Fetch Pixel Configs (GET /pixel-config)
  const {
    data: rawConfigs,
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
    isRefetching: isRefetchingConfigs,
  } = useQuery({
    queryKey: ["pixel-config"],
    queryFn: async () => {
      const res = await api.get("/pixel-config");
      return res.data;
    },
  });

  const pixelConfigs: PixelConfig[] = useMemo(() => {
    const list = rawConfigs?.data?.data ?? rawConfigs?.data ?? rawConfigs;
    if (!Array.isArray(list)) return [];
    return list.map((item: any) => ({
      ...item,
      _id: item._id || item.id || item.pixelConfigId,
    }));
  }, [rawConfigs]);

  // 2. Fetch Stats (GET /pixel/stats)
  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery<PixelTrackingStats | null>({
    queryKey: ["pixel-tracking-stats"],
    queryFn: async () => {
      try {
        const res = await api.get("/pixel/stats");
        return res?.data?.data ?? res?.data ?? res;
      } catch {
        return null;
      }
    },
  });

  // 3. Fetch Campaigns (GET /pixel/campaigns)
  const {
    data: rawCampaigns,
    isLoading: isLoadingCampaigns,
    refetch: refetchCampaigns,
    isRefetching: isRefetchingCampaigns,
  } = useQuery({
    queryKey: ["pixel-tracking-campaigns"],
    queryFn: async () => {
      try {
        const res = await api.get("/pixel/campaigns");
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const campaigns: PixelCampaign[] = useMemo(() => {
    const list =
      rawCampaigns?.data?.analytics ??
      rawCampaigns?.data?.campaigns ??
      rawCampaigns?.data?.data ??
      rawCampaigns?.data ??
      rawCampaigns;
    if (!Array.isArray(list)) return [];
    return list.map((item: any, idx: number) => ({
      ...item,
      _id: item._id !== null && item._id !== undefined ? String(item._id) : `general-traffic-${idx}`,
      campaignId: item._id !== null && item._id !== undefined ? String(item._id) : null,
      campaignName:
        item.campaignName ||
        item.name ||
        (item._id ? String(item._id) : "زيارات عامة ومباشرة (Direct / Organic)"),
      totalHits: Number(item.totalHits ?? 0),
      uniqueHits: Number(item.uniqueHits ?? 0),
      conversions: Number(item.conversions ?? item.totalConversions ?? 0),
      conversionValue: Number(item.conversionValue ?? item.totalConversionValue ?? 0),
      conversionRate: Number(item.conversionRate ?? 0),
      countries: Number(item.countries ?? 0),
      devices: Number(item.devices ?? 0),
      uniqueUsers: Number(item.uniqueUsers ?? 0),
    }));
  }, [rawCampaigns]);

  // 4. Create Mutation (POST /pixel-config)
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post("/pixel-config", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["pixel-config"] });
      queryClient.invalidateQueries({ queryKey: ["pixel-tracking-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pixel-tracking-campaigns"] });
      toast.success(res?.message || "تمت إضافة إعداد البكسل بنجاح!");
      setIsModalOpen(false);
      reset();
    },
    onError: (err: any) => {
      const errList = err?.response?.data?.errors;
      if (Array.isArray(errList) && errList.length > 0) {
        errList.forEach((e: any) => {
          if (e?.message) toast.error(e.message);
        });
        return;
      }
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "فشل في إنشاء إعداد البكسل";
      toast.error(typeof msg === "string" ? msg : "حدث خطأ غير متوقع");
    },
  });

  // 5. Update Mutation (PUT /pixel-config/:pixelConfigId)
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      try {
        const res = await api.put(`/pixel-config/${id}`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        return res.data;
      } catch {
        const res = await api.patch(`/pixel-config/${id}`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        return res.data;
      }
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["pixel-config"] });
      queryClient.invalidateQueries({ queryKey: ["pixel-tracking-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pixel-tracking-campaigns"] });
      toast.success(res?.message || "تم تحديث إعداد البكسل بنجاح!");
      setIsModalOpen(false);
      setSelectedConfig(null);
      reset();
    },
    onError: (err: any) => {
      const errList = err?.response?.data?.errors;
      if (Array.isArray(errList) && errList.length > 0) {
        errList.forEach((e: any) => {
          if (e?.message) toast.error(e.message);
        });
        return;
      }
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "فشل في تحديث إعداد البكسل";
      toast.error(typeof msg === "string" ? msg : "حدث خطأ غير متوقع");
    },
  });

  // 6. Delete Mutation (DELETE /pixel-config/:pixelConfigId)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/pixel-config/${id}`);
      return res.data;
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["pixel-config"] });
      queryClient.invalidateQueries({ queryKey: ["pixel-tracking-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pixel-tracking-campaigns"] });
      toast.success(res?.message || "تم حذف إعداد البكسل بنجاح!");
      setDeleteId(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "فشل في حذف إعداد البكسل";
      toast.error(typeof msg === "string" ? msg : "حدث خطأ أثناء الحذف");
    },
  });

  // Open modal for adding a new pixel
  const handleOpenAddModal = () => {
    setSelectedConfig(null);
    reset({
      name: "",
      platform: "google-ads",
      trackingId: "",
      description: "",
      isActive: true,
      isTestMode: false,
      events: {
        purchase: "",
        lead: "",
      },
      triggers: {
        pageView: true,
        viewContent: true,
        search: true,
        lead: true,
        completeRegistration: true,
        addToCart: true,
        initiateCheckout: true,
        purchase: true,
      },
      targetPages: "",
      excludePages: "",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing pixel
  const handleOpenEditModal = (config: PixelConfig) => {
    setSelectedConfig(config);
    const platform =
      config.platform === "meta" ? "facebook" : config.platform || "google-ads";

    reset({
      _id: config._id || config.id,
      name: config.name || "",
      platform,
      trackingId: config.trackingId || "",
      description: config.description || "",
      isActive: config.isActive !== false,
      isTestMode: Boolean(config.isTestMode),
      events: {
        purchase: config.events?.purchase || "",
        lead: config.events?.lead || "",
      },
      triggers: {
        pageView: config.triggers?.pageView ?? true,
        viewContent: config.triggers?.viewContent ?? true,
        search: config.triggers?.search ?? true,
        lead: config.triggers?.lead ?? true,
        completeRegistration: config.triggers?.completeRegistration ?? true,
        addToCart: config.triggers?.addToCart ?? true,
        initiateCheckout: config.triggers?.initiateCheckout ?? true,
        purchase: config.triggers?.purchase ?? true,
      },
      targetPages: Array.isArray(config.targetPages)
        ? config.targetPages.join(", ")
        : (config.targetPages || ""),
      excludePages: Array.isArray(config.excludePages)
        ? config.excludePages.join(", ")
        : (config.excludePages || ""),
    });
    setIsModalOpen(true);
  };

  // Submit Handler
  const onSubmit = (formData: any) => {
    // 1. Build clean events object only for non-empty fields
    const events: Record<string, string> = {};
    if (formData.events?.purchase?.trim()) {
      events.purchase = formData.events.purchase.trim();
    }
    if (formData.events?.lead?.trim()) {
      events.lead = formData.events.lead.trim();
    }

    // 2. Base required payload fields
    const payload: any = {
      name: formData.name.trim(),
      platform: formData.platform.trim(),
      trackingId: formData.trackingId.trim(),
    };

    // 3. Optional description
    if (formData.description?.trim()) {
      payload.description = formData.description.trim();
    }

    // 4. Optional events override
    if (Object.keys(events).length > 0) {
      payload.events = events;
    }

    // 5. Optional targetPages & excludePages
    const parsePages = (input: any): string[] => {
      if (Array.isArray(input)) {
        return input.map((s) => String(s).trim()).filter(Boolean);
      }
      if (typeof input === "string") {
        return input
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    };

    const targetPages = parsePages(formData.targetPages);
    if (targetPages.length > 0) {
      payload.targetPages = targetPages;
    }

    const excludePages = parsePages(formData.excludePages);
    if (excludePages.length > 0) {
      payload.excludePages = excludePages;
    }

    // 6. Optional triggers
    if (formData.triggers && typeof formData.triggers === "object") {
      const cleanTriggers: Record<string, boolean> = {};
      Object.entries(formData.triggers).forEach(([key, val]) => {
        if (typeof val === "boolean") {
          cleanTriggers[key] = val;
        }
      });
      if (Object.keys(cleanTriggers).length > 0) {
        payload.triggers = cleanTriggers;
      }
    }

    // 7. Status toggles
    if (formData.isActive !== undefined) {
      payload.isActive = Boolean(formData.isActive);
    }
    if (formData.isTestMode !== undefined) {
      payload.isTestMode = Boolean(formData.isTestMode);
    }

    const targetId = selectedConfig?._id || selectedConfig?.id;
    if (selectedConfig && targetId) {
      updateMutation.mutate({ id: targetId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("تم النسخ بنجاح!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered Configs by Platform
  const filteredConfigs = useMemo(() => {
    if (selectedPlatformFilter === "all") return pixelConfigs;
    return pixelConfigs.filter(
      (c) =>
        c.platform?.toLowerCase() === selectedPlatformFilter.toLowerCase()
    );
  }, [pixelConfigs, selectedPlatformFilter]);

  // Aggregate Stats
  const statsOverview = useMemo(() => {
    const total = pixelConfigs.length;
    const activeCount = pixelConfigs.filter((c) => c.isActive !== false).length;
    const testModeCount = pixelConfigs.filter((c) => Boolean(c.isTestMode)).length;
    const uniquePlatforms = new Set(
      pixelConfigs.map((c) => c.platform?.toLowerCase()).filter(Boolean)
    ).size;
    const totalPurchasesEvents = pixelConfigs.filter(
      (c) => Boolean(c.events?.purchase)
    ).length;
    const totalLeadEvents = pixelConfigs.filter(
      (c) => Boolean(c.events?.lead)
    ).length;
    const totalCampaigns = campaigns.length;

    // Real live metrics from GET /pixel/stats
    const totalHits = Number(statsData?.totalHits ?? 0);
    const uniqueHits = Number(statsData?.uniqueHits ?? 0);
    const totalConversions = Number(
      statsData?.totalConversions ?? statsData?.conversions ?? 0
    );
    const totalConversionValue = Number(
      statsData?.totalConversionValue ?? statsData?.revenue ?? 0
    );
    const uniqueUsers = Number(statsData?.uniqueUsers ?? 0);
    const uniqueEmails = Number(statsData?.uniqueEmails ?? 0);

    return {
      totalConfigs: total,
      activeCount,
      testModeCount,
      uniquePlatforms,
      totalPurchasesEvents,
      totalLeadEvents,
      totalCampaigns,
      totalHits,
      uniqueHits,
      totalConversions,
      totalConversionValue,
      uniqueUsers,
      uniqueEmails,
    };
  }, [pixelConfigs, campaigns, statsData]);

  const isFormSubmitting =
    createMutation.isPending || updateMutation.isPending;

  if (isLoadingConfigs && pixelConfigs.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        pageName="Pixel Tracking"
        pageDescription="إدارة وتهيئة بكسلات التتبع (Google Ads, Meta, TikTok, LinkedIn) والتحكم في المحفزات والحملات الإعلانية"
        PageIcon={FaChartLine}
      />

      {/* 2. BreadCrumb */}
      <BreadCrumb breadCrumbItems="Pixel Tracking" />

      {/* 3. Top Overview Stats Cards (Live metrics from /pixel/stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Hits from /pixel/stats */}
        <div className="p-5 bg-background border border-border rounded-2xl shadow-xs relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              إجمالي الزيارات والتتبع (Total Hits)
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <FaChartLine className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {statsOverview.totalHits}
            </span>
            <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-md">
              {statsOverview.uniqueHits} فريدة
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            إجمالي النقرات والزيارات الملتقطة عبر البكسل
          </p>
        </div>

        {/* Card 2: Conversions from /pixel/stats */}
        <div className="p-5 bg-background border border-border rounded-2xl shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              التحويلات الناجحة (Conversions)
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <FaCircleCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {statsOverview.totalConversions}
            </span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {statsOverview.totalHits > 0
                ? `${((statsOverview.totalConversions / statsOverview.totalHits) * 100).toFixed(1)}% معدل تحويل`
                : "0%"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            عمليات شراء وتحويلات مكتملة
          </p>
        </div>

        {/* Card 3: Total Conversion Value from /pixel/stats */}
        <div className="p-5 bg-background border border-border rounded-2xl shadow-xs relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              قيمة التحويلات (Revenue Value)
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <FaCartShopping className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {statsOverview.totalConversionValue.toLocaleString()} ر.س
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            إجمالي العائد المالي المسجل بالتتبع
          </p>
        </div>

        {/* Card 4: Configured Pixels & Campaigns */}
        <div className="p-5 bg-background border border-border rounded-2xl shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              البكسلات المفعلة والحملات
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <FaSliders className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {statsOverview.activeCount} نشط
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              من {statsOverview.totalConfigs} بكسل
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {statsOverview.uniquePlatforms} منصات إعلانية • {campaigns.length} حملة مسجلة
          </p>
        </div>
      </div>

      {/* 4. Navigation Tabs: Configs vs Campaigns */}
      <div className="flex items-center gap-3 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("configs")}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all relative ${
            activeTab === "configs"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FaSliders className="w-4 h-4" />
          <span>إعدادات البكسل (Pixel Configurations)</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-normal">
            {pixelConfigs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("campaigns")}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 cursor-pointer transition-all relative ${
            activeTab === "campaigns"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FaBullhorn className="w-4 h-4" />
          <span>الحملات الإعلانية (Campaigns)</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-normal">
            {campaigns.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            refetchConfigs();
            refetchStats();
            refetchCampaigns();
          }}
          disabled={isRefetchingConfigs || isRefetchingCampaigns}
          title="تحديث البيانات"
          className="ms-auto pb-2 p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          <FaRotate
            className={`w-3.5 h-3.5 ${
              isRefetchingConfigs || isRefetchingCampaigns
                ? "animate-spin text-primary"
                : ""
            }`}
          />
        </button>
      </div>

      {/* 5. Tab Content: Pixel Configurations */}
      {activeTab === "configs" && (
        <div className="space-y-4">
          {/* Platform Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedPlatformFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border ${
                selectedPlatformFilter === "all"
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-background text-muted-foreground border-border hover:bg-muted/60"
              }`}
            >
              <span>الكل ({pixelConfigs.length})</span>
            </button>

            {PLATFORMS_CONFIG.map((platform) => {
              const count = pixelConfigs.filter(
                (c) =>
                  c.platform?.toLowerCase() === platform.id.toLowerCase() ||
                  (platform.id === "facebook" && c.platform?.toLowerCase() === "meta")
              ).length;
              const isSelected = selectedPlatformFilter === platform.id;

              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setSelectedPlatformFilter(platform.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-background text-muted-foreground border-border hover:bg-muted/60"
                  }`}
                >
                  <PlatformBrandLogo
                    platform={platform.id}
                    className="w-3.5 h-3.5 flex-shrink-0"
                  />
                  <span>{platform.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Data Table */}
          <DataTableHeader
            title="قائمة بكسلات التتبع المهيأة"
            action={
              <AddItemCard
                label="إضافة بكسل جديد"
                setShowCreateModal={handleOpenAddModal}
              />
            }
          />

          <DataTable<PixelConfig>
            data={filteredConfigs}
            itemsPerPage={15}
            columns={[
              {
                key: "platform",
                label: "المنصة",
                render: (val: string) => {
                  const meta = getPlatformMeta(val);
                  return (
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.bgColor} border ${meta.borderColor}`}
                      >
                        <PlatformBrandLogo platform={val} className="w-4 h-4" />
                      </span>
                      <span className="font-semibold text-xs text-foreground">
                        {meta.name}
                      </span>
                    </div>
                  );
                },
              },
              {
                key: "name",
                label: "الاسم والوصف",
                render: (val: string, row: PixelConfig) => (
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground text-xs block">
                      {val || "-"}
                    </span>
                    {row.description && (
                      <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                        {row.description}
                      </p>
                    )}
                    {Array.isArray(row.targetPages) && row.targetPages.length > 0 && (
                      <div className="flex items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded font-mono">
                          {row.targetPages.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "trackingId",
                label: "معرّف التتبع (Tracking ID)",
                render: (val: string) => (
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-muted border border-border/80 text-foreground font-semibold">
                      {val || "-"}
                    </span>
                    {val && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(val, `tid-${val}`);
                        }}
                        className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors cursor-pointer"
                        title="نسخ معرّف التتبع"
                      >
                        {copiedKey === `tid-${val}` ? (
                          <FaCheck className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <FaCopy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                ),
              },
              {
                key: "isActive" as any,
                label: "الحالة والوضع",
                render: (_, row: PixelConfig) => {
                  const isActive = row.isActive !== false;
                  const isTest = Boolean(row.isTestMode);
                  return (
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                          }`}
                        />
                        {isActive ? "نشط" : "معطل"}
                      </span>

                      {isTest && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1">
                          <FaFlask className="w-2.5 h-2.5" />
                          وضع الاختبار
                        </span>
                      )}
                    </div>
                  );
                },
              },
              {
                key: "events",
                label: "أحداث التحويل (Events)",
                render: (val: any) => {
                  const purchaseVal = val?.purchase;
                  const leadVal = val?.lead;
                  return (
                    <div className="flex flex-col gap-1 max-w-xs">
                      {purchaseVal && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20 text-[10px]">
                            Purchase
                          </span>
                          <span className="font-mono text-muted-foreground truncate max-w-[120px]">
                            {purchaseVal}
                          </span>
                        </div>
                      )}
                      {leadVal && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-semibold border border-blue-500/20 text-[10px]">
                            Lead
                          </span>
                          <span className="font-mono text-muted-foreground truncate max-w-[120px]">
                            {leadVal}
                          </span>
                        </div>
                      )}
                      {!purchaseVal && !leadVal && (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </div>
                  );
                },
              },
              {
                key: "triggers" as any,
                label: "المحفزات المفعلة (Triggers)",
                render: (_, row: PixelConfig) => {
                  const trigs = row.triggers || {};
                  const activeTriggers = Object.entries(trigs)
                    .filter(([_, enabled]) => Boolean(enabled))
                    .map(([k]) => k);

                  if (activeTriggers.length === 0) {
                    return <span className="text-muted-foreground text-xs">لا يوجد</span>;
                  }

                  return (
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {activeTriggers.slice(0, 3).map((trigKey) => {
                        const info = TRIGGER_LABELS[trigKey] || { label: trigKey };
                        return (
                          <span
                            key={trigKey}
                            className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-foreground border border-border"
                          >
                            {info.label}
                          </span>
                        );
                      })}
                      {activeTriggers.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setDetailsModalConfig(row)}
                          className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          +{activeTriggers.length - 3} المزيد
                        </button>
                      )}
                    </div>
                  );
                },
              },
              {
                key: "createdAt",
                label: "تاريخ الإنشاء",
                render: (date: string) => (
                  <span className="text-xs text-muted-foreground">
                    {date
                      ? new Date(date).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </span>
                ),
              },
            ]}
            onEdit={handleOpenEditModal}
            onDelete={(id) => setDeleteId(id)}
          />
        </div>
      )}

      {/* 6. Tab Content: Campaigns (GET /pixel/campaigns) */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <DataTableHeader
            title="تحليلات الحملات الإعلانية (Campaign Analytics)"
            action={null}
          />

          {/* KPI Analytics Summary Strip for Campaigns */}
          {campaigns.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/30 border border-border rounded-2xl">
              <div>
                <span className="text-[11px] text-muted-foreground block mb-0.5">
                  إجمالي نقرات الحملات
                </span>
                <span className="text-lg font-bold text-foreground">
                  {campaigns.reduce((acc, c) => acc + (c.totalHits || 0), 0)}
                </span>
                <span className="text-[10px] text-muted-foreground ms-1">
                  ({campaigns.reduce((acc, c) => acc + (c.uniqueHits || 0), 0)} فريدة)
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block mb-0.5">
                  إجمالي التحويلات
                </span>
                <span className="text-lg font-bold text-emerald-600">
                  {campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block mb-0.5">
                  قيمة المبيعات المحققة
                </span>
                <span className="text-lg font-bold text-foreground">
                  {campaigns
                    .reduce((acc, c) => acc + (c.conversionValue || 0), 0)
                    .toLocaleString()}{" "}
                  ر.س
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block mb-0.5">
                  مصادر / حملات التتبع
                </span>
                <span className="text-lg font-bold text-foreground">
                  {campaigns.length}
                </span>
              </div>
            </div>
          )}

          {isLoadingCampaigns ? (
            <div className="min-h-[250px] flex items-center justify-center">
              <Spinner />
            </div>
          ) : campaigns.length > 0 ? (
            <DataTable<PixelCampaign>
              data={campaigns}
              itemsPerPage={15}
              columns={[
                {
                  key: "campaignName",
                  label: "معرّف الحملة (Campaign ID)",
                  render: (_, row: PixelCampaign) => {
                    if (!row.campaignId) {
                      return (
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                            <FaCircleInfo className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <span className="font-semibold text-xs text-foreground block">
                              زيارات عامة ومباشرة (Direct / Organic)
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              زيارات بدون وسم حملة تتبع
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <FaBullhorn className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="font-bold text-xs font-mono text-foreground block">
                            {row.campaignId}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            معرّف الحملة المعتمد
                          </span>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  key: "totalHits",
                  label: "الزيارات (Hits)",
                  render: (_, row: PixelCampaign) => (
                    <div>
                      <span className="font-bold text-xs text-foreground block">
                        {row.totalHits ?? 0} زيارة
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {row.uniqueHits ?? 0} فريدة
                      </span>
                    </div>
                  ),
                },
                {
                  key: "conversions",
                  label: "التحويلات (Conversions)",
                  render: (_, row: PixelCampaign) => {
                    const count = row.conversions ?? 0;
                    if (count > 0) {
                      return (
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          <FaCircleCheck className="w-3 h-3" />
                          {count} تحويل
                        </span>
                      );
                    }
                    return (
                      <span className="text-xs text-muted-foreground font-medium">
                        0
                      </span>
                    );
                  },
                },
                {
                  key: "conversionRate",
                  label: "معدل التحويل (Conv. Rate)",
                  render: (_, row: PixelCampaign) => {
                    const rate = row.conversionRate ?? 0;
                    if (rate > 0) {
                      return (
                        <span className="inline-flex items-center font-bold text-xs text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-md">
                          {rate}%
                        </span>
                      );
                    }
                    return (
                      <span className="text-xs text-muted-foreground font-medium">
                        0%
                      </span>
                    );
                  },
                },
                {
                  key: "conversionValue",
                  label: "قيمة التحويلات (Revenue)",
                  render: (_, row: PixelCampaign) => {
                    const val = row.conversionValue ?? 0;
                    if (val > 0) {
                      return (
                        <span className="font-bold text-xs text-foreground bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20">
                          {val.toLocaleString()} ر.س
                        </span>
                      );
                    }
                    return (
                      <span className="text-xs text-muted-foreground">
                        0 ر.س
                      </span>
                    );
                  },
                },
                {
                  key: "devices",
                  label: "الأجهزة والدول",
                  render: (_, row: PixelCampaign) => (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted border border-border text-foreground">
                        {row.devices ?? 0} أجهزة
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted border border-border text-foreground">
                        {row.countries ?? 0} دول
                      </span>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <div className="p-12 text-center bg-background border border-border rounded-2xl space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FaBullhorn className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                لا توجد حملات إعلانية مسجلة حتى الآن
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                يتم ربط بيانات الحملات الإعلانية تلقائياً عندما يتفاعل الزوار مع روابط
                الحملات التي تحتوي على معرّفات التتبع (UTM Campaign أو Campaign ID).
              </p>
            </div>
          )}
        </div>
      )}

      {/* 7. Modal: Add / Edit Pixel Config (POST & PUT /pixel-config) */}
      <Modal isOpen={isModalOpen} onClose={setIsModalOpen}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[85vh] overflow-y-auto px-1">
          <div className="flex items-center justify-between border-b pb-3 sticky top-0 bg-background z-10">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {selectedConfig
                  ? "تعديل إعداد بكسل التتبع"
                  : "إضافة بكسل تتبع جديد"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                قم بتعيين المنصة الإعلانية ومعرف التتبع والمحفزات
              </p>
            </div>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FaSliders className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Field: Name */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                اسم البكسل <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                {...register("name", {
                  required: "يرجى كتابة اسم تعريفي للبكسل",
                })}
                placeholder="مثال: Google Ads Main أو Meta Main"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden"
              />
              {errors.name && (
                <span className="text-[11px] text-destructive mt-1 block">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Field: Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                الوصف (اختياري)
              </label>
              <input
                type="text"
                {...register("description")}
                placeholder="وصف مختصر للغرض من هذا البكسل..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden"
              />
            </div>

            {/* Field: Platform (with Visual Logo Preview) */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                المنصة الإعلانية (Platform){" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentPlatformInfo.bgColor} border ${currentPlatformInfo.borderColor} flex-shrink-0 transition-colors`}
                >
                  <PlatformBrandLogo
                    platform={selectedFormPlatform}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <SelectMenu
                    name="platform"
                    control={control}
                    options={PLATFORM_OPTIONS}
                    placeholder="اختر المنصة"
                  />
                </div>
              </div>
            </div>

            {/* Field: Tracking ID */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                معرّف التتبع (Tracking ID / Pixel ID){" "}
                <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  {...register("trackingId", {
                    required: "يرجى إدخال معرّف التتبع",
                  })}
                  placeholder={currentPlatformInfo.trackingPlaceholder}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden text-left"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                المعرف الخاص بالحساب الإعلاني أو البكسل من لوحة تحكم المنصة.
              </p>
              {errors.trackingId && (
                <span className="text-[11px] text-destructive mt-1 block">
                  {errors.trackingId.message}
                </span>
              )}
            </div>

            {/* Status & Test Mode Toggles */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <span>تفعيل البكسل (نشط)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  {...register("isTestMode")}
                  className="rounded border-border text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span>وضع الاختبار (Test Mode)</span>
              </label>
            </div>

            {/* Event Overrides Section */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center gap-1.5">
                <FaCircleInfo className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  تخصيص معرفات أحداث التحويل (Events Override)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                اختياري: اكتب المعرف المخصص لحدث الشراء أو العميل المحتمل إذا تطلب الأمر.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Purchase Event */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    حدث الشراء (Purchase)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    {...register("events.purchase")}
                    placeholder={currentPlatformInfo.purchasePlaceholder}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden text-left"
                  />
                </div>

                {/* Lead Event */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    حدث العميل المحتمل (Lead)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    {...register("events.lead")}
                    placeholder={currentPlatformInfo.leadPlaceholder}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden text-left"
                  />
                </div>
              </div>
            </div>

            {/* Target & Exclude Pages Section */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
              <div className="flex items-center gap-1.5">
                <FaCode className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  قواعد توجيه الصفحات (Target & Exclude Pages)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                اختياري: حدد نطاق الصفحات المسموح تشغيل البكسل عليها أو استثناؤها (افصل بين المسارات بفاصلة أو سطر جديد).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Pages */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    الصفحات المستهدفة (Target Pages)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    {...register("targetPages")}
                    placeholder="/packages/*, /checkout"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden text-left"
                  />
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    مثال: <code className="text-primary font-mono font-bold">/packages/*</code>
                  </span>
                </div>

                {/* Exclude Pages */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    الصفحات المستثناة (Exclude Pages)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    {...register("excludePages")}
                    placeholder="/admin/*, /dashboard/*"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-hidden text-left"
                  />
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    مثال: <code className="text-destructive font-mono font-bold">/admin/*</code>
                  </span>
                </div>
              </div>
            </div>

            {/* Triggers Section */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5">
              <span className="text-xs font-bold text-foreground block">
                تفعيل المحفزات المسموحة (Triggers)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(TRIGGER_LABELS).map(([key, info]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/80 text-[11px] cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      {...register(`triggers.${key}` as any)}
                      className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    <span className="truncate">{info.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t sticky bottom-0 bg-background z-10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isFormSubmitting}
              className="h-10 px-7 min-w-[120px] whitespace-nowrap bg-primary hover:bg-primary/90 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isFormSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
              )}
              <span>{selectedConfig ? "حفظ التعديلات" : "إضافة البكسل"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. Modal: Full Details & Inspection */}
      <Modal
        isOpen={Boolean(detailsModalConfig)}
        onClose={() => setDetailsModalConfig(null)}
      >
        {detailsModalConfig && (
          <div className="space-y-4 max-h-[85vh] overflow-y-auto px-1">
            <div className="flex items-center justify-between border-b pb-3 sticky top-0 bg-background z-10">
              <div className="flex items-center gap-2.5">
                {(() => {
                  const meta = getPlatformMeta(detailsModalConfig.platform);
                  return (
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bgColor} border ${meta.borderColor}`}
                    >
                      <PlatformBrandLogo
                        platform={detailsModalConfig.platform}
                        className="w-5 h-5"
                      />
                    </span>
                  );
                })()}
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {detailsModalConfig.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    تفاصيل إعداد البكسل والمحفزات
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                    detailsModalConfig.isActive !== false
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {detailsModalConfig.isActive !== false ? "نشط" : "معطل"}
                </span>

                {detailsModalConfig.isTestMode && (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    وضع الاختبار
                  </span>
                )}
              </div>
            </div>

            {/* Core Info Cards */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">معرّف البكسل في النظام (ID):</span>
                <span className="font-mono text-foreground font-semibold">
                  {detailsModalConfig._id || detailsModalConfig.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">المنصة (Platform):</span>
                <span className="font-semibold text-primary capitalize">
                  {detailsModalConfig.platform}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">معرّف التتبع (Tracking ID):</span>
                <span className="font-mono font-bold text-foreground">
                  {detailsModalConfig.trackingId}
                </span>
              </div>
              {detailsModalConfig.description && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">الوصف:</span>
                  <span className="text-foreground">{detailsModalConfig.description}</span>
                </div>
              )}
              {detailsModalConfig.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                  <span className="text-foreground">
                    {new Date(detailsModalConfig.createdAt).toLocaleString("ar-EG")}
                  </span>
                </div>
              )}
            </div>

            {/* Events Mapping */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
              <span className="font-bold text-foreground block mb-2">
                أحداث التحويل المعرفة (Events Override)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-background border border-border">
                  <span className="text-[11px] text-muted-foreground block mb-1">
                    حدث الشراء (Purchase):
                  </span>
                  <span className="font-mono text-emerald-600 font-bold block truncate">
                    {detailsModalConfig.events?.purchase || "غير محدد"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-background border border-border">
                  <span className="text-[11px] text-muted-foreground block mb-1">
                    حدث العميل المحتمل (Lead):
                  </span>
                  <span className="font-mono text-blue-600 font-bold block truncate">
                    {detailsModalConfig.events?.lead || "غير محدد"}
                  </span>
                </div>
              </div>
            </div>

            {/* Triggers Grid */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2.5 text-xs">
              <span className="font-bold text-foreground block">
                حالة المحفزات (Triggers Status)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(TRIGGER_LABELS).map(([key, info]) => {
                  const isEnabled = Boolean(detailsModalConfig.triggers?.[key]);
                  return (
                    <div
                      key={key}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        isEnabled
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted/50 border-border text-muted-foreground"
                      }`}
                    >
                      <span className="text-[11px] font-medium">{info.label}</span>
                      {isEnabled ? (
                        <FaCircleCheck className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <FaCircleXmark className="w-3.5 h-3.5 text-muted-foreground/60" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target & Exclude Pages */}
            {(detailsModalConfig.targetPages?.length || detailsModalConfig.excludePages?.length) ? (
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2.5 text-xs">
                <span className="font-bold text-foreground block">
                  نطاق الصفحات (Page Targeting)
                </span>
                {detailsModalConfig.targetPages && detailsModalConfig.targetPages.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-[11px] block mb-1">
                      الصفحات المستهدفة:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {detailsModalConfig.targetPages.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-[11px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {detailsModalConfig.excludePages && detailsModalConfig.excludePages.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-[11px] block mb-1">
                      الصفحات المستبعدة:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {detailsModalConfig.excludePages.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 font-mono text-[11px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Raw JSON */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-muted-foreground">
                  بيانات JSON الكاملة
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(detailsModalConfig, null, 2),
                      "detailsJson"
                    )
                  }
                  className="text-primary hover:underline flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                >
                  {copiedKey === "detailsJson" ? (
                    <FaCheck className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <FaCopy className="w-3 h-3" />
                  )}
                  <span>نسخ الكود</span>
                </button>
              </div>
              <pre
                className="p-3 bg-muted rounded-xl font-mono text-[11px] text-foreground overflow-x-auto max-h-48 select-all border border-border"
                dir="ltr"
              >
                {JSON.stringify(detailsModalConfig, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailsModalConfig(null)}
                className="px-5 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 9. Modal: Delete Confirmation (DELETE /pixel-config/:pixelConfigId) */}
      <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <div className="space-y-4 text-center p-2">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <FaTrashCan className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              تأكيد حذف إعداد البكسل
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              هل أنت متأكد من رغبتك في حذف هذا البكسل نهائياً؟ سيتم استدعاء:
              <br />
              <code className="text-[11px] font-mono text-primary bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                DELETE /pixel-config/{deleteId}
              </code>
            </p>
          </div>
          <div className="flex items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="h-10 px-5 min-w-[110px] bg-destructive hover:bg-destructive/90 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleteMutation.isPending && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
              )}
              <span>تأكيد الحذف</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
