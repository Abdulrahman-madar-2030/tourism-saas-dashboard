"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Spinner from "@/components/ui/Spinner/Spinner";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaBuilding } from "react-icons/fa6";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import { Country } from "@/types/countryTypes";
import {
  FormField,
  FormRenderer,
} from "@/components/common/FormRenderer/FormRenderer";
import { useCrud, getImgsUrl } from "@/hooks/useCrudQuery";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import DataTable from "@/components/ui/DataTable/DataTable";
import Image from "next/image";
import dynamic from "next/dynamic";
import { OfficeBranch, OfficeBranchForm } from "@/types/officeBranchTypes";

const MapPicker = dynamic(() => import("@/components/ui/MapPicker/MapPicker"), {
  ssr: false,
});

const formSchema: FormField<OfficeBranchForm>[] = [
  {
    name: "name",
    label: "اسم الفرع",
    type: "text",
    required: true,
    placeholder: "مثال: فرع الرياض الرئيسي",
  },
  {
    name: "address",
    label: "العنوان بالتفصيل",
    type: "text",
    required: true,
    placeholder: "مثال: حي المرسلات - طريق أبو بكر الصديق",
  },
  {
    name: "openTime",
    label: "وقت الفتح",
    type: "time",
    required: true,
  },
  {
    name: "closeTime",
    label: "وقت الإغلاق",
    type: "time",
    required: true,
  },
  {
    name: "image",
    label: "صورة الفرع",
    type: "singleImage",
    required: true,
  },
];

