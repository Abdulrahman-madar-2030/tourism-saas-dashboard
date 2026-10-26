"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaBox,
  FaImage,
  FaTag,
  FaHotel,
  FaListCheck,
  FaGlobe,
  FaPlus,
  FaTrash,
  FaCheck,
  FaXmark,
  FaArrowRight,
  FaArrowLeft,
  FaLink,
  FaWandMagicSparkles,
  FaArrowUpRightFromSquare,
  FaStar,
  FaLocationDot,
  FaRoute,
  FaArrowRightArrowLeft,
} from "react-icons/fa6";
import {
  PackageHotel,
  PackageFlight,
  PracticalInfoItem,
  PackageOffer,
  ACCOMMODATION_VIEWS,
  MEAL_PLANS,
  HOTEL_ROOM_TYPES,
  HOTEL_BED_TYPES,
  PackageHotelRoom,
} from "@/types/packageTypes";
import { useCrud } from "@/hooks/useCrudQuery";
import api from "@/lib/axios";
import Spinner from "@/components/ui/Spinner/Spinner";
import Modal from "@/components/ui/Modal/Modal";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import dynamic from "next/dynamic";

const HotelModal = dynamic(
  () => import("@/components/common/HotelModal/HotelModal"),
  { ssr: false }
);

const PackageVariantsManager = dynamic(
  () =>
    import(
      "@/components/common/PackageVariantsManager/PackageVariantsManager"
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-muted/20">
        <Spinner />
      </div>
    ),
  }
);

interface SelectOption {
  _id: string;
  name: string;
  slug?: string;
}

interface ServiceCatalogItem {
  _id: string;
  name: string;
  description?: string;
  method?: string;
  slug?: string;
  image?: {
    url?: string;
    alt?: string;
  };
}

export interface RichServiceItem {
  _id: string;
  name: string;
  image?: {
    url?: string;
    alt?: string;
  };
  slug?: string;
  description?: string;
  method?: string;
}

type TabKey =
  | "basic"
  | "services"
  | "media"
  | "hotels"
  | "variants"
  | "offer"
  | "seo";

const TABS: { id: TabKey; label: string; icon: React.ElementType }[] = [
  { id: "basic", label: "البيانات الأساسية", icon: FaBox },
  { id: "services", label: "المشتملات والاستثناءات", icon: FaListCheck },
  { id: "media", label: "الصور والغلاف", icon: FaImage },
  { id: "hotels", label: "الفنادق", icon: FaHotel },
  { id: "variants", label: "فئات وجولات الباقة", icon: FaRoute },
  { id: "offer", label: "العرض والأسعار", icon: FaTag },
  { id: "seo", label: "السيو (SEO)", icon: FaGlobe },
];

// Meal plans and view definitions from centralized types
export const VIEW_LABELS: Record<string, string> = {
  sea: "بحر",
  city: "مدينة",
  mountain: "جبال",
  courtyard: "فناء داخلي",
  garden: "حديقة",
  river: "نهر",
  plains: "سهول",
  بحر: "بحر",
  مدينة: "مدينة",
  جبال: "جبال",
  "فناء داخلي": "فناء داخلي",
  حديقة: "حديقة",
  نهر: "نهر",
  سهول: "سهول",
};

export const MEAL_LABELS: Record<string, string> = {
  BB: "إفطار فقط",
  HB: "إفطار وعشاء",
  FB: "إفطار وغداء وعشاء",
  ALL_INCLUSIVE: "شامل جميع الوجبات",
  "إفطار فقط": "إفطار فقط",
  "إفطار وعشاء": "إفطار وعشاء",
  "إفطار وغداء وعشاء": "إفطار وغداء وعشاء",
  "شامل جميع الوجبات": "شامل جميع الوجبات",
};

export const ROOM_TYPE_LABELS: Record<string, string> = {
  دابل: "دابل",
  سوبريور: "سوبريور",
  ديلوكس: "ديلوكس",
  "دابل سويت": "دابل سويت",
  "غرفه عائليه": "غرفه عائليه",
  "جناح عائلي": "جناح عائلي",
};

export const BED_TYPE_LABELS: Record<string, string> = {
  فردي: "فردي",
  "سريرين منفصلين": "سريرين منفصلين",
  مزدوج: "مزدوج",
  "سرير كوين": "سرير كوين",
  "سرير كينغ": "سرير كينغ",
};

const COMMON_MEALS = [
  "إفطار فقط",
  "إفطار وعشاء",
  "إفطار وغداء وعشاء",
  "شامل جميع الوجبات",
];

