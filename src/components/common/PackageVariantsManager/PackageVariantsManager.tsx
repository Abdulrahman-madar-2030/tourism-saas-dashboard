"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useController, useFieldArray, useForm } from "react-hook-form";
import {
  FaCalendarDay,
  FaCity,
  FaClock,
  FaLayerGroup,
  FaMoon,
  FaPencil,
  FaPlus,
  FaRoute,
  FaStar,
  FaSun,
  FaTrash,
  FaCoins,
} from "react-icons/fa6";
import { FiX } from "react-icons/fi";
import FormInput from "@/components/ui/FieldInput/FieldInput";
import FormTextEditor from "@/components/ui/FormTextEditor/FormTextEditor";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import { MultipleImageSelector } from "@/components/ui/ImageInput/ImageInput";
import Modal from "@/components/ui/Modal/Modal";
import Tabs from "@/components/ui/Tabs/Tabs";
import { useCrud } from "@/hooks/useCrudQuery";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import type {
  PackageVariant,
  VariantForm,
  VariantFormCity,
} from "@/types/packageVariantTypes";
import type { TourForm } from "@/types/toursTypes";

export const EMPTY_VARIANT: VariantForm = {
  name: "",
  description: "",
  cities: [],
  duration: { days: 1, nights: 0 },
  price: 0,
  currency: "SAR",
  itinerary: [],
  isActive: true,
};

// Activity row inside ItineraryDayCard
function DayActivityRow({
  dayIndex,
  activityIndex,
  register,
  onRemove,
}: {
  dayIndex: number;
  activityIndex: number;
  control: any;
  register: any;
  onRemove: () => void;
}) {
  return (
    <div className="p-3 bg-muted/30 rounded-xl border border-border/60 space-y-2 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 left-2 text-muted-foreground hover:text-rose-500 p-1 rounded-md transition-colors"
        title="حذف النشاط"
      >
        <FiX size={14} />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-6">
        <div className="sm:col-span-2">
          <input
            {...register(
              `itinerary.${dayIndex}.activities.${activityIndex}.title`,
              { required: true },
            )}
            placeholder="عنوان النشاط (مثال: زيارة برج خليفة)"
            className="w-full h-8 px-2.5 text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1.5">
          <input
            type="time"
            {...register(
              `itinerary.${dayIndex}.activities.${activityIndex}.timeFrom`,
            )}
            className="w-1/2 h-8 px-1.5 text-xs rounded-lg bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="time"
            {...register(
              `itinerary.${dayIndex}.activities.${activityIndex}.timeTo`,
            )}
            className="w-1/2 h-8 px-1.5 text-xs rounded-lg bg-background border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <textarea
        {...register(
          `itinerary.${dayIndex}.activities.${activityIndex}.description`,
        )}
        rows={2}
        placeholder="وصف تفصيلي للنشاط (اختياري)..."
        className="w-full p-2 text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />
    </div>
  );
}

