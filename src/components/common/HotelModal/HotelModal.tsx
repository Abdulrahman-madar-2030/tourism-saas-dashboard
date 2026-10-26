"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal/Modal";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import { HotelItem } from "@/types/hotelType";
import { useCrud } from "@/hooks/useCrudQuery";
import {
  AccommodationType,
  ACCOMMODATION_VIEWS,
  MEAL_PLANS,
} from "@/types/packageTypes";

const MapPicker = dynamic(() => import("@/components/ui/MapPicker/MapPicker"), {
  ssr: false,
});

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

export interface HotelFormData {
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

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelToEdit?: HotelItem | null;
  defaultType?: AccommodationType;
  onSuccess?: (createdOrUpdatedHotel: HotelItem) => void;
}

export default function HotelModal({
  isOpen,
  onClose,
  hotelToEdit,
  defaultType = "hotel",
  onSuccess,
}: HotelModalProps) {
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

  const citiesList = React.useMemo(
    () => citiesData?.cities || [],
    [citiesData?.cities]
  );

  const { createItem: createHotel, updateItem: updateHotel } = useCrud({
    queryKey: ["hotels"],
    endpoint: "/hotels/admin",
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
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
      type: defaultType,
      view: defaultType === "cabin" ? "نهر" : defaultType === "villa" ? "جبال" : "بحر",
      mealPlan: "إفطار وعشاء",
      hasJacuzzi: false,
      hasPrivatePool: false,
      description: "",
      lat: "",
      lng: "",
    },
  });

  const selectedType = watch("type") || "hotel";
  const currentView = watch("view");
  const latVal = watch("lat");
  const lngVal = watch("lng");

  // Keep view in sync when type changes (e.g. switching to villa or cabin)
  useEffect(() => {
    if (!isOpen) return;
    const allowedViews =
      ACCOMMODATION_VIEWS[selectedType as keyof typeof ACCOMMODATION_VIEWS] ||
      ACCOMMODATION_VIEWS.hotel;

    if (!allowedViews.includes(currentView as any)) {
      setValue("view", allowedViews[0], { shouldValidate: true, shouldDirty: true });
    }
  }, [isOpen, selectedType, currentView, setValue]);

  // Populate form only when modal opens or hotelToEdit/defaultType changes
  useEffect(() => {
    if (!isOpen) return;

    if (hotelToEdit) {
      const resolvedCityId =
        hotelToEdit.cityId ||
        citiesList.find((c: any) => c.name === hotelToEdit.city)?._id ||
        "";

      const defaultView =
        hotelToEdit.view ||
        (hotelToEdit.type === "cabin"
          ? "نهر"
          : hotelToEdit.type === "villa"
          ? "جبال"
          : "بحر");

      reset({
        hotelId: hotelToEdit.hotelId,
        name: hotelToEdit.name,
        address: hotelToEdit.address || "",
        price:
          hotelToEdit.price !== undefined && hotelToEdit.price !== null
            ? hotelToEdit.price
            : "",
        currency: hotelToEdit.currency || "SAR",
        stars: hotelToEdit.stars || 5,
        rating: hotelToEdit.rating || 8.0,
        ratingWord: hotelToEdit.ratingWord || "جيد جداً",
        image: hotelToEdit.image || "",
        url: hotelToEdit.url || "",
        type: (hotelToEdit.type as AccommodationType) || "hotel",
        description: hotelToEdit.description || "",
        cityId: resolvedCityId,
        view: defaultView,
        mealPlan: hotelToEdit.mealPlan || "إفطار وعشاء",
        hasJacuzzi: Boolean(hotelToEdit.hasJacuzzi),
        hasPrivatePool: Boolean(hotelToEdit.hasPrivatePool),
        lat: hotelToEdit.lat ?? hotelToEdit.latitude ?? "",
        lng: hotelToEdit.lng ?? hotelToEdit.longitude ?? "",
      });
    } else {
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
        type: defaultType,
        view: defaultType === "cabin" ? "نهر" : defaultType === "villa" ? "جبال" : "بحر",
        mealPlan: "إفطار وعشاء",
        hasJacuzzi: false,
        hasPrivatePool: false,
        description: "",
        lat: "",
        lng: "",
      });
    }
  }, [isOpen, hotelToEdit?._id, hotelToEdit?.hotelId, defaultType]);

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

      const allowedViews =
        ACCOMMODATION_VIEWS[type as keyof typeof ACCOMMODATION_VIEWS] ||
        ACCOMMODATION_VIEWS.hotel;

      const finalView =
        formData.view && allowedViews.includes(formData.view as any)
          ? formData.view
          : allowedViews[0];

      let body: any = {
        type,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        view: finalView,
        cityId: formData.cityId,
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
          stars:
            formData.stars !== undefined && formData.stars !== ""
              ? Number(formData.stars)
              : undefined,
          rating:
            formData.rating !== undefined && formData.rating !== ""
              ? Number(formData.rating)
              : undefined,
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
          price:
            formData.price !== undefined && formData.price !== ""
              ? Number(formData.price)
              : undefined,
          currency: formData.currency || undefined,
          rating:
            formData.rating !== undefined && formData.rating !== ""
              ? Number(formData.rating)
              : undefined,
        };
      } else if (type === "villa") {
        body = {
          ...body,
          hasPrivatePool: Boolean(formData.hasPrivatePool),
          image: formData.image?.trim() || undefined,
          url: formData.url?.trim() || undefined,
          address: formData.address?.trim() || undefined,
          price:
            formData.price !== undefined && formData.price !== ""
              ? Number(formData.price)
              : undefined,
          currency: formData.currency || undefined,
          rating:
            formData.rating !== undefined && formData.rating !== ""
              ? Number(formData.rating)
              : undefined,
        };
      }

      const payload = { body };
      const targetId = hotelToEdit?.hotelId || hotelToEdit?._id;

      let savedHotelResult: any = null;

      if (targetId) {
        const res = await updateHotel({
          id: targetId,
          endpoint: "/hotels/admin",
          ...payload,
        });
        savedHotelResult = res?.data?.hotel || res?.data || res;
      } else {
        const res = await createHotel({
          endpoint: "/hotels/admin",
          ...payload,
        });
        savedHotelResult = res?.data?.hotel || res?.data || res;
      }

      onClose();

      // Find selected city name for complete object
      const matchedCity = citiesList.find((c: any) => c._id === formData.cityId);
      const enrichedHotel: HotelItem = {
        _id: savedHotelResult?._id || savedHotelResult?.id || targetId || "",
        hotelId: savedHotelResult?.hotelId || savedHotelResult?._id || targetId || "",
        name: formData.name.trim(),
        city: matchedCity?.name || "",
        cityId: formData.cityId,
        type: type,
        view: formData.view,
        address: formData.address,
        image: formData.image,
        url: formData.url,
        description: formData.description,
        price: formData.price !== undefined && formData.price !== "" ? Number(formData.price) : undefined,
        currency: formData.currency || "SAR",
        stars: formData.stars !== undefined && formData.stars !== "" ? Number(formData.stars) : undefined,
        rating: formData.rating !== undefined && formData.rating !== "" ? Number(formData.rating) : undefined,
        ratingWord: formData.ratingWord,
        mealPlan: formData.mealPlan,
        hasJacuzzi: Boolean(formData.hasJacuzzi),
        hasPrivatePool: Boolean(formData.hasPrivatePool),
        lat: parsedLat,
        lng: parsedLng,
        ...savedHotelResult,
      };

      if (onSuccess) {
        try {
          onSuccess(enrichedHotel);
        } catch (callbackError) {
          console.error("Error in onSuccess callback:", callbackError);
          // Don't show error to user since the hotel was saved successfully
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حفظ المكان");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset();
      }}
    >
      <div className="space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-base font-bold text-foreground">
            {hotelToEdit ? "تعديل بيانات المكان" : "إضافة مكان جديد"}
          </h2>
          <p className="text-xs text-muted-foreground">
            أدخل بيانات المكان، السعر، المدينة، والتقييم
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmitHotel)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-foreground mb-1">
                النوع
              </label>
              <SelectMenu
                control={control}
                name="type"
                options={[
                  { label: "فندق", value: "hotel" },
                  { label: "فيلا", value: "villa" },
                  { label: "كوخ", value: "cabin" },
                ]}
                placeholder="اختر النوع"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-foreground mb-1">
                اسم المكان <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                {...register("name", { required: true })}
                placeholder="مثال: هيلتون دبي كريك"
                className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                المدينة <span className="text-rose-500">*</span>
              </label>
              <SelectMenu
                control={control}
                name="cityId"
                required
                searchable
                options={citiesList.map((city: any) => ({
                  label: city.name,
                  value: city._id,
                }))}
                placeholder="اختر المدينة"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                العنوان / المنطقة
              </label>
              <input
                type="text"
                {...register("address")}
                placeholder="مثال: ديرة"
                className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Interactive Map Picker & Coordinates */}
            <div className="sm:col-span-2 space-y-3 p-3.5 bg-muted/20 border border-border rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-foreground">
                    موقع الفندق على الخريطة (Map Picker)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    اضغط على الخريطة لتحديد الموقع تلقائياً أو أدخل الإحداثيات يدوياً.
                  </span>
                </div>
                {latVal && lngVal && (
                  <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                    {Number(latVal).toFixed(4)}, {Number(lngVal).toFixed(4)}
                  </span>
                )}
              </div>

              <MapPicker
                lat={latVal || ""}
                lng={lngVal || ""}
                onChange={(lat, lng) => {
                  setValue("lat", lat, { shouldValidate: true, shouldDirty: true });
                  setValue("lng", lng, { shouldValidate: true, shouldDirty: true });
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                    خط العرض (Latitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register("lat")}
                    placeholder="مثال: 25.276987"
                    className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-left dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                    خط الطول (Longitude)
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register("lng")}
                    placeholder="مثال: 55.296249"
                    className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-left dir-ltr"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-foreground mb-1">
                الوصف
              </label>
              <textarea
                rows={2}
                {...register("description")}
                placeholder="وصف تفصيلي للمكان..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* View Selection (Based on Type) */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                الإطلالة (View) <span className="text-rose-500">*</span>
              </label>
              <SelectMenu
                control={control}
                name="view"
                options={(
                  ACCOMMODATION_VIEWS[selectedType as keyof typeof ACCOMMODATION_VIEWS] ||
                  ACCOMMODATION_VIEWS.hotel
                ).map((v) => ({ label: v, value: v }))}
                placeholder="اختر الإطلالة"
              />
            </div>

            {/* Meal Plan (Hotels only) */}
            {selectedType === "hotel" && (
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  خطة الوجبات (Meal Plan) <span className="text-rose-500">*</span>
                </label>
                <SelectMenu
                  control={control}
                  name="mealPlan"
                  options={MEAL_PLANS.map((plan) => ({ label: plan, value: plan }))}
                  placeholder="اختر خطة الوجبات"
                />
              </div>
            )}

            {/* Jacuzzi (Cabins only) */}
            {selectedType === "cabin" && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border sm:col-span-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("hasJacuzzi")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    يوجد جاكوزي (hasJacuzzi)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    كوخ مزود بجاكوزي خاص
                  </span>
                </div>
              </div>
            )}

            {/* Private Pool (Villas only) */}
            {selectedType === "villa" && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border sm:col-span-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("hasPrivatePool")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    مسبح خاص (hasPrivatePool)
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    فيلا مزودة بمسبح خاص
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                السعر / ليلة <span className="text-muted-foreground font-normal">(اختياري)</span>
              </label>
              <input
                type="number"
                {...register("price", { min: 0 })}
                placeholder="مثال: 780"
                className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                العملة
              </label>
              <SelectMenu
                control={control}
                name="currency"
                options={[
                  { label: "ريال سعودي (SAR)", value: "SAR" },
                  { label: "درهم إماراتي (AED)", value: "AED" },
                  { label: "دولار أمريكي (USD)", value: "USD" },
                  { label: "يورو (EUR)", value: "EUR" },
                ]}
                placeholder="اختر العملة"
              />
            </div>

            {/* Rating and Stars for hotels */}
            {selectedType === "hotel" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    عدد النجوم (Stars)
                  </label>
                  <SelectMenu
                    control={control}
                    name="stars"
                    options={[
                      { label: "5 نجوم ⭐⭐⭐⭐⭐", value: 5 },
                      { label: "4 نجوم ⭐⭐⭐⭐", value: 4 },
                      { label: "3 نجوم ⭐⭐⭐", value: 3 },
                      { label: "2 نجمتان ⭐⭐", value: 2 },
                      { label: "نجمة واحدة ⭐", value: 1 },
                    ]}
                    placeholder="اختر عدد النجوم"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    التقييم الرقمي (من 10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    {...register("rating")}
                    placeholder="9.1"
                    className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1">
                    وصف التقييم (Rating Word)
                  </label>
                  <input
                    type="text"
                    {...register("ratingWord")}
                    placeholder="مثال: ممتاز، رائع، جيد جداً"
                    className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground"
                  />
                </div>
              </>
            )}

            {/* Rating for cabins and villas */}
            {selectedType !== "hotel" && (
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  التقييم الرقمي (اختياري من 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  {...register("rating")}
                  placeholder="8.5"
                  className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground font-mono"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-foreground mb-1">
                رابط صورة المكان (Image URL)
              </label>
              <input
                type="url"
                {...register("image")}
                placeholder="https://..."
                className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground text-left dir-ltr"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-foreground mb-1">
                رابط الحجز الخارجي (Booking URL / Website)
              </label>
              <input
                type="url"
                {...register("url")}
                placeholder="https://..."
                className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border text-foreground text-left dir-ltr"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                onClose();
                reset();
              }}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isSubmitting && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{hotelToEdit ? "حفظ التعديلات" : "إضافة المكان"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