const safeIsoDate = (val?: string): string | undefined => {
  if (!val || typeof val !== "string") return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

const CHANGE_FREQUENCIES = [
  { value: "always", label: "دائماً (Always)" },
  { value: "hourly", label: "كل ساعة (Hourly)" },
  { value: "daily", label: "يومياً (Daily)" },
  { value: "weekly", label: "أسبوعياً (Weekly)" },
  { value: "monthly", label: "شهرياً (Monthly)" },
  { value: "yearly", label: "سنوياً (Yearly)" },
  { value: "never", label: "أبداً (Never)" },
];

interface PackageFormViewProps {
  mode: "create" | "edit";
  packageId?: string;
}

export default function PackageFormView({
  mode,
  packageId,
}: PackageFormViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [isLoadingPackage, setIsLoadingPackage] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slugs for navigation and API matching
  const [currentTypeSlug, setCurrentTypeSlug] = useState<string>("");
  const [currentCountrySlug, setCurrentCountrySlug] = useState<string>("");
  const [loadedPackageType, setLoadedPackageType] =
    useState<SelectOption | null>(null);
  const [loadedCountry, setLoadedCountry] = useState<SelectOption | null>(null);

  // Basic Info
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [packageType, setPackageType] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Media
  const [coverMode, setCoverMode] = useState<"file" | "url">("file");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [coverPublicId, setCoverPublicId] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");

  const [imagesList, setImagesList] = useState<
    Array<{ url: string; publicId?: string; file?: File; preview?: string }>
  >([]);
  const [newImgUrl, setNewImgUrl] = useState<string>("");
  const [newImgPublicId, setNewImgPublicId] = useState<string>("");

  // Offer
  const [oldPrice, setOldPrice] = useState<string>("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Rich Services (Includes & Excludes)
  const [includedServices, setIncludedServices] = useState<RichServiceItem[]>(
    [],
  );
  const [excludedServices, setExcludedServices] = useState<RichServiceItem[]>(
    [],
  );
  const [includes, setIncludes] = useState<string[]>([]);
  const [excludes, setExcludes] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState<string>("");

  // Variants
  const [variants, setVariants] = useState<any[]>([]);

  // Hotels
  const [hotels, setHotels] = useState<PackageHotel[]>([]);
  const [activeHotelType, setActiveHotelType] = useState<
    "hotel" | "villa" | "cabin"
  >("hotel");
  const [showHotelModal, setShowHotelModal] = useState<boolean>(false);
  const [hotelModalType, setHotelModalType] = useState<
    "hotel" | "villa" | "cabin"
  >("hotel");

  // Flights
  const [flights, setFlights] = useState<PackageFlight[]>([]);

  // Practical Info
  const [practicalInfo, setPracticalInfo] = useState<PracticalInfoItem[]>([
    { title: "مدة الرحلة", value: "5 أيام / 4 ليالي", icon: "calendar" },
    { title: "العملة", value: "الريال السعودي (SAR)", icon: "currency" },
    { title: "اللغة", value: "العربية والإنجليزية", icon: "language" },
    { title: "درجة الحرارة", value: "معتدلة", icon: "weather" },
  ]);

  // SEO
  const [seoTitle, setSeoTitle] = useState<string>("");
  const [seoDesc, setSeoDesc] = useState<string>("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState<string>("");
  const [seoPriority, setSeoPriority] = useState<number>(0.5);
  const [seoChangeFrequency, setSeoChangeFrequency] =
    useState<string>("monthly");
  const [seoNoIndex, setSeoNoIndex] = useState<boolean>(false);
  const [seoNoFollow, setSeoNoFollow] = useState<boolean>(false);
  const [seoNoArchive, setSeoNoArchive] = useState<boolean>(false);
  const [seoNoSnippet, setSeoNoSnippet] = useState<boolean>(false);

  // Queries for selectors
  const { data: packageTypes } = useCrud<SelectOption[]>({
    queryKey: ["packageTypes", "package-form"],
    endpoint: "/package-types",
    select: (res: any) => {
      const data = res?.data ?? res;
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: countries } = useCrud<SelectOption[]>({
    queryKey: ["countries", "package-form"],
    endpoint: "/countries",
    select: (res: any) => res?.data?.data ?? res?.data ?? res ?? [],
  });

  const { data: airlines } = useCrud<SelectOption[]>({
    queryKey: ["airlines", "package-form"],
    endpoint: "/airlines",
    select: (res: any) => res?.data?.data ?? res?.data ?? res ?? [],
  });

  // Inclusions & Exclusions from /packages/admin/content
  const { data: rawAdminContent, refetch: refetchAdminContent } = useCrud<any>({
    queryKey: ["packages-admin-content", packageId || "all"],
    endpoint: "/packages/admin/content",
    select: (res: any) => res?.data?.data ?? res?.data ?? res,
  });

  // Modal for adding a new inclusion/exclusion item directly to the catalog
  const [showInclusionModal, setShowInclusionModal] = useState<boolean>(false);
  const [newInclusionText, setNewInclusionText] = useState<string>("");
  const [newInclusionType, setNewInclusionType] = useState<
    "include" | "exclude"
  >("include");
  const [isSubmittingInclusion, setIsSubmittingInclusion] =
    useState<boolean>(false);

  const handleCreateInclusionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newInclusionText.trim();
    if (!trimmed) {
      return toast.error("يرجى إدخال اسم البند");
    }

    setIsSubmittingInclusion(true);
    try {
      const endpoint = `/packages/admin/content/${newInclusionType}`;
      await api.post(endpoint, {
        item: trimmed,
        items: [{ item: trimmed }],
        ...(packageId ? { packageId } : {}),
      });

      toast.success(
        `تمت إضافة "${trimmed}" بنجاح كـ ${newInclusionType === "include" ? "مشتمل" : "استثناء"}`,
      );

      // Auto-assign to current package
      const tempId = `item-${Date.now()}`;
      const newItem: RichServiceItem = {
        _id: tempId,
        name: trimmed,
        method: newInclusionType === "include" ? "مشمول" : "مستبعد",
      };

      if (newInclusionType === "include") {
        handleAddInclude(newItem);
      } else {
        handleAddExclude(newItem);
      }

      setNewInclusionText("");
      setShowInclusionModal(false);
      refetchAdminContent();
    } catch (err: any) {
      console.error("Failed to add inclusion item:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "حدث خطأ أثناء إضافة البند",
      );
    } finally {
      setIsSubmittingInclusion(false);
    }
  };

  // Extract items exclusively from /packages/admin/content
  const catalogServices = useMemo<ServiceCatalogItem[]>(() => {
    const list: ServiceCatalogItem[] = [];
    const seen = new Set<string>();

    const incArray =
      rawAdminContent?.includes ||
      rawAdminContent?.include ||
      rawAdminContent?.included ||
      [];
    const excArray =
      rawAdminContent?.excludes ||
      rawAdminContent?.exclude ||
      rawAdminContent?.excluded ||
      [];

    const extractItems = (arr: any[], defaultType: "include" | "exclude") => {
      if (!Array.isArray(arr)) return;
      arr.forEach((item: any, idx: number) => {
        const name =
          typeof item === "string"
            ? item
            : item?.item || item?.name || item?.title || "";
        const id =
          (typeof item === "object" ? item?._id || item?.id : null) || name;
        if (name && !seen.has(name.trim())) {
          seen.add(name.trim());
          list.push({
            _id: id,
            name: name.trim(),
            method:
              (typeof item === "object" ? item?.method : undefined) ||
              (defaultType === "include" ? "مشمول" : "مستبعد"),
            description:
              typeof item === "object" ? item?.description : undefined,
            catalogType: defaultType,
          } as any);
        }
      });
    };

    extractItems(incArray, "include");
    extractItems(excArray, "exclude");

    // If rawAdminContent is directly an array
    if (Array.isArray(rawAdminContent)) {
      rawAdminContent.forEach((item: any) => {
        const isExc = item.type === "exclude" || item.isExclude;
        extractItems([item], isExc ? "exclude" : "include");
      });
    }

    return list;
  }, [rawAdminContent]);

  // In create mode (new package): automatically pre-select items into includes / excludes based on their catalog type
  useEffect(() => {
    if (mode === "create" && catalogServices.length > 0) {
      // Only auto-initialize once if lists are still empty
      if (includes.length === 0 && excludes.length === 0) {
        const autoInc: RichServiceItem[] = [];
        const autoExc: RichServiceItem[] = [];
        const autoIncIds: string[] = [];
        const autoExcIds: string[] = [];

        catalogServices.forEach((service: any) => {
          if (service.catalogType === "exclude") {
            autoExc.push({
              _id: service._id,
              name: service.name,
              description: service.description,
              method: service.method || "مستبعد",
            });
            autoExcIds.push(service._id);
          } else {
            // Default to include
            autoInc.push({
              _id: service._id,
              name: service.name,
              description: service.description,
              method: service.method || "مشمول",
            });
            autoIncIds.push(service._id);
          }
        });

        setIncludedServices(autoInc);
        setIncludes(autoIncIds);
        setExcludedServices(autoExc);
        setExcludes(autoExcIds);
      }
    }
  }, [mode, catalogServices, includes.length, excludes.length]);

  // Cities for resolving cityId in manual accommodations
  const { data: citiesData } = useCrud<any>({
    queryKey: ["cities", "package-form"],
    endpoint: "/cities",
    select: (res: any) => {
      const dataObj = res?.data ?? res;
      const arr =
        dataObj?.cities ??
        dataObj?.data?.cities ??
        dataObj?.data ??
        (Array.isArray(dataObj) ? dataObj : []);
      return Array.isArray(arr) ? arr : [];
    },
  });
  const citiesList = Array.isArray(citiesData) ? citiesData : [];

  // Hotel catalog search query (q= param)
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>("");
  const [debouncedHotelSearch, setDebouncedHotelSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHotelSearch(hotelSearchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [hotelSearchQuery]);

  // Accumulated hotels map to ensure previously loaded/selected hotels are always resolvable
  const [accumulatedHotels, setAccumulatedHotels] = useState<
    Record<string, any>
  >({});

  // Hotels catalog from /hotels/admin with q= search parameter
  const {
    data: hotelsCatalog,
    refetch: refetchHotelsCatalog,
    isLoading: isLoadingHotelsCatalog,
  } = useCrud<any[]>({
    queryKey: ["hotels", "package-form", debouncedHotelSearch],
    endpoint: "/hotels/admin",
    params: {
      page: 1,
      limit: 100,
      ...(debouncedHotelSearch ? { q: debouncedHotelSearch } : {}),
    },
    select: (res: any) => {
      const dataObj = res?.data ?? res;
      const arr =
        dataObj?.hotels ??
        dataObj?.data?.hotels ??
        dataObj?.data ??
        (Array.isArray(dataObj) ? dataObj : []);
      return Array.isArray(arr) ? arr : [];
    },
  });

  useEffect(() => {
    if (Array.isArray(hotelsCatalog) && hotelsCatalog.length > 0) {
      setAccumulatedHotels((prev) => {
        const next = { ...prev };
        hotelsCatalog.forEach((h: any) => {
          const id = h._id || h.hotelId;
          if (id) next[id] = h;
          if (h._id) next[h._id] = h;
          if (h.hotelId) next[h.hotelId] = h;
        });
        return next;
      });
    }
  }, [hotelsCatalog]);

  const catalogHotelOptions = useMemo(() => {
    if (!Array.isArray(hotelsCatalog)) return [];
    return hotelsCatalog.map((h: any) => {
      const id = h._id || h.hotelId;
      const typeLabel =
        h.type === "villa"
          ? "فيلا"
          : h.type === "cabin"
            ? "كوخ"
            : h.type === "chalet"
              ? "شاليه"
              : "فندق";
      return {
        value: String(h._id || id),
        label: `[${typeLabel}] ${h.name} ${h.city ? `(${h.city})` : ""} ${h.stars ? `• ${h.stars}★` : ""}`,
      };
    });
  }, [hotelsCatalog]);

  const { createItem: createPackage, updateItem: updatePackage } = useCrud({
    queryKey: ["packages"],
    endpoint: "/packages",
    useJsonPayload: true,
    showToast: false,
  });

  // Set default packageType and country on create once loaded
  useEffect(() => {
    if (mode === "create") {
      if (!packageType && packageTypes && packageTypes.length > 0) {
        setPackageType(packageTypes[0]._id);
      }
      if (!country && countries && countries.length > 0) {
        setCountry(countries[0]._id);
      }
    }
  }, [mode, packageTypes, countries, packageType, country]);

  // Filter cities to only those that belong to the selected country
  const filteredCities = useMemo(() => {
    if (!country) return [];
    return citiesList.filter((c: any) => {
      const cityCountryId =
        typeof c.country === "object" && c.country !== null
          ? c.country._id || c.country.id
          : c.country;
      return String(cityCountryId) === String(country);
    });
  }, [citiesList, country]);

  // When country changes, remove any previously selected cities that don't belong to the new country
  const handleCountryChange = (newCountryId: string) => {
    setCountry(newCountryId);
    setCities((prev) => {
      if (!newCountryId) return [];
      const validIds = new Set(
        citiesList
          .filter((c: any) => {
            const cId =
              typeof c.country === "object" && c.country !== null
                ? c.country._id || c.country.id
                : c.country;
            return String(cId) === String(newCountryId);
          })
          .map((c: any) => c._id || c.id),
      );
      return prev.filter((id) => validIds.has(id));
    });
  };

  // Helper to extract package & variants from API payload with any response shape
  const extractFromPayload = (payload: any, targetId?: string) => {
    if (!payload) return { pkg: null, variants: [] };

    // 1. Array of packages wrapper: { packages: [ { pkg: {...}, variants: [...] } ] } or [ { pkg: {...} } ]
    const packagesArr = Array.isArray(payload.packages)
      ? payload.packages
      : Array.isArray(payload.data?.packages)
        ? payload.data.packages
        : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : null;

    if (packagesArr && packagesArr.length > 0) {
      const match =
        packagesArr.find(
          (item: any) =>
            item?.pkg?._id === targetId ||
            item?._id === targetId ||
            item?.pkg?.slug === targetId ||
            item?.slug === targetId,
        ) || packagesArr[0];

      if (match) {
        return {
          pkg: match.pkg || match,
          variants: Array.isArray(match.variants) ? match.variants : [],
        };
      }
    }

    // 2. Direct pkg property: { pkg: {...}, variants: [...] }
    if (payload.pkg) {
      return {
        pkg: payload.pkg,
        variants: Array.isArray(payload.variants) ? payload.variants : [],
      };
    }

    // 3. Direct package property: { package: {...}, variants: [...] }
    if (payload.package) {
      const p = payload.package;
      return {
        pkg: p.pkg || p,
        variants: Array.isArray(p.variants)
          ? p.variants
          : Array.isArray(payload.variants)
            ? payload.variants
            : [],
      };
    }

    // 4. Object itself is the package
    if (payload._id || payload.name) {
      return {
        pkg: payload,
        variants: Array.isArray(payload.variants) ? payload.variants : [],
      };
    }

    return { pkg: null, variants: [] };
  };

  // Load package data if editing via the correct endpoint:
  // /package-types/${typeSlug}/countries/${countrySlug}
  useEffect(() => {
    if (mode === "edit" && packageId) {
      setIsLoadingPackage(true);
      (async () => {
        try {
          let typeSlug =
            searchParams.get("type") || searchParams.get("typeSlug") || "";
          let countrySlug =
            searchParams.get("country") ||
            searchParams.get("countrySlug") ||
            "";
          let resolvedPackageTypeId = "";
          let resolvedCountryId = "";
          let pkgData: any = null;
          let variantsData: any[] = [];

          // 1. If slugs are available in search params, fetch from slug-based endpoint
          if (typeSlug && countrySlug) {
            setCurrentTypeSlug(typeSlug);
            setCurrentCountrySlug(countrySlug);
            try {
              const res = await api.get(
                `/package-types/${typeSlug}/countries/${countrySlug}`,
              );
              const payload = res?.data?.data ?? res?.data;
              const extracted = extractFromPayload(payload, packageId);
              if (extracted.pkg) {
                pkgData = extracted.pkg;
                variantsData = extracted.variants;
              }
            } catch (e) {
              console.warn("Fetch from package-types slug endpoint failed:", e);
            }
          }

          // 2. Direct single-item endpoint (fastest & most reliable): /packages/:packageId
          if (!pkgData) {
            try {
              const res = await api.get(`/packages/${packageId}`);
              const payload = res?.data?.data ?? res?.data;
              const extracted = extractFromPayload(payload, packageId);
              if (extracted.pkg) {
                pkgData = extracted.pkg;
                variantsData = extracted.variants;
              }
            } catch {
              // Ignore and continue to list fallback
            }
          }

          // 3. Fallback search in packages list if needed
          if (!pkgData) {
            try {
              const res = await api.get(`/packages?limit=200`);
              const list =
                res?.data?.data?.packages ||
                res?.data?.data ||
                res?.data?.packages ||
                res?.data ||
                [];
              const extracted = extractFromPayload(list, packageId);
              if (extracted.pkg) {
                pkgData = extracted.pkg;
                variantsData = extracted.variants;
              }
            } catch {
              // Ignore
            }
          }
          if (!pkgData) {
            try {
              const res = await api.get(`/packages?limit=200`);
              const list =
                res?.data?.data?.packages ||
                res?.data?.data ||
                res?.data?.packages ||
                res?.data ||
                [];
              const extracted = extractFromPayload(list, packageId);
              if (extracted.pkg) {
                pkgData = extracted.pkg;
                variantsData = extracted.variants;
              }
            } catch {
              // Ignore
            }
          }

          // 4. If we found pkgData from list but still don't have slugs, try fetching detail endpoint
          if (pkgData && (!typeSlug || !countrySlug)) {
            const fTypeSlug =
              pkgData.packageType?.slug ||
              (typeof pkgData.packageType === "string"
                ? pkgData.packageType
                : "");
            const fCountrySlug =
              pkgData.country?.slug ||
              (typeof pkgData.country === "string" ? pkgData.country : "");
            if (fTypeSlug && fCountrySlug) {
              setCurrentTypeSlug(fTypeSlug);
              setCurrentCountrySlug(fCountrySlug);
              try {
                const detailRes = await api.get(
                  `/package-types/${fTypeSlug}/countries/${fCountrySlug}`,
                );
                const payload = detailRes?.data?.data ?? detailRes?.data;
                const extracted = extractFromPayload(payload, packageId);
                if (extracted.pkg) {
                  pkgData = extracted.pkg;
                  if (extracted.variants.length > 0) {
                    variantsData = extracted.variants;
                  }
                }
              } catch {
                // Keep pkgData
              }
            }
          }

          if (!pkgData) {
            toast.error("لم يتم العثور على تفاصيل الباقة");
            return;
          }

          // Populate basic info
          setName(pkgData.name || "");
          setSlug(pkgData.slug || "");
          setDescription(pkgData.description || "");
          setIsActive(pkgData.isActive !== false);

          // Update slugs state
          if (pkgData.packageType?.slug) {
            setCurrentTypeSlug(pkgData.packageType.slug);
          }
          if (pkgData.country?.slug) {
            setCurrentCountrySlug(pkgData.country.slug);
          }

          // Cache loaded packageType & country objects for selects
          if (
            typeof pkgData.packageType === "object" &&
            pkgData.packageType !== null
          ) {
            setLoadedPackageType(pkgData.packageType);
          }
          if (typeof pkgData.country === "object" && pkgData.country !== null) {
            setLoadedCountry(pkgData.country);
          }

          // Resolve and set packageType ID
          const finalTypeId =
            (typeof pkgData.packageType === "object" &&
            pkgData.packageType !== null
              ? pkgData.packageType?._id
              : pkgData.packageType) ||
            resolvedPackageTypeId ||
            (typeSlug
              ? packageTypes?.find((t) => t.slug === typeSlug)?._id
              : "");
          if (finalTypeId) setPackageType(finalTypeId);

          // Resolve and set country ID
          const finalCountryId =
            (typeof pkgData.country === "object" && pkgData.country !== null
              ? pkgData.country?._id
              : pkgData.country) ||
            resolvedCountryId ||
            (countrySlug
              ? countries?.find((c) => c.slug === countrySlug)?._id
              : "");
          if (finalCountryId) setCountry(finalCountryId);

          // Cities in package
          if (Array.isArray(pkgData.cities)) {
            const loadedCityIds = pkgData.cities
              .map((c: any) =>
                typeof c === "object" && c !== null ? c._id || c.id : c,
              )
              .filter(Boolean);
            setCities(loadedCityIds);
          }

          // Cover Image
          const existingCover =
            pkgData.imageCover || pkgData.coverImage || pkgData.image;

          if (existingCover) {
            if (typeof existingCover === "object") {
              const url = existingCover.url || existingCover.secure_url || "";
              setCoverUrl(url);
              setCoverPublicId(
                existingCover.publicId || existingCover.public_id || "",
              );
              setCoverPreview(url);
              setCoverMode("url");
            } else if (typeof existingCover === "string") {
              setCoverUrl(existingCover);
              setCoverPublicId("");
              setCoverPreview(existingCover);
              setCoverMode("url");
            }
          }

          // Gallery Images
          if (Array.isArray(pkgData.images)) {
            setImagesList(
              pkgData.images.map((img: any) =>
                typeof img === "object" && img !== null
                  ? {
                      url: img.url || "",
                      publicId: img.publicId || "",
                      preview: img.url || "",
                    }
                  : {
                      url: String(img || ""),
                      publicId: "",
                      preview: String(img || ""),
                    },
              ),
            );
          }

          // Offer and Prices
          if (pkgData.offer) {
            setOldPrice(
              pkgData.offer.oldPrice !== undefined &&
                pkgData.offer.oldPrice !== null
                ? String(pkgData.offer.oldPrice)
                : "",
            );
            setNewPrice(
              pkgData.offer.newPrice !== undefined &&
                pkgData.offer.newPrice !== null
                ? String(pkgData.offer.newPrice)
                : "",
            );
            setStartDate(
              pkgData.offer.startDate
                ? String(pkgData.offer.startDate).slice(0, 10)
                : "",
            );
            setEndDate(
              pkgData.offer.endDate
                ? String(pkgData.offer.endDate).slice(0, 10)
                : "",
            );
          } else if (pkgData.price) {
            setNewPrice(String(pkgData.price));
          }

          // Rich Includes
          if (Array.isArray(pkgData.includes)) {
            const incList: RichServiceItem[] = pkgData.includes.map((i: any) =>
              typeof i === "object" && i !== null
                ? {
                    _id: i._id || "",
                    name: i.name || "",
                    image: i.image,
                    slug: i.slug,
                    description: i.description,
                    method: i.method,
                  }
                : {
                    _id: String(i || ""),
                    name: String(i || ""),
                  },
            );
            setIncludedServices(incList);
            setIncludes(incList.map((i) => i._id).filter(Boolean));
          }

          // Rich Excludes
          if (Array.isArray(pkgData.excludes)) {
            const excList: RichServiceItem[] = pkgData.excludes.map((e: any) =>
              typeof e === "object" && e !== null
                ? {
                    _id: e._id || "",
                    name: e.name || "",
                    image: e.image,
                    slug: e.slug,
                    description: e.description,
                    method: e.method,
                  }
                : {
                    _id: String(e || ""),
                    name: String(e || ""),
                  },
            );
            setExcludedServices(excList);
            setExcludes(excList.map((e) => e._id).filter(Boolean));
          }

          setVariants(variantsData);

          // Hotels
          // Hotels & Accommodations
          let loadedHotels: any[] = [];
          if (
            Array.isArray(pkgData.accommodations) &&
            pkgData.accommodations.length > 0
          ) {
            loadedHotels = pkgData.accommodations;
          } else if (
            Array.isArray(pkgData.hotels) &&
            pkgData.hotels.length > 0
          ) {
            loadedHotels = pkgData.hotels;
          } else if (
            Array.isArray(pkgData.hotelIds) &&
            pkgData.hotelIds.length > 0
          ) {
            loadedHotels = pkgData.hotelIds.map((item: any) =>
              typeof item === "object" && item !== null
                ? item
                : { hotel: String(item) },
            );
          }

          if (loadedHotels.length > 0) {
            const rawPkgRooms: any[] = Array.isArray(pkgData.rooms)
              ? pkgData.rooms
              : [];

            setHotels(
              loadedHotels.map((h: any) => {
                const hotelRef =
                  typeof h?.hotel === "object" && h?.hotel !== null
                    ? h.hotel?._id || h.hotel?.id
                    : h?.hotel;
                const rawCurrentId = hotelRef || h?._id || h?.hotelId || "";

                // Prioritize 24-character hex Mongo _id
                let currentHotelId = "";
                if (
                  rawCurrentId &&
                  /^[0-9a-fA-F]{24}$/.test(String(rawCurrentId).trim())
                ) {
                  currentHotelId = String(rawCurrentId).trim();
                } else {
                  // If it's a manual uuid or name, check hotelsCatalog
                  const foundCat = hotelsCatalog?.find(
                    (cat: any) =>
                      cat.hotelId === rawCurrentId ||
                      cat._id === rawCurrentId ||
                      (h.name &&
                        cat.name?.trim().toLowerCase() ===
                          h.name.trim().toLowerCase()),
                  );
                  if (
                    foundCat?._id &&
                    /^[0-9a-fA-F]{24}$/.test(String(foundCat._id))
                  ) {
                    currentHotelId = String(foundCat._id);
                  } else {
                    currentHotelId = String(rawCurrentId);
                  }
                }

                // Find rooms associated with this hotel from package rooms or hotel.rooms
                let hotelRooms: PackageHotelRoom[] = [];
                if (Array.isArray(h?.rooms) && h.rooms.length > 0) {
                  hotelRooms = h.rooms.map((r: any) => ({
                    hotelId: currentHotelId,
                    roomType: r?.roomType || "دابل",
                    bedType: r?.bedType || "مزدوج",
                  }));
                } else if (rawPkgRooms.length > 0) {
                  const matchingRooms = rawPkgRooms.filter(
                    (r: any) =>
                      String(r?.hotelId || r?.hotel) ===
                        String(currentHotelId) ||
                      String(r?.hotelId || r?.hotel) === String(h?._id),
                  );
                  if (matchingRooms.length > 0) {
                    hotelRooms = matchingRooms.map((r: any) => ({
                      hotelId: currentHotelId,
                      roomType: r?.roomType || "دابل",
                      bedType: r?.bedType || "مزدوج",
                    }));
                  }
                }

                return {
                  hotel: currentHotelId,
                  name: h?.name || h?.hotel?.name || "",
                  link: h?.link || h?.url || h?.hotel?.url || "",
                  url: h?.url || h?.link || h?.hotel?.url || "",
                  meals: Array.isArray(h?.meals)
                    ? h.meals
                    : h?.mealPlan
                      ? [h.mealPlan]
                      : [],
                  mealPlan:
                    h?.mealPlan ||
                    (Array.isArray(h?.meals) && h.meals[0]) ||
                    "إفطار وعشاء",
                  stars: h?.stars || h?.hotel?.stars || undefined,
                  rating:
                    h?.rating !== undefined
                      ? Number(h.rating)
                      : h?.hotel?.rating || undefined,
                  ratingWord: h?.ratingWord || h?.hotel?.ratingWord || "",
                  price:
                    h?.price !== undefined
                      ? Number(h.price)
                      : h?.hotel?.price || undefined,
                  currency: h?.currency || h?.hotel?.currency || "SAR",
                  address: h?.address || h?.hotel?.address || "",
                  city: h?.city || h?.hotel?.city || "",
                  cityId: h?.cityId || h?.hotel?.cityId || "",
                  image:
                    typeof h?.image === "string"
                      ? h.image
                      : h?.image?.url || h?.hotel?.image || undefined,
                  type: h?.type || h?.hotel?.type || "hotel",
                  view: h?.view || h?.hotel?.view || "",
                  hasJacuzzi: Boolean(
                    h?.hasJacuzzi ?? h?.jacuzzi ?? h?.hotel?.hasJacuzzi,
                  ),
                  hasPrivatePool: Boolean(
                    h?.hasPrivatePool ?? h?.pool ?? h?.hotel?.hasPrivatePool,
                  ),
                  pool: h?.hasPrivatePool ?? h?.pool,
                  jacuzzi: h?.hasJacuzzi ?? h?.jacuzzi,
                  description:
                    h?.description || h?.hotel?.description || undefined,
                  calendar: h?.calendar || undefined,
                  rooms: hotelRooms,
                };
              }),
            );
          }

          // Flights
          if (Array.isArray(pkgData.flights)) {
            setFlights(
              pkgData.flights.map((f: any) => ({
                airline:
                  typeof f?.airline === "object" && f?.airline !== null
                    ? f.airline?._id || ""
                    : f?.airline || "",
                airlineObj:
                  typeof f?.airline === "object" && f?.airline !== null
                    ? f.airline
                    : null,
                flightNumber: f?.flightNumber || "",
                from: f?.from || "",
                to: f?.to || "",
                departureDate: f?.departureDate
                  ? String(f.departureDate).slice(0, 10)
                  : "",
                departureTime: f?.departureTime || "",
                arrivalDate: f?.arrivalDate
                  ? String(f.arrivalDate).slice(0, 10)
                  : "",
                arrivalTime: f?.arrivalTime || "",
              })),
            );
          }

          // Practical Info
          if (Array.isArray(pkgData.practicalInfo)) {
            setPracticalInfo(
              pkgData.practicalInfo.map((p: any) => ({
                title: p?.title || "",
                value: p?.value || "",
                icon: p?.icon || "info",
              })),
            );
          }

          // SEO Fields
          if (pkgData.seo) {
            setSeoTitle(pkgData.seo.title || pkgData.name || "");
            setSeoDesc(pkgData.seo.description || pkgData.description || "");
            if (Array.isArray(pkgData.seo.keywords)) {
              setSeoKeywords(pkgData.seo.keywords);
            } else if (
              typeof pkgData.seo.keywords === "string" &&
              pkgData.seo.keywords.trim()
            ) {
              setSeoKeywords(
                pkgData.seo.keywords
                  .split(",")
                  .map((k: string) => k.trim())
                  .filter(Boolean),
              );
            }
            if (pkgData.seo.priority !== undefined) {
              setSeoPriority(Number(pkgData.seo.priority) || 0.5);
            }
            if (pkgData.seo.changeFrequency) {
              setSeoChangeFrequency(pkgData.seo.changeFrequency);
            }
            setSeoNoIndex(
              pkgData.seo.noIndex === true || pkgData.seo.noIndex === "true",
            );
            setSeoNoFollow(
              pkgData.seo.noFollow === true || pkgData.seo.noFollow === "true",
            );
            setSeoNoArchive(
              pkgData.seo.noArchive === true ||
                pkgData.seo.noArchive === "true",
            );
            setSeoNoSnippet(
              pkgData.seo.noSnippet === true ||
                pkgData.seo.noSnippet === "true",
            );
          } else {
            setSeoTitle(pkgData.name || "");
            setSeoDesc(pkgData.description || "");
          }
        } catch (err) {
          console.error("Error loading package details:", err);
          toast.error("فشل في تحميل تفاصيل الباقة");
        } finally {
          setIsLoadingPackage(false);
        }
      })();
    }
  }, [mode, packageId, searchParams]);

  // Synchronize packageType and country if options load after initial package fetch
  useEffect(() => {
    if (
      mode === "edit" &&
      currentTypeSlug &&
      !packageType &&
      packageTypes?.length
    ) {
      const match = packageTypes.find((t) => t.slug === currentTypeSlug);
      if (match) setPackageType(match._id);
    }
  }, [mode, currentTypeSlug, packageType, packageTypes]);

  useEffect(() => {
    if (
      mode === "edit" &&
      currentCountrySlug &&
      !country &&
      countries?.length
    ) {
      const match = countries.find((c) => c.slug === currentCountrySlug);
      if (match) setCountry(match._id);
    }
  }, [mode, currentCountrySlug, country, countries]);

  // Generate slug automatically from title
  const handleGenerateSlug = () => {
    if (!name) return;
    const generated = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0621-\u064A-]/g, "")
      .replace(/[\s_-]+/g, "-");
    setSlug(generated);
  };

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
      imagesList.forEach((img) => {
        if (img.preview && img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [coverPreview, imagesList]);

  // Image helpers
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (coverPreview && coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newEntries = files.map((file) => ({
        url: "",
        file,
        preview: URL.createObjectURL(file),
      }));
      setImagesList((prev) => [...prev, ...newEntries]);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImgUrl.trim()) return;
    setImagesList((prev) => [
      ...prev,
      {
        url: newImgUrl.trim(),
        publicId: newImgPublicId.trim() || undefined,
        preview: newImgUrl.trim(),
      },
    ]);
    setNewImgUrl("");
    setNewImgPublicId("");
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => {
      const target = prev[index];
      if (target?.preview && target.preview.startsWith("blob:")) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Hotel Helpers
  const addHotel = (specificType?: "hotel" | "villa" | "cabin") => {
    const t = specificType || activeHotelType || "hotel";
    setHotels((prev) => [
      ...prev,
      {
        hotel: "",
        name: "",
        link: "",
        meals: t === "hotel" ? ["BB"] : [],
        type: t,
        view: "",
        pool: t === "villa" ? false : undefined,
        jacuzzi: t === "cabin" ? false : undefined,
      },
    ]);
  };

  const updateHotel = (index: number, field: keyof PackageHotel, val: any) => {
    setHotels((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const removeHotel = (index: number) => {
    setHotels((prev) => prev.filter((_, i) => i !== index));
  };
  const addHotelRoom = (hotelIndex: number) => {
    setHotels((prev) => {
      const next = [...prev];
      const hotelItem = next[hotelIndex];
      const currentRooms = hotelItem.rooms || [];
      const newRoom: PackageHotelRoom = {
        hotelId: hotelItem.hotel || undefined,
        roomType: "دابل",
        bedType: "مزدوج",
      };
      next[hotelIndex] = {
        ...hotelItem,
        rooms: [...currentRooms, newRoom],
      };
      return next;
    });
  };
  const updateHotelRoom = (
    hotelIndex: number,
    roomIndex: number,
    field: "roomType" | "bedType",
    value: string,
  ) => {
    setHotels((prev) => {
      const next = [...prev];
      const hotelItem = next[hotelIndex];
      const rooms = [...(hotelItem.rooms || [])];
      if (rooms[roomIndex]) {
        rooms[roomIndex] = {
          ...rooms[roomIndex],
          hotelId: hotelItem.hotel || rooms[roomIndex].hotelId,
          [field]: value,
        };
      }
      next[hotelIndex] = { ...hotelItem, rooms };
      return next;
    });
  };
  const removeHotelRoom = (hotelIndex: number, roomIndex: number) => {
    setHotels((prev) => {
      const next = [...prev];
      const hotelItem = next[hotelIndex];
      const rooms = (hotelItem.rooms || []).filter(
        (_, idx) => idx !== roomIndex,
      );
      next[hotelIndex] = { ...hotelItem, rooms };
      return next;
    });
  };
  const toggleHotelMeal = (hotelIndex: number, meal: string) => {
    setHotels((prev) => {
      const next = [...prev];
      const currentMeals = next[hotelIndex]?.meals || [];
      const updatedMeals = currentMeals.includes(meal)
        ? currentMeals.filter((m) => m !== meal)
        : [...currentMeals, meal];
      next[hotelIndex] = { ...next[hotelIndex], meals: updatedMeals };
      return next;
    });
  };

  // Flight Helpers
  const addFlight = () => {
    setFlights((prev) => [
      ...prev,
      {
        airline: "",
        flightNumber: "",
        from: "",
        to: "",
        departureDate: "",
        departureTime: "",
        arrivalDate: "",
        arrivalTime: "",
      },
    ]);
  };
  const updateFlight = (
    index: number,
    field: keyof PackageFlight,
    val: any,
  ) => {
    setFlights((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const removeFlight = (index: number) => {
    setFlights((prev) => prev.filter((_, i) => i !== index));
  };

  // Practical Info Helpers
  const addPracticalInfo = (title: string, value: string, icon = "info") => {
    setPracticalInfo((prev) => [...prev, { title, value, icon }]);
  };
  const updatePracticalInfo = (
    index: number,
    field: keyof PracticalInfoItem,
    val: string,
  ) => {
    setPracticalInfo((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };
  const removePracticalInfo = (index: number) => {
    setPracticalInfo((prev) => prev.filter((_, i) => i !== index));
  };

  // Rich Service Helpers (Includes & Excludes)
  const handleAddInclude = (service: any) => {
    const id = service._id;
    if (!id) return;
    if (!includes.includes(id)) {
      setIncludes((prev) => [...prev, id]);
      setIncludedServices((prev) => [
        ...prev,
        {
          _id: id,
          name: service.name || "",
          image: service.image,
          slug: service.slug,
          description: service.description,
          method: service.method,
        },
      ]);
    }
    // Remove from excludes if present
    setExcludes((prev) => prev.filter((x) => x !== id));
    setExcludedServices((prev) => prev.filter((x) => x._id !== id));
  };

  const handleAddExclude = (service: any) => {
    const id = service._id;
    if (!id) return;
    if (!excludes.includes(id)) {
      setExcludes((prev) => [...prev, id]);
      setExcludedServices((prev) => [
        ...prev,
        {
          _id: id,
          name: service.name || "",
          image: service.image,
          slug: service.slug,
          description: service.description,
          method: service.method,
        },
      ]);
    }
    // Remove from includes if present
    setIncludes((prev) => prev.filter((x) => x !== id));
    setIncludedServices((prev) => prev.filter((x) => x._id !== id));
  };

  const handleRemoveInclude = (id: string) => {
    setIncludes((prev) => prev.filter((x) => x !== id));
    setIncludedServices((prev) => prev.filter((x) => x._id !== id));
  };

  const handleRemoveExclude = (id: string) => {
    setExcludes((prev) => prev.filter((x) => x !== id));
    setExcludedServices((prev) => prev.filter((x) => x._id !== id));
  };

  // Switch between Include and Exclude directly
  const handleToggleIncludeToExclude = (item: RichServiceItem) => {
    handleRemoveInclude(item._id);
    handleAddExclude(item);
    toast.success(`تم تحويل "${item.name}" إلى المستبعد (غير مشمول)`);
  };

  const handleToggleExcludeToInclude = (item: RichServiceItem) => {
    handleRemoveExclude(item._id);
    handleAddInclude(item);
    toast.success(`تم تحويل "${item.name}" إلى المشمول في الباقة`);
  };

  // SEO Keywords Helpers
  const handleAddKeyword = () => {
    const kw = newKeywordInput.trim();
    if (!kw) return;
    if (!seoKeywords.includes(kw)) {
      setSeoKeywords((prev) => [...prev, kw]);
    }
    setNewKeywordInput("");
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setSeoKeywords((prev) => prev.filter((kw) => kw !== kwToRemove));
  };

  // Validate specific step requirements
  const validateStep = (tabId: TabKey): boolean => {
    if (tabId === "basic") {
      if (!name || !name.trim()) {
        toast.error("يرجى إدخال اسم الباقة أولاً");
        return false;
      }
      if (!packageType) {
        toast.error("يرجى اختيار نوع الباقة");
        return false;
      }
      if (!country) {
        toast.error("يرجى اختيار الدولة");
        return false;
      }
    }

    if (tabId === "media") {
      const hasCover =
        (coverMode === "file" && coverFile) ||
        Boolean(coverUrl && coverUrl.trim());
      if (!hasCover) {
        toast.error(
          "صورة الغلاف (imageCover) إجبارية، يرجى رفع صورة أو إدخال رابط الصورة",
        );
        return false;
      }
    }

    return true;
  };

  // Helper to safely navigate to target tab, ensuring prior required steps are valid
  const handleTabChange = (targetTab: TabKey) => {
    // If currently on basic and trying to move forward, validate basic
    if (activeTab === "basic" && targetTab !== "basic") {
      if (!validateStep("basic")) return;
    }

    // If moving beyond media, ensure cover image is set
    const tabOrder: TabKey[] = [
      "basic",
      "services",
      "media",
      "hotels",
      "variants",
      "offer",
      "seo",
    ];
    const targetIdx = tabOrder.indexOf(targetTab);
    const mediaIdx = tabOrder.indexOf("media");

    // If trying to jump forward beyond basic without basic info
    if (!validateStep("basic")) {
      setActiveTab("basic");
      return;
    }

    // If trying to jump past media without cover image
    if (targetIdx > mediaIdx) {
      if (!validateStep("media")) {
        setActiveTab("media");
        return;
      }
    }

    setActiveTab(targetTab);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep("basic")) {
      setActiveTab("basic");
      return;
    }

    // التحقق من أن صورة الغلاف إجبارية
    if (!validateStep("media")) {
      setActiveTab("media");
      return;
    }

    // التحقق من أن السعر قبل الخصم أعلى من السعر بعد الخصم
    const parsedNewPrice = Number(newPrice);
    const parsedOldPrice = Number(oldPrice);
    if (oldPrice && !isNaN(parsedOldPrice)) {
      if (isNaN(parsedNewPrice) || parsedNewPrice <= 0) {
        setActiveTab("offer");
        return toast.error("يرجى إدخال السعر الحالي (الجديد) أولاً");
      }
      if (parsedOldPrice <= parsedNewPrice) {
        setActiveTab("offer");
        return toast.error(
          "السعر قبل الخصم (Old Price) يجب أن يكون أعلى من السعر بعد الخصم (New Price)",
        );
      }
    }

    setIsSubmitting(true);
    try {
      let imageCoverPayload: any = null;
      if (coverMode === "file" && coverFile) {
        imageCoverPayload = coverFile;
      } else if (coverUrl.trim()) {
        imageCoverPayload = {
          url: coverUrl.trim(),
          ...(coverPublicId.trim() ? { publicId: coverPublicId.trim() } : {}),
        };
      }

      const imagesPayload: any[] = imagesList
        .filter((item) => !item.file && item.url)
        .map((item) => ({
          url: item.url,
          ...(item.publicId ? { publicId: item.publicId } : {}),
        }));

      const parsedStartDate = safeIsoDate(startDate);
      const parsedEndDate = safeIsoDate(endDate);

      const offerPayload: PackageOffer = {
        newPrice: Number(newPrice) || 0,
        ...(oldPrice ? { oldPrice: Number(oldPrice) } : {}),
        ...(parsedStartDate ? { startDate: parsedStartDate } : {}),
        ...(parsedEndDate ? { endDate: parsedEndDate } : {}),
      };

      const flightsPayload: PackageFlight[] = flights.map((f) => ({
        airline: f.airline || "",
        flightNumber: f.flightNumber || "",
        from: f.from || "",
        to: f.to || "",
        departureDate: safeIsoDate(f.departureDate),
        departureTime: f.departureTime || undefined,
        arrivalDate: safeIsoDate(f.arrivalDate),
        arrivalTime: f.arrivalTime || undefined,
      }));

      const bodyData = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        packageType,
        country,
        cities,
        description: description.trim(),
        isActive,
        imageCover: imageCoverPayload,
        images: imagesPayload,
        includes,
        excludes,
        // If selected from catalog (API), send hotelIds (MongoDB ObjectIDs only)
        ...(hotels.some((h) =>
          Boolean(h.hotel && String(h.hotel).trim() !== ""),
        )
          ? {
              hotelIds: hotels
                .map((h) => {
                  const rawId =
                    typeof h.hotel === "object" && h.hotel !== null
                      ? (h.hotel as any)._id || (h.hotel as any).id
                      : h.hotel;

                  // 1. If it's already a valid 24-char hex Mongo _id
                  if (rawId && /^[0-9a-fA-F]{24}$/.test(String(rawId).trim())) {
                    return String(rawId).trim();
                  }

                  // 2. If it's a manual-UUID or other ID, resolve it to Mongo _id from hotelsCatalog
                  const foundInCatalog = hotelsCatalog?.find(
                    (cat: any) =>
                      cat.hotelId === rawId ||
                      cat._id === rawId ||
                      (h.name &&
                        cat.name?.trim().toLowerCase() ===
                          h.name.trim().toLowerCase()),
                  );
                  if (
                    foundInCatalog?._id &&
                    /^[0-9a-fA-F]{24}$/.test(String(foundInCatalog._id))
                  ) {
                    return String(foundInCatalog._id);
                  }

                  return undefined;
                })
                .filter((id): id is string => Boolean(id)),
            }
          : {}),
        // Send rooms configured across hotels: { hotelId, roomType, bedType }
        rooms: hotels.flatMap((h) => {
          if (!Array.isArray(h.rooms) || h.rooms.length === 0) return [];
          const rawHotelId =
            typeof h.hotel === "object" && h.hotel !== null
              ? (h.hotel as any)._id || (h.hotel as any).id
              : h.hotel;

          let cleanHotelId: string | undefined = undefined;
          if (
            rawHotelId &&
            /^[0-9a-fA-F]{24}$/.test(String(rawHotelId).trim())
          ) {
            cleanHotelId = String(rawHotelId).trim();
          } else {
            const foundInCatalog = hotelsCatalog?.find(
              (cat: any) =>
                cat.hotelId === rawHotelId ||
                cat._id === rawHotelId ||
                (h.name &&
                  cat.name?.trim().toLowerCase() ===
                    h.name.trim().toLowerCase()),
            );
            if (
              foundInCatalog?._id &&
              /^[0-9a-fA-F]{24}$/.test(String(foundInCatalog._id))
            ) {
              cleanHotelId = String(foundInCatalog._id);
            }
          }

          return h.rooms.map((r) => {
            let rHotelId: string | undefined = undefined;
            if (
              r.hotelId &&
              /^[0-9a-fA-F]{24}$/.test(String(r.hotelId).trim())
            ) {
              rHotelId = String(r.hotelId).trim();
            } else if (r.hotelId) {
              const matchedInCat = hotelsCatalog?.find(
                (cat: any) =>
                  cat.hotelId === r.hotelId || cat._id === r.hotelId,
              );
              if (
                matchedInCat?._id &&
                /^[0-9a-fA-F]{24}$/.test(String(matchedInCat._id))
              ) {
                rHotelId = String(matchedInCat._id);
              }
            }
            return {
              hotelId: rHotelId || cleanHotelId,
              roomType: r.roomType || "دابل",
              bedType: r.bedType || "مزدوج",
            };
          });
        }),
        // If manual/custom accommodations entered (no catalog hotel ID), send accommodations
        ...(hotels.some(
          (h) => !h.hotel || !/^[0-9a-fA-F]{24}$/.test(String(h.hotel).trim()),
        )
          ? {
              accommodations: hotels
                .filter(
                  (h) =>
                    !h.hotel ||
                    !/^[0-9a-fA-F]{24}$/.test(String(h.hotel).trim()),
                )
                .map((h) => {
                  const accType = h.type || "hotel";
                  const resolvedCityId =
                    h.cityId ||
                    citiesList.find(
                      (c: any) =>
                        c.name?.trim().toLowerCase() ===
                        h.city?.trim().toLowerCase(),
                    )?._id ||
                    undefined;

                  const baseAcc: any = {
                    type: accType,
                    name: h.name.trim(),
                    description: h.description?.trim() || undefined,
                    city: h.city?.trim() || undefined,
                    cityId: resolvedCityId,
                    view: h.view || undefined,
                    image: h.image?.trim() || undefined,
                    url: h.url?.trim() || h.link?.trim() || undefined,
                    rating:
                      h.rating !== undefined
                        ? Number(h.rating)
                        : h.stars
                          ? Number(h.stars)
                          : undefined,
                  };

                  if (accType === "hotel") {
                    return {
                      ...baseAcc,
                      address: h.address?.trim() || undefined,
                      price:
                        h.price !== undefined ? Number(h.price) : undefined,
                      currency: h.currency || "SAR",
                      stars: h.stars ? Number(h.stars) : undefined,
                      ratingWord: h.ratingWord?.trim() || undefined,
                      mealPlan: h.mealPlan || (h.meals && h.meals[0]) || "HB",
                      meals: Array.isArray(h.meals) ? h.meals : [],
                      link: h.link?.trim() || undefined,
                    };
                  } else if (accType === "cabin") {
                    return {
                      ...baseAcc,
                      hasJacuzzi: Boolean(h.hasJacuzzi ?? h.jacuzzi),
                    };
                  } else if (accType === "villa") {
                    return {
                      ...baseAcc,
                      hasPrivatePool: Boolean(h.hasPrivatePool ?? h.pool),
                    };
                  }
                  return baseAcc;
                }),
            }
          : {}),
        variants: (variants || []).map((v: any) => {
          const citiesPayload = (v.cities || [])
            .map((c: any) => {
              if (typeof c === "object" && c !== null) {
                return c._id || c.id;
              }
              if (typeof c === "string") {
                const trimmed = c.trim();
                if (/^[0-9a-fA-F]{24}$/.test(trimmed)) return trimmed;
                // Try to resolve city name to ID from citiesList
                const found = citiesList.find(
                  (item: any) =>
                    item.name?.trim().toLowerCase() === trimmed.toLowerCase(),
                );
                return found?._id || undefined;
              }
              return undefined;
            })
            .filter((id: any): id is string =>
              Boolean(id && /^[0-9a-fA-F]{24}$/.test(String(id))),
            );

          const rawDays = v.duration?.days;
          const rawNights = v.duration?.nights;
          const days = Math.max(1, parseInt(String(rawDays), 10) || 1);
          const nights = Math.max(0, parseInt(String(rawNights), 10) || 0);

          const sanitizedItinerary = (v.itinerary || []).map((item: any) => {
            const cleanTour =
              typeof item.tour === "object" && item.tour !== null
                ? item.tour._id || item.tour.id || undefined
                : typeof item.tour === "string" && item.tour.trim() !== ""
                  ? item.tour.trim()
                  : undefined;

            return {
              day: Number(item.day) || 1,
              type: item.type || "TOUR",
              ...(item.date ? { date: item.date } : {}),
              title: item.title || "",
              description: item.description || "",
              ...(cleanTour ? { tour: cleanTour } : {}),
              ...(Array.isArray(item.activity)
                ? { activity: item.activity }
                : {}),
            };
          });

          return {
            ...(v._id && !String(v._id).startsWith("temp_")
              ? { _id: v._id }
              : {}),
            name: (v.name || "").trim(),
            description: (v.description || "").trim(),
            cities: citiesPayload,
            duration: { days, nights },
            price: Math.max(0, parseFloat(String(v.price)) || 0),
            currency: "SAR",
            isActive: v.isActive !== false,
            itinerary: sanitizedItinerary,
          };
        }),
        offer: offerPayload,
        flights: flightsPayload,
        practicalInfo,
        seo: {
          title: seoTitle.trim() || name.trim(),
          description: seoDesc.trim() || description.slice(0, 160).trim(),
          keywords: seoKeywords,
          priority: Number(seoPriority) || 0.5,
          changeFrequency: seoChangeFrequency,
          noIndex: String(seoNoIndex),
          noFollow: String(seoNoFollow),
          noArchive: String(seoNoArchive),
          noSnippet: String(seoNoSnippet),
        },
      };

      const payload = {
        body: bodyData,
        imageCover: coverFile instanceof File ? coverFile : undefined,
        images: imagesList
          .map((i) => i.file)
          .filter((f): f is File => f instanceof File),
      };

      // Sync helper for includes and excludes to /packages/admin/content
      const syncContentToAdmin = async (targetPkgId: string) => {
        if (!targetPkgId) return;
        try {
          if (includes.length > 0) {
            const incItems = includes.map((incId) => {
              const matched = catalogServices.find((s) => s._id === incId);
              return { item: matched?.name || incId };
            });
            await api.post("/packages/admin/content/include", {
              packageId: targetPkgId,
              items: incItems,
            });
          }
          if (excludes.length > 0) {
            const excItems = excludes.map((excId) => {
              const matched = catalogServices.find((s) => s._id === excId);
              return { item: matched?.name || excId };
            });
            await api.post("/packages/admin/content/exclude", {
              packageId: targetPkgId,
              items: excItems,
            });
          }
        } catch (contentErr) {
          console.warn(
            "Could not sync content to /packages/admin/content:",
            contentErr,
          );
        }
      };

      let finalPkgId = packageId;
      if (mode === "edit" && packageId) {
        await updatePackage({
          id: packageId,
          endpoint: "/packages/admin",
          ...payload,
        });
      } else {
        const createRes: any = await createPackage({
          ...payload,
          endpoint: "/packages",
        });

        finalPkgId =
          createRes?.data?._id ||
          createRes?.data?.pkg?._id ||
          createRes?._id ||
          createRes?.pkg?._id;
      }

      // Sync includes & excludes for created or edited package
      if (finalPkgId) {
        await syncContentToAdmin(finalPkgId);
      }

      if (mode === "edit") {
        toast.success("تم تحديث الباقة بنجاح");
      } else {
        toast.success("تم إنشاء وحفظ الباقة بنجاح");
      }

      router.push("/dashboard/packages");
    } catch (err: any) {
      console.error("Save package error:", err);
      const apiErrors = err?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const detailMessages = apiErrors
          .map(
            (e: any) =>
              `${e.field ? `${e.field}: ` : ""}${e.message || e.code || ""}`,
          )
          .filter(Boolean);
        const topError =
          detailMessages[0] ||
          err?.response?.data?.message ||
          "حدث خطأ في التحقق من البيانات";
        toast.error(`خطأ في البيانات: ${topError}`, { duration: 6000 });
      } else {
        toast.error(err?.response?.data?.message || "حدث خطأ أثناء حفظ الباقة");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountPercent =
    newPrice && oldPrice && Number(oldPrice) > Number(newPrice)
      ? Math.round(
          ((Number(oldPrice) - Number(newPrice)) / Number(oldPrice)) * 100,
        )
      : null;

  const filteredCatalogServices = (catalogServices || []).filter((s) =>
    (s.name || "").toLowerCase().includes((serviceSearch || "").toLowerCase()),
  );

  // Link to tourism package variants if slugs exist
  const tourismPackagesRoute =
    currentTypeSlug && currentCountrySlug
      ? `/dashboard/packages/${currentTypeSlug}/${currentCountrySlug}`
      : null;

  if (isLoadingPackage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Spinner />
        <p className="text-sm font-medium text-muted-foreground">
          جاري جلب تفاصيل الباقة من الخادم...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 animate-fadeIn">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border py-4 px-2 -mx-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/packages"
            className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="العودة للباقات"
          >
            <FaArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {mode === "create"
                  ? "إنشاء باقة سياحية جديدة"
                  : "تعديل الباقة السياحية"}
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                }`}
              >
                {isActive ? "نشطة" : "معطلة"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === "create"
                ? "أضف كافة تفاصيل الباقة، المشتملات، الاستثناءات، الجولات، والفنادق"
                : `تعديل بيانات الباقة: ${name || ""}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {tourismPackagesRoute && (
            <Link
              href={tourismPackagesRoute}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5"
              title="إدارة برامج وجولات الباقة السياحية"
            >
              <span>إدارة الجولات والفئات</span>
              <FaArrowUpRightFromSquare className="w-3 h-3" />
            </Link>
          )}

          <Link
            href="/dashboard/packages"
            className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : mode === "create" ? (
              "إنشاء وحفظ الباقة"
            ) : (
              "حفظ التعديلات"
            )}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-background rounded-2xl border border-border p-1.5 shadow-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              let badge: number | null = null;
              if (tab.id === "services")
                badge = includedServices.length + excludedServices.length;
              if (tab.id === "hotels") badge = hotels.length;
              if (tab.id === "variants") badge = variants.length;
              if (tab.id === "media")
                badge = (coverUrl || coverFile ? 1 : 0) + imagesList.length;
              if (tab.id === "seo")
                badge = seoKeywords.length > 0 ? seoKeywords.length : null;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {badge !== null && badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content Cards */}
        <div className="bg-background rounded-2xl border border-border p-6 shadow-xs space-y-6">
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  البيانات الأساسية للباقة
                </h3>
                <p className="text-xs text-muted-foreground">
                  الاسم التعريفي، الوجهة الجغرافية، ونوع الباقة
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    اسم الباقة السياحية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name ?? ""}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: رحلة سياحية إلى دبي 5 أيام"
                    className="w-full h-11 px-4 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      الرابط المخصص (Slug)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <FaWandMagicSparkles className="w-2.5 h-2.5" />
                      <span>توليد تلقائي</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={slug ?? ""}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="مثال: dubai-5-days-trip"
                    className="w-full h-11 px-4 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left dir-ltr font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    حالة ظهور الباقة
                  </label>
                  <div className="flex items-center justify-between h-11 px-4 bg-muted/30 rounded-xl border border-border">
                    <span className="text-xs font-semibold text-foreground">
                      {isActive ? "نشطة للعملاء" : "معطلة مؤقتاً"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    نوع الباقة <span className="text-rose-500">*</span>
                  </label>
                  <SelectMenu
                    required
                    value={packageType ?? ""}
                    onChange={(val) => setPackageType(String(val))}
                    options={(packageTypes || []).map((pt) => ({
                      label: pt.name,
                      value: pt._id,
                    }))}
                    placeholder="اختر نوع الباقة..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    الدولة / الوجهة <span className="text-rose-500">*</span>
                  </label>
                  <SelectMenu
                    required
                    searchable
                    value={country ?? ""}
                    onChange={(val) => handleCountryChange(String(val))}
                    options={(countries || []).map((c) => ({
                      label: c.name,
                      value: c._id,
                    }))}
                    placeholder="اختر الدولة أولاً..."
                  />
                </div>

                {/* مدن الدولة المشمولة في الباقة (اختيار متعدد مربوط بالدولة) */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      المدن التابعة للدولة (يمكن اختيار أكثر من مدينة)
                    </label>
                    {filteredCities.length > 0 && (
                      <span className="text-[11px] text-primary font-medium">
                        تم اختيار {cities.length} من {filteredCities.length}{" "}
                        مدينة
                      </span>
                    )}
                  </div>

                  {!country ? (
                    <div className="p-3 text-xs text-muted-foreground bg-muted/30 border border-dashed border-border rounded-xl text-center">
                      يرجى اختيار الدولة أولاً لعرض المدن التابعة لها
                    </div>
                  ) : filteredCities.length === 0 ? (
                    <div className="p-3 text-xs text-muted-foreground bg-muted/30 border border-dashed border-border rounded-xl text-center">
                      لا توجد مدن مسجلة لهذه الدولة حتى الآن
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/20 border border-border rounded-xl">
                      {filteredCities.map((c: any) => {
                        const cityId = c._id || c.id;
                        const isSelected = cities.includes(cityId);
                        return (
                          <button
                            key={cityId}
                            type="button"
                            onClick={() => {
                              setCities((prev) =>
                                isSelected
                                  ? prev.filter((id) => id !== cityId)
                                  : [...prev, cityId],
                              );
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-background border-border text-foreground hover:bg-muted"
                            }`}
                          >
                            <span>{isSelected ? "✓" : "+"}</span>
                            <span>{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  الوصف التفصيلي للباقة
                </label>
                <textarea
                  rows={4}
                  value={description ?? ""}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب وصفاً جذاباً يشمل مزايا الإقامة، النقل، والجولات السياحية..."
                  className="w-full px-4 py-3 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: INCLUDES & EXCLUDES (المشتملات والاستثناءات) */}
          {activeTab === "services" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    المشتملات والاستثناءات (Includes & Excludes)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    الخدمات ووسائل النقل والمرافق المشمولة وغير المشمولة في
                    الباقة
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    المشمول: {includedServices.length}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    المستبعد: {excludedServices.length}
                  </span>
                </div>
              </div>

              {/* Active Assigned Services Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. INCLUDED SERVICES */}
                <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                        الخدمات المشمولة في الباقة ({includedServices.length})
                      </h4>
                    </div>
                  </div>

                  {includedServices.length === 0 ? (
                    <div className="text-center py-8 bg-background/50 rounded-xl border border-dashed border-emerald-500/20 text-xs text-muted-foreground">
                      لم يتم تعيين أي خدمات مشمولة بعد. اختر من القائمة أدناه.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto no-scrollbar pr-1">
                      {includedServices.map((item, idx) => (
                        <div
                          key={item._id || idx}
                          className="p-3 bg-background border border-emerald-500/20 rounded-xl flex items-start justify-between gap-3 shadow-2xs group hover:border-emerald-500/40 transition-all"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {item.image?.url ? (
                              <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                                <Image
                                  src={item.image.url}
                                  alt={item.name}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-11 h-11 rounded-lg shrink-0 bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm font-bold">
                                <FaCheck className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-foreground">
                                  {item.name}
                                </h5>
                                {item.method && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                    {item.method}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleIncludeToExclude(item)}
                              className="px-2 py-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="تحويل إلى استثناء (غير مشمول)"
                            >
                              <FaArrowRightArrowLeft className="w-2.5 h-2.5" />
                              <span>تحويل لمستبعد</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveInclude(item._id)}
                              className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="إزالة من المشمول"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. EXCLUDED SERVICES */}
                <div className="space-y-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                        الخدمات غير المشمولة (الاستثناءات) (
                        {excludedServices.length})
                      </h4>
                    </div>
                  </div>

                  {excludedServices.length === 0 ? (
                    <div className="text-center py-8 bg-background/50 rounded-xl border border-dashed border-rose-500/20 text-xs text-muted-foreground">
                      لم يتم تعيين أي استثناءات بعد.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto no-scrollbar pr-1">
                      {excludedServices.map((item, idx) => (
                        <div
                          key={item._id || idx}
                          className="p-3 bg-background border border-rose-500/20 rounded-xl flex items-start justify-between gap-3 shadow-2xs group hover:border-rose-500/40 transition-all"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {item.image?.url ? (
                              <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-muted border border-border">
                                <Image
                                  src={item.image.url}
                                  alt={item.name}
                                  fill
                                  unoptimized
                                  className="object-cover opacity-80"
                                />
                              </div>
                            ) : (
                              <div className="w-11 h-11 rounded-lg shrink-0 bg-rose-500/10 text-rose-600 flex items-center justify-center text-sm font-bold">
                                <FaXmark className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-foreground">
                                  {item.name}
                                </h5>
                                {item.method && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300">
                                    {item.method}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleExcludeToInclude(item)}
                              className="px-2 py-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="تحويل إلى مشمول في الباقة"
                            >
                              <FaArrowRightArrowLeft className="w-2.5 h-2.5" />
                              <span>تحويل لمشمول</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExclude(item._id)}
                              className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="إزالة من المستبعد"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. CATALOG SERVICES / INCLUSIONS SEARCH & ADD */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      كتالوج المشتملات والخدمات المتاحة
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      ابحث واختر البنود لإضافتها كمشمول أو مستبعد بنقرة واحدة،
                      ويمكنك التبديل بينهما في أي وقت
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setNewInclusionText("");
                        setNewInclusionType("include");
                        setShowInclusionModal(true);
                      }}
                      className="h-10 px-3.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                    >
                      <FaPlus className="w-3 h-3" />
                      <span>إضافة بند جديد</span>
                    </button>
                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        value={serviceSearch ?? ""}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        placeholder="ابحث في المشتملات والخدمات..."
                        className="w-full h-10 px-3.5 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                {filteredCatalogServices.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8 bg-muted/20 rounded-xl">
                    لا توجد بنود أو خدمات مطابقة لبحثك.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto no-scrollbar p-1">
                    {filteredCatalogServices.map((service) => {
                      const isInc = includes.includes(service._id);
                      const isExc = excludes.includes(service._id);

                      return (
                        <div
                          key={service._id}
                          className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                            isInc
                              ? "bg-emerald-500/5 border-emerald-500/30"
                              : isExc
                                ? "bg-rose-500/5 border-rose-500/30"
                                : "bg-background border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-foreground truncate flex-1">
                              {service.name}
                            </span>
                            {service.method && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 font-medium">
                                {service.method}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleAddInclude(service)}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isInc
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                              }`}
                            >
                              <FaCheck className="w-2.5 h-2.5" />
                              <span>{isInc ? "مشمول" : "يشمل"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAddExclude(service)}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isExc
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
                              }`}
                            >
                              <FaXmark className="w-2.5 h-2.5" />
                              <span>{isExc ? "مستبعد" : "لا يشمل"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA (الصور والغلاف) */}
          {activeTab === "media" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  الصور والوسائط
                </h3>
                <p className="text-xs text-muted-foreground">
                  حدد صورة الغلاف الرئيسية وصور المعرض الإضافية
                </p>
              </div>

              {/* Cover Image Section */}
              <div className="p-5 bg-muted/20 rounded-2xl border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <span>صورة الغلاف الرئيسية (Image Cover)</span>
                      <span className="text-rose-500 font-bold">
                        * (إجباري)
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      الصورة المميزة للباقة في بطاقات الموقع وصفحات الهبوط
                      (مطلوبة)
                    </p>
                  </div>
                  <div className="flex items-center bg-background rounded-lg p-0.5 border border-border">
                    <button
                      type="button"
                      onClick={() => setCoverMode("url")}
                      className={`text-xs px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                        coverMode === "url"
                          ? "bg-primary text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      رابط خارجي
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode("file")}
                      className={`text-xs px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                        coverMode === "file"
                          ? "bg-primary text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      رفع من الجهاز
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2 space-y-3">
                    {coverMode === "url" ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">
                            رابط الصورة (URL)
                          </label>
                          <input
                            type="url"
                            value={coverUrl ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCoverUrl(val);
                              setCoverPreview(val);
                            }}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">
                            معرّف الصورة (Public ID)
                          </label>
                          <input
                            type="text"
                            value={coverPublicId ?? ""}
                            onChange={(e) => setCoverPublicId(e.target.value)}
                            placeholder="packages/dubai-cover"
                            className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          اختر ملف الصورة من جهازك
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Preview Cover */}
                  <div className="flex flex-col items-center justify-center p-3 bg-background rounded-xl border border-dashed border-border min-h-[140px]">
                    {coverPreview ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden">
                        <Image
                          src={coverPreview}
                          alt="Cover Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground/50 space-y-1">
                        <FaImage className="w-8 h-8 mx-auto" />
                        <span className="text-[11px] block">
                          لا توجد صورة غلاف
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              <div className="p-5 bg-muted/20 rounded-2xl border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      معرض الصور الإضافية (Gallery)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      صور توضيحية للأماكن والفعاليات
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                    {imagesList.length} صور
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryFilesChange}
                      className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newImgUrl}
                      onChange={(e) => setNewImgUrl(e.target.value)}
                      placeholder="أو أضف رابط صورة..."
                      className="flex-1 h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground text-left dir-ltr"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 h-9 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      إضافة
                    </button>
                  </div>
                </div>

                {imagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {imagesList.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-background"
                      >
                        {img.preview ? (
                          <Image
                            src={img.preview}
                            alt={`Gallery ${idx}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            صورة {idx + 1}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 left-1.5 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="حذف"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HOTELS */}
          {activeTab === "hotels" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    مكان الإقامة
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    اختر فندقاً من قاعدة البيانات أو أضف يدوياً
                  </p>
                </div>
              </div>

              {/* Select accommodation from catalog */}
              <div className="bg-muted/20 rounded-xl border border-border p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-foreground block">
                      اختيار من قاعدة البيانات (فندق / فيلا / كوخ / شاليه):
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      ابحث بالاسم أو اختر مباشرة من القائمة (يتم البحث في
                      السيرفر عبر البارامتر q=)
                    </p>
                  </div>
                  {isLoadingHotelsCatalog && (
                    <span className="text-xs text-primary font-medium flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span>جاري البحث عبر السيرفر...</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <SelectMenu
                    placeholder="-- ابحث أو اختر من القائمة لإضافته للباقة (فندق / فيلا / شاليه / كوخ) --"
                    options={catalogHotelOptions}
                    value=""
                    searchable={true}
                    isLoading={isLoadingHotelsCatalog}
                    onSearch={(query) => setHotelSearchQuery(query)}
                    onChange={(hotelId: string) => {
                      if (hotelId) {
                        const matched =
                          hotelsCatalog?.find(
                            (h: any) =>
                              h._id === hotelId || h.hotelId === hotelId,
                          ) || accumulatedHotels[hotelId];
                        if (matched) {
                          const newAccItem: PackageHotel = {
                            hotel: matched._id || hotelId,
                            name: matched.name || "",
                            link: matched.url || "",
                            url: matched.url || "",
                            meals: matched.mealPlan
                              ? [matched.mealPlan]
                              : ["Breakfast"],
                            stars:
                              matched.stars !== undefined &&
                              matched.stars !== null
                                ? Number(matched.stars)
                                : undefined,
                            rating:
                              matched.rating !== undefined &&
                              matched.rating !== null
                                ? Number(matched.rating)
                                : undefined,
                            ratingWord: matched.ratingWord || "",
                            city: matched.city || "",
                            cityId: matched.cityId || "",
                            address: matched.address || "",
                            image: matched.image || "",
                            type: matched.type || activeHotelType || "hotel",
                            view: matched.view || "",
                            mealPlan: matched.mealPlan || "",
                            hasJacuzzi: Boolean(matched.hasJacuzzi),
                            hasPrivatePool: Boolean(matched.hasPrivatePool),
                            price:
                              matched.price !== undefined &&
                              matched.price !== null
                                ? Number(matched.price)
                                : undefined,
                            currency: matched.currency || "SAR",
                            description:
                              matched.description || matched.overview || "",
                          };
                          setHotels((prev) => [...prev, newAccItem]);
                          toast.success(
                            `تمت إضافة "${matched.name}" إلى الباقة`,
                          );
                        }
                      }
                    }}
                  />

                  {debouncedHotelSearch && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground px-2 py-1.5 bg-background/80 rounded-lg border border-border/60">
                      <span>
                        نتائج البحث عبر السيرفر عن:{" "}
                        <strong className="text-foreground font-mono">
                          &quot;{debouncedHotelSearch}&quot;
                        </strong>{" "}
                        (تم تمرير:{" "}
                        <code className="text-primary font-mono font-bold">
                          ?q={debouncedHotelSearch}
                        </code>
                        )
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setHotelSearchQuery("");
                          setDebouncedHotelSearch("");
                        }}
                        className="text-primary hover:underline font-bold cursor-pointer text-xs"
                      >
                        إلغاء البحث وإظهار الكل
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Header Actions to Add accommodation */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  قائمة الإقامات المضافة ({hotels.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHotelModalType("hotel");
                      setShowHotelModal(true);
                    }}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaPlus className="w-3 h-3" />
                    <span>إضافة فندق جديد</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHotelModalType("cabin");
                      setShowHotelModal(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaPlus className="w-3 h-3" />
                    <span>إضافة كوخ جديد</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHotelModalType("villa");
                      setShowHotelModal(true);
                    }}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaPlus className="w-3 h-3" />
                    <span>إضافة فيلا جديدة</span>
                  </button>
                </div>
              </div>

              {hotels.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border space-y-3">
                  <FaHotel className="w-8 h-8 mx-auto text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground font-medium">
                    لم يتم إضافة أي مكان إقامة بعد، اختر من قاعدة البيانات أعلاه
                    أو أضف إقامة جديدة:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setHotelModalType("hotel");
                        setShowHotelModal(true);
                      }}
                      className="px-3 py-1.5 bg-background hover:bg-muted border border-border text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <FaPlus className="w-3 h-3 text-primary" />
                      <span>+ إضافة فندق جديد</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHotelModalType("cabin");
                        setShowHotelModal(true);
                      }}
                      className="px-3 py-1.5 bg-background hover:bg-muted border border-border text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <FaPlus className="w-3 h-3 text-emerald-500" />
                      <span>+ إضافة كوخ جديد</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHotelModalType("villa");
                        setShowHotelModal(true);
                      }}
                      className="px-3 py-1.5 bg-background hover:bg-muted border border-border text-foreground rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <FaPlus className="w-3 h-3 text-amber-500" />
                      <span>+ إضافة فيلا جديدة</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {hotels.map((hotel, hIdx) => (
                    <div
                      key={hIdx}
                      className="p-4 bg-muted/20 rounded-2xl border border-border space-y-3 relative group"
                    >
                      <button
                        type="button"
                        onClick={() => removeHotel(hIdx)}
                        className="absolute top-3 left-3 p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-3 pl-8">
                        {/* Type Selector & Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              نوع الإقامة:
                            </span>
                            {hotel.type === "hotel" && (
                              <span className="text-[11px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                فندق
                              </span>
                            )}
                            {hotel.type === "cabin" && (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                كوخ
                              </span>
                            )}
                            {hotel.type === "villa" && (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                فيلا
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rich preview card for hotels selected from catalog (hotel.hotel) */}
                        {hotel.hotel && (
                          <div className="p-3.5 bg-background rounded-xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                              {hotel.image ? (
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                                  <Image
                                    src={hotel.image}
                                    alt={hotel.name || "hotel"}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
                                  <FaHotel className="w-6 h-6" />
                                </div>
                              )}
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-foreground">
                                    {hotel.name}
                                  </h4>
                                  {Number(hotel.stars) > 0 && (
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-500">
                                      <FaStar className="w-3 h-3 fill-amber-400" />
                                      <span>{hotel.stars}</span>
                                    </span>
                                  )}
                                  {hotel.rating !== undefined &&
                                    Number(hotel.rating) > 0 && (
                                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                                        {hotel.rating} ★{" "}
                                        {hotel.ratingWord
                                          ? `(${hotel.ratingWord})`
                                          : ""}
                                      </span>
                                    )}
                                </div>

                                {(hotel.city || hotel.address) && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                    <FaLocationDot className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                                    <span>{hotel.city}</span>
                                    {hotel.address && (
                                      <span>• {hotel.address}</span>
                                    )}
                                  </p>
                                )}

                                {/* Chips: View, Jacuzzi, Pool, Meal */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {hotel.view && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                                      {VIEW_LABELS[hotel.view] || hotel.view}
                                    </span>
                                  )}
                                  {hotel.hasJacuzzi && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                      ♨️ جاكوزي
                                    </span>
                                  )}
                                  {hotel.hasPrivatePool && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                      🏊 مسبح خاص
                                    </span>
                                  )}
                                  {hotel.mealPlan && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      🍽️{" "}
                                      {MEAL_LABELS[hotel.mealPlan] ||
                                        hotel.mealPlan}
                                    </span>
                                  )}
                                </div>

                                {hotel.description && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed pt-0.5">
                                    {hotel.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Price and Link */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0 w-full sm:w-auto">
                              {hotel.price !== undefined &&
                              Number(hotel.price) > 0 ? (
                                <span className="text-xs font-black font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                                  {hotel.price} {hotel.currency || "SAR"}
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">
                                  السعر حسب الحجز
                                </span>
                              )}

                              {(hotel.url || hotel.link) && (
                                <a
                                  href={hotel.url || hotel.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-[11px] font-bold flex items-center gap-1"
                                >
                                  <span>رابط الحجز</span>
                                  <FaArrowUpRightFromSquare className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Show details for manually added hotels (no hotel ID) */}
                        {!hotel.hotel && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                  الاسم <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={hotel.name ?? ""}
                                  onChange={(e) =>
                                    updateHotel(hIdx, "name", e.target.value)
                                  }
                                  placeholder={
                                    hotel.type === "cabin"
                                      ? "مثال: كوخ الجبل أو كوخ السحاب"
                                      : hotel.type === "villa"
                                        ? "مثال: فيلا الياسمين الفاخرة"
                                        : "مثال: فندق العنوان دبي مول"
                                  }
                                  className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                  المدينة (City)
                                </label>
                                {citiesList.length > 0 ? (
                                  <div className="space-y-1">
                                    <SelectMenu
                                      value={hotel.cityId || ""}
                                      onChange={(val) => {
                                        const cId = String(val);
                                        const found = citiesList.find(
                                          (c: any) => (c._id || c.id) === cId,
                                        );
                                        updateHotel(hIdx, "cityId", cId);
                                        if (found) {
                                          updateHotel(hIdx, "city", found.name);
                                        }
                                      }}
                                      searchable
                                      options={citiesList.map((c: any) => ({
                                        label: c.name,
                                        value: c._id || c.id,
                                      }))}
                                      placeholder="-- اختر المدينة --"
                                    />
                                    {/* {!hotel.cityId && (
                                      <input
                                        type="text"
                                        value={hotel.city ?? ""}
                                        onChange={(e) =>
                                          updateHotel(
                                            hIdx,
                                            "city",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="أو اكتب اسم المدينة يدوياً..."
                                        className="w-full h-9 px-3 text-[11px] rounded-xl bg-muted/30 border border-border text-foreground"
                                      />
                                    )} */}
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={hotel.city ?? ""}
                                    onChange={(e) =>
                                      updateHotel(hIdx, "city", e.target.value)
                                    }
                                    placeholder="مثال: الرياض، دبي، القاهرة..."
                                    className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                                )}
                              </div>
                            </div>

                            {/* Type Specific Fields */}
                            {hotel.type === "hotel" && (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1">
                                      العنوان / المنطقة (Address)
                                    </label>
                                    <input
                                      type="text"
                                      value={hotel.address ?? ""}
                                      onChange={(e) =>
                                        updateHotel(
                                          hIdx,
                                          "address",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="مثال: الكورنيش، وسط المدينة..."
                                      className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-semibold text-foreground mb-1">
                                        السعر (Price)
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={hotel.price ?? ""}
                                        onChange={(e) =>
                                          updateHotel(
                                            hIdx,
                                            "price",
                                            e.target.value === ""
                                              ? undefined
                                              : Number(e.target.value),
                                          )
                                        }
                                        placeholder="مثال: 850"
                                        className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-foreground mb-1">
                                        العملة
                                      </label>
                                      <SelectMenu
                                        value={hotel.currency ?? "SAR"}
                                        onChange={(val) =>
                                          updateHotel(
                                            hIdx,
                                            "currency",
                                            String(val),
                                          )
                                        }
                                        options={[
                                          { label: "SAR", value: "SAR" },
                                          { label: "AED", value: "AED" },
                                          { label: "USD", value: "USD" },
                                          { label: "EUR", value: "EUR" },
                                        ]}
                                        placeholder="العملة"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1">
                                      عدد النجوم (Stars)
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="7"
                                      value={hotel.stars ?? ""}
                                      onChange={(e) =>
                                        updateHotel(
                                          hIdx,
                                          "stars",
                                          e.target.value === ""
                                            ? undefined
                                            : Number(e.target.value),
                                        )
                                      }
                                      placeholder="مثال: 5"
                                      className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1">
                                      التقييم الرقمي (Rating)
                                    </label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="10"
                                      value={hotel.rating ?? ""}
                                      onChange={(e) =>
                                        updateHotel(
                                          hIdx,
                                          "rating",
                                          e.target.value === ""
                                            ? undefined
                                            : Number(e.target.value),
                                        )
                                      }
                                      placeholder="مثال: 9"
                                      className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1">
                                      وصف التقييم (Rating Word)
                                    </label>
                                    <input
                                      type="text"
                                      value={hotel.ratingWord ?? ""}
                                      onChange={(e) =>
                                        updateHotel(
                                          hIdx,
                                          "ratingWord",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="مثال: ممتاز، رائع"
                                      className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Rating and Price for Cabin or Villa if needed */}
                            {hotel.type !== "hotel" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1">
                                    التقييم الرقمي (Rating){" "}
                                    <span className="text-muted-foreground font-normal">
                                      (اختياري)
                                    </span>
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={hotel.rating ?? ""}
                                    onChange={(e) =>
                                      updateHotel(
                                        hIdx,
                                        "rating",
                                        e.target.value === ""
                                          ? undefined
                                          : Number(e.target.value),
                                      )
                                    }
                                    placeholder="مثال: 8.5"
                                    className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1">
                                    رابط الصورة (Image URL)
                                  </label>
                                  <input
                                    type="url"
                                    value={hotel.image ?? ""}
                                    onChange={(e) =>
                                      updateHotel(hIdx, "image", e.target.value)
                                    }
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr"
                                  />
                                </div>
                              </div>
                            )}

                            {hotel.type === "hotel" && (
                              <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                  رابط صورة الفندق (Image URL)
                                </label>
                                <input
                                  type="url"
                                  value={hotel.image ?? ""}
                                  onChange={(e) =>
                                    updateHotel(hIdx, "image", e.target.value)
                                  }
                                  placeholder="https://example.com/hotel.jpg"
                                  className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr"
                                />
                              </div>
                            )}

                            {/* View Selection (الإطلالة حسب نوع الإقامة) */}
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">
                                الإطلالة (
                                {hotel.type === "cabin"
                                  ? "الكوخ"
                                  : hotel.type === "villa"
                                    ? "الفيلا"
                                    : "الفندق"}
                                ):
                              </label>
                              <div className="flex flex-wrap items-center gap-2">
                                {(
                                  ACCOMMODATION_VIEWS[
                                    (hotel.type as keyof typeof ACCOMMODATION_VIEWS) ||
                                      "hotel"
                                  ] || ACCOMMODATION_VIEWS.hotel
                                ).map((viewKey) => {
                                  const isSelected =
                                    hotel.view === viewKey ||
                                    hotel.view === VIEW_LABELS[viewKey];
                                  return (
                                    <button
                                      key={viewKey}
                                      type="button"
                                      onClick={() =>
                                        updateHotel(
                                          hIdx,
                                          "view",
                                          isSelected ? "" : viewKey,
                                        )
                                      }
                                      className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isSelected
                                          ? "bg-primary/10 border-primary text-primary"
                                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                                      }`}
                                    >
                                      {isSelected && (
                                        <FaCheck className="w-2.5 h-2.5" />
                                      )}
                                      <span>
                                        {VIEW_LABELS[viewKey] || viewKey}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Special Features: Jacuzzi for Cabins, Private Pool for Villas */}
                            {hotel.type === "cabin" && (
                              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      hotel.hasJacuzzi ?? hotel.jacuzzi,
                                    )}
                                    onChange={(e) => {
                                      updateHotel(
                                        hIdx,
                                        "hasJacuzzi",
                                        e.target.checked,
                                      );
                                      updateHotel(
                                        hIdx,
                                        "jacuzzi",
                                        e.target.checked,
                                      );
                                    }}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <div>
                                  <span className="text-xs font-bold text-foreground">
                                    يوجد جاكوزي (hasJacuzzi)
                                  </span>
                                  <p className="text-[11px] text-muted-foreground">
                                    تحديد ما إذا كان الكوخ يحتوي على جاكوزي خاص
                                  </p>
                                </div>
                              </div>
                            )}

                            {hotel.type === "villa" && (
                              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      hotel.hasPrivatePool ?? hotel.pool,
                                    )}
                                    onChange={(e) => {
                                      updateHotel(
                                        hIdx,
                                        "hasPrivatePool",
                                        e.target.checked,
                                      );
                                      updateHotel(
                                        hIdx,
                                        "pool",
                                        e.target.checked,
                                      );
                                    }}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <div>
                                  <span className="text-xs font-bold text-foreground">
                                    مسبح خاص (hasPrivatePool)
                                  </span>
                                  <p className="text-[11px] text-muted-foreground">
                                    تحديد ما إذا كانت الفيلا توفر مسبحاً خاصاً
                                  </p>
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1">
                                الرابط الخارجي (Link / URL)
                              </label>
                              <div className="relative">
                                <input
                                  type="url"
                                  value={hotel.link ?? hotel.url ?? ""}
                                  onChange={(e) => {
                                    updateHotel(hIdx, "link", e.target.value);
                                    updateHotel(hIdx, "url", e.target.value);
                                  }}
                                  placeholder="https://example.com"
                                  className="w-full h-10 px-3 pl-8 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr"
                                />
                                <FaLink className="absolute left-2.5 top-3 w-3 h-3 text-muted-foreground/50" />
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1">
                                الوصف (Description)
                              </label>
                              <textarea
                                rows={2}
                                value={hotel.description ?? ""}
                                onChange={(e) =>
                                  updateHotel(
                                    hIdx,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder={
                                  hotel.type === "cabin"
                                    ? "مثال: كوخ بإطلالة على النهر مع جاكوزي..."
                                    : hotel.type === "villa"
                                      ? "مثال: فيلا بإطلالة على الجبل ومسبح خاص..."
                                      : "مثال: فندق بإطلالة على البحر..."
                                }
                                className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>

                            {/* Calendar */}
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1">
                                التقويم (Calendar)
                              </label>
                              <input
                                type="text"
                                value={hotel.calendar ?? ""}
                                onChange={(e) =>
                                  updateHotel(hIdx, "calendar", e.target.value)
                                }
                                placeholder="رابط التقويم أو معلومات التوفر..."
                                className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          </>
                        )}

                        {/* Meals (for hotels without hotel ID) */}
                        {(!hotel.type || hotel.type === "hotel") &&
                          !hotel.hotel && (
                            <div>
                              <label className="block text-xs font-semibold text-foreground mb-1.5">
                                خطة الوجبات المشمولة للفندق (mealPlan):
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {MEAL_PLANS.map((planKey) => {
                                  const isChecked =
                                    hotel.mealPlan === planKey ||
                                    hotel.meals?.includes(planKey);
                                  return (
                                    <button
                                      key={planKey}
                                      type="button"
                                      onClick={() => {
                                        updateHotel(hIdx, "mealPlan", planKey);
                                        toggleHotelMeal(hIdx, planKey);
                                      }}
                                      className={`text-xs px-3 py-2 rounded-xl border font-bold transition-all flex items-center justify-between text-right cursor-pointer ${
                                        isChecked
                                          ? "bg-primary/10 border-primary text-primary shadow-xs"
                                          : "bg-background border-border text-muted-foreground hover:bg-muted"
                                      }`}
                                    >
                                      <span>
                                        {MEAL_LABELS[planKey] || planKey}
                                      </span>
                                      {isChecked && (
                                        <FaCheck className="w-3 h-3 text-primary shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        {/* Rooms & Beds Configuration (الغرف والأسرة) */}
                        <div className="pt-3 border-t border-border/60 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                <span>
                                  خيارات الغرف والأسرة المحددة (Rooms & Beds)
                                </span>
                                {Array.isArray(hotel.rooms) &&
                                  hotel.rooms.length > 0 && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                      {hotel.rooms.length}
                                    </span>
                                  )}
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                حدد أنواع الغرف والأسرة المتوفرة لهذا الفندق في
                                الباقة (تُرسل في حقل rooms)
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addHotelRoom(hIdx)}
                              className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <FaPlus className="w-2.5 h-2.5" />
                              <span>إضافة غرفة</span>
                            </button>
                          </div>

                          {!hotel.rooms || hotel.rooms.length === 0 ? (
                            <div className="p-3 bg-muted/30 border border-dashed border-border rounded-xl flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                لم يتم تحديد غرف مخصصة لهذا الفندق بعد (اختياري)
                              </span>
                              <button
                                type="button"
                                onClick={() => addHotelRoom(hIdx)}
                                className="text-primary hover:underline font-bold text-xs cursor-pointer"
                              >
                                + إضافة غرفة الآن
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {hotel.rooms.map((roomItem, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="p-3 bg-background border border-border/80 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                                    <div>
                                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                                        نوع الغرفة (roomType)
                                      </label>
                                      <SelectMenu
                                        value={roomItem.roomType || "دابل"}
                                        onChange={(val) =>
                                          updateHotelRoom(
                                            hIdx,
                                            rIdx,
                                            "roomType",
                                            String(val),
                                          )
                                        }
                                        options={HOTEL_ROOM_TYPES.map((rt) => ({
                                          label: rt,
                                          value: rt,
                                        }))}
                                        placeholder="نوع الغرفة"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                                        نوع السرير (bedType)
                                      </label>
                                      <SelectMenu
                                        value={roomItem.bedType || "مزدوج"}
                                        onChange={(val) =>
                                          updateHotelRoom(
                                            hIdx,
                                            rIdx,
                                            "bedType",
                                            String(val),
                                          )
                                        }
                                        options={HOTEL_BED_TYPES.map((bt) => ({
                                          label: bt,
                                          value: bt,
                                        }))}
                                        placeholder="نوع السرير"
                                      />
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeHotelRoom(hIdx, rIdx)}
                                    className="self-end sm:self-center p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                                    title="حذف الغرفة"
                                  >
                                    <FaTrash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Shared Hotel Creation Modal */}
              {showHotelModal && (
                <HotelModal
                  isOpen={showHotelModal}
                  onClose={() => setShowHotelModal(false)}
                  defaultType={hotelModalType}
                  onSuccess={async (newHotel) => {
                    try {
                      await refetchHotelsCatalog();
                    } catch (e) {
                      console.error("Refetch catalog error:", e);
                    }

                    const newAccItem: PackageHotel = {
                      hotel: newHotel._id || newHotel.hotelId || "",
                      name: newHotel.name || "",
                      link: newHotel.url || "",
                      url: newHotel.url || "",
                      meals: newHotel.mealPlan ? [newHotel.mealPlan] : ["HB"],
                      stars:
                        newHotel.stars !== undefined && newHotel.stars !== null
                          ? Number(newHotel.stars)
                          : undefined,
                      rating:
                        newHotel.rating !== undefined && newHotel.rating !== null
                          ? Number(newHotel.rating)
                          : undefined,
                      ratingWord: newHotel.ratingWord || "",
                      city: newHotel.city || "",
                      cityId: newHotel.cityId || "",
                      address: newHotel.address || "",
                      image: newHotel.image || "",
                      type: newHotel.type || hotelModalType,
                      view: newHotel.view || "",
                      mealPlan: newHotel.mealPlan || "HB",
                      hasJacuzzi: Boolean(newHotel.hasJacuzzi),
                      hasPrivatePool: Boolean(newHotel.hasPrivatePool),
                      price:
                        newHotel.price !== undefined && newHotel.price !== null
                          ? Number(newHotel.price)
                          : undefined,
                      currency: newHotel.currency || "SAR",
                      description: newHotel.description || "",
                    };

                    setHotels((prev) => [...prev, newAccItem]);
                    toast.success(
                      `تمت إضافة "${newHotel.name}" واختياره في الباقة بنجاح`,
                    );
                  }}
                />
              )}
            </div>
          )}

          {/* TAB: VARIANTS (فئات وجولات الباقة) */}
          {activeTab === "variants" && (
            <PackageVariantsManager
              variants={variants}
              onChange={setVariants}
              packageId={packageId}
              countrySlug={currentCountrySlug}
              isEditMode={mode === "edit"}
            />
          )}

          {/* TAB: OFFER & PRICES (العرض والأسعار) */}
          {activeTab === "offer" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  العرض الترويجي والأسعار
                </h3>
                <p className="text-xs text-muted-foreground">
                  حدد السعر، نسبة الخصم، وتواريخ سريان العرض
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    السعر بعد الخصم / السعر الحالي (New Price){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newPrice ?? ""}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="2500"
                      className="w-full h-11 px-4 text-sm rounded-xl bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 text-left dir-ltr"
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-muted-foreground">
                      ر.س
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    السعر قبل الخصم (Old Price) - يجب أن يكون أعلى من السعر بعد
                    الخصم
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={oldPrice ?? ""}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="3200"
                      className={`w-full h-11 px-4 text-sm rounded-xl bg-background border text-foreground font-mono focus:outline-none focus:ring-2 text-left dir-ltr ${
                        oldPrice &&
                        newPrice &&
                        Number(oldPrice) <= Number(newPrice)
                          ? "border-rose-500 focus:ring-rose-500/20"
                          : "border-border focus:ring-primary/20"
                      }`}
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-muted-foreground">
                      ر.س
                    </span>
                  </div>
                  {oldPrice &&
                    newPrice &&
                    Number(oldPrice) <= Number(newPrice) && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">
                        ⚠️ تنبيه: السعر قبل الخصم ({oldPrice}) يجب أن يكون أكبر
                        من السعر بعد الخصم ({newPrice})
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    تاريخ بداية العرض
                  </label>
                  <input
                    type="date"
                    value={startDate ?? ""}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    تاريخ انتهاء العرض
                  </label>
                  <input
                    type="date"
                    value={endDate ?? ""}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {discountPercent !== null && discountPercent > 0 && (
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      عرض تخفيض خاص مفعل
                    </h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      يوفر العميل{" "}
                      {(Number(oldPrice) - Number(newPrice)).toLocaleString()}{" "}
                      ر.س
                    </p>
                  </div>
                  <span className="text-sm font-black px-3 py-1 bg-emerald-600 text-white rounded-xl shadow-xs">
                    خصم {discountPercent}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB: SEO (السيو) */}
          {activeTab === "seo" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground">
                  تهيئة محركات البحث المتقدمة (SEO)
                </h3>
                <p className="text-xs text-muted-foreground">
                  الكلمات المفتاحية، الأولوية، تردد التحديث، وتوجيهات روبوتات
                  الفهرسة
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      عنوان السيو (Meta Title)
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {seoTitle.length} حرف
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle ?? ""}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={name || "رحلة سياحية إلى دبي 5 أيام"}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      وصف السيو (Meta Description)
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      {seoDesc.length} / 160 حرف
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDesc ?? ""}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    placeholder="استمتع برحلة سياحية مميزة إلى دبي لمدة 5 أيام تشمل الإقامة والجولات..."
                    className="w-full px-4 py-3 text-sm rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
                  />
                </div>

                {/* Keywords Manager */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-foreground">
                    الكلمات المفتاحية (Keywords)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newKeywordInput}
                      onChange={(e) => setNewKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      placeholder="أدخل كلمة مفتاحية واضغط إضافة..."
                      className="flex-1 h-10 px-3.5 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-4 h-10 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      + إضافة
                    </button>
                  </div>

                  {seoKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {seoKeywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs rounded-lg font-bold"
                        >
                          <span>#{kw}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(kw)}
                            className="text-primary hover:text-rose-600 cursor-pointer"
                          >
                            <FaXmark className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority & Change Frequency */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    أولوية الصفحة (Sitemap Priority): {seoPriority}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={seoPriority}
                    onChange={(e) => setSeoPriority(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>منخفض (0.1)</span>
                    <span>افتراضي (0.5)</span>
                    <span>مرتفع (1.0)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    تردد التحديث (Change Frequency)
                  </label>
                  <SelectMenu
                    value={seoChangeFrequency}
                    onChange={(val) => setSeoChangeFrequency(String(val))}
                    options={CHANGE_FREQUENCIES}
                  />
                </div>

                {/* Robots Directives */}
                <div className="md:col-span-2 space-y-2 pt-2">
                  <label className="block text-xs font-bold text-foreground mb-1">
                    توجيهات روبوتات الفهرسة (Robots Directives)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <label className="flex items-center gap-2 p-3 bg-muted/20 border border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={seoNoIndex}
                        onChange={(e) => setSeoNoIndex(e.target.checked)}
                        className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-foreground">
                        noIndex (منع الفهرسة)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-muted/20 border border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={seoNoFollow}
                        onChange={(e) => setSeoNoFollow(e.target.checked)}
                        className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-foreground">
                        noFollow (منع تتبع الروابط)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-muted/20 border border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={seoNoArchive}
                        onChange={(e) => setSeoNoArchive(e.target.checked)}
                        className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-foreground">
                        noArchive (منع الأرشفة)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-3 bg-muted/20 border border-border rounded-xl cursor-pointer hover:bg-muted/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={seoNoSnippet}
                        onChange={(e) => setSeoNoSnippet(e.target.checked)}
                        className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-foreground">
                        noSnippet (منع المقتطف)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Google Snippet Live Preview */}
              <div className="p-4 bg-muted/20 rounded-2xl border border-border space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  معاينة محرك البحث (Google Snippet Preview)
                </span>
                <p className="text-xs text-emerald-600 font-mono dir-ltr text-left truncate">
                  https://tourism-domain.com/packages/{slug || "dubai-package"}
                </p>
                <h4 className="text-sm font-bold text-blue-600 hover:underline cursor-pointer truncate">
                  {seoTitle || name || "عنوان الباقة السياحية"}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {seoDesc ||
                    description ||
                    "استمتع بأفضل العروض والبرامج السياحية مع منصة السياحة والسفر..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          {activeTab !== "basic" ? (
            <button
              type="button"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx > 0) setActiveTab(TABS[idx - 1].id);
              }}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FaArrowRight className="w-3 h-3" />
              <span>القسم السابق</span>
            </button>
          ) : (
            <div />
          )}

          {activeTab !== "seo" && (
            <button
              type="button"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx < TABS.length - 1) handleTabChange(TABS[idx + 1].id);
              }}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>القسم التالي</span>
              <FaArrowLeft className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {/* Modal for adding a new inclusion/exclusion item directly */}
      <Modal
        isOpen={showInclusionModal}
        onClose={() => setShowInclusionModal(false)}
        className="max-w-md p-6"
      >
        <div className="space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground">
              {newInclusionType === "include"
                ? "إضافة بند مشمول جديد"
                : "إضافة استثناء غير مشمول جديد"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              أدخل اسم البند وحدد تصنيفه ليتم حفظه وإضافته للباقة فوراً
            </p>
          </div>

          <div className="space-y-4">
            {/* Item text */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                اسم البند أو الخدمة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newInclusionText}
                onChange={(e) => setNewInclusionText(e.target.value)}
                placeholder="مثال: الإقامة في فنادق 4 نجوم، تذاكر الطيران، وجبة الإفطار..."
                className="w-full h-10 px-3.5 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateInclusionItem(e);
                  }
                }}
              />
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                التصنيف (مشمول أم غير مشمول){" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewInclusionType("include")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    newInclusionType === "include"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <FaCheck className="w-3 h-3" />
                  <span>مشمول (Include)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewInclusionType("exclude")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    newInclusionType === "exclude"
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <FaXmark className="w-3 h-3" />
                  <span>غير مشمول (Exclude)</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setShowInclusionModal(false)}
                disabled={isSubmittingInclusion}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleCreateInclusionItem}
                disabled={isSubmittingInclusion || !newInclusionText.trim()}
                className="px-5 py-2 text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isSubmittingInclusion && <Spinner />}
                <span>حفظ وإضافة للباقة</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </form>
  );
}
