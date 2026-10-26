"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */

import { FaBox, FaCalendarDay, FaPlus, FaTrash, FaX } from "react-icons/fa6";
import {
  MultipleImageSelector,
  SingleImageSelector,
} from "@/components/ui/ImageInput/ImageInput";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import DataTable from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import FormInput from "@/components/ui/FieldInput/FieldInput";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import FormTextEditor from "@/components/ui/FormTextEditor/FormTextEditor";
import Image from "next/image";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import { Seo } from "@/types/seoTypes";
import Spinner from "@/components/ui/Spinner/Spinner";
import { TourForm } from "@/types/toursTypes";
import toast from "react-hot-toast";
import { useCrud } from "@/hooks/useCrudQuery";

export default function TourPage() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<TourForm>({
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      slug: "",
      imageCoverAlt: "",
      duration: "",
      productCode: "",
      isInstantConfirmation: false,
      isFreeCancellation: false,
      price: { amount: "" as any, currency: "SAR" },
      cancellationPolicy: { type: "قياسي", description: "" },
      pricingInfo: { type: "لكل شخص", ageBands: [] },
      inclusions: [{ value: "" }],
      exclusions: [{ value: "" }],
      additionalInfo: [{ value: "" }],
      itinerary: {
        itineraryType: "STANDARD",
        skipTheLine: false,
        privateTour: false,
        maxTravelersInSharedTour: 6,
        duration: { fixedDurationInMinutes: 0 },
        itineraryItems: [],
      },
      productOptions: [],
      logistics: {
        start: [{ description: "" }],
        end: [{ description: "" }],
        redemption: { redemptionType: "NONE", specialInstructions: "" },
      },
      tags: [],
      packages: [],
      imageCover: null,
      images: [],
    },
  });

  const {
    fields: inclusions,
    append: appendInclusions,
    remove: removeInclusions,
  } = useFieldArray({
    control,
    name: "inclusions",
  });

  const {
    fields: exclusions,
    append: appendExclusions,
    remove: removeExclusions,
  } = useFieldArray({
    control,
    name: "exclusions",
  });

  // const {
  //   fields: additionalInfo,
  //   append: appendAdditionalInfo,
  //   remove: removeAdditionalInfo,
  // } = useFieldArray({
  //   control,
  //   name: "additionalInfo",
  // });

  // const {
  //   fields: ageBands,
  //   append: appendAgeBand,
  //   remove: removeAgeBand,
  // } = useFieldArray({
  //   control,
  //   name: "pricingInfo.ageBands",
  // });

  // const {
  //   fields: itineraryItems,
  //   append: appendItineraryItem,
  //   remove: removeItineraryItem,
  // } = useFieldArray({
  //   control,
  //   name: "itinerary.itineraryItems",
  // });

  // const {
  //   fields: productOptions,
  //   append: appendProductOption,
  //   remove: removeProductOption,
  // } = useFieldArray({
  //   control,
  //   name: "productOptions",
  // });

  // const {
  //   fields: tags,
  //   append: appendTag,
  //   remove: removeTag,
  // } = useFieldArray({
  //   control,
  //   name: "tags",
  // });

  const {
    fields: tourPackages,
    append: appendPackage,
    remove: removePackage,
  } = useFieldArray({
    control,
    name: "packages",
  });

  // const {
  //   fields: logisticsStart,
  //   append: appendLogisticsStart,
  //   remove: removeLogisticsStart,
  // } = useFieldArray({
  //   control,
  //   name: "logistics.start",
  // });

  // const {
  //   fields: logisticsEnd,
  //   append: appendLogisticsEnd,
  //   remove: removeLogisticsEnd,
  // } = useFieldArray({
  //   control,
  //   name: "logistics.end",
  // });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourForm | null>(null);
  const [editingSeoPackage, setEditingSeo] = useState<TourForm | null>(null);
  const [citiesList, setCitiesList] = useState<any[]>([]);

  const {
    data: tours,
    isLoading,
    isError,
    createItem: createTour,
    updateItem: updateTour,
    deleteItem: deleteTour,
  } = useCrud<any>({  
    queryKey: ["tours"],
    endpoint: "/tours/dashboard",
    select: (res: any) => {
      const array =
        res?.data?.tours || res?.data?.data || res?.data || res?.tours || [];
      return Array.isArray(array) ? array : [];
    },
    handleCloseModal: () => {
      setShowCreateModal(false);
      setShowUpdateModal(false);
    },
    enabled: true,
  });

  const { data: cities } = useCrud<any>({
    queryKey: ["cities", "tours"],
    endpoint: "/cities",
    select: (res: any) => {
      const array = res?.data?.data || res?.data || [];
      return Array.isArray(array) ? array : [];
    },
    enabled: true,
  });

  const { data: countries } = useCrud<any>({
    queryKey: ["countries", "tours"],
    endpoint: "/countries",
    select: (res: any) => {
      const array = res?.data?.data || res?.data || [];
      return Array.isArray(array) ? array : [];
    },
    enabled: true,
  });

  const country = watch("country");
  useEffect(() => {
    if (!cities || !Array.isArray(cities)) return;
    const filteredCities = cities.filter((city: any) => {
      const cityCountryId =
        typeof city.country === "string" ? city.country : city.country?._id;
      return cityCountryId === country;
    });
    setCitiesList(filteredCities);
  }, [cities, country]);

  const handleSeoSubmit = async (seoData: Seo) => {
    if (!editingSeoPackage?._id) return toast.error("الجولة غير محددة");

    await updateTour({
      id: editingSeoPackage._id,
      endpoint: "/tours",
      body: {
        seo: {
          ...seoData,
          slug: String(seoData.slugUrl || seoData.slug || ""),
          noIndex: String(!!seoData.noIndex),
          noFollow: String(!!seoData.noFollow),
          noArchive: String(!!seoData.noArchive),
          noSnippet: String(!!seoData.noSnippet),
        },
      },
    });
    setShowUpdateModal(false);
  };

  async function onSubmit(formData: TourForm) {
    const {
      imageCover,
      imageCoverAlt,
      images,
      coverImage: _coverImage,
      _id,
      ...rest
    } = formData;

    const inclusions =
      rest.inclusions?.map((item: any) =>
        typeof item === "string" ? item : item.value,
      ) || [];
    const exclusions =
      rest.exclusions?.map((item: any) =>
        typeof item === "string" ? item : item.value,
      ) || [];
    const additionalInfo =
      rest.additionalInfo?.map((item: any) =>
        typeof item === "string" ? item : item.value,
      ) || [];
    const tags =
      rest.tags?.map((item: any) =>
        typeof item === "string" ? item : item.value,
      ) || [];

    const payload = {
      body: {
        ...rest,
        inclusions,
        exclusions,
        additionalInfo,
        tags,
        city: rest.city?._id || rest.city,
        price:
          rest.price?.amount !== undefined &&
          rest.price?.amount !== null &&
          String(rest.price.amount).trim() !== "" &&
          !isNaN(Number(rest.price.amount))
            ? {
                amount: parseFloat(String(rest.price.amount)),
                currency: rest.price.currency || "SAR",
              }
            : undefined,
        coverImage:
          imageCover && !(imageCover instanceof File)
            ? { ...imageCover, alt: imageCoverAlt || (imageCover as any).alt }
            : undefined,
        images: Array.isArray(images)
          ? images.filter((img) => !(img instanceof File))
          : [],
      },
      coverImage: imageCover instanceof File ? imageCover : undefined,
      imageCoverAlt,
      images: Array.isArray(images)
        ? (images as any[]).filter((img) => img instanceof File)
        : [],
    };

    if (selectedTour?._id) {
      await updateTour({
        id: selectedTour._id as string,
        endpoint: "/tours",
        ...payload,
      });
    } else {
      await createTour({
        ...payload,
        endpoint: "/tours",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (isError) return <p>Something went wrong fetching tours.</p>;

  return (
    <>
      {/* Create / Edit Package Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="اسم الجولة"
                name="title"
                register={register}
                required={true}
                error={errors.title}
                placeholder="مثال: جولة دبي"
              />
              <FormInput
                label="المدة"
                name="duration"
                register={register}
                error={errors.duration}
                placeholder="مثال: 2 ساعة 30 دقيقة"
              />
              {/* <FormInput
                label="الرابط (Slug)"
                name="slug"
                register={register}
                required={true}
                error={errors.slug}
                placeholder="مثال: dubai-tour"
              /> */}
            </div>

            {/* <div className="grid grid-cols-2 gap-3"></div> */}

            <div className="p-3 bg-secondary/10 rounded-lg border border-primary/10">
              <label className="text-sm font-semibold text-gray-700 block mb-3">
                السعر والعملة <span className="text-xs text-muted-foreground font-normal">(اختياري)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
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
              placeholder="وصف ترويجي قصير"
            />

            <FormTextEditor
              label="تفاصيل الجولة"
              name="description"
              control={control}
              required={true}
              placeholder="اكتب تفاصيل الجولة هنا"
              error={errors.description?.message}
            />

            <div className="grid grid-cols-2 gap-3">
              {/* <div className="flex items-center gap-4 p-3 bg-secondary/20 rounded-lg border border-primary/20">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isInstantConfirmation")}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    تأكيد فوري
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isFreeCancellation")}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    إلغاء مجاني
                  </span>
                </label>
              </div> */}

              {/* <FormInput
                label="المنطقة الزمنية"
                name="timeZone"
                register={register}
                placeholder="مثال: Europe/Paris"
              /> */}
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/10 rounded-lg border border-primary/10">
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
                placeholder="تفاصيل سياسة الإلغاء"
              />
            </div>

            {/* Pricing Info */}
            {/* <div className="space-y-3 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-gray-700">
                  معلومات التسعير (فئات الأعمار)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    appendAgeBand({
                      ageBand: "بالغ",
                      startAge: 18,
                      endAge: 99,
                      minTravelersPerBooking: 1,
                      maxTravelersPerBooking: 8,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors border-dashed"
                >
                  <FaPlus size={14} />
                  <span>إضافة فئة عمرية</span>
                </button>
              </div>
              <FormInput
                label="نوع التسعير"
                name="pricingInfo.type"
                register={register}
                placeholder="مثال: لكل شخص"
              />
              <div className="space-y-3">
                {ageBands.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-6 gap-2 items-end p-2 border border-gray-200 rounded bg-white shadow-sm"
                  >
                    <FormInput
                      label="الفئة"
                      name={`pricingInfo.ageBands.${index}.ageBand`}
                      register={register}
                      placeholder="بالغ"
                    />
                    <FormInput
                      label="ابدأ"
                      type="number"
                      name={`pricingInfo.ageBands.${index}.startAge`}
                      register={register}
                    />
                    <FormInput
                      label="نهاية"
                      type="number"
                      name={`pricingInfo.ageBands.${index}.endAge`}
                      register={register}
                    />
                    <FormInput
                      label="أدنى حجز"
                      type="number"
                      name={`pricingInfo.ageBands.${index}.minTravelersPerBooking`}
                      register={register}
                    />
                    <FormInput
                      label="أقصى حجز"
                      type="number"
                      name={`pricingInfo.ageBands.${index}.maxTravelersPerBooking`}
                      register={register}
                    />
                    <button
                      type="button"
                      onClick={() => removeAgeBand(index)}
                      className="mb-1 p-2 text-red-500 hover:bg-red-50 rounded border border-red-100"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Inclusions, Exclusions, Additional Info */}
            <div className="flex flex-col gap-3">
              {/* Inclusions */}
              <div className="space-y-3 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
                <div className="flex items-center justify-between">
                  <label className="text-md font-bold text-gray-700">
                    ما تشمله الجولة
                  </label>
                  <button
                    type="button"
                    onClick={() => appendInclusions({ value: "" })}
                    className="text-green-600 hover:text-green-700"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {inclusions.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-1">
                      <input
                        {...register(`inclusions.${index}.value`)}
                        className="flex-1 text-xs p-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeInclusions(index)}
                        className="text-red-500"
                      >
                        <FaX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div className="space-y-3 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
                <div className="flex items-center justify-between">
                  <label className="text-md font-bold text-gray-700">
                    ما لا تشمله
                  </label>
                  <button
                    type="button"
                    onClick={() => appendExclusions({ value: "" })}
                    className="text-green-600 hover:text-green-700"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {exclusions.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-1">
                      <input
                        {...register(`exclusions.${index}.value`)}
                        className="flex-1 text-xs p-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeExclusions(index)}
                        className="text-red-500"
                      >
                        <FaX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              {/* <div className="space-y-3 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
                <div className="flex items-center justify-between">
                  <label className="text-md font-bold text-gray-700">
                    معلومات إضافية
                  </label>
                  <button
                    type="button"
                    onClick={() => appendAdditionalInfo({ value: "" })}
                    className="text-green-600 hover:text-green-700"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {additionalInfo.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-1">
                      <input
                        {...register(`additionalInfo.${index}.value`)}
                        className="flex-1 text-xs p-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalInfo(index)}
                        className="text-red-500"
                      >
                        <FaX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>

            {/* Itinerary */}
            {/* <div className="space-y-4 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCalendarDay className="text-blue-600 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">
                    برنامج الرحلة (Itinerary)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    appendItineraryItem({
                      description: "",
                      admissionIncluded: "YES",
                      passByWithoutStopping: false,
                      duration: { fixedDurationInMinutes: 0 },
                    })
                  }
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                >
                  <FaPlus size={14} />
                  <span>إضافة عنصر للبرنامج</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="نوع البرنامج"
                  name="itinerary.itineraryType"
                  register={register}
                  placeholder="مثال: STANDARD"
                />
                <FormInput
                  label="إجمالي المدة (دقائق)"
                  type="number"
                  name="itinerary.duration.fixedDurationInMinutes"
                  register={register}
                />
              </div>

              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("itinerary.skipTheLine")}
                    className="w-4 h-4 text-primary rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">تخطي الطابور</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("itinerary.privateTour")}
                    className="w-4 h-4 text-primary rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">جولة خاصة</span>
                </label>
              </div>

              <div className="space-y-4">
                {itineraryItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 border rounded-lg shadow-sm space-y-3"
                  >
                    <div className="flex justify-between">
                      <span className="font-bold text-blue-600">
                        عنصر #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItineraryItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    <textarea
                      {...register(
                        `itinerary.itineraryItems.${index}.description`,
                      )}
                      rows={3}
                      className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="وصف النشاط..."
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <FormInput
                        label="المدة (دقائق)"
                        type="number"
                        name={`itinerary.itineraryItems.${index}.duration.fixedDurationInMinutes`}
                        register={register}
                      />
                      <FormInput
                        label="الدخول مشمول؟"
                        name={`itinerary.itineraryItems.${index}.admissionIncluded`}
                        register={register}
                        placeholder="YES / NO"
                      />
                      <div className="flex items-center h-full mt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            {...register(
                              `itinerary.itineraryItems.${index}.passByWithoutStopping`,
                            )}
                            className="w-4 h-4 text-primary rounded"
                          />
                          <span className="text-xs">مرور دون توقف</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Logistics */}
            {/* <div className="space-y-4 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
              <h2 className="text-lg font-bold text-gray-700">
                الخدمات اللوجستية
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold">بداية الجولة</label>
                    <button
                      type="button"
                      onClick={() => appendLogisticsStart({ description: "" })}
                      className="text-primary"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  {logisticsStart.map((field, index) => (
                    <div key={field.id} className="flex gap-1">
                      <input
                        {...register(`logistics.start.${index}.description`)}
                        className="flex-1 p-2 text-xs border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeLogisticsStart(index)}
                        className="text-red-500"
                      >
                        <FaX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold">نهاية الجولة</label>
                    <button
                      type="button"
                      onClick={() => appendLogisticsEnd({ description: "" })}
                      className="text-primary"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  {logisticsEnd.map((field, index) => (
                    <div key={field.id} className="flex gap-1">
                      <input
                        {...register(`logistics.end.${index}.description`)}
                        className="flex-1 p-2 text-xs border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeLogisticsEnd(index)}
                        className="text-red-500"
                      >
                        <FaX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  label="نوع الاسترداد"
                  name="logistics.redemption.redemptionType"
                  register={register}
                />
                <textarea
                  {...register("logistics.redemption.specialInstructions")}
                  rows={2}
                  placeholder="تعليمات خاصة للاسترداد..."
                  className="w-full p-2 text-xs border rounded"
                />
              </div>
            </div> */}

            {/* Product Options */}
            {/* <div className="space-y-3 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-gray-700">
                  خيارات المنتج
                </label>
                <button
                  type="button"
                  onClick={() =>
                    appendProductOption({
                      productOptionCode: "",
                      title: "",
                      description: "",
                      languageGuides: [],
                    })
                  }
                  className="text-primary"
                >
                  <FaPlus size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {productOptions.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-3 border rounded bg-white space-y-2"
                  >
                    <div className="flex justify-between">
                      <span className="text-sm font-bold">
                        خيار #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProductOption(index)}
                        className="text-red-500"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <FormInput
                        label="الكود"
                        name={`productOptions.${index}.productOptionCode`}
                        register={register}
                      />
                      <FormInput
                        label="العنوان"
                        name={`productOptions.${index}.title`}
                        register={register}
                      />
                    </div>
                    <textarea
                      {...register(`productOptions.${index}.description`)}
                      className="w-full p-2 text-xs border rounded"
                      placeholder="الوصف..."
                    />
                  </div>
                ))}
              </div>
            </div> */}

            {/* Tags and Packages */}
            {/* <div className="flex flex-col gap-3"> */}
            {/* <div className="space-y-3 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-bold text-gray-700">
                    الوسوم (Tags)
                  </label>
                  <button
                    type="button"
                    onClick={() => appendTag({ value: "" })}
                    className="text-primary"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {tags.map((field, index) => (
                    <div key={field.id} className="flex gap-1">
                      <input
                        {...register(`tags.${index}.value`)}
                        className="flex-1 p-2 text-xs border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-red-500"
                      >
                        <FaX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div> */}

            {/* <div className="space-y-3 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-bold text-gray-700">
                    الباقات (Packages)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      appendPackage({
                        _id: "",
                        name: "",
                        slug: "",
                        price: 0,
                        currency: "SAR",
                      })
                    }
                    className="text-primary"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  {tourPackages.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-2 border rounded bg-white space-y-1"
                    >
                      <div className="flex justify-between">
                        <input
                          {...register(`packages.${index}.name`)}
                          placeholder="الاسم"
                          className="flex-1 text-xs p-1 border-none focus:ring-0"
                        />
                        <button
                          type="button"
                          onClick={() => removePackage(index)}
                          className="text-red-500"
                        >
                          <FaX size={12} />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          {...register(`packages.${index}.price`)}
                          type="number"
                          placeholder="السعر"
                          className="w-1/2 text-xs p-1 border rounded"
                        />
                        <input
                          {...register(`packages.${index}.currency`)}
                          placeholder="العملة"
                          className="w-1/2 text-xs p-1 border rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
            {/* </div> */}

            <div className="grid grid-cols-2 gap-3">
              <SelectMenu
                label="الدولة"
                name="country"
                control={control}
                options={
                  Array.isArray(countries)
                    ? countries.map((c: any) => ({
                        label: c.name,
                        value: c._id || c.id,
                      }))
                    : []
                }
                placeholder="اختر الدولة"
              />
              <SelectMenu
                label="المدن"
                placeholder="اختر المدن"
                disabled={!(citiesList?.length > 0)}
                name="city"
                control={control}
                options={citiesList?.map((city: any) => ({
                  label: city.name,
                  value: city._id || city.id,
                }))}
              />
            </div>

            {/* Cover Image */}
            {/* <div className="grid grid-cols-2 gap-3">
              <SingleImageSelector
                label="صورة الغلاف"
                onImageSelect={(file: File | null) => {
                  setValue("imageCover", file as File);
                }}
                currentImage={watch("imageCover") || watch("coverImage")}
                required
              />
              <FormInput
                label="النص البديل (صورة الغلاف)"
                name="imageCoverAlt"
                register={register}
                placeholder="وصف صورة الغلاف..."
              />
            </div> */}

            {/* Gallery Images */}
            <MultipleImageSelector
              label="صور إضافية"
              currentImages={watch("images") as any[]}
              onImagesChange={(files: any[]) => {
                setValue("images", files);
              }}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="p-3 flex items-center justify-center bg-secondary/30 text-primary rounded-lg border-2 border-primary/40 cursor-pointer"
            >
              {isSubmitting ? <div className="spinner"></div> : "حفظ"}
            </button>
          </form>
        </div>
      </Modal>

      {/* SEO Modal */}
      <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)}>
        <FormSEO
          onSubmit={handleSeoSubmit}
          defaultValues={{
            ...editingSeoPackage?.seo,
            slugUrl:
              editingSeoPackage?.seo?.slug || editingSeoPackage?.slug || "",
            alt:
              editingSeoPackage?.seo?.alt ||
              editingSeoPackage?.coverImage?.alt ||
              editingSeoPackage?.alt ||
              "",
            keywords: editingSeoPackage?.seo?.keywords || "",
            priority: Number(editingSeoPackage?.seo?.priority) || 0.9,
            noIndex:
              editingSeoPackage?.seo?.noIndex === "true" ||
              editingSeoPackage?.seo?.noIndex === true,
            noFollow:
              editingSeoPackage?.seo?.noFollow === "true" ||
              editingSeoPackage?.seo?.noFollow === true,
            noArchive:
              editingSeoPackage?.seo?.noArchive === "true" ||
              editingSeoPackage?.seo?.noArchive === true,
            noSnippet:
              editingSeoPackage?.seo?.noSnippet === "true" ||
              editingSeoPackage?.seo?.noSnippet === true,
          }}
        />
      </Modal>

      <PageHeader
        pageName="الجولات"
        pageDescription="تحكم بقائمة الجولات هنا"
        PageIcon={FaBox}
      />
      <div className="my-6">
        <BreadCrumb breadCrumbItems="الجولات" />
      </div>

      <div className="space-y-4">
        <DataTableHeader
          title="قائمة الجولات"
          action={
            <AddItemCard
              label="إضافة جولة جديدة"
              setShowCreateModal={() => {
                setShowCreateModal(true);
                setSelectedTour(null);
                reset({
                  title: "",
                  slug: "",
                  shortDescription: "",
                  description: "",
                  imageCoverAlt: "",
                  duration: "",
                  productCode: "",
                  isInstantConfirmation: false,
                  isFreeCancellation: false,
                  price: { amount: "" as any, currency: "SAR" },
                  cancellationPolicy: { type: "قياسي", description: "" },
                  pricingInfo: { type: "لكل شخص", ageBands: [] },
                  inclusions: [{ value: "" }],
                  exclusions: [{ value: "" }],
                  additionalInfo: [{ value: "" }],
                  itinerary: {
                    itineraryType: "STANDARD",
                    skipTheLine: false,
                    privateTour: false,
                    maxTravelersInSharedTour: 6,
                    duration: { fixedDurationInMinutes: 0 },
                    itineraryItems: [],
                  },
                  productOptions: [],
                  logistics: {
                    start: [{ description: "" }],
                    end: [{ description: "" }],
                    redemption: {
                      redemptionType: "NONE",
                      specialInstructions: "",
                    },
                  },
                  tags: [],
                  packages: [],
                  imageCover: null,
                  images: [],
                });
              }}
            />
          }
        />

        <DataTable
          data={tours || []}
          columns={[
            {
              key: "images",
              label: "الصورة",
              render: (value, row: any) => {
                const imgUrl =
                  (Array.isArray(value) && (value[0]?.url || value[0])) ||
                  row?.imageCover?.url ||
                  row?.coverImage?.url ||
                  row?.image?.url ||
                  (typeof value === "string" ? value : null);
                const imgAlt =
                  (Array.isArray(value) && value[0]?.alt) ||
                  row?.title ||
                  "tour";

                if (!imgUrl) {
                  return (
                    <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground text-[10px]">
                      بدون صورة
                    </div>
                  );
                }

                return (
                  <Image
                    src={imgUrl}
                    alt={imgAlt}
                    width={80}
                    height={80}
                    unoptimized
                    className="w-16 h-16 object-cover rounded-lg border border-border"
                  />
                );
              },
            },
            { key: "title", label: "اسم الجولة" },
            {
              key: "duration",
              label: "المدة",
              render: (duration) => (duration ? duration : "-"),
            },
            {
              key: "rating",
              label: "التقييم",
              render: (rating) =>
                rating
                  ? typeof rating === "object"
                    ? rating.average ?? "-"
                    : rating
                  : "-",
            },
            {
              key: "price",
              label: "السعر",
              render: (price) => {
                if (!price) return "-";
                if (typeof price === "object") {
                  if (price.amount !== undefined && price.amount !== null && price.amount !== "") {
                    return `${price.amount} ${price.currency ?? "SAR"}`;
                  }
                  return "-";
                }
                return `${price} SAR`;
              },
            },
            { key: "actions", label: "الإجراءات" },
          ]}
          onEdit={(tour: any) => {
            setShowCreateModal(true);
            setSelectedTour(tour);
            reset({
              ...tour,
              seo: tour.seo || undefined,
              inclusions:
                tour.inclusions?.map((item: any) => ({ value: item })) || [],
              exclusions:
                tour.exclusions?.map((item: any) => ({ value: item })) || [],
              additionalInfo:
                tour.additionalInfo?.map((item: any) => ({ value: item })) ||
                [],
              tags: tour.tags?.map((item: any) => ({ value: item })) || [],
              country: tour?.city?.country?._id || tour?.country?._id,
              city: tour?.city?._id,
              // Map coverImage → imageCover so the existing cover is sent correctly on update
              imageCover: tour.coverImage || null,
              imageCoverAlt: tour.coverImage?.alt || "",
              // Load existing images into the images field (mixed with new ones on add)
              images: tour.images || [],
            });
          }}
          onDelete={(id) => {
            deleteTour(`/tours/${id}`);
          }}
          onSeo={(tour) => {
            setShowUpdateModal(true);
            setEditingSeo(tour);
          }}
        />
      </div>
    </>
  );
}
