"use client";

import { City, CityForm } from "@/types/cityTypes";
import {
  FormField,
  FormRenderer,
} from "@/components/common/FormRenderer/FormRenderer";

import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import { Country } from "@/types/countryTypes";
import DataTable from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import { FaCity } from "react-icons/fa";
import FormSEO from "@/components/common/FromSEO/FormSEO";
import Image from "next/image";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import { Seo } from "@/types/seoTypes";
import Spinner from "@/components/ui/Spinner/Spinner";
import toast from "react-hot-toast";
import { useCrud } from "@/hooks/useCrudQuery";
import { useForm } from "react-hook-form";
import { useState } from "react";

const cityFormSchema: FormField<CityForm>[] = [
  {
    name: "name",
    label: "اسم المدينة",
    type: "text",
    required: true,
    placeholder: "مثال: القاهرة",
  },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "example: cairo",
  },
  {
    name: "shortDescription",
    label: "الوصف القصير",
    type: "text",
    placeholder: "وصف ترويجي قصير",
  },
  {
    name: "bestTimeToVisit",
    label: "أفضل وقت للزيارة",
    type: "text",
    placeholder: "مثال: من أكتوبر إلى أبريل",
  },
  // {
  //   name: "tourGuide",
  //   label: "دليل الجولات",
  //   type: "text",
  //   placeholder: "معلومات عن المرشد السياحي",
  // },
  // {
  //   name: "lat",
  //   label: "خط العرض (Latitude)",
  //   type: "text",
  //   placeholder: "مثال: 30.0444",
  // },
  // {
  //   name: "lon",
  //   label: "خط الطول (Longitude)",
  //   type: "text",
  //   placeholder: "مثال: 31.2357",
  // },
  {
    name: "description",
    label: "تفاصيل المدينة",
    type: "editor",
    required: true,
    placeholder: "وصف تفصيلي",
  },
  {
    name: "imageCover",
    label: "صورة الغلاف",
    type: "singleImage",
    required: true,
  },
  {
    name: "imageCoverAlt",
    label: "نص بديل لصورة الغلاف (Alt)",
    type: "text",
    placeholder: "مثال: صورة لمدينة القاهرة",
  },
  {
    name: "images",
    label: "صور المدينة",
    type: "multipleImage",
  },
];

