"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { FaCar, FaPlane } from "react-icons/fa";
import {
  FormField,
  FormRenderer,
} from "@/components/common/FormRenderer/FormRenderer";

import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import DataTable from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import Image from "next/image";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Spinner from "@/components/ui/Spinner/Spinner";
import { useCrud } from "@/hooks/useCrudQuery";
import { useForm } from "react-hook-form";
import { useState } from "react";

type EntityType = "services" | "airlines";

const serviceFormSchema: FormField<any>[] = [
  {
    name: "name",
    label: "اسم الخدمة",
    type: "text",
    required: true,
    placeholder: "مثال: خدمة حجز الفنادق",
  },
  {
    name: "method",
    label: "الطريقة",
    type: "text",
    placeholder: "طريقة تقديم الخدمة",
  },
  {
    name: "summary",
    label: "الملخص",
    type: "text",
    placeholder: "ملخص الخدمة",
  },
  {
    name: "alt",
    label: "وصف بديل للصورة",
    type: "text",
    placeholder: "وصف الصورة",
  },
  {
    name: "description",
    label: "وصف الخدمة",
    type: "textarea",
    placeholder: "اكتب وصف الخدمة هنا",
  },
  {
    name: "imageCover",
    label: "صورة",
    type: "singleImage",
    required: true,
  },
];

const airlineFormSchema: FormField<any>[] = [
  {
    name: "name",
    label: "اسم شركة الطيران",
    type: "text",
    required: true,
    placeholder: "مثال: الخطوط الجوية القطرية",
  },
  {
    name: "alt",
    label: "وصف بديل للصورة",
    type: "text",
    required: true,
    placeholder: "شعار الخطوط الجوية القطرية",
  },
  {
    name: "imageCover",
    label: "شعار شركة الطيران",
    type: "singleImage",
    required: true,
  },
];

export default function Other() {
  const [activeTab, setActiveTab] = useState<EntityType>("services");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<any>();

  const {
    data: items,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useCrud({
    queryKey: [activeTab],
    endpoint: `/${activeTab}`,
    handleCloseModal: () => {
      setShowCreateModal(false);
      reset({});
    },
  });

  const onSubmit = async (formData: any) => {
    const { alt, ...rest } = formData;

    if (activeTab === "airlines") {
      const payload = {
        body: {
          ...rest,
        },
        imageCover: formData.imageCover,
        imageCoverAlt: alt,
      };

      if (selectedEntity?._id) {
        await updateItem({
          id: selectedEntity._id,
          endpoint: `/${activeTab}/admin`,
          ...payload,
        });
      } else {
        await createItem({
          ...payload,
          endpoint: `/${activeTab}`,
        });
      }

      return;
    }
    const payload = {
      body: {
        ...rest,
      },
      image: formData.imageCover,
      imageAlt: alt,
    };

    if (selectedEntity?._id) {
      await updateItem({
        id: selectedEntity._id,
        endpoint: `/${activeTab}/admin`,
        ...payload,
      });
    } else {
      await createItem({
        ...payload,
        endpoint: `/${activeTab}`,
      });
    }
  };

  const getEntityName = (type: EntityType) => {
    if (type === "services") return "الخدمات";
    return "شركات الطيران";
  };

  const getFields = () => {
    if (activeTab === "services") return serviceFormSchema;
    return airlineFormSchema;
  };

  const getColumns = () => {
    const baseColumns = [
      {
        key: activeTab === "services" ? "image" : "imageCover",
        label: activeTab === "airlines" ? "الشعار" : "الصورة",
        render: (item: any) => (
          <Image
            src={item?.url || "/placeholder.png"}
            alt="cover"
            width={80}
            height={80}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ),
      },
      { key: "name", label: "الاسم" },
    ];

    if (activeTab === "services") {
      return [
        ...baseColumns,
        { key: "method", label: "الطريقة" },
        {
          key: "summary",
          label: "الملخص",
          render: (item: any) => <p className="max-w-xs truncate">{item}</p>,
        },
        { key: "actions", label: "الإجراءات" },
      ];
    }

    return [...baseColumns, { key: "actions", label: "الإجراءات" }];
  };

  if (isLoading) return <Spinner />;

  return (
    <>
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedEntity(null);
          reset({});
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <FormRenderer
            fields={getFields()}
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="p-3 flex items-center justify-center bg-secondary/30 text-primary rounded-lg border-2 border-primary/40"
          >
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </form>
      </Modal>

      <PageHeader
        pageName="أخرى"
        pageDescription="تحكم بالعروض والخدمات وشركات الطيران"
        PageIcon={activeTab === "services" ? FaCar : FaPlane}
      />

      <div className="my-6">
        <BreadCrumb breadCrumbItems="أخرى" />
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          {(["services", "airlines"] as EntityType[]).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {getEntityName(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <DataTableHeader
          title={`قائمة ${getEntityName(activeTab)}`}
          action={
            <AddItemCard
              label="إضافة جديد"
              setShowCreateModal={() => {
                setShowCreateModal(true);
                setSelectedEntity(null);
                reset({});
              }}
            />
          }
        />

        <DataTable
          data={items || []}
          columns={getColumns()}
          onEdit={(item) => {
            setSelectedEntity(item);
            setShowCreateModal(true);
            reset(item);
          }}
          onDelete={(id) => {
            deleteItem(`/${activeTab}/admin/${id}`);
          }}
        />
      </div>
    </>
  );
}
