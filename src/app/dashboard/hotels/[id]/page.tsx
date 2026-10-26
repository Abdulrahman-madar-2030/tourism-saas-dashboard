"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaHotel,
  FaStar,
  FaLocationDot,
  FaCity,
  FaAward,
  FaTrash,
  FaArrowRight,
  FaArrowUpRightFromSquare,
  FaCompass,
  FaUtensils,
  FaWater,
  FaHotTubPerson,
  FaCircleCheck,
  FaCircleXmark,
  FaBuilding,
  FaDoorOpen,
  FaClock,
  FaBed,
  FaCommentDots,
  FaMapLocationDot,
} from "react-icons/fa6";
import { TbSeo } from "react-icons/tb";

import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import Spinner from "@/components/ui/Spinner/Spinner";
import Modal from "@/components/ui/Modal/Modal";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import { useCrud } from "@/hooks/useCrudQuery";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/ui/MapPicker/MapPicker"), {
  ssr: false,
});
import { HotelItem } from "@/types/hotelType";
import { Seo } from "@/types/seoTypes";
import { VIEW_LABELS, MEAL_LABELS } from "@/app/dashboard/hotels/page";

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hotelIdentifier = (params?.id as string) || "";

  const [showSeoModal, setShowSeoModal] = useState(false);

  // Fetch hotels admin catalog to find this hotel or load specific
  const {
    data: hotelsData,
    isLoading,
    updateItem: updateHotel,
    deleteItem: deleteHotel,
    refetch,
  } = useCrud<{ hotels: HotelItem[]; meta?: any }>({
    queryKey: ["hotels"],
    endpoint: "/hotels/admin",
    params: {
      page: 1,
      limit: 200,
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
      };
    },
  });

  // Also query single hotel if API supports it as a fallback
  const { data: singleHotelData, isLoading: isSingleLoading } = useCrud<any>({
    queryKey: ["hotel-detail", hotelIdentifier],
    endpoint: `/hotels/admin/${hotelIdentifier}`,
    enabled: !!hotelIdentifier,
    select: (res: any) => {
      return res?.data?.hotel || res?.data || res;
    },
  });

  const hotel: any = useMemo(() => {
    // 1. Give highest priority to single hotel detail endpoint data since it contains full properties (rooms, phone, website, etc.)
    if (singleHotelData) {
      const h = singleHotelData.hotel || singleHotelData.data?.hotel || singleHotelData.data || singleHotelData;
      if (h && (h.name || h.hotel_name || h._id || h.hotelId)) {
        return h;
      }
    }

    // 2. Fallback to list item if single endpoint didn't respond yet
    if (hotelsData?.hotels) {
      const found = hotelsData.hotels.find(
        (h) =>
          String(h.hotelId) === String(hotelIdentifier) ||
          String(h._id) === String(hotelIdentifier) ||
          h.slug === hotelIdentifier
      );
      if (found) return found;
    }

    return null;
  }, [hotelsData, singleHotelData, hotelIdentifier]);

  const hotelName = hotel?.name || hotel?.hotel_name || hotel?.hotel_translated_name || "تفاصيل الفندق";
  const hotelCity = hotel?.city || hotel?.city_translated || "غير محدد";
  const hotelAddress = hotel?.address || hotel?.addressline1 || "";
  const hotelImage = hotel?.image || hotel?.photo1 || "/images/placeholder.jpg";
  const starCount = Number(hotel?.stars || hotel?.star_rating || 0);
  const ratingScore = hotel?.rating ?? hotel?.rating_average ?? 0;
  const ratingText = hotel?.ratingWord || "تقييم النزلاء";
  const accommodationType = hotel?.type || "hotel";
  const price = hotel?.price;
  const currency = hotel?.currency || "SAR";

  // Gallery of photos
  const photos = useMemo(() => {
    const list: string[] = [];
    if (hotel?.image) list.push(hotel.image);
    if (hotel?.photo1 && !list.includes(hotel.photo1)) list.push(hotel.photo1);
    if (hotel?.photo2 && !list.includes(hotel.photo2)) list.push(hotel.photo2);
    if (hotel?.photo3 && !list.includes(hotel.photo3)) list.push(hotel.photo3);
    if (hotel?.photo4 && !list.includes(hotel.photo4)) list.push(hotel.photo4);
    if (hotel?.photo5 && !list.includes(hotel.photo5)) list.push(hotel.photo5);
    return list;
  }, [hotel]);

  // Handle SEO update
  const handleSeoSubmit = async (seoData: Seo) => {
    const targetId = hotel?.hotelId || hotel?._id || hotelIdentifier;
    if (!targetId) return;

    try {
      await updateHotel({
        id: targetId,
        endpoint: "/hotels/admin",
        body: { seo: seoData },
      });
      setShowSeoModal(false);
      await refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "فشل تحديث بيانات الـ SEO");
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    const targetId = hotel?.hotelId || hotel?._id || hotelIdentifier;
    if (!targetId) return;
    if (!confirm(`هل أنت متأكد من حذف الفندق "${hotelName}"؟`)) return;

    try {
      await deleteHotel(`/hotels/admin/${targetId}`);
      router.push("/dashboard/hotels");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "فشل حذف الفندق");
    }
  };

  if (isLoading && isSingleLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner />
        <p className="text-sm text-muted-foreground animate-pulse">جاري تحميل تفاصيل الفندق...</p>
      </div>
    );
  }

  if (!hotel && !isLoading) {
    return (
      <div className="space-y-6">
        <BreadCrumb breadCrumbItems="الفنادق / فندق غير موجود" />
        <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-border space-y-4">
          <FaHotel className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <h2 className="text-lg font-bold text-foreground">لم يتم العثور على الفندق المطلوب</h2>
          <p className="text-xs text-muted-foreground">قد يكون الفندق قد حُذف أو أن المعرف غير صحيح.</p>
          <Link
            href="/dashboard/hotels"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity"
          >
            <FaArrowRight className="w-3.5 h-3.5" />
            <span>العودة لقائمة الفنادق</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BreadCrumb breadCrumbItems={`الفنادق / ${hotelName}`} />

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/hotels"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted/50 text-foreground text-xs font-bold transition-colors cursor-pointer"
          >
            <FaArrowRight className="w-3.5 h-3.5" />
            <span>العودة للقائمة</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowSeoModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-colors cursor-pointer"
          >
            <TbSeo className="w-4 h-4" />
            <span>إعدادات SEO</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
          >
            <FaTrash className="w-3.5 h-3.5" />
            <span>حذف</span>
          </button>

          {hotel.url && (
            <Link
              href={hotel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <span>رابط الحجز الخارجي</span>
              <FaArrowUpRightFromSquare className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Hero Header Card */}
      <div className="bg-background rounded-3xl border border-border overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Visual Image Banner */}
          <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full bg-muted">
            <Image
              src={hotelImage}
              alt={hotelName}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
            <div className="absolute top-4 start-4 flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black backdrop-blur-md shadow-xs ${
                  accommodationType === "villa"
                    ? "bg-amber-500/90 text-white"
                    : accommodationType === "cabin"
                    ? "bg-emerald-500/90 text-white"
                    : "bg-primary/90 text-white"
                }`}
              >
                {accommodationType === "villa"
                  ? "🏰 فيلا خاصة"
                  : accommodationType === "cabin"
                  ? "🏡 كوخ ريفي"
                  : "🏨 فندق"}
              </span>
            </div>
          </div>

          {/* Hotel Summary & Core Attributes */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {starCount > 0 ? (
                    Array.from({ length: starCount }).map((_, i) => (
                      <FaStar key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground font-medium">بدون تصنيف نجوم</span>
                  )}
                  {starCount > 0 && (
                    <span className="text-xs font-bold text-amber-500 ms-1">({starCount} نجوم)</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-xl text-xs font-black font-mono">
                  <FaAward className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{ratingScore}</span>
                  <span className="font-sans font-medium text-[11px]">({ratingText})</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {hotelName}
              </h1>

              {hotel.hotel_translated_name && hotel.hotel_translated_name !== hotelName && (
                <p className="text-sm text-muted-foreground font-medium">
                  {hotel.hotel_translated_name}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <FaCity className="w-3.5 h-3.5 text-primary" />
                  <span>المدينة: {hotelCity}</span>
                  {hotel.country && <span>- {hotel.country}</span>}
                </div>

                {hotelAddress && (
                  <div className="flex items-center gap-1.5">
                    <FaLocationDot className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-clamp-1">{hotelAddress}</span>
                  </div>
                )}

                {hotel.distance && (
                  <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-0.5 rounded-md text-foreground font-medium">
                    <FaLocationDot className="w-3 h-3 text-sky-500 shrink-0" />
                    <span>{hotel.distance}</span>
                  </div>
                )}

                {hotel.reviewsCount !== undefined && hotel.reviewsCount > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FaCommentDots className="w-3 h-3 text-primary" />
                    <span>({hotel.reviewsCount} تقييم)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Highlighted Features */}
            <div className="pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground block mb-0.5">
                  السعر التقديري / لليلة
                </span>
                {price !== undefined && price !== null && !isNaN(Number(price)) && Number(price) > 0 ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-primary">
                      {price}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">{currency}</span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">غير محدد</span>
                )}
              </div>

              {/* Badges for Quick Overview */}
              <div className="flex flex-wrap gap-2">
                {hotel.view && (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 flex items-center gap-1.5">
                    <FaCompass className="w-3 h-3 text-sky-500" />
                    <span>{VIEW_LABELS[hotel.view] || hotel.view}</span>
                  </span>
                )}

                {hotel.mealPlan && (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
                    <FaUtensils className="w-3 h-3 text-amber-500" />
                    <span>{MEAL_LABELS[hotel.mealPlan] || hotel.mealPlan}</span>
                  </span>
                )}

                {hotel.hasPrivatePool && (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5">
                    <FaWater className="w-3 h-3 text-indigo-500" />
                    <span>مسبح خاص</span>
                  </span>
                )}

                {hotel.hasJacuzzi && (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 flex items-center gap-1.5">
                    <FaHotTubPerson className="w-3 h-3 text-teal-500" />
                    <span>جاكوزي</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description & Gallery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview / Description */}
          <div className="bg-background rounded-3xl border border-border p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FaHotel className="w-4 h-4 text-primary" />
              <span>نبذة وتفاصيل الإقامة</span>
            </h2>

            {hotel.description || hotel.overview ? (
              <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line bg-muted/20 p-4 rounded-2xl border border-border/50">
                {hotel.description || hotel.overview}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-3">
                لا يوجد وصف تفصيلي مسجل لهذا الفندق حالياً.
              </p>
            )}
          </div>

          {/* Rooms List if Available */}
          {Array.isArray(hotel.rooms) && hotel.rooms.length > 0 && (
            <div className="bg-background rounded-3xl border border-border p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FaBed className="w-4 h-4 text-primary" />
                <span>خيارات الغرف والأسرة المتاحة ({hotel.rooms.length})</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hotel.rooms.map((rm: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-border bg-muted/15 flex items-center gap-3.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FaBed className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block capitalize">
                        {rm.roomType === "standard"
                          ? "غرفة قياسية (Standard Room)"
                          : rm.roomType === "suite"
                          ? "جناح فندقي (Suite)"
                          : rm.roomType || `غرفة ${idx + 1}`}
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        نوع السرير: {rm.bedType === "single" ? "سرير فردي (Single)" : rm.bedType === "double" ? "سرير مزدوج (Double)" : rm.bedType || "غير محدد"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery if Available */}
          {photos.length > 0 && (
            <div className="bg-background rounded-3xl border border-border p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>صور المكان ({photos.length})</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="relative h-36 rounded-2xl overflow-hidden border border-border bg-muted group"
                  >
                    <Image
                      src={imgUrl}
                      alt={`${hotelName} - ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEO Details Card */}
          <div className="bg-background rounded-3xl border border-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <TbSeo className="w-5 h-5 text-amber-500" />
                <span>بيانات محركات البحث (SEO)</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowSeoModal(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                تعديل الـ SEO
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground block">
                  الرابط الدائم (Slug)
                </span>
                <span className="text-xs font-mono font-bold text-foreground break-all">
                  {hotel.slug || hotel.hotelId || "غير محدد"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground block">
                  عنوان السيو (Meta Title)
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {hotel.seo?.title || "غير محدد"}
                </span>
              </div>

              <div className="md:col-span-2 p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground block">
                  وصف السيو (Meta Description)
                </span>
                <span className="text-xs text-muted-foreground">
                  {hotel.seo?.description || "لا يوجد وصف SEO مخصص"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Specifications & Meta Information */}
        <div className="space-y-6">
          {/* Specifications Card */}
          <div className="bg-background rounded-3xl border border-border p-6 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-foreground">المواصفات والخصائص</h2>

            <div className="space-y-3.5 divide-y divide-border/60 text-xs">
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <FaHotel className="w-3.5 h-3.5 text-primary" />
                  <span>نوع مكان الإقامة</span>
                </span>
                <span className="font-bold text-foreground">
                  {accommodationType === "villa"
                    ? "فيلا"
                    : accommodationType === "cabin"
                    ? "كوخ"
                    : "فندق"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <FaStar className="w-3.5 h-3.5 text-amber-400" />
                  <span>تصنيف النجوم</span>
                </span>
                <span className="font-bold text-foreground">
                  {starCount > 0 ? `${starCount} نجوم` : "غير مصنف"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <FaAward className="w-3.5 h-3.5 text-emerald-500" />
                  <span>التقييم العام</span>
                </span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {ratingScore} ({ratingText})
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <FaCompass className="w-3.5 h-3.5 text-sky-500" />
                  <span>الإطلالة</span>
                </span>
                <span className="font-bold text-foreground">
                  {hotel.view ? VIEW_LABELS[hotel.view] || hotel.view : "افتراضية / غير محددة"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <FaUtensils className="w-3.5 h-3.5 text-amber-500" />
                  <span>خطة الوجبات</span>
                </span>
                <span className="font-bold text-foreground">
                  {hotel.mealPlan ? MEAL_LABELS[hotel.mealPlan] || hotel.mealPlan : "غير محددة"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <FaWater className="w-3.5 h-3.5 text-indigo-500" />
                  <span>مسبح خاص</span>
                </span>
                <span className="font-bold">
                  {hotel.hasPrivatePool ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <FaCircleCheck className="w-3 h-3" /> متوفر
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <FaCircleXmark className="w-3 h-3" /> غير متوفر
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <FaHotTubPerson className="w-3.5 h-3.5 text-teal-500" />
                  <span>جاكوزي</span>
                </span>
                <span className="font-bold">
                  {hotel.hasJacuzzi ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <FaCircleCheck className="w-3 h-3" /> متوفر
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <FaCircleXmark className="w-3 h-3" /> غير متوفر
                    </span>
                  )}
                </span>
              </div>

              {hotel.numberrooms && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <FaDoorOpen className="w-3.5 h-3.5 text-primary" />
                    <span>عدد الغرف</span>
                  </span>
                  <span className="font-bold font-mono text-foreground">{hotel.numberrooms}</span>
                </div>
              )}

              {hotel.numberfloors && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <FaBuilding className="w-3.5 h-3.5 text-primary" />
                    <span>عدد الطوابق</span>
                  </span>
                  <span className="font-bold font-mono text-foreground">{hotel.numberfloors}</span>
                </div>
              )}

              {hotel.checkin && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <FaClock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>تسجيل الوصول</span>
                  </span>
                  <span className="font-bold font-mono text-foreground">{hotel.checkin}</span>
                </div>
              )}

              {hotel.checkout && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <FaClock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>تسجيل المغادرة</span>
                  </span>
                  <span className="font-bold font-mono text-foreground">{hotel.checkout}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Contact Information */}
          <div className="bg-background rounded-3xl border border-border p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FaLocationDot className="w-4 h-4 text-primary" />
              <span>الموقع وبيانات التواصل</span>
            </h2>

            <div className="space-y-3.5 text-xs">
              {/* Interactive Map display */}
              {(hotel.lat || hotel.latitude || hotel.lng || hotel.longitude) && (
                <div className="rounded-2xl overflow-hidden border border-border bg-muted/20 p-2 space-y-2">
                  <MapPicker
                    lat={hotel.lat ?? hotel.latitude}
                    lng={hotel.lng ?? hotel.longitude}
                    readOnly={true}
                    title=""
                  />
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {hotel.lat ?? hotel.latitude}, {hotel.lng ?? hotel.longitude}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${hotel.lat ?? hotel.latitude},${hotel.lng ?? hotel.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <FaMapLocationDot className="w-3.5 h-3.5" />
                      <span>فتح على Google Maps</span>
                    </a>
                  </div>
                </div>
              )}

              {hotel.phone && (
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">رقم الهاتف</span>
                  <a
                    href={`tel:${hotel.phone}`}
                    className="font-mono font-bold text-primary hover:underline dir-ltr"
                  >
                    {hotel.phone}
                  </a>
                </div>
              )}

              {hotel.website && (
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">الموقع الإلكتروني</span>
                  <a
                    href={hotel.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary hover:underline truncate max-w-[180px]"
                  >
                    زيارة الموقع ↗
                  </a>
                </div>
              )}

              {hotel.openingHours && (
                <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 space-y-1">
                  <span className="text-muted-foreground block text-[10px] font-bold">
                    ساعات العمل / الاستقبال
                  </span>
                  <span className="text-xs font-semibold text-foreground block">
                    {hotel.openingHours}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Modal */}
      <Modal isOpen={showSeoModal} onClose={() => setShowSeoModal(false)}>
        <div className="space-y-4">
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">
              إعدادات SEO - {hotelName}
            </h3>
          </div>
          <FormSEO
            onSubmit={handleSeoSubmit}
            defaultValues={{
              ...hotel?.seo,
              slug: hotel?.slug || hotel?.hotelId || hotelIdentifier,
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
