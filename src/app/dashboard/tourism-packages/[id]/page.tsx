"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { City, Country, PackageForm } from "@/types/packageTypes";
import DataTable, { TableColumn } from "@/components/ui/DataTable/DataTable";
import {
  FormField,
  FormRenderer,
} from "@/components/common/FormRenderer/FormRenderer";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import { City as CityType } from "@/types/cityTypes";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import {
  MultipleImageSelector,
} from "@/components/ui/ImageInput/ImageInput";
import { FaBox, FaPlus, FaX } from "react-icons/fa6";
import FormInput from "@/components/ui/FieldInput/FieldInput";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import FormTextEditor from "@/components/ui/FormTextEditor/FormTextEditor";
import Image from "next/image";
import Link from "next/link";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import { Seo } from "@/types/seoTypes";
import Spinner from "@/components/ui/Spinner/Spinner";
import toast from "react-hot-toast";
import { useCrud } from "@/hooks/useCrudQuery";
import { useParams } from "next/navigation";


export default function PackagePage() {
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PackageForm>({
    defaultValues: {
      name: "",
      description: "",
      descText: "",
      shortDescription: "",
      slug: "",
      alt: "",
      duration: "",
      price: { amount: "" as any, currency: "SAR" },
      cancellationPolicy: { type: "قياسي", description: "" },
      inclusions: [{ value: "" }],
      exclusions: [{ value: "" }],
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
    name: "inclusions" as any,
  });

  const {
    fields: exclusions,
    append: appendExclusions,
    remove: removeExclusions,
  } = useFieldArray({
    control,
    name: "exclusions" as any,
  });

  const {
    data: packages,
    isLoading,
    createItem: createPackage,
    updateItem: updatePackage,
    deleteItem: deletePackage,
    isError: error,
  } = useCrud<PackageForm[]>({
    queryKey: ["packagesDetails", id as string],
    endpoint: `/package-types/${id}`,
    select: (res: any) => {
      const data = res?.data ?? res;
      return Array.isArray(data) ? data : [];
    },
    handleCloseModal: () => {
      setShowCreateModal(false);
      setShowUpdateModal(false);
    },
    enabled: !!id,
    useJsonPayload: true,
  });
  console.log("PACKAGES:  ", packages);

  const { createItem: updatePackageImages } = useCrud<PackageForm>({
    queryKey: ["packagesDetails", id as string],
    endpoint: `/packages?packageType=${id}`,
    handleCloseModal: () => {
      setShowCreateModal(false);
    },
  });

  const { data: cities } = useCrud({
    queryKey: ["cities", "packagesDetails"],
    endpoint: "/cities",
    handleCloseModal: () => {
      setShowCreateModal(false);
      setShowUpdateModal(false);
    },
  });

  const { data: countries } = useCrud({
    queryKey: ["countries", "packagesDetails"],
    endpoint: "/countries",
    enabled: !!id,
    handleCloseModal: () => {
      setShowCreateModal(false);
      setShowUpdateModal(false);
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageForm | null>(
    null,
  );
  const [editingSeoPackage, setEditingSeo] = useState<PackageForm | null>(null);
  const [citiesList, setCitiesList] = useState<[Record<string, string>]>([{}]);

  const country = watch("country");
  console.log("COUNTRY: ", country);
  useEffect(() => {
    const filteredCities = cities?.filter((city: CityType) => {
      const cityCountryId =
        typeof city?.country === "object" ? city.country?._id : city?.country;
      return cityCountryId === country;
    });
    setCitiesList(filteredCities || []);
    console.log("FILTERED CITIES:  ", filteredCities);
  }, [cities, country]);

  const formFields: FormField<PackageForm>[] = [
    {
      name: "name",
      label: "اسم الباقة",
      type: "text",
      required: true,
      placeholder: "مثال: الباقة الذهبية",
    },
    {
      name: "slug",
      label: "slug",
      type: "text",
      required: false,
      placeholder: "gold-package",
    },
    {
      name: "shortDescription",
      label: "النص الترويجي",
      type: "text",
      required: true,
      placeholder: "وصف قصير",
    },
    {
      name: "country",
      label: "الدولة",
      type: "select",
      required: true,
      options:
        countries?.map((c: any) => ({ label: c.name, value: c._id || c.id })) ||
        [],
    },
    {
      name: "cities",
      label: "المدن",
      type: "checklist",
      required: true,
      options:
        citiesList?.map((city) => ({ label: city.name, value: city._id })) ||
        [],
    },
    // {
    //   name: "description",
    //   label: "تفاصيل الباقة",
    //   type: "editor",
    //   required: true,
    // },
    {
      name: "imageCover",
      label: "صورة الغلاف",
      type: "singleImage",
      required: true,
    },
  ];

  const columns: TableColumn<PackageForm>[] = [
    {
      key: "imageCover",
      label: "الصورة",
      render: (value: any) => (
        <div>
          <Image
            src={
              value?.url ||
              value?.secure_url ||
              (typeof value === "string" ? value : "/placeholder.png")
            }
            alt={value?.alt || "cover"}
            width={100}
            height={100}
            unoptimized
            className="w-12 h-12 object-cover rounded-xl border border-border shadow-2xs"
          />
        </div>
      ),
    },
    { key: "name", label: "الدولة" },
    {
      key: "cityNames",
      label: "المدن",
      render: (value: string[], record: any) => {
        const citiesArr =
          Array.isArray(value) && value.length > 0
            ? value
            : Array.isArray(record?.cities)
              ? record.cities.map((c: any) => (typeof c === "object" ? c.name : c))
              : [];
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] inline-block font-medium">
            {citiesArr.length > 0 ? citiesArr.join("، ") : "لا يوجد"}
          </span>
        );
      },
    },
    { key: "shortDescription", label: "الوصف" },
    {
      key: "packagesCount",
      label: "عدد الباقات",
      render: (val: any) => (
        <span className="text-xs font-bold text-foreground bg-muted px-2.5 py-1 rounded-lg font-mono">
          {val ?? 0}
        </span>
      ),
    },
    {
      key: "slug",
      label: "الباقات",
      render: (value: string, record: any) => {
        const countryParam = record?._id || value;
        const typeParam = String(id);
        const targetUrl = `/dashboard/packages?packageType=${encodeURIComponent(typeParam)}&country=${encodeURIComponent(countryParam)}&type=${encodeURIComponent(typeParam)}`;

        return (
          <Link
            href={targetUrl}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-2xs transition-all group"
          >
            <FaBox size={11} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span>عرض الباقات</span>
            {record?.packagesCount !== undefined && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono">
                {record.packagesCount}
              </span>
            )}
          </Link>
        );
      },
    },
  ];

  const imageFields: FormField<PackageForm>[] = [
    {
      name: "imageCover",
      label: "صورة الغلاف",
      type: "singleImage",
      required: true,
    },
    {
      name: "images",
      label: "صور إضافية",
      type: "multipleImage",
      required: false,
    },
  ];

  const handleSeoSubmit = async (seoData: Seo) => {
    if (!editingSeoPackage?._id) return toast.error("الباقة غير محددة");

    await updatePackage({
      id: editingSeoPackage._id,
      endpoint: "/packages/admin",
      body: { ...seoData },
    });
    setShowUpdateModal(false);
  };

  const handleImageSubmit = async (imageData: PackageForm) => {
    if (!selectedPackage?._id) return toast.error("الباقة غير محددة");

    await updatePackageImages({
      endpoint: `/packages/${selectedPackage._id}/images`,
      body: { ...imageData },
    });
    setShowUpdateModal(false);
  };

  async function onSubmit(formData: any) {
    const {
      imageCover,
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

    const payload = {
      body: {
        ...rest,
        inclusions,
        exclusions,
        cities: formData.cities,
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
            ? { ...imageCover, alt: rest.alt || (imageCover as any).alt }
            : undefined,
        images: Array.isArray(images)
          ? images.filter((img) => !(img instanceof File))
          : [],
        packageType: String(id),
      },
      coverImage: imageCover instanceof File ? imageCover : undefined,
      images: Array.isArray(images)
        ? (images as any[]).filter((img) => img instanceof File)
        : [],
    };

    if (selectedPackage?._id) {
      await updatePackage({
        id: selectedPackage._id,
        endpoint: "/packages/admin",
        ...payload,
      });
    } else {
      await createPackage({
        ...payload,
        endpoint: "/packages",
      });
    }
  }


  if (isLoading)
    return (
      <>
        <PageHeader
          pageName="الدول التي بها باقات"
          pageDescription={`الخطوة 2: قائمة الدول التابعة لنوع الباقة (${id})`}
          PageIcon={FaBox}
        />
        <div className="my-6">
          <BreadCrumb breadCrumbItems={`الباقات السياحية / ${id}`} />
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      </>
    );

  if (error) return <p>حدث خطأ ما</p>;

  return (
    <>
      {/* Create / Edit Package Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setSelectedPackage(null);
          reset({});
          setShowCreateModal(false);
          setIsEditingImage(false);
        }}
      >
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="اسم الباقة"
                name="name"
                register={register}
                required={true}
                error={errors.name}
                placeholder="مثال: الباقة الذهبية"
              />
              <FormInput
                label="المدة"
                name="duration"
                register={register}
                error={errors.duration as any}
                placeholder="مثال: 2 ساعة 30 دقيقة"
              />
            </div>

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
                  error={(errors.price as any)?.amount}
                  placeholder="مثال: 694.28 (اختياري)"
                />
                <FormInput
                  label="العملة"
                  name="price.currency"
                  type="text"
                  register={register}
                  error={(errors.price as any)?.currency}
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
              label="تفاصيل الباقة"
              name="description"
              control={control}
              required={true}
              placeholder="اكتب تفاصيل الباقة هنا"
              error={errors.description?.message}
            />

            <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/10 rounded-lg border border-primary/10">
              <FormInput
                label="نوع سياسة الإلغاء"
                name="cancellationPolicy.type"
                register={register}
                error={errors.cancellationPolicy?.type as any}
                placeholder="مثال: قياسي"
              />
              <FormInput
                label="وصف سياسة الإلغاء"
                name="cancellationPolicy.description"
                register={register}
                error={errors.cancellationPolicy?.description as any}
                placeholder="تفاصيل سياسة الإلغاء"
              />
            </div>

            {/* Inclusions, Exclusions */}
            <div className="flex flex-col gap-3">
              {/* Inclusions */}
              <div className="space-y-3 bg-secondary/40 border border-primary/20 shadow-md rounded-md p-3">
                <div className="flex items-center justify-between">
                  <label className="text-md font-bold text-gray-700">
                    ما تشمله الباقة
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
                        {...register(`inclusions.${index}.value` as any)}
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
                        {...register(`exclusions.${index}.value` as any)}
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SelectMenu
                label="الدولة"
                name="country"
                control={control}
                options={
                  countries?.map((c: any) => ({
                    label: c.name,
                    value: c._id || c.id,
                  })) || []
                }
                placeholder="اختر الدولة"
              />
              <SelectMenu
                label="المدن"
                placeholder="اختر المدن"
                disabled={!(citiesList?.length > 0)}
                name="city"
                control={control}
                options={citiesList?.map((city) => ({
                  label: city.name,
                  value: city._id,
                }))}
              />
            </div>

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
            slugUrl: editingSeoPackage?.slug,
            alt: editingSeoPackage?.alt,
          }}
        />
      </Modal>

      <PageHeader
        pageName="الدول التي بها باقات"
        pageDescription={`قائمة الدول التي تحتوي على باقات من نوع (${id}) — اضغط على "عرض الباقات" للانتقال لباقات الدولة`}
        PageIcon={FaBox}
      />
      <div className="my-6">
        <BreadCrumb breadCrumbItems={`الباقات السياحية / الدول المتاحة (${id})`} />
      </div>

      <div className="space-y-4">
        <DataTableHeader
          title="الدول التي بها باقات"
        />
        <DataTable
          data={packages || []}
          columns={columns}
          onEdit={(pkg) => {
            setShowCreateModal(true);
            setSelectedPackage(pkg);
            reset({
              ...pkg,
              seo: pkg.seo || undefined,
              inclusions:
                pkg.inclusions?.map((item: any) => ({ value: item })) || [
                  { value: "" },
                ],
              exclusions:
                pkg.exclusions?.map((item: any) => ({ value: item })) || [
                  { value: "" },
                ],
              country:
                typeof (pkg as any)?.city?.country === "object"
                  ? (pkg as any).city.country._id
                  : typeof (pkg as any)?.country === "object"
                    ? (pkg.country as any)?._id
                    : (pkg as any)?.country,
              city: (pkg as any)?.city?._id || pkg?.city,
              imageCover: pkg.imageCover || pkg.coverImage || null,
              images: pkg.images || [],
              duration: pkg.duration || "",
              price: pkg.price || { amount: "" as any, currency: "SAR" },
              cancellationPolicy:
                pkg.cancellationPolicy || { type: "قياسي", description: "" },
            });
          }}
          onDelete={(id) => {
            deletePackage(`/packages/admin/${id}`);
          }}
          onSeo={(pkg) => {
            setShowUpdateModal(true);
            setEditingSeo(pkg);
          }}
          // onImage={(pkg) => {
          //   setShowCreateModal(true);
          //   setIsEditingImage(true);
          //   setSelectedPackage({
          //     _id: pkg._id,
          //     imageCover: pkg.imageCover,
          //     images: pkg.images,
          //   });
          // }}
        />
      </div>
    </>
  );
}
