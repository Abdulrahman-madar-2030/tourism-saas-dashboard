"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CountryFAQ, CountryFAQForm } from "@/types/countryTypes";
import { useCrud } from "@/hooks/useCrudQuery";
import Modal from "@/components/ui/Modal/Modal";
import { FormField, FormRenderer } from "@/components/common/FormRenderer/FormRenderer";
import DataTable, { TableColumn } from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import { FaQuestionCircle } from "react-icons/fa";
import Spinner from "@/components/ui/Spinner/Spinner";

interface CountryFAQsModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryId: string;
  countryName: string;
}

const countryFAQFormSchema: FormField<CountryFAQForm>[] = [
  {
    name: "question",
    label: "السؤال",
    type: "text",
    placeholder: "مثال: ما أفضل وقت لزيارة الدولة؟",
    required: true,
  },
  {
    name: "answer",
    label: "الإجابة",
    type: "textarea",
    placeholder: "مثال: من أكتوبر إلى أبريل",
    required: true,
  },
  {
    name: "displayOrder",
    label: "ترتيب العرض",
    type: "number",
    placeholder: "مثال: 1",
    required: true,
  },
  {
    name: "isActive",
    label: "نشط",
    type: "checkbox",
  },
];

export default function CountryFAQsModal({
  isOpen,
  onClose,
  countryId,
  countryName,
}: CountryFAQsModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CountryFAQForm>({
    defaultValues: {
      question: "",
      answer: "",
      displayOrder: 1,
      isActive: true,
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<CountryFAQ | null>(null);

  const {
    data: faqs,
    isLoading,
    createItem: createFAQ,
    updateItem: updateFAQ,
    deleteItem: deleteFAQ,
  } = useCrud<CountryFAQ[]>({
    queryKey: ["country-faqs", countryId],
    endpoint: `/countries/${countryId}/faqs`,
    select: (res: any) => {
      const array = res?.data?.faqs || res?.data?.data || res?.data || res || [];
      return Array.isArray(array) ? array : [];
    },
    handleCloseModal: () => {
      setShowCreateModal(false);
      setSelectedFAQ(null);
    },
    enabled: isOpen && !!countryId,
  });

  // Reset state when modal opens/closes
  if (!isOpen) {
    if (showCreateModal || selectedFAQ) {
      setShowCreateModal(false);
      setSelectedFAQ(null);
      reset({ question: "", answer: "", displayOrder: 1, isActive: true });
    }
  }

  const onSubmit = async (formData: CountryFAQForm) => {
    if (selectedFAQ?._id) {
      await updateFAQ({
        id: selectedFAQ._id,
        endpoint: `/countries/${countryId}/faqs`,
        body: formData,
      });
    } else {
      await createFAQ({
        endpoint: `/countries/${countryId}/faqs`,
        body: formData,
      });
    }
    setShowCreateModal(false);
    setSelectedFAQ(null);
    reset({ question: "", answer: "", displayOrder: 1, isActive: true });
  };

  const handleEdit = (faq: CountryFAQ) => {
    setSelectedFAQ(faq);
    reset({
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder,
      isActive: faq.isActive,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (faqId: string) => {
    await deleteFAQ(`/countries/${countryId}/faqs/${faqId}`);
  };

  const columns: TableColumn<CountryFAQ>[] = [
    { key: "question", label: "السؤال" },
    {
      key: "answer",
      label: "الإجابة",
      render: (value: string) => (
        <span className="text-sm text-gray-600 line-clamp-2 max-w-[300px]">
          {value}
        </span>
      ),
    },
    { key: "displayOrder", label: "الترتيب" },
    {
      key: "isActive",
      label: "الحالة",
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {value ? "نشط" : "غير نشط"}
        </span>
      ),
    },
    { key: "actions", label: "الإجراءات" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b pb-4">
          <FaQuestionCircle className="text-primary text-2xl" />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              الأسئلة الشائعة - {countryName}
            </h2>
            <p className="text-sm text-gray-500">إدارة الأسئلة الشائعة للدولة</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Spinner />
          </div>
        ) : (
          <>
            <DataTableHeader
              title="قائمة الأسئلة الشائعة"
              action={
                <button
                  onClick={() => {
                    setSelectedFAQ(null);
                    reset({ question: "", answer: "", displayOrder: 1, isActive: true });
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  إضافة سؤال جديد
                </button>
              }
            />

            <DataTable
              data={faqs || []}
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
          setSelectedFAQ(null);
          reset({ question: "", answer: "", displayOrder: 1, isActive: true });
        }}
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {selectedFAQ?._id ? "تعديل السؤال" : "إضافة سؤال جديد"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <FormRenderer
              fields={countryFAQFormSchema}
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
