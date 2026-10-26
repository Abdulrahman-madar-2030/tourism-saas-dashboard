"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FaHotel,
  FaStar,
  FaLocationDot,
  FaCity,
  FaAward,
  FaPlus,
  FaPencil,
  FaTrash,
  FaArrowUpRightFromSquare,
  FaMagnifyingGlass,
  FaTableList,
  FaTableCellsLarge,
  FaArrowRotateRight,
  FaEye,
} from "react-icons/fa6";
import { TbSeo } from "react-icons/tb";

import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Spinner from "@/components/ui/Spinner/Spinner";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import HotelModal from "@/components/common/HotelModal/HotelModal";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import { Seo } from "@/types/seoTypes";
import { HotelItem } from "@/types/hotelType";
import { useCrud } from "@/hooks/useCrudQuery";

import { ACCOMMODATION_TYPES, ACCOMMODATION_VIEWS, MEAL_PLANS, AccommodationType } from "@/types/packageTypes";

export { ACCOMMODATION_TYPES, ACCOMMODATION_VIEWS, MEAL_PLANS };

export const VIEW_LABELS: Record<string, string> = {
  sea: "مطل على البحر",
  city: "مطل على المدينة",
  mountain: "مطل على الجبل",
  courtyard: "مطل على الفناء الداخلي",
  garden: "مطل على الحديقة",
  river: "مطل على النهر",
  plains: "مطل على السهول",
};

export const MEAL_LABELS: Record<string, string> = {
  BB: "شامل الإفطار (BB)",
  HB: "إفطار وعشاء (HB)",
  FB: "إفطار وغداء وعشاء (FB)",
  ALL_INCLUSIVE: "شامل كلياً (All Inclusive)",
};

interface HotelFormData {
  hotelId?: string;
  name: string;
  description?: string;
  cityId: string;
  type?: AccommodationType;
  address?: string;
  price?: number | string | null;
  currency?: string;
  stars?: number | string;
  rating?: number | string;
  ratingWord?: string;
  image?: string;
  url?: string;
  view?: string;
  mealPlan?: string;
  hasJacuzzi?: boolean;
  hasPrivatePool?: boolean;
  lat?: number | string;
  lng?: number | string;
}

