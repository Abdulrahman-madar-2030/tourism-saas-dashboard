"use client";
import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Spinner from "@/components/ui/Spinner/Spinner";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaCity, FaInfoCircle, FaQuestionCircle } from "react-icons/fa";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import { Seo } from "@/types/seoTypes";
import { CountryFormValues } from "@/types/countryTypes";
import DataTable from "@/components/ui/DataTable/DataTable";
import {
  FormField,
  FormRenderer,
} from "@/components/common/FormRenderer/FormRenderer";
import { useCrud } from "@/hooks/useCrudQuery";
import Image from "next/image";
import CountryInfoModal from "@/components/CountryInfoModal/CountryInfoModal";
import CountryFAQsModal from "@/components/CountryFAQsModal/CountryFAQsModal";

const countryFormSchema: FormField<CountryFormValues>[] = [
  {
    name: "name",
    label: "اسم الدولة",
    type: "text",
    placeholder: "مثال: تركيا",
    required: true,
  },
  {
    name: "slug",
    label: "الرابط (Slug)",
    type: "text",
    placeholder: "مثال: turkey",
    required: true,
  },
  {
    name: "continent",
    label: "القارة",
    type: "select",
    required: true,
    options: [
      { label: "آسيا", value: "Asia" },
      { label: "أوروبا", value: "Europe" },
      { label: "أفريقيا", value: "Africa" },
      { label: "أمريكا الشمالية", value: "North America" },
      { label: "أمريكا الجنوبية", value: "South America" },
      { label: "أوقيانوسيا", value: "Oceania" },
    ],
  },
  {
    name: "currency",
    label: "العملة",
    type: "text",
    placeholder: "مثال: ليرة تركية",
  },
  {
    name: "language",
    label: "اللغة",
    type: "text",
    placeholder: "مثال: التركية",
  },
  {
    name: "bestTimeToVisit",
    label: "أفضل وقت للزيارة",
    type: "text",
    placeholder: "مثال: أبريل - أكتوبر",
  },
  {
    name: "VisaRequirements",
    label: "متطلبات التأشيرة",
    type: "text",
    placeholder: "مثال: تأشيرة إلكترونية",
  },
  {
    name: "tripDuration",
    label: "مدة استخراج التأشيرة",
    type: "text",
    placeholder: "مثال: 5-10 أيام",
  },
  // {
  //   name: "tourGuide",
  //   label: "مرشد سياحي",
  //   type: "select",
  //   options: [
  //     { label: "متوفر", value: "متوفر" },
  //     { label: "غير متوفر", value: "غير متوفر" },
  //   ],
  // },
  {
    name: "shortDescription",
    label: "وصف مختصر",
    type: "textarea",
    placeholder: "وصف قصير يظهر في البطاقة",
  },
  {
    name: "description",
    label: "الوصف",
    type: "textarea",
    placeholder: "وصف كامل للدولة",
  },
  {
    name: "isPopular",
    label: "وجهة مشهورة؟",
    type: "checkbox",
  },
  {
    name: "imageCover",
    label: "صورة الغلاف",
    type: "singleImage",
  },
  {
    name: "imageCoverAlt",
    label: "نص بديل لصورة الغلاف (Alt)",
    type: "text",
    placeholder: "مثال: صورة لمدينة اسطنبول",
  },
  {
    name: "images",
    label: "صور إضافية",
    type: "multipleImage",
  },
];