export default function Cities() {
  const {
    register,
    unregister,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CityForm>({
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      bestTimeToVisit: "",
      tourGuide: "",
      country: "",
      lat: "",
      lon: "",
      slug: "",
      imageCoverAlt: "",
      imageCover: null,
      images: [],
    },
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [editingSeoCity, setEditingSeo] = useState<City | null>(null);

  const {
    data: cities,
    isLoading,
    createItem: createCity,
    updateItem: updateCity,
    deleteItem: deleteCity,
  } = useCrud({
    queryKey: ["cities"],
    endpoint: "/cities",
    handleCloseModal: () => {
      setShowCreateModal(false);
      setShowUpdateModal(false);
    },
    enabled: true,
  });

  const { data: countries } = useCrud({
    queryKey: ["countries", "cities"],
    endpoint: "/countries",
    enabled: true,
  });

  const handleSeoSubmit = async (seoData: Seo) => {
    if (!editingSeoCity?._id) return toast.error("المدينة غير محددة");
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
    };

    if (filteredSeoFields.keywords) {
      editedSeo.keywords = Array.isArray(filteredSeoFields.keywords)
        ? filteredSeoFields.keywords
        : typeof filteredSeoFields.keywords === "string"
          ? filteredSeoFields.keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean)
          : [];
    }

    if (filteredSeoFields.priority) {
      editedSeo.priority = Number(filteredSeoFields.priority);
    }

    if (filteredSeoFields.noIndex !== undefined)
      editedSeo.noIndex = filteredSeoFields.noIndex.toString();
    if (filteredSeoFields.noFollow !== undefined)
      editedSeo.noFollow = filteredSeoFields.noFollow.toString();
    if (filteredSeoFields.noArchive !== undefined)
      editedSeo.noArchive = filteredSeoFields.noArchive.toString();
    if (filteredSeoFields.noSnippet !== undefined)
      editedSeo.noSnippet = filteredSeoFields.noSnippet.toString();

    await updateCity({
      id: editingSeoCity._id,
      endpoint: "/cities/admin",
      body: {
        seo: editedSeo,
      },
    });
    setShowUpdateModal(false);
  };

  async function onSubmit(formData: CityForm) {
    const { imageCover, imageCoverAlt, images, lat, lon, ...rest } = formData;

    const payloadBody = {
      ...rest,
      coordinates: {
        lat: String(lat || 0),
        lon: String(lon || 0),
      },
    };

    const imageCoverFile = imageCover instanceof File ? imageCover : undefined;
    const imagesFiles = Array.isArray(images)
      ? images.filter((img): img is File => img instanceof File)
      : undefined;

    const payload = {
      body: {
        ...payloadBody,
        imageCover:
          imageCover && !(imageCover instanceof File)
            ? { ...imageCover, alt: imageCoverAlt || imageCover.alt }
            : undefined,
        images: Array.isArray(images)
          ? images.filter((img) => !(img instanceof File))
          : [],
      },
      imageCover: imageCoverFile,
      imageCoverAlt,
      images: imagesFiles && imagesFiles.length > 0 ? imagesFiles : undefined,
    };

    if (selectedCity?._id) {
      await updateCity({
        id: selectedCity._id,
        endpoint: "/cities/admin",
        ...payload,
      });
    } else if (editingSeoCity?._id) {
      await updateCity({
        id: editingSeoCity._id,
        endpoint: "/cities/admin",
        body: { ...formData },
      });
    } else {
      await createCity({
        ...payload,
        endpoint: "/cities",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <SelectMenu
              label="الدولة"
              options={
                Array.isArray(countries)
                  ? countries.map((country: Country) => ({
                      label: country.name,
                      value: country._id,
                    }))
                  : []
              }
              name="country"
              control={control}
              required
            />
            <FormRenderer
              fields={cityFormSchema || []}
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
            />
            <button
              type="submit"
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
          setSelectedCity(null);
          reset({
            name: "",
            description: "",
            shortDescription: "",
            bestTimeToVisit: "",
            tourGuide: "",
            country: "",
            lat: "",
            lon: "",
            slug: "",
            imageCoverAlt: "",
            imageCover: null,
            images: [],
          });
        }}
      >
        <FormSEO
          onSubmit={handleSeoSubmit}
          defaultValues={{
            ...editingSeoCity?.seo,
            slugUrl: editingSeoCity?.slug,
            alt:
              (editingSeoCity?.imageCover as { url: string; alt: string })
                ?.alt || "",
          }}
        />
      </Modal>

      <PageHeader
        pageName="المدن"
        pageDescription="تحكم بقائمة المدن هنا"
        PageIcon={FaCity}
      />
      <div className="my-6">
        <BreadCrumb breadCrumbItems="المدن" />
      </div>

      <div className="space-y-4">
        <DataTableHeader
          title="المدن"
          action={
            <AddItemCard
              label="إضافة مدينة جديدة"
              setShowCreateModal={() => {
                setShowCreateModal(true);
                setSelectedCity(null);
                setEditingSeo(null);
                reset({
                  name: "",
                  slug: "",
                  shortDescription: "",
                  description: "",
                  imageCoverAlt: "",
                  lat: "",
                  lon: "",
                });
              }}
            />
          }
        />
        <DataTable
          data={cities || []}
          columns={[
            {
              key: "imageCover",
              label: "الصورة",
              render: (value) => {
                const rawUrl = typeof value === "string" ? value : value?.url;
                const safeUrl = rawUrl && !rawUrl.includes("example.com") ? rawUrl : "/placeholder.png";
                return (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border shadow-2xs">
                    <Image
                      src={safeUrl}
                      alt={typeof value === "object" ? value?.alt || "غلاف المدينة" : "غلاف المدينة"}
                      fill
                      className="object-cover"
                      sizes="64px"
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
              key: "country",
              label: "الدولة",
              render: (val: any) => {
                if (!val) return "—";
                // If populated object
                if (typeof val === "object" && val.name) return val.name;
                // If it's an ID string, find name in countries list
                if (typeof val === "string" && Array.isArray(countries)) {
                  const match = countries.find((c: any) => c._id === val || c.id === val);
                  if (match?.name) return match.name;
                }
                return typeof val === "string" ? val : "—";
              },
            },
            {
              key: "bestTimeToVisit",
              label: "أفضل وقت للزيارة",
              render: (val) => val || "—",
            },
            {
              key: "slug",
              label: "الرابط",
            },
          ]}
          onEdit={(item: City) => {
            setShowCreateModal(true);
            setSelectedCity(item);
            reset({
              ...item,
              country:
                typeof item.country === "string"
                  ? item.country
                  : item.country?._id || "",
              imageCover:
                typeof item.imageCover === "string"
                  ? { url: item.imageCover, alt: "" }
                  : item.imageCover,
              images: Array.isArray(item.images)
                ? item.images.map((img) =>
                    typeof img === "string" ? { url: img, alt: "" } : img,
                  )
                : [],
              // lat: String(item.coordinates?.lat || ""),
              // lon: String(item.coordinates?.lon || ""),
              imageCoverAlt:
                typeof item.imageCover === "object" && item.imageCover
                  ? item.imageCover.alt
                  : "",
            });
            setEditingSeo(null);
            unregister("seo");
          }}
          onDelete={(id) => {
            deleteCity(`/cities/admin/${id}`);
          }}
          onSeo={(item: City) => {
            setSelectedCity(null);
            setShowUpdateModal(true);
            setEditingSeo(item);
            reset({
              ...item,
              country:
                typeof item.country === "string"
                  ? item.country
                  : item.country?._id || "",
              imageCover:
                typeof item.imageCover === "string"
                  ? { url: item.imageCover, alt: "" }
                  : item.imageCover,
              images: Array.isArray(item.images)
                ? item.images.map((img) =>
                    typeof img === "string" ? { url: img, alt: "" } : img,
                  )
                : [],
              // lat: String(item.coordinates?.lat || ""),
              // lon: String(item.coordinates?.lon || ""),
              imageCoverAlt:
                typeof item.imageCover === "object" && item.imageCover
                  ? item.imageCover.alt
                  : "",
            });
          }}
        />
      </div>
    </>
  );
}
