"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CountryInfo, CountryInfoForm } from "@/types/countryTypes";
import { useCrud } from "@/hooks/useCrudQuery";
import Modal from "@/components/ui/Modal/Modal";
import { FormField, FormRenderer } from "@/components/common/FormRenderer/FormRenderer";
import DataTable, { TableColumn } from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import { FaInfoCircle } from "react-icons/fa";
import Spinner from "@/components/ui/Spinner/Spinner";

interface CountryInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryId: string;
  countryName: string;
}

const countryInfoFormSchema: FormField<CountryInfoForm>[] = [
  {
    name: "title",
    label: "العنوان",
    type: "text",
    placeholder: "مثال: متطلبات التأشيرة",
    required: true,
  },
  {
    name: "solution",
    label: "الحل",
    type: "textarea",
    placeholder: "الحل المقترح",
    required: true,
  },
  {
    name: "description",
    label: "الوصف",
    type: "textarea",
    placeholder: "وصف تفصيلي",
    required: true,
  },
];

export default function CountryInfoModal({
  isOpen,
  onClose,
  countryId,
  countryName,
}: CountryInfoModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CountryInfoForm>({
    defaultValues: {
      title: "",
      solution: "",
      description: "",
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<CountryInfo | null>(null);

  const {
    data: countryInfos,
    isLoading,
    createItem: createCountryInfo,
    updateItem: updateCountryInfo,
    deleteItem: deleteCountryInfo,
  } = useCrud<CountryInfo[]>({
    queryKey: ["country-info", countryId],
    endpoint: `/countries/${countryId}/country-info`,
    select: (res: any) => {
      const array = res?.data?.countryInfo || res?.data?.data || res?.data || res || [];
      return Array.isArray(array) ? array : [];
    },
    handleCloseModal: () => {
      setShowCreateModal(false);
      setSelectedInfo(null);
    },
    enabled: isOpen && !!countryId,
  });

  // Reset state when modal opens/closes
  if (!isOpen) {
    if (showCreateModal || selectedInfo) {
      setShowCreateModal(false);
      setSelectedInfo(null);
      reset({ title: "", solution: "", description: "" });
    }
  }

  const onSubmit = async (formData: CountryInfoForm) => {
    if (selectedInfo?._id) {
      await updateCountryInfo({
        id: selectedInfo._id,
        endpoint: `/countries/${countryId}/country-info`,
        body: formData,
      });
    } else {
      await createCountryInfo({
        endpoint: `/countries/${countryId}/country-info`,
        body: formData,
      });
    }
    setShowCreateModal(false);
    setSelectedInfo(null);
    reset({ title: "", solution: "", description: "" });
  };

  const handleEdit = (info: CountryInfo) => {
    setSelectedInfo(info);
    reset({
      title: info.title,
      solution: info.solution,
      description: info.description,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (infoId: string) => {
    await deleteCountryInfo(
      `/countries/${countryId}/country-info/${infoId}`
    );
  };

  const columns: TableColumn<CountryInfo>[] = [
    { key: "title", label: "العنوان" },
    {
      key: "solution",
      label: "الحل",
      render: (value: string) => (
        <span className="text-sm text-gray-600 line-clamp-2 max-w-[200px]">
          {value}
        </span>
      ),
    },
    {
      key: "description",
      label: "الوصف",
      render: (value: string) => (
        <span className="text-sm text-gray-600 line-clamp-2 max-w-[300px]">
          {value}
        </span>
      ),
    },
    { key: "actions", label: "الإجراءات" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b pb-4">
          <FaInfoCircle className="text-primary text-2xl" />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              معلومات إضافية - {countryName}
            </h2>
            <p className="text-sm text-gray-500">إدارة المعلومات الإضافية للدولة</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Spinner />
          </div>
        ) : (
          <>
            <DataTableHeader
              title="قائمة المعلومات"
              action={
                <button
                  onClick={() => {
                    setSelectedInfo(null);
                    reset({ title: "", solution: "", description: "" });
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  إضافة معلومة جديدة
                </button>
              }
            />

            <DataTable
              data={countryInfos || []}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedInfo(null);
          reset({ title: "", solution: "", description: "" });
        }}
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {selectedInfo?._id ? "تعديل المعلومة" : "إضافة معلومة جديدة"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <FormRenderer
              fields={countryInfoFormSchema}
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="p-3 flex items-center justify-center bg-secondary/30 text-primary rounded-lg border-2 border-primary/40 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <div className="spinner"></div> : "حفظ"}
            </button>
          </form>
        </div>
      </Modal>
    </Modal>
  );
}