export default function OfficeBranches() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OfficeBranchForm>({
    defaultValues: {
      name: "",
      address: "",
      country: "",
      openTime: "09:00",
      closeTime: "23:00",
      lat: "24.7136",
      lng: "46.6753",
      image: undefined,
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<OfficeBranch | null>(null);

  const {
    data: branches,
    isLoading,
    refetch,
    deleteItem: deleteBranch,
  } = useCrud({
    queryKey: ["branches"],
    endpoint: "/branches",
    select: (res: any) => {
      const arr = res?.data?.data ?? res?.data ?? res;
      return Array.isArray(arr) ? arr : [];
    },
    handleCloseModal: () => {
      setShowCreateModal(false);
    },
    enabled: true,
  });

  const { data: countries } = useCrud<Country[]>({
    queryKey: ["countries", "branches"],
    endpoint: "/countries",
    select: (res: any) => {
      const arr = res?.data?.data ?? res?.data ?? res;
      return Array.isArray(arr) ? arr : [];
    },
    enabled: true,
  });

  const countriesList: Country[] = Array.isArray(countries) ? countries : [];

  const countryOptions = countriesList
    .filter((c: any) => Boolean(c?.name || (c as any)?.nameAr))
    .map((country: Country) => ({
      label: country.name || (country as any).nameAr || "",
      value: country._id,
    }));

  async function onSubmit(formData: OfficeBranchForm) {
    try {
      if (!formData.name?.trim()) {
        toast.error("يرجى إدخال اسم الفرع");
        return;
      }
      if (!formData.country) {
        toast.error("يرجى اختيار الدولة");
        return;
      }
      if (!formData.address?.trim()) {
        toast.error("يرجى إدخال عنوان الفرع");
        return;
      }
      if (!formData.lat || !formData.lng) {
        toast.error("يرجى تحديد الموقع على الخريطة");
        return;
      }

      if (formData.openTime && formData.closeTime) {
        if (formData.closeTime <= formData.openTime) {
          toast.error("يجب أن يكون وقت الإغلاق بعد وقت الفتح");
          return;
        }
      }

      // Handle Image Upload - Backend strictly requires body.image to be an object: { url, alt, ... }
      let imageObj: { url: string; alt?: string; publicId?: string } | null = null;

      if (formData.image instanceof File) {
        const uploadRes = await getImgsUrl(formData.image);
        const raw = uploadRes?.data?.data || uploadRes?.data || uploadRes;
        if (raw?.url) {
          imageObj = {
            url: raw.url,
            alt: formData.name.trim(),
            ...(raw.publicId || raw.public_id
              ? { publicId: raw.publicId || raw.public_id }
              : {}),
          };
        }
      } else if (typeof formData.image === "string" && formData.image) {
        imageObj = {
          url: formData.image,
          alt: formData.name.trim(),
        };
      } else if (
        formData.image &&
        typeof formData.image === "object" &&
        (formData.image as any).url
      ) {
        imageObj = {
          url: (formData.image as any).url,
          alt: (formData.image as any).alt || formData.name.trim(),
          ...((formData.image as any).publicId || (formData.image as any).public_id
            ? {
                publicId:
                  (formData.image as any).publicId ||
                  (formData.image as any).public_id,
              }
            : {}),
        };
      } else if (selectedBranch?.image && typeof selectedBranch.image === "object" && (selectedBranch.image as any).url) {
        imageObj = {
          url: (selectedBranch.image as any).url,
          alt: (selectedBranch.image as any).alt || formData.name.trim(),
        };
      } else if (selectedBranch?.imageCover && typeof selectedBranch.imageCover === "object" && (selectedBranch.imageCover as any).url) {
        imageObj = {
          url: (selectedBranch.imageCover as any).url,
          alt: (selectedBranch.imageCover as any).alt || formData.name.trim(),
        };
      } else if (typeof selectedBranch?.image === "string" && selectedBranch.image) {
        imageObj = {
          url: selectedBranch.image,
          alt: formData.name.trim(),
        };
      }

      if (!imageObj || !imageObj.url) {
        toast.error("يرجى اختيار صورة للفرع");
        return;
      }

      // Exact body schema matching backend validator:
      // name, address, country, lat, lng, openTime, closeTime, image (as object)
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        country: formData.country,
        lat: Number(formData.lat) || formData.lat,
        lng: Number(formData.lng) || formData.lng,
        openTime: formData.openTime || "09:00",
        closeTime: formData.closeTime || "23:00",
        image: imageObj,
      };

      if (selectedBranch?._id) {
        await api.patch(`/branches/${selectedBranch._id}`, payload);
        toast.success("تم تحديث الفرع بنجاح");
      } else {
        await api.post("/branches", payload);
        toast.success("تم إنشاء الفرع بنجاح");
      }

      setShowCreateModal(false);
      refetch();
    } catch (error: unknown) {
      const err = error as any;
      if (err?.message === "Authentication cancelled by user") return;
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        err.response.data.errors.forEach((e: any) =>
          toast.error(typeof e === "string" ? e : e.message || "خطأ في البيانات")
        );
      } else {
        toast.error(
          err?.response?.data?.message || "حدث خطأ أثناء حفظ بيانات الفرع"
        );
      }
    }
  }

  async function handleDelete(id: string, name = "هذا الفرع") {
    if (!confirm(`هل أنت متأكد من حذف الفرع "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    try {
      await deleteBranch(`/branches/${id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "فشل في حذف الفرع");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div className="p-1">
          <h3 className="text-lg font-bold mb-4 text-foreground">
            {selectedBranch ? "تعديل بيانات الفرع" : "إضافة فرع جديد"}
          </h3>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <div>
              <SelectMenu
                label="الدولة"
                options={countryOptions}
                name="country"
                control={control}
                required
                placeholder="اختر الدولة..."
              />
            </div>

            <FormRenderer
              fields={formSchema}
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                الموقع الجغرافي على الخريطة
              </label>
              <MapPicker
                lat={watch("lat") || "24.7136"}
                lng={watch("lng") || "46.6753"}
                onChange={(lat, lng) => {
                  setValue("lat", String(lat));
                  setValue("lng", String(lng));
                }}
                error={errors.lat || errors.lng ? "يرجى تحديد الموقع" : undefined}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 p-3.5 flex items-center justify-center bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="spinner"></div>
              ) : selectedBranch ? (
                "حفظ التعديلات"
              ) : (
                "إضافة الفرع"
              )}
            </button>
          </form>
        </div>
      </Modal>

      <PageHeader
        pageName="فروع المكاتب"
        pageDescription="إدارة ومتابعة شبكة فروع ومكاتب شركات ووكالات السياحة حول العالم"
        PageIcon={FaBuilding}
      />
      <div className="my-6">
        <BreadCrumb breadCrumbItems="فروع المكاتب" />
      </div>

      <div className="space-y-4">
        <DataTableHeader
          title="فروع المكاتب"
          action={
            <AddItemCard
              label="إضافة فرع جديد"
              setShowCreateModal={() => {
                setShowCreateModal(true);
                setSelectedBranch(null);
                reset({
                  name: "",
                  address: "",
                  country: countriesList[0]?._id || "",
                  openTime: "09:00",
                  closeTime: "23:00",
                  lat: "24.7136",
                  lng: "46.6753",
                  image: undefined,
                });
              }}
            />
          }
        />
        <DataTable
          data={branches || []}
          columns={[
            {
              key: "image",
              label: "صورة الفرع",
              render: (val, row: any) => {
                const src =
                  (typeof val === "string" ? val : val?.url) ||
                  (typeof row?.image === "string" ? row.image : row?.image?.url) ||
                  row?.imageCover?.url ||
                  (typeof row?.imageCover === "string" ? row.imageCover : null) ||
                  row?.country?.imageCover?.url ||
                  null;

                return src ? (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border shadow-xs bg-muted flex-shrink-0">
                    <img
                      src={src}
                      alt={row?.name || "صورة الفرع"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = "flex";
                        }
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center bg-muted text-muted-foreground text-[10px]">
                      لا صورة
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground text-[10px] flex-shrink-0">
                    لا صورة
                  </div>
                );
              },
            },
            { key: "name", label: "اسم الفرع" },
            {
              key: "country",
              label: "الدولة",
              render: (item) => {
                if (!item) return "—";
                if (typeof item === "object") return item.name || item.title || "—";
                const matched = countriesList.find(
                  (c: any) => c._id === item || c.id === item
                );
                return matched?.name || item || "—";
              },
            },
            { key: "address", label: "العنوان" },
            {
              key: "coordinates",
              label: "الموقع الجغرافي",
              render: (_val, row: any) => {
                const lat = row?.lat ?? row?.coordinates?.lat;
                const lng = row?.lng ?? row?.coordinates?.lng;
                if (!lat || !lng) return "—";
                return (
                  <a
                    href={`https://maps.google.com/?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
                  >
                    📍 {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
                  </a>
                );
              },
            },
            {
              key: "workingHours",
              label: "أوقات العمل",
              render: (_val, row: any) => {
                const open = row?.openTime || row?.workingHours?.from;
                const close = row?.closeTime || row?.workingHours?.to;
                if (!open && !close) return "—";
                return (
                  <span className="text-xs font-semibold font-mono">
                    {open || "—"} - {close || "—"}
                  </span>
                );
              },
            },
            { key: "actions", label: "الإجراءات" },
          ]}
          onEdit={(item: any) => {
            setShowCreateModal(true);
            setSelectedBranch(item);

            const countryId =
              typeof item.country === "object"
                ? item.country?._id
                : item.country || "";

            const latVal =
              item.lat ??
              item.coordinates?.lat ??
              24.7136;
            const lngVal =
              item.lng ??
              item.coordinates?.lng ??
              46.6753;

            const fromTime = item.openTime || item.workingHours?.from || "09:00";
            const toTime = item.closeTime || item.workingHours?.to || "23:00";

            const imgSrc =
              typeof item.image === "string"
                ? item.image
                : item.image?.url ||
                  item.imageCover?.url ||
                  item.imageCover ||
                  null;

            reset({
              name: item.name || "",
              country: countryId,
              address: item.address || "",
              openTime: fromTime,
              closeTime: toTime,
              lat: String(latVal),
              lng: String(lngVal),
              image: imgSrc,
            });
          }}
          onDelete={(id: string) => {
            const branch = (branches || []).find((b: any) => b._id === id);
            handleDelete(id, branch?.name || "هذا الفرع");
          }}
        />
      </div>
    </>
  );
}