// Itinerary Day Card inside VariantFormModal
function ItineraryDayCard({
  dayIndex,
  control,
  register,
  watch,
  setValue,
  onRemove,
  tours,
  onOpenQuickTour,
}: {
  dayIndex: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  onRemove: () => void;
  tours: any[];
  onOpenQuickTour?: (dayIndex: number) => void;
}) {
  const dayType = watch(`itinerary.${dayIndex}.type`);

  const {
    fields: activityFields,
    append: appendActivity,
    remove: removeActivity,
  } = useFieldArray({
    control,
    name: `itinerary.${dayIndex}.activities`,
  });

  const handleAddActivity = () => {
    appendActivity({ title: "", description: "", timeFrom: "", timeTo: "" });
  };

  return (
    <div className="p-4 bg-background rounded-2xl border border-border shadow-xs space-y-3">
      {/* Day header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">
            {dayIndex + 1}
          </span>
          <span className="text-sm font-bold text-foreground">
            اليوم {dayIndex + 1}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Day type toggle */}
          <div className="flex rounded-lg border border-border p-0.5 bg-muted text-xs">
            <button
              type="button"
              onClick={() => setValue(`itinerary.${dayIndex}.type`, "CUSTOM")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                dayType === "CUSTOM"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              أنشطة حرة
            </button>
            <button
              type="button"
              onClick={() => setValue(`itinerary.${dayIndex}.type`, "TOUR")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                dayType === "TOUR"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              جولة سياحية
            </button>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="text-muted-foreground hover:text-rose-500 p-1 rounded-md transition-colors"
            title="حذف اليوم"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* Common inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <input
          {...register(`itinerary.${dayIndex}.title`)}
          placeholder="عنوان اليوم (مثال: جولة في دبي القديمة)"
          className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="date"
          {...register(`itinerary.${dayIndex}.date`)}
          className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <textarea
        {...register(`itinerary.${dayIndex}.description`)}
        rows={2}
        placeholder="وصف عام لليوم (اختياري)..."
        className="w-full p-2.5 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />

      {/* TOUR Type: Select tour */}
      {dayType === "TOUR" && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground block">
              اختر الجولة السياحية:
            </label>
            {onOpenQuickTour && (
              <button
                type="button"
                onClick={() => onOpenQuickTour(dayIndex)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <FaPlus size={9} />
                <span>إضافة جولة سياحية جديدة</span>
              </button>
            )}
          </div>
          <SelectMenu
            name={`itinerary.${dayIndex}.tour`}
            control={control}
            required
            placeholder="اختر جولة من القائمة..."
            options={tours.map((t) => ({
              value: t._id || t.id,
              label: `${t.title} ${t.price ? `(${t.price?.amount} ${t.price?.currency})` : ""}`,
            }))}
          />
        </div>
      )}

      {/* CUSTOM Type: Activity builder */}
      {dayType === "CUSTOM" && (
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              الأنشطة المخصصة:
            </span>
            <button
              type="button"
              onClick={handleAddActivity}
              className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              <FaPlus size={10} />
              إضافة نشاط
            </button>
          </div>

          {activityFields.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-3 bg-muted/20 rounded-xl">
              لا توجد أنشطة محددة لهذا اليوم بعد. انقر على &quot;إضافة نشاط&quot; للبدء.
            </p>
          ) : (
            <div className="space-y-2">
              {activityFields.map((actField, actIdx) => (
                <DayActivityRow
                  key={actField.id}
                  dayIndex={dayIndex}
                  activityIndex={actIdx}
                  control={control}
                  register={register}
                  onRemove={() => removeActivity(actIdx)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// Quick modal to create Tour on the fly
function QuickCreateTourModal({
  isOpen,
  onClose,
  cities,
  onTourCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  cities: VariantFormCity[];
  onTourCreated: (newTour: any) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TourForm>({
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      duration: "",
      price: { amount: "" as any, currency: "SAR" },
      cancellationPolicy: { type: "قياسي", description: "" },
      inclusions: [{ value: "" }],
      exclusions: [{ value: "" }],
      images: [],
    },
  });

  const {
    fields: inclusions,
    append: appendInclusions,
    remove: removeInclusions,
  } = useFieldArray({ control, name: "inclusions" });

  const {
    fields: exclusions,
    append: appendExclusions,
    remove: removeExclusions,
  } = useFieldArray({ control, name: "exclusions" });

  const { data: countriesData } = useCrud<any>({
    queryKey: ["countries", "quick-tour-modal"],
    endpoint: "/countries",
    select: (res: any) => res?.data?.data || res?.data || [],
  });

  const [filteredCities, setFilteredCities] = useState<any[]>([]);

  useEffect(() => {
    if (cities && cities.length > 0) {
      setFilteredCities(cities);
    }
  }, [cities]);

  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        description: "",
        shortDescription: "",
        duration: "",
        price: { amount: "" as any, currency: "SAR" },
        cancellationPolicy: { type: "قياسي", description: "" },
        inclusions: [{ value: "" }],
        exclusions: [{ value: "" }],
        images: [],
        city: cities && cities.length > 0 ? (cities[0]._id as any) : undefined,
      });
    }
  }, [isOpen, reset, cities]);

  const onTourSubmit = async (formData: TourForm) => {
    try {
      const { imageCover, imageCoverAlt, images, _id, ...rest } = formData;

      const inclusionsClean =
        rest.inclusions
          ?.map((item: any) => (typeof item === "string" ? item : item.value))
          .filter(Boolean) || [];

      const exclusionsClean =
        rest.exclusions
          ?.map((item: any) => (typeof item === "string" ? item : item.value))
          .filter(Boolean) || [];

      const payload: any = {
        ...rest,
        inclusions: inclusionsClean,
        exclusions: exclusionsClean,
        city: rest.city?._id || rest.city,
      };

      if (
        rest.price?.amount !== undefined &&
        rest.price?.amount !== null &&
        String(rest.price.amount).trim() !== "" &&
        !isNaN(Number(rest.price.amount))
      ) {
        payload.price = {
          amount: parseFloat(String(rest.price.amount)),
          currency: rest.price.currency || "SAR",
        };
      } else {
        delete payload.price;
      }

      const fileImages = Array.isArray(images)
        ? (images as any[]).filter((img) => img instanceof File)
        : [];

      if (fileImages.length > 0) {
        const formDataUpload = new FormData();
        fileImages.forEach((file) => formDataUpload.append("images", file));
        try {
          const uploadRes = await api.post("/upload/batch", formDataUpload, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const uploadedUrls = uploadRes?.data || [];
          payload.images = (Array.isArray(uploadedUrls) ? uploadedUrls : []).map(
            (item: any) => ({
              url: item?.url || item,
              alt: "",
            }),
          );
        } catch (uploadErr) {
          console.warn("Images upload fallback:", uploadErr);
        }
      }

      const res = await api.post("/tours", payload);
      const created =
        res?.data?.tour ||
        res?.data?.data ||
        res?.data?.result ||
        res?.data ||
        res;
      const normalizedCreated = {
        ...payload,
        ...(typeof created === "object" ? created : {}),
        _id: created?._id || created?.id || payload._id || ("tour_" + Date.now()),
      };

      toast.success("تم إنشاء الجولة السياحية بنجاح!");
      onTourCreated(normalizedCreated);
      onClose();
    } catch (err: any) {
      console.error("Failed to create tour:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "حدث خطأ أثناء إضافة الجولة السياحية",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="space-y-4 p-2 text-right">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FaRoute size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                إضافة جولة سياحية جديدة
              </h3>
              <p className="text-xs text-muted-foreground">
                املأ بيانات الجولة وسيتم حفظها في قاعدة بيانات الجولات وإدراجها فوراً
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <FiX size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.stopPropagation();
            handleSubmit(onTourSubmit)(e);
          }}
          className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-1 no-scrollbar"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="اسم الجولة"
              name="title"
              register={register}
              required={true}
              error={errors.title}
              placeholder="مثال: جولة بحرية في مارينا دبي"
            />
            <FormInput
              label="المدة"
              name="duration"
              register={register}
              error={errors.duration}
              placeholder="مثال: 2 ساعة 30 دقيقة"
            />
          </div>

          <div className="p-3 bg-muted/30 rounded-xl border border-border">
            <label className="text-xs font-bold text-foreground block mb-2">
              السعر والعملة <span className="text-[11px] text-muted-foreground font-normal">(اختياري)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormInput
                label="السعر"
                name="price.amount"
                type="text"
                register={register}
                error={errors.price?.amount}
                placeholder="مثال: 694.28 (اختياري)"
              />
              <FormInput
                label="العملة"
                name="price.currency"
                type="text"
                register={register}
                error={errors.price?.currency}
                placeholder="مثال: SAR"
              />
            </div>
          </div>

          <FormInput
            label="الوصف القصير"
            name="shortDescription"
            register={register}
            required={true}
            error={errors.shortDescription}
            placeholder="وصف ترويجي قصير للجولة..."
          />

          <FormTextEditor
            label="تفاصيل الجولة"
            name="description"
            control={control}
            required={true}
            placeholder="اكتب تفاصيل ومحطات الجولة هنا..."
            error={errors.description?.message}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/20 rounded-xl border border-border">
            <FormInput
              label="نوع سياسة الإلغاء"
              name="cancellationPolicy.type"
              register={register}
              placeholder="مثال: قياسي"
            />
            <FormInput
              label="وصف سياسة الإلغاء"
              name="cancellationPolicy.description"
              register={register}
              placeholder="تفاصيل سياسة الإلغاء..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-2 bg-muted/25 border border-border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  ما تشمله الجولة
                </label>
                <button
                  type="button"
                  onClick={() => appendInclusions({ value: "" })}
                  className="text-emerald-600 hover:text-emerald-700 p-1 cursor-pointer"
                >
                  <FaPlus size={12} />
                </button>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {inclusions.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-1.5">
                    <input
                      {...register(`inclusions.${index}.value`)}
                      placeholder="مثال: وجبة غداء، مرشد سياحي..."
                      className="flex-1 text-xs px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeInclusions(index)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-2 bg-muted/25 border border-border rounded-xl p-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  ما لا تشمله
                </label>
                <button
                  type="button"
                  onClick={() => appendExclusions({ value: "" })}
                  className="text-emerald-600 hover:text-emerald-700 p-1 cursor-pointer"
                >
                  <FaPlus size={12} />
                </button>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {exclusions.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-1.5">
                    <input
                      {...register(`exclusions.${index}.value`)}
                      placeholder="مثال: المصاريف الشخصية..."
                      className="flex-1 text-xs px-2.5 py-1.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeExclusions(index)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectMenu
              label="الدولة"
              name="country"
              control={control}
              options={
                Array.isArray(countriesData)
                  ? countriesData.map((c: any) => ({
                      label: c.name,
                      value: c._id || c.id,
                    }))
                  : []
              }
              placeholder="اختر الدولة"
            />
            <SelectMenu
              label="المدينة"
              placeholder="اختر المدينة"
              name="city"
              control={control}
              options={filteredCities.map((city: any) => ({
                label: city.name,
                value: city._id || city.id,
              }))}
            />
          </div>

          <MultipleImageSelector
            label="صور إضافية للجولة"
            currentImages={watch("images") as any[]}
            onImagesChange={(files: any[]) => {
              setValue("images", files);
            }}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FaPlus size={12} />
              )}
              <span>إضافة واختيار الجولة</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// Quick modal to create city on the fly
function QuickCreateCityModal({
  isOpen,
  onClose,
  countrySlug,
  onCityCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  countrySlug?: string;
  onCityCreated: (newCity: any) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [bestTimeToVisit, setBestTimeToVisit] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSlug("");
      setShortDescription("");
      setBestTimeToVisit("");
      setDescription("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-")) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم المدينة");
      return;
    }

    try {
      setIsSubmitting(true);
      const generatedSlug =
        slug.trim() ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-") ||
        `city-${Date.now()}`;

      const payload: any = {
        name: name.trim(),
        slug: generatedSlug,
        shortDescription: shortDescription.trim() || undefined,
        bestTimeToVisit: bestTimeToVisit.trim() || undefined,
        description: description.trim() || name.trim(),
      };

      if (countrySlug) {
        payload.country = countrySlug;
      }

      const res = await api.post("/cities", payload);
      const created =
        res?.data?.city ||
        res?.data?.data ||
        res?.data?.result ||
        res?.data;

      toast.success("تم إنشاء المدينة بنجاح وإضافتها للمتغير!");
      onCityCreated(created);
      onClose();
    } catch (err: any) {
      console.error("Failed to quick-create city:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "حدث خطأ أثناء إضافة المدينة",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          handleSubmit(e);
        }}
        className="space-y-4 p-2 text-right"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FaCity size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                إضافة مدينة جديدة سريعاً
              </h3>
              <p className="text-[11px] text-muted-foreground">
                أدخل اسم المدينة وسيتم إنشاؤها وتحديدها فوراً في المتغير
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm p-1"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1 no-scrollbar">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              اسم المدينة <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثال: دبي، الرياض، إسطنبول..."
              className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              الرابط اللطيف (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="مثال: dubai"
              className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-left dir-ltr"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              أفضل وقت للزيارة (اختياري)
            </label>
            <input
              type="text"
              value={bestTimeToVisit}
              onChange={(e) => setBestTimeToVisit(e.target.value)}
              placeholder="مثال: من أكتوبر إلى أبريل"
              className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              وصف مختصر (اختياري)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="وصف ترويجي قصير للمدينة..."
              className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              تفاصيل أو نبذة عن المدينة (اختياري)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف إضافي للمدينة..."
              className="w-full p-2.5 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FaPlus size={11} />
            )}
            <span>إضافة وتحديد المدينة</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Modal for Creating & Editing Variants
export function VariantFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isSaving,
  cities,
  tours,
  title,
  countrySlug,
  onTourCreated,
  onCityCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VariantForm) => Promise<void>;
  defaultValues: VariantForm;
  isSaving: boolean;
  cities: VariantFormCity[];
  tours: any[];
  title: string;
  countrySlug?: string;
  onTourCreated?: (newTour: any) => void;
  onCityCreated?: (newCity: any) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VariantForm>({
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) reset(defaultValues);
  }, [isOpen, defaultValues, reset]);

  const [localTours, setLocalTours] = useState<any[]>(tours);
  const [localCities, setLocalCities] = useState<VariantFormCity[]>(cities);

  useEffect(() => {
    setLocalTours(tours);
  }, [tours]);

  useEffect(() => {
    setLocalCities(cities);
  }, [cities]);

  const {
    fields: itineraryFields,
    append: appendDay,
    remove: removeDay,
  } = useFieldArray({
    control,
    name: "itinerary",
  });

  const [showQuickTourModal, setShowQuickTourModal] = useState(false);
  const [quickTourDayIndex, setQuickTourDayIndex] = useState<number | null>(null);
  const [showQuickCityModal, setShowQuickCityModal] = useState(false);

  const handleOpenQuickTour = (dayIdx: number) => {
    setQuickTourDayIndex(dayIdx);
    setShowQuickTourModal(true);
  };

  const handleQuickTourCreated = (newTour: any) => {
    const newId = newTour?._id || newTour?.id;
    if (newTour && newId) {
      setLocalTours((prev) => {
        const exists = prev.some((t) => (t._id || t.id) === newId);
        return exists
          ? prev.map((t) => ((t._id || t.id) === newId ? { ...t, ...newTour } : t))
          : [newTour, ...prev];
      });
      if (quickTourDayIndex !== null) {
        setValue(`itinerary.${quickTourDayIndex}.tour`, newId, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        if (newTour.title) {
          const currentTitle = watch(`itinerary.${quickTourDayIndex}.title`);
          if (!currentTitle) {
            setValue(`itinerary.${quickTourDayIndex}.title`, newTour.title);
          }
        }
      }
    }
    if (onTourCreated) {
      onTourCreated(newTour);
    }
  };

  const handleQuickCityCreated = (newCity: any) => {
    const newId = newCity?._id || newCity?.id;
    if (newCity && newId) {
      const formattedCity: VariantFormCity = {
        _id: newId,
        name: newCity.name,
        slug: newCity.slug || "",
      };
      setLocalCities((prev) => {
        const exists = prev.some((c) => c._id === newId);
        return exists ? prev : [...prev, formattedCity];
      });
      const current = citiesField.value || [];
      const alreadySelected = current.some(
        (item: any) => (typeof item === "object" ? item._id : item) === newId,
      );
      if (!alreadySelected) {
        citiesField.onChange([...current, formattedCity]);
      }
    }
    if (onCityCreated) {
      onCityCreated(newCity);
    }
  };

  const { field: citiesField } = useController({
    name: "cities",
    control,
  });

  const onFormSubmit = async (data: VariantForm) => {
    await onSubmit(data);
  };

  const handleAddCustom = () => {
    appendDay({
      day: itineraryFields.length + 1,
      type: "CUSTOM",
      title: "",
      description: "",
      activities: [],
      tour: undefined,
    });
  };

  const handleAddTour = () => {
    appendDay({
      day: itineraryFields.length + 1,
      type: "TOUR",
      title: "",
      description: "",
      activities: [],
      tour: undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          handleSubmit(onFormSubmit)(e);
        }}
        className="flex flex-col gap-4 pb-2"
      >
        <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="اسم المتغير"
            name="name"
            register={register}
            required
            error={errors.name}
            placeholder="مثال: الباقة الكلاسيكية"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="الأيام"
              name="duration.days"
              register={register}
              type="number"
              min={1}
              required
              error={errors.duration?.days as any}
              placeholder="5"
            />
            <FormInput
              label="الليالي"
              name="duration.nights"
              register={register}
              type="number"
              min={0}
              required
              error={errors.duration?.nights as any}
              placeholder="4"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            الوصف
          </label>
          <textarea
            {...register("description")}
            rows={3}
            placeholder="وصف مميزات هذا المتغير..."
            className="w-full p-3 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            label="السعر الإجمالي"
            name="price"
            register={register}
            type="number"
            min={0}
            required
            error={errors.price as any}
            placeholder="3500"
          />
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              العملة
            </label>
            <SelectMenu
              name="currency"
              control={control}
              options={[{ value: "SAR", label: "ريال سعودي (SAR)" }]}
              placeholder="اختر العملة"
              disabled
            />
            <p className="text-[10px] text-muted-foreground mt-1">العملة المعتمدة للباقات هي الريال السعودي (SAR)</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-foreground">
              المدن المشمولة في المتغير:
            </label>
            <button
              type="button"
              onClick={() => setShowQuickCityModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              <FaPlus size={9} />
              <span>إضافة مدينة جديدة</span>
            </button>
          </div>
          {localCities && localCities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {localCities.map((c) => {
                const isSelected = (citiesField.value || []).some(
                  (item: any) =>
                    (typeof item === "object" ? item._id : item) === c._id,
                );
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => {
                      const cur = citiesField.value || [];
                      if (isSelected) {
                        citiesField.onChange(
                          cur.filter(
                            (item: any) =>
                              (typeof item === "object" ? item._id : item) !==
                              c._id,
                          ),
                        );
                      } else {
                        citiesField.onChange([...cur, c]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-center bg-muted/20 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
              لا توجد مدن مضافة بعد. اضغط على زر &quot;إضافة مدينة جديدة&quot; لإضافة أول مدينة.
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            {...register("isActive")}
            className="w-4 h-4 text-primary rounded border-border"
          />
          <span className="text-xs font-semibold text-foreground">
            تفعيل هذا المتغير للعملاء
          </span>
        </label>

        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                جدول الرحلة اليومي ({itineraryFields.length} أيام)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                أضف برامج وأنشطة الرحلة لكل يوم
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddCustom}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground hover:bg-muted/80 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <FaPlus size={10} />
                يوم حر (أنشطة)
              </button>
              <button
                type="button"
                onClick={handleAddTour}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <FaPlus size={10} />
                يوم جولة سياحية
              </button>
            </div>
          </div>

          {itineraryFields.length === 0 ? (
            <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
              لا توجد أيام في جدول الرحلة بعد. استخدم الأزرار أعلاه لإضافة أيام.
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
              {itineraryFields.map((field, idx) => (
                <ItineraryDayCard
                  key={field.id}
                  dayIndex={idx}
                  control={control}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  onRemove={() => removeDay(idx)}
                  tours={localTours}
                  onOpenQuickTour={handleOpenQuickTour}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            حفظ المتغير
          </button>
        </div>
      </form>

      <QuickCreateTourModal
        isOpen={showQuickTourModal}
        onClose={() => {
          setShowQuickTourModal(false);
          setQuickTourDayIndex(null);
        }}
        cities={localCities}
        onTourCreated={handleQuickTourCreated}
      />

      <QuickCreateCityModal
        isOpen={showQuickCityModal}
        onClose={() => setShowQuickCityModal(false)}
        countrySlug={countrySlug}
        onCityCreated={handleQuickCityCreated}
      />
    </Modal>
  );
}

// Read-only display of variant
export function VariantDisplay({
  variant,
  onEdit,
  onDelete,
  isDeleting,
  tours = [],
}: {
  variant: PackageVariant;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  tours?: any[];
}) {
  const cities = (variant.cities as any[]) || [];
  const currency = variant.currency || "SAR";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-6 bg-background rounded-3xl border border-border shadow-xs">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              {variant.name}
            </h2>
            {variant.slug && (
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-0.5 rounded-lg border border-border/60">
                {variant.slug}
              </span>
            )}
            {variant.isActive !== false ? (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                نشط
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold">
                معطّل
              </span>
            )}
          </div>

          {variant.description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {variant.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-foreground bg-muted/70 border border-border/80 px-3 py-1.5 rounded-xl font-semibold">
              <FaSun className="text-amber-500" size={13} />
              <span>{variant.duration?.days || 0} يوم</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-foreground bg-muted/70 border border-border/80 px-3 py-1.5 rounded-xl font-semibold">
              <FaMoon className="text-indigo-500" size={13} />
              <span>{variant.duration?.nights || 0} ليلة</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-xl font-bold">
              <FaCoins className="text-primary" size={13} />
              <span>الإجمالي: {Number(variant.price || 0).toLocaleString()} {currency}</span>
            </span>
          </div>

          {cities?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground font-medium">
                المدن المشمولة:
              </span>
              {cities.map((c: any) => (
                <span
                  key={c._id || c}
                  className="inline-flex items-center gap-1 text-xs bg-muted text-foreground border border-border px-2.5 py-1 rounded-lg font-semibold"
                >
                  <FaCity size={11} className="text-primary" />
                  {c.name || c}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-primary text-white hover:bg-primary/90 rounded-xl transition-all cursor-pointer font-bold shadow-xs"
          >
            <FaPencil size={11} />
            <span>تعديل الفئة</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-all cursor-pointer font-bold disabled:opacity-50"
          >
            <FaTrash size={11} />
            <span>حذف</span>
          </button>
        </div>
      </div>

      {(variant.basePrice !== undefined ||
        variant.toursPrice !== undefined ||
        variant.price !== undefined) && (
        <div className="bg-background rounded-3xl border border-border shadow-xs p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <FaCoins className="text-primary w-4 h-4" />
              <h3 className="text-sm font-bold text-foreground">
                التفاصيل المالية والتسعير للفئة
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              العملة المعتمدة: {currency}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">
                السعر الأساسي للفئة (بدون الجولات)
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-foreground">
                  {Number(variant.basePrice ?? variant.price ?? 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {currency}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">
                تكلفة الجولات السياحية المضافة
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  +{Number(variant.toursPrice || 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {currency}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
              <span className="text-xs text-emerald-800 dark:text-emerald-300 block font-bold">
                السعر الإجمالي النهائي للفئة
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {Number(variant.price || 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaRoute className="text-primary w-4 h-4" />
            <h3 className="text-base font-bold text-foreground">
              جدول الرحلة والأنشطة اليومية ({variant.itinerary?.length || 0} أيام)
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {variant.duration?.days || 0} أيام • {variant.duration?.nights || 0} ليالي
          </span>
        </div>

        {!variant.itinerary || variant.itinerary.length === 0 ? (
          <div className="p-12 text-center bg-background rounded-3xl border border-dashed border-border space-y-2">
            <FaRoute size={28} className="mx-auto text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground font-medium">
              لم يتم إضافة جدول رحلة يومي لهذه الفئة بعد
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {variant.itinerary.map((day: any) => {
              const isTour = day.type === "TOUR";
              const rawTour = day.tour;
              const tour =
                typeof rawTour === "object" && rawTour !== null
                  ? rawTour
                  : (tours || []).find((t: any) => (t._id || t.id) === rawTour) || null;

              const tourPriceAmount =
                typeof tour?.price === "object"
                  ? tour?.price?.amount
                  : typeof tour?.price === "number"
                  ? tour?.price
                  : null;
              const tourPriceCurrency =
                typeof tour?.price === "object"
                  ? tour?.price?.currency || currency
                  : currency;

              const tourImage =
                Array.isArray(tour?.images) && tour?.images.length > 0
                  ? typeof tour.images[0] === "object"
                    ? tour.images[0].url
                    : tour.images[0]
                  : tour?.imageCover?.url ||
                    (typeof tour?.imageCover === "string" ? tour?.imageCover : null);

              const ratingAvg =
                typeof tour?.rating === "object"
                  ? tour?.rating?.average
                  : typeof tour?.rating === "number"
                  ? tour?.rating
                  : null;
              const ratingCount =
                typeof tour?.rating === "object" ? tour?.rating?.count : null;

              return (
                <div
                  key={day._id || day.day}
                  className="p-5 bg-background rounded-3xl border border-border shadow-xs space-y-4 transition-all hover:border-border/80"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
                        {day.day}
                      </span>
                      <span className="font-extrabold text-sm sm:text-base text-foreground">
                        {isTour
                          ? tour?.title || day.title || `اليوم ${day.day}`
                          : day.title || `اليوم ${day.day}`}
                      </span>
                      {day.date && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border/60">
                          <FaCalendarDay size={11} className="text-primary" />
                          <span>
                            {new Date(day.date).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        isTour
                          ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {isTour ? "جولة سياحية مشمولة" : "برنامج حر ومخصص"}
                    </span>
                  </div>

                  {day.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {day.description}
                    </p>
                  )}

                  {isTour && tour && (
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        {tourImage ? (
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-border bg-background shadow-xs">
                            <Image
                              src={tourImage}
                              alt={tour.title || "جولة"}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0 text-muted-foreground/40">
                            <FaRoute size={22} />
                          </div>
                        )}

                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-foreground truncate">
                              {tour.title}
                            </h4>
                            {tour.slug && (
                              <span className="text-[10px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                                {tour.slug}
                              </span>
                            )}
                          </div>

                          {tour.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {tour.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 flex-wrap text-xs pt-0.5">
                            {tour.duration && (
                              <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <FaClock size={11} className="text-indigo-500" />
                                <span>{tour.duration}</span>
                              </span>
                            )}
                            {ratingAvg !== null && ratingAvg !== undefined && (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                                <FaStar size={11} className="text-amber-500" />
                                <span>{ratingAvg}</span>
                                {ratingCount !== null && ratingCount !== undefined && (
                                  <span className="text-[10px] text-muted-foreground font-normal">
                                    ({ratingCount} تقييم)
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {tourPriceAmount !== null && tourPriceAmount !== undefined && (
                        <div className="self-end sm:self-center shrink-0 px-3.5 py-2 rounded-xl bg-background border border-border text-left shadow-xs">
                          <span className="text-[10px] text-muted-foreground block font-medium">
                            سعر الجولة
                          </span>
                          <span className="text-sm font-extrabold text-primary">
                            {Number(tourPriceAmount).toLocaleString()} {tourPriceCurrency}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {!isTour && day.activity && day.activity.length > 0 && (
                    <div className="space-y-2.5 pt-2 border-t border-border/60">
                      <span className="text-xs font-bold text-foreground block">
                        الأنشطة والفعاليات المجدولة:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {day.activity.map((act: any, aIdx: number) => (
                          <div
                            key={act._id || aIdx}
                            className="p-3 bg-muted/30 rounded-2xl border border-border/60 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-foreground">
                                {act.title}
                              </span>
                              {(act.duration?.timeFrom || act.duration?.timeTo) && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-background px-2 py-0.5 rounded-md border border-border/60">
                                  <FaClock size={10} className="text-primary" />
                                  <span>
                                    {act.duration?.timeFrom} - {act.duration?.timeTo}
                                  </span>
                                </span>
                              )}
                            </div>
                            {act.description && (
                              <p className="text-muted-foreground text-[11px] leading-relaxed">
                                {act.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Complete PackageVariantsManager component for PackageFormView
export default function PackageVariantsManager({
  variants,
  onChange,
  packageId,
  countrySlug,
  isEditMode,
}: {
  variants: any[];
  onChange: (newVariants: any[]) => void;
  packageId?: string;
  countrySlug?: string;
  isEditMode?: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tours
  const { data: tours, refetch: refetchTours } = useCrud<any>({
    queryKey: ["tours"],
    endpoint: "/tours?limit=1000",
    select: (res: any) => {
      const arr =
        res?.data?.tours || res?.data?.data || res?.data || res?.tours || [];
      return Array.isArray(arr) ? arr : [];
    },
  });

  // Cities
  const { data: cities, refetch: refetchCities } = useCrud<any>({
    queryKey: ["cities"],
    endpoint: `/cities?limit=200`,
    select: (res: any) => {
      const arr = res?.data?.cities ?? res?.data?.data ?? res?.data ?? res;
      return Array.isArray(arr) ? arr : [];
    },
  });

  const openCreate = () => {
    setEditingVariant(null);
    setShowModal(true);
  };

  const openEdit = (v: any) => {
    setEditingVariant(v);
    setShowModal(true);
  };

  const handleDelete = (vId: string, idx: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المتغير؟")) return;
    const next = [...variants];
    next.splice(idx, 1);
    onChange(next);
    toast.success("تم حذف المتغير من القائمة (سيتم اعتماده عند حفظ الباقة)");
  };

  const handleSubmitVariant = async (data: VariantForm) => {
    const rawDays = data.duration?.days;
    const rawNights = data.duration?.nights;
    const days = Math.max(1, parseInt(String(rawDays), 10) || 1);
    const nights = Math.max(0, parseInt(String(rawNights), 10) || 0);
    const price = Math.max(0, parseFloat(String(data.price)) || 0);

    const itinerary = (data.itinerary || []).map((day, idx) => ({
      day: Number(day.day) || idx + 1,
      type: day.type,
      ...(day.date ? { date: day.date } : {}),
      ...(day.type === "CUSTOM"
        ? {
            title: day.title || "",
            description: day.description || "",
            activity: (day.activities || []).map((a) => ({
              title: a.title,
              description: a.description || "",
              duration: {
                timeFrom: a.timeFrom || "",
                timeTo: a.timeTo || "",
              },
            })),
            tour: undefined,
          }
        : {
            title: day.title || "",
            description: day.description || "",
            tour: day.tour || undefined,
            activity: [],
          }),
    }));

    const citiesPayload = (data.cities || []).map((c) =>
      typeof c === "object" ? c._id : c,
    );

    const variantPayload: any = {
      name: (data.name || "").trim(),
      description: (data.description || "").trim(),
      cities: data.cities,
      duration: { days, nights },
      price,
      currency: "SAR",
      isActive: data.isActive ?? true,
      itinerary,
    };

    if (editingVariant) {
      const matchId = editingVariant._id || editingVariant.tempId;
      const next = variants.map((v) =>
        (v._id || v.tempId) === matchId ? { ...v, ...variantPayload, cities: citiesPayload } : v,
      );
      onChange(next);
      toast.success("تم حفظ المتغير في القائمة (سيتم حفظه مع تحديث الباقة)");
    } else {
      const newVar = {
        ...variantPayload,
        cities: citiesPayload,
        _id: `temp_${Date.now()}`,
        tempId: `temp_${Date.now()}`,
      };
      onChange([...variants, newVar]);
      toast.success("تمت إضافة المتغير إلى القائمة (سيتم حفظه مع تحديث الباقة)");
    }

    setShowModal(false);
    setEditingVariant(null);
  };

  const variantDefaults: VariantForm = editingVariant
    ? {
        name: editingVariant.name || "",
        description: editingVariant.description || "",
        cities: ((editingVariant.cities as any[]) || []).map((c: any) =>
          typeof c === "object"
            ? { _id: c._id || c.id, name: c.name, slug: c.slug || "" }
            : { _id: c, name: c, slug: "" },
        ),
        duration: {
          days: Number(editingVariant.duration?.days) || 1,
          nights:
            editingVariant.duration?.nights !== undefined &&
            !isNaN(Number(editingVariant.duration?.nights))
              ? Number(editingVariant.duration.nights)
              : 0,
        },
        price: Number(editingVariant.price) || 0,
        currency: "SAR",
        isActive: editingVariant.isActive ?? true,
        itinerary: (editingVariant.itinerary || []).map((day: any, idx: number) => ({
          day: Number(day.day) || idx + 1,
          type: day.type,
          title: day.title || "",
          description: day.description || "",
          date: day.date ? day.date.split("T")[0] : "",
          activities: (day.activity || day.activities || []).map((a: any) => ({
            title: a.title,
            description: a.description || "",
            timeFrom: a.duration?.timeFrom || a.timeFrom || "",
            timeTo: a.duration?.timeTo || a.timeTo || "",
          })),
          tour:
            day.type === "TOUR" && day.tour
              ? typeof day.tour === "object"
                ? (day.tour as any)._id
                : day.tour
              : undefined,
        })),
      }
    : EMPTY_VARIANT;

  const tabItems = (variants || []).map((v: any, idx: number) => ({
    id: v._id || v.tempId || idx,
    label: v.name || `فئة ${idx + 1}`,
    content: (
      <VariantDisplay
        key={v._id || v.tempId || idx}
        variant={v}
        onEdit={() => openEdit(v)}
        onDelete={() => handleDelete(v._id || v.tempId, idx)}
        isDeleting={deletingId === (v._id || v.tempId)}
        tours={(tours as any[]) || []}
      />
    ),
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FaRoute className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              فئات وجولات الباقة ({variants.length})
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            حدد خيارات الباقة المتنوعة (مثل كلاسيك، VIP)، المدد، الأسعار، وبرامج الجولات اليومية
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <FaPlus size={12} />
          <span>إضافة فئة / متغير جديد</span>
        </button>
      </div>

      {/* Variants Tabs or Empty State */}
      {variants.length > 0 ? (
        <Tabs items={tabItems} />
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border space-y-3">
          <FaLayerGroup size={40} className="mx-auto text-muted-foreground/30" />
          <h4 className="text-sm font-bold text-foreground">
            لا توجد متغيرات أو فئات مسجلة بعد
          </h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            يمكنك إنشاء أكثر من فئة للباقة السياحية مع تخصيص السعر، المدة، والبرنامج اليومي لكل منها.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
          >
            <FaPlus size={12} />
            <span>إنشاء أول متغير للباقة</span>
          </button>
        </div>
      )}

      {/* Modal */}
      <VariantFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingVariant(null);
        }}
        onSubmit={handleSubmitVariant}
        defaultValues={variantDefaults}
        isSaving={false}
        cities={((cities as any[]) || []).map((c: any) => ({
          _id: c._id || c.id,
          name: c.name,
          slug: c.slug || "",
        }))}
        tours={(tours as any[]) || []}
        title={editingVariant ? "تعديل الفئة / المتغير" : "إضافة فئة جديدة للباقة"}
        countrySlug={countrySlug}
        onTourCreated={() => {
          refetchTours();
        }}
        onCityCreated={() => {
          refetchCities();
        }}
      />
    </div>
  );
}