export default function Countries() {
  const {
    register,
    unregister,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CountryFormValues>({
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      language: "",
      continent: "",
      currency: "",
      bestTimeToVisit: "",
      VisaRequirements: "",
      tripDuration: "",
      tourGuide: "",
      slug: "",
      isPopular: false,
      imageCover: null,
      imageCoverAlt: "",
      images: [],
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCountry, setSelectedCountry] =
    useState<CountryFormValues | null>(null);
  const [editingSeoCountry, setEditingSeo] = useState<CountryFormValues | null>(
    null,
  );
  const [showCountryInfoModal, setShowCountryInfoModal] = useState(false);
  const [selectedCountryForInfo, setSelectedCountryForInfo] =
    useState<{ id: string; name: string } | null>(null);
  const [showCountryFAQsModal, setShowCountryFAQsModal] = useState(false);
  const [selectedCountryForFAQs, setSelectedCountryForFAQs] =
    useState<{ id: string; name: string } | null>(null);

  const {
    data: countries,
    isLoading,
    createItem: createCountry,
    updateItem: updateCountry,
    deleteItem: deleteCountry,
  } = useCrud({
    queryKey: ["countries"],
    endpoint: "/countries",
    handleCloseModal: () => {
      setShowCreateModal(false);
      setShowUpdateModal(false);
    },
  });

  const handleSeoSubmit = async (seoData: Seo) => {
    if (!editingSeoCountry?._id) return toast.error("المدينة غير محددة");
    const { ...seoFields } = seoData;
    const filteredSeoFields = Object.entries(seoFields).reduce(
      (acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Seo,
    );

    const editedSeo = {
      ...filteredSeoFields,
      keywords: Array.isArray(filteredSeoFields.keywords)
        ? filteredSeoFields.keywords
        : typeof filteredSeoFields.keywords === "string"
          ? filteredSeoFields.keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : undefined,
      priority: Number(filteredSeoFields.priority),
      noIndex: filteredSeoFields.noIndex.toString(),
      noFollow: filteredSeoFields.noFollow.toString(),
      noArchive: filteredSeoFields.noArchive.toString(),
      noSnippet: filteredSeoFields.noSnippet.toString(),
    };

    await updateCountry({
      id: editingSeoCountry._id,
      endpoint: "/countries/admin",
      body: {
        seo: editedSeo,
      },
    });

    setShowUpdateModal(false);
  };

  async function onSubmit(formData: CountryFormValues) {
    const { imageCover, imageCoverAlt, images, ...rest } = formData;

    const payload = {
      body: {
        ...rest,
        imageCover:
          imageCover && !(imageCover instanceof File)
            ? { ...imageCover, alt: imageCoverAlt || imageCover.alt }
            : undefined,
        images: Array.isArray(images)
          ? images.filter((img) => !(img instanceof File))
          : [],
      },
      imageCover: imageCover instanceof File ? imageCover : undefined,
      imageCoverAlt,
      images: Array.isArray(images)
        ? (images as File[]).filter((img) => img instanceof File)
        : [],
    };
    console.log("PAYLOAD: ", payload);

    if (selectedCountry?._id) {
      await updateCountry({
        id: selectedCountry._id,
        endpoint: "/countries/admin",
        ...payload,
      });
    } else {
      await createCountry({
        ...payload,
        endpoint: "/countries",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedCountry(null);
        }}
      >
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <FormRenderer
              fields={countryFormSchema}
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="p-3 flex items-center justify-center   bg-secondary/30 text-primary rounded-lg border-2 border-primary/40 cursor-pointer "
            >
              {isSubmitting ? <div className="spinner"></div> : "اضافة"}
            </button>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedCountry(null);
          reset({
            name: "",
            shortDescription: "",
            description: "",
            continent: "",
            currency: "",
            language: "",
            slug: "",
            isPopular: false,
            imageCover: null,
            imageCoverAlt: "",
            images: [],
          });
        }}
      >
        <FormSEO
          onSubmit={handleSeoSubmit}
          defaultValues={{
            ...editingSeoCountry?.seo,
            slugUrl: editingSeoCountry?.slug,
          }}
        />
      </Modal>

      <PageHeader
        pageName="الدول"
        pageDescription="تحكم بقائمة الدول هنا"
        PageIcon={FaCity}
      />
      <div className="my-6">
        <BreadCrumb breadCrumbItems="الدول" />
      </div>

      <div className="space-y-4">
        <DataTableHeader
          title="الدول"
          action={
            <AddItemCard
              label="إضافة دولة جديدة"
              setShowCreateModal={() => {
                setShowCreateModal(true);
                setSelectedCountry(null);
                setEditingSeo(null);
                reset({
                  name: "",
                  slug: "",
                  shortDescription: "",
                  description: "",
                  continent: "",
                  currency: "",
                  language: "",
                  isPopular: false,
                  imageCover: null,
                  imageCoverAlt: "",
                  images: [],
                });
              }}
            />
          }
        />
        <DataTable<CountryFormValues>
          data={countries || []}
          columns={[
            {
              key: "imageCover",
              label: "الصورة",
              render: (value) => {
                let rawUrl = "";
                let altText = "غلاف الدولة";

                if (typeof value === "string") {
                  rawUrl = value;
                } else if (value && typeof value === "object") {
                  rawUrl = value.url || "";
                  altText = value.alt || "غلاف الدولة";
                }

                const safeUrl = rawUrl && !rawUrl.includes("example.com") ? rawUrl : "/placeholder.png";

                return (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border shadow-2xs">
                    <Image
                      src={safeUrl}
                      alt={altText}
                      fill
                      className="object-cover"
                      sizes="64px"
                      onError={(e) => {
                        const target = e.currentTarget as unknown as HTMLImageElement;
                        if (target) {
                          target.src = "/placeholder.png";
                        }
                      }}
                    />
                  </div>
                );
              },
            },
            {
              key: "name",
              label: "الاسم",
            },
            {
              key: "continent",
              label: "القارة",
            },
            {
              key: "currency",
              label: "العملة",
            },
            {
              key: "language",
              label: "اللغة",
            },
            { key: "bestTimeToVisit", label: "افضل اوقات للزيارة" },
            {
              key: "slug",
              label: "الرابط",
            },
            {
              key: "countryInfoButton" as any,
              label: "معلومات إضافية",
              render: (value: any, row: any) => (
                <button
                  onClick={() => {
                    setSelectedCountryForInfo({
                      id: row._id || "",
                      name: row.name,
                    });
                    setShowCountryInfoModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <FaInfoCircle size={13} />
                  <span>عرض المعلومات</span>
                </button>
              ),
            },
            {
              key: "countryFAQsButton" as any,
              label: "الأسئلة الشائعة",
              render: (value: any, row: any) => (
                <button
                  onClick={() => {
                    setSelectedCountryForFAQs({
                      id: row._id || "",
                      name: row.name,
                    });
                    setShowCountryFAQsModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-xs font-semibold cursor-pointer"
                >
                  <FaQuestionCircle size={13} />
                  <span>عرض الأسئلة</span>
                </button>
              ),
            },
          ]}
          onEdit={(item) => {
            setShowCreateModal(true);
            setSelectedCountry(item);
            reset({
              ...item,
              imageCover: item.imageCover || null,
              imageCoverAlt:
                (item.imageCover as { url: string; alt: string })?.alt || "",
              images: item.images || [],
            });
            setEditingSeo(null);
            unregister("seo");
          }}
          onDelete={(id) => {
            deleteCountry(`/countries/admin/${id}`);
          }}
          onSeo={(item) => {
            setShowUpdateModal(true);
            setEditingSeo(item);
            reset({
              ...item,
            });
          }}
        />
      </div>

      {/* Country Info Modal */}
      {selectedCountryForInfo && (
        <CountryInfoModal
          isOpen={showCountryInfoModal}
          onClose={() => {
            setShowCountryInfoModal(false);
            setSelectedCountryForInfo(null);
          }}
          countryId={selectedCountryForInfo.id}
          countryName={selectedCountryForInfo.name}
        />
      )}

      {/* Country FAQs Modal */}
      {selectedCountryForFAQs && (
        <CountryFAQsModal
          isOpen={showCountryFAQsModal}
          onClose={() => {
            setShowCountryFAQsModal(false);
            setSelectedCountryForFAQs(null);
          }}
          countryId={selectedCountryForFAQs.id}
          countryName={selectedCountryForFAQs.name}
        />
      )}
    </>
  );
}