export default function HotelsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAccommodationType, setSelectedAccommodationType] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedStars, setSelectedStars] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc" | "stars">("rating");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelItem | null>(null);
  const [editingSeoHotel, setEditingSeoHotel] = useState<HotelItem | null>(null);
  const [deletingHotelId, setDeletingHotelId] = useState<string | null>(null);

  // Debounce search term by 400ms to avoid unnecessary requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch hotels from the API endpoint: /hotels/admin
  const {
    data: hotelsData,
    isLoading,
    isRefetching,
    refetch,
    createItem: createHotel,
    updateItem: updateHotel,
    deleteItem: deleteHotel,
  } = useCrud<{ hotels: HotelItem[]; meta?: any }>({
    queryKey: ["hotels", debouncedSearch],
    endpoint: "/hotels/admin",
    params: {
      page: 1,
      limit: 100,
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
    },
    select: (res: any) => {
      const dataObj = res?.data ?? res;
      const hotelsArr =
        dataObj?.hotels ??
        dataObj?.data?.hotels ??
        dataObj?.data ??
        (Array.isArray(dataObj) ? dataObj : []);
      return {
        hotels: Array.isArray(hotelsArr) ? hotelsArr : [],
        meta: dataObj?.meta,
        results: res?.results ?? hotelsArr?.length ?? 0,
      };
    },
    handleCloseModal: () => {
      setShowCreateModal(false);
      setShowSeoModal(false);
    },
  });

  // Fetch cities for dropdown
  const { data: citiesData } = useCrud<{ cities: any[] }>({
    queryKey: ["cities"],
    endpoint: "/cities",
    select: (res: any) => {
      const dataObj = res?.data ?? res;
      const citiesArr =
        dataObj?.cities ??
        dataObj?.data?.cities ??
        dataObj?.data ??
        (Array.isArray(dataObj) ? dataObj : []);
      return {
        cities: Array.isArray(citiesArr) ? citiesArr : [],
      };
    },
  });

  const citiesList = citiesData?.cities || [];

  const hotelsList: HotelItem[] = useMemo(
    () => hotelsData?.hotels || [],
    [hotelsData?.hotels]
  );

  // Form for create / edit
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<HotelFormData>({
    defaultValues: {
      name: "",
      cityId: "",
      address: "",
      price: "",
      currency: "SAR",
      stars: 5,
      rating: 8.5,
      ratingWord: "جيد جداً",
      image: "",
      url: "",
      type: "hotel",
      view: "sea",
      mealPlan: "HB",
      hasJacuzzi: false,
      hasPrivatePool: false,
      lat: "",
      lng: "",
    },
  });

  const selectedType = watch("type") || "hotel";
  const selectedView = watch("view");
  const selectedMealPlan = watch("mealPlan");
  const hasJacuzziVal = watch("hasJacuzzi");
  const hasPrivatePoolVal = watch("hasPrivatePool");
  const latVal = watch("lat");
  const lngVal = watch("lng");

  // Calculate unique cities and stats
  const { uniqueCities, stats } = useMemo(() => {
    const citiesSet = new Set<string>();
    let totalPrice = 0;
    let totalRating = 0;
    let pricedCount = 0;
    let ratedCount = 0;

    hotelsList.forEach((h) => {
      if (h.city) citiesSet.add(h.city);
      if (h.price !== undefined && h.price !== null && !isNaN(Number(h.price)) && Number(h.price) > 0) {
        totalPrice += Number(h.price);
        pricedCount++;
      }
      if (h.rating) {
        totalRating += Number(h.rating);
        ratedCount++;
      }
    });

    return {
      uniqueCities: Array.from(citiesSet),
      stats: {
        total: hotelsList.length,
        citiesCount: citiesSet.size,
        avgRating: ratedCount ? (totalRating / ratedCount).toFixed(1) : "0.0",
        avgPrice: pricedCount ? Math.round(totalPrice / pricedCount) : 0,
      },
    };
  }, [hotelsList]);

  const accommodationTypeOptions = useMemo(
    () => [
      { label: "كل الأنواع (فنادق، أكواخ، فلل)", value: "all" },
      { label: "🏨 فندق", value: "hotel" },
      { label: "🏡 كوخ", value: "cabin" },
      { label: "🏰 فيلا", value: "villa" },
    ],
    []
  );

  const cityOptions = useMemo(
    () => [
      { label: `جميع المدن (${uniqueCities.length})`, value: "all" },
      ...uniqueCities.map((city) => ({ label: city, value: city })),
    ],
    [uniqueCities]
  );

  const starsOptions = useMemo(
    () => [
      { label: "كل النجوم", value: "all" },
      { label: "5 نجوم ⭐⭐⭐⭐⭐", value: "5" },
      { label: "4 نجوم ⭐⭐⭐⭐", value: "4" },
      { label: "3 نجوم ⭐⭐⭐", value: "3" },
    ],
    []
  );

  const sortByOptions = useMemo(
    () => [
      { label: "الأعلى تقييماً", value: "rating" },
      { label: "النجوم (الأعلى)", value: "stars" },
      { label: "السعر (الأقل أولاً)", value: "price-asc" },
      { label: "السعر (الأعلى أولاً)", value: "price-desc" },
    ],
    []
  );

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    return hotelsList
      .filter((hotel) => {
        const matchesSearch =
          !searchTerm ||
          (hotel.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (hotel.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (hotel.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          Boolean(debouncedSearch);

        const matchesType =
          selectedAccommodationType === "all" ||
          (hotel.type || "hotel") === selectedAccommodationType;

        const matchesCity =
          selectedCity === "all" || hotel.city === selectedCity;

        const matchesStars =
          selectedStars === "all" || String(hotel.stars) === selectedStars;

        return matchesSearch && matchesType && matchesCity && matchesStars;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "price-asc") return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sortBy === "price-desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (sortBy === "stars") return (b.stars || 0) - (a.stars || 0);
        return 0;
      });
  }, [
    hotelsList,
    searchTerm,
    debouncedSearch,
    selectedAccommodationType,
    selectedCity,
    selectedStars,
    sortBy,
  ]);

  // Handle open create
  const handleOpenCreate = () => {
    setSelectedHotel(null);
    reset({
      name: "",
      cityId: "",
      address: "",
      price: "",
      currency: "SAR",
      stars: 5,
      rating: 8.5,
      ratingWord: "جيد جداً",
      image: "",
      url: "",
      type: "hotel",
      view: "sea",
      mealPlan: "HB",
      hasJacuzzi: false,
      hasPrivatePool: false,
      description: "",
      lat: "",
      lng: "",
    });
    setShowCreateModal(true);
  };

  // Handle open edit
  const handleOpenEdit = (hotel: HotelItem) => {
    setSelectedHotel(hotel);

    // Use cityId if present, otherwise resolve it from the city name
    const resolvedCityId =
      hotel.cityId ||
      citiesList.find((c: any) => c.name === hotel.city)?._id ||
      "";

    const defaultView = hotel.view || (hotel.type === "cabin" ? "river" : hotel.type === "villa" ? "mountain" : "sea");

    reset({
      hotelId: hotel.hotelId,
      name: hotel.name,
      address: hotel.address || "",
      price: hotel.price !== undefined && hotel.price !== null ? hotel.price : "",
      currency: hotel.currency || "SAR",
      stars: hotel.stars || 5,
      rating: hotel.rating || 8.0,
      ratingWord: hotel.ratingWord || "جيد جداً",
      image: hotel.image || "",
      url: hotel.url || "",
      type: (hotel.type as AccommodationType) || "hotel",
      description: hotel.description || "",
      cityId: resolvedCityId,
      view: defaultView,
      mealPlan: hotel.mealPlan || "HB",
      hasJacuzzi: Boolean(hotel.hasJacuzzi),
      hasPrivatePool: Boolean(hotel.hasPrivatePool),
      lat: hotel.lat ?? hotel.latitude ?? "",
      lng: hotel.lng ?? hotel.longitude ?? "",
    });
    setShowCreateModal(true);
  };

  // Submit hotel form
  const onSubmitHotel = async (formData: HotelFormData) => {
    try {
      const type = formData.type || "hotel";
      const parsedLat =
        formData.lat !== undefined && formData.lat !== null && formData.lat !== ""
          ? Number(formData.lat)
          : undefined;
      const parsedLng =
        formData.lng !== undefined && formData.lng !== null && formData.lng !== ""
          ? Number(formData.lng)
          : undefined;

      let body: any = {
        type,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        view: formData.view || undefined,
        ...(type !== "cabin" || formData.cityId ? { cityId: formData.cityId } : {}),
        ...(parsedLat !== undefined && { lat: parsedLat }),
        ...(parsedLng !== undefined && { lng: parsedLng }),
      };

      if (type === "hotel") {
        const parsedPrice =
          formData.price !== undefined &&
          formData.price !== null &&
          formData.price !== ""
            ? Number(formData.price)
            : undefined;

        body = {
          ...body,
          address: formData.address?.trim() || undefined,
          price: parsedPrice,
          currency: formData.currency || "SAR",
          stars: formData.stars !== undefined && formData.stars !== "" ? Number(formData.stars) : undefined,
          rating: formData.rating !== undefined && formData.rating !== "" ? Number(formData.rating) : undefined,
          ratingWord: formData.ratingWord?.trim() || undefined,
          image: formData.image?.trim() || undefined,
          url: formData.url?.trim() || undefined,
          mealPlan: formData.mealPlan || "HB",
        };
      } else if (type === "cabin") {
        body = {
          ...body,
          hasJacuzzi: Boolean(formData.hasJacuzzi),
          image: formData.image?.trim() || undefined,
          url: formData.url?.trim() || undefined,
          address: formData.address?.trim() || undefined,
          price: formData.price !== undefined && formData.price !== "" ? Number(formData.price) : undefined,
          currency: formData.currency || undefined,
          rating: formData.rating !== undefined && formData.rating !== "" ? Number(formData.rating) : undefined,
        };
      } else if (type === "villa") {
        body = {
          ...body,
          hasPrivatePool: Boolean(formData.hasPrivatePool),
          image: formData.image?.trim() || undefined,
          url: formData.url?.trim() || undefined,
          address: formData.address?.trim() || undefined,
          price: formData.price !== undefined && formData.price !== "" ? Number(formData.price) : undefined,
          currency: formData.currency || undefined,
          rating: formData.rating !== undefined && formData.rating !== "" ? Number(formData.rating) : undefined,
        };
      }

      const payload = { body };
      const targetId = selectedHotel?.hotelId || selectedHotel?._id;

      if (targetId) {
        await updateHotel({
          id: targetId,
          endpoint: "/hotels/admin",
          ...payload,
        });
      } else {
        await createHotel({
          endpoint: "/hotels/admin",
          ...payload,
        });
      }

      setShowCreateModal(false);
      await refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حفظ المكان");
    }
  };

  // Submit SEO
  const handleSeoSubmit = async (seoData: Seo) => {
    const targetId = editingSeoHotel?.hotelId || editingSeoHotel?._id;
    if (!targetId) return toast.error("الفندق غير محدد");

    try {
      await updateHotel({
        id: targetId,
        endpoint: "/hotels/admin",
        body: { seo: seoData },
      });
      setShowSeoModal(false);
      await refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "فشل في تحديث SEO");
    }
  };

  // Delete hotel
  const handleDeleteHotel = async (hotel: HotelItem) => {
    const targetId = hotel.hotelId || hotel._id;
    if (!targetId) return;
    if (!confirm(`هل أنت متأكد من حذف فندق "${hotel.name}"؟`)) return;

    setDeletingHotelId(targetId);
    try {
      await deleteHotel(`/hotels/admin/${targetId}`);
      await refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "فشل حذف الفندق");
    } finally {
      setDeletingHotelId(null);
    }
  };

  if (isLoading && !hotelsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Spinner />
        <p className="text-xs text-muted-foreground font-medium">
          جاري جلب قائمة الفنادق من السيرفر...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageHeader
            pageName="إدارة الفنادق"
            pageDescription="استعراض والتحكم بقائمة الفنادق العالمية، الأسعار، والتقييمات"
            PageIcon={FaHotel}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="تحديث البيانات"
          >
            <FaArrowRotateRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FaPlus className="w-3 h-3" />
            <span>إضافة فندق جديد</span>
          </button>
        </div>
      </div>

      <BreadCrumb breadCrumbItems="الخدمات والرحلات السياحية / إدارة الفنادق" />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-background rounded-2xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن الفندق بالاسم أو المدينة أو العنوان..."
              className="w-full h-11 pr-10 pl-4 text-xs rounded-xl bg-muted/30 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
            {isRefetching || searchTerm.trim() !== debouncedSearch ? (
              <FaArrowRotateRight className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-primary animate-spin" />
            ) : (
              <FaMagnifyingGlass className="absolute right-3.5 top-3.5 w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>

          {/* Filters & View Switches */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Accommodation Type Filter */}
            <div className="min-w-[150px]">
              <SelectMenu
                value={selectedAccommodationType}
                onChange={(val) => setSelectedAccommodationType(String(val))}
                options={accommodationTypeOptions}
                placeholder="نوع الإقامة"
              />
            </div>

            {/* City Filter */}
            <div className="min-w-[150px]">
              <SelectMenu
                value={selectedCity}
                onChange={(val) => setSelectedCity(String(val))}
                options={cityOptions}
                searchable
                placeholder="المدينة"
              />
            </div>

            {/* Stars Filter */}
            <div className="min-w-[130px]">
              <SelectMenu
                value={selectedStars}
                onChange={(val) => setSelectedStars(String(val))}
                options={starsOptions}
                placeholder="النجوم"
              />
            </div>

            {/* Sort Select */}
            <div className="min-w-[140px]">
              <SelectMenu
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                options={sortByOptions}
                placeholder="الترتيب"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-muted/40 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="عرض شبكي (كروت)"
              >
                <FaTableCellsLarge className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="عرض جدول"
              >
                <FaTableList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Cards Grid View */}
      {viewMode === "grid" && (
        <>
          {filteredHotels.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-2xl border border-dashed border-border space-y-3">
              <FaHotel className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground font-medium">
                لا توجد فنادق مطابقة للبحث والفلاتر المحددة
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedAccommodationType("all");
                  setSelectedCity("all");
                  setSelectedStars("all");
                }}
                className="text-xs text-primary font-bold hover:underline"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredHotels.map((hotel, idx) => (
                <div
                  key={hotel.hotelId || hotel._id || idx}
                  className="bg-background rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Hotel Cover Image */}
                    <div className="relative w-full h-44 bg-muted overflow-hidden">
                      {hotel.image ? (
                        <Image
                          src={hotel.image}
                          alt={hotel.name || "hotel"}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <FaHotel className="w-10 h-10" />
                        </div>
                      )}

                      {/* Type Badge */}
                      <div className={`absolute top-2.5 right-2.5 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs ${
                        hotel.type === "villa"
                          ? "bg-amber-600/90"
                          : hotel.type === "cabin"
                          ? "bg-emerald-600/90"
                          : "bg-primary/90"
                      }`}>
                        {hotel.type === "villa" ? "🏰 فيلا" : hotel.type === "cabin" ? "🏡 كوخ" : "🏨 فندق"}
                      </div>

                      {/* Stars Overlay Badge (Only if stars > 0) */}
                      {Number(hotel.stars) > 0 && (
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-400 px-2 py-1 rounded-lg text-xs font-bold shadow-xs">
                          <FaStar className="w-3 h-3 fill-amber-400" />
                          <span>{hotel.stars}</span>
                        </div>
                      )}

                      {/* City Chip */}
                      <div className="absolute bottom-2.5 right-2.5 bg-background/90 backdrop-blur-md text-foreground px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs">
                        <FaCity className="w-3 h-3 text-primary" />
                        <span>{hotel.city}</span>
                      </div>

                      {/* Price Badge */}
                      {hotel.price !== undefined && hotel.price !== null && !isNaN(Number(hotel.price)) && Number(hotel.price) > 0 ? (
                        <div className="absolute bottom-2.5 left-2.5 bg-primary text-white px-2.5 py-1 rounded-lg text-xs font-black shadow-xs font-mono">
                          {hotel.price} {hotel.currency || "SAR"}
                          <span className="text-[10px] font-normal mr-1">/ ليلة</span>
                        </div>
                      ) : (
                        <div className="absolute bottom-2.5 left-2.5 bg-muted/80 backdrop-blur-md text-muted-foreground px-2 py-0.5 rounded-lg text-[10px] font-medium shadow-xs">
                          السعر حسب التوفر
                        </div>
                      )}
                    </div>

                    {/* Hotel Details */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {hotel.name}
                        </h3>
                        {hotel.address && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                            <FaLocationDot className="w-2.5 h-2.5 text-muted-foreground/60 shrink-0" />
                            <span className="truncate">{hotel.address}</span>
                          </p>
                        )}
                      </div>

                      {/* Features / Badges: View, Jacuzzi, Pool, Meal */}
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
                            🍽️ {MEAL_LABELS[hotel.mealPlan] || hotel.mealPlan}
                          </span>
                        )}
                      </div>

                      {/* Rating Word & Score */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/60">
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {hotel.ratingWord || "تقييم النزلاء"}
                        </span>
                        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-xs font-black font-mono">
                          <FaAward className="w-3 h-3 text-emerald-600" />
                          <span>{hotel.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/hotels/${hotel.hotelId || hotel._id}`}
                        className="p-2 text-muted-foreground hover:text-sky-600 hover:bg-sky-500/10 rounded-xl transition-colors cursor-pointer text-xs"
                        title="عرض تفاصيل الفندق"
                      >
                        <FaEye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(hotel)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer text-xs"
                        title="تعديل بيانات الفندق"
                      >
                        <FaPencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSeoHotel(hotel);
                          setShowSeoModal(true);
                        }}
                        className="p-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors cursor-pointer text-xs"
                        title="إعدادات SEO"
                      >
                        <TbSeo className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingHotelId === (hotel.hotelId || hotel._id)}
                        onClick={() => handleDeleteHotel(hotel)}
                        className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        title="حذف الفندق"
                      >
                        {deletingHotelId === (hotel.hotelId || hotel._id) ? (
                          <span className="w-3.5 h-3.5 inline-block border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTrash className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {hotel.url && (
                      <Link
                        href={hotel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-primary hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>رابط الحجز</span>
                        <FaArrowUpRightFromSquare className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Hotel Table View */}
      {viewMode === "table" && (
        <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-bold">
                <tr>
                  <th className="py-3 px-4">الصورة</th>
                  <th className="py-3 px-4">النوع</th>
                  <th className="py-3 px-4">اسم الفندق</th>
                  <th className="py-3 px-4">المدينة / العنوان</th>
                  <th className="py-3 px-4">النجوم</th>
                  <th className="py-3 px-4">التقييم</th>
                  <th className="py-3 px-4">السعر / ليلة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredHotels.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      لا توجد فنادق مطابقة للبحث المختار
                    </td>
                  </tr>
                ) : (
                  filteredHotels.map((hotel, idx) => (
                    <tr
                      key={hotel.hotelId || hotel._id || idx}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                          {hotel.image ? (
                            <Image
                              src={hotel.image}
                              alt={hotel.name || "hotel"}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <FaHotel className="w-5 h-5 m-auto text-muted-foreground/30" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${
                          hotel.type === "villa"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                            : hotel.type === "cabin"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}>
                          {hotel.type === "villa" ? "🏰 فيلا" : hotel.type === "cabin" ? "🏡 كوخ" : "🏨 فندق"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        <div>
                          <span>{hotel.name}</span>
                          {hotel.hotelId && (
                            <span className="block text-[10px] text-muted-foreground font-mono">
                              {hotel.hotelId}
                            </span>
                          )}
                          {/* Badges for View, Jacuzzi, Pool, Meal Plan */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {hotel.view && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                {VIEW_LABELS[hotel.view] || hotel.view}
                              </span>
                            )}
                            {hotel.hasJacuzzi && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                ♨️ جاكوزي
                              </span>
                            )}
                            {hotel.hasPrivatePool && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                🏊 مسبح خاص
                              </span>
                            )}
                            {hotel.mealPlan && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                🍽️ {hotel.mealPlan}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground">
                            {hotel.city}
                          </span>
                          {hotel.address && (
                            <span className="block text-[11px] text-muted-foreground truncate max-w-xs">
                              {hotel.address}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {Number(hotel.stars) > 0 ? (
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <FaStar className="w-3 h-3 fill-amber-400" />
                            <span>{hotel.stars}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-xs font-black font-mono">
                          <span>{hotel.rating}</span>
                          <span className="text-[10px] font-normal">
                            ({hotel.ratingWord})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-black font-mono text-primary text-sm">
                        {hotel.price !== undefined && hotel.price !== null && !isNaN(Number(hotel.price)) && Number(hotel.price) > 0 ? (
                          `${hotel.price} ${hotel.currency || "SAR"}`
                        ) : (
                          <span className="text-muted-foreground text-xs font-normal font-sans">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/dashboard/hotels/${hotel.hotelId || hotel._id}`}
                            className="p-2 text-muted-foreground hover:text-sky-600 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                            title="عرض التفاصيل"
                          >
                            <FaEye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(hotel)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            title="تعديل"
                          >
                            <FaPencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSeoHotel(hotel);
                              setShowSeoModal(true);
                            }}
                            className="p-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                            title="SEO"
                          >
                            <TbSeo className="w-4 h-4" />
                          </button>
                          {hotel.url && (
                            <Link
                              href={hotel.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="فتح الرابط"
                            >
                              <FaArrowUpRightFromSquare className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            type="button"
                            disabled={deletingHotelId === (hotel.hotelId || hotel._id)}
                            onClick={() => handleDeleteHotel(hotel)}
                            className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="حذف"
                          >
                            {deletingHotelId === (hotel.hotelId || hotel._id) ? (
                              <span className="w-3.5 h-3.5 inline-block border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaTrash className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Hotel Modal (Shared Component) */}
      <HotelModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedHotel(null);
        }}
        hotelToEdit={selectedHotel}
        onSuccess={async () => {
          await refetch();
        }}
      />

      {/* SEO Modal */}
      <Modal isOpen={showSeoModal} onClose={() => setShowSeoModal(false)}>
        <FormSEO
          onSubmit={handleSeoSubmit}
          defaultValues={{
            ...editingSeoHotel?.seo,
            slug: editingSeoHotel?.slug || editingSeoHotel?.hotelId,
          }}
        />
      </Modal>
    </div>
  );
}