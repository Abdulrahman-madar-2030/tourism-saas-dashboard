"use client";

import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import Modal from "@/components/ui/Modal/Modal";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Spinner from "@/components/ui/Spinner/Spinner";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaExclamationTriangle } from "react-icons/fa";
import { BookingIssue, BookingIssueForm } from "@/types/bookingIssueTypes";
import DataTable from "@/components/ui/DataTable/DataTable";
import {
  FormField,
  FormRenderer,
} from "@/components/common/FormRenderer/FormRenderer";
import { useCrud } from "@/hooks/useCrudQuery";

const bookingIssueFormSchema: FormField<BookingIssueForm>[] = [
  {
    name: "problem",
    label: "المشكلة",
    type: "text",
    placeholder: "مثال: رسوم إضافية",
    required: true,
  },
  {
    name: "problemDescription",
    label: "وصف المشكلة",
    type: "textarea",
    placeholder: "وصف تفصيلي للمشكلة",
    required: true,
  },
  {
    name: "solution",
    label: "الحل",
    type: "text",
    placeholder: "مثال: التواصل مع الدعم",
    required: true,
  },
  {
    name: "solutionDescription",
    label: "وصف الحل",
    type: "textarea",
    placeholder: "شرح تفصيلي للحل",
    required: true,
  },
];

export default function BookingIssues() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingIssueForm>({
    defaultValues: {
      problem: "",
      problemDescription: "",
      solution: "",
      solutionDescription: "",
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<BookingIssue | null>(null);

  const {
    data: bookingIssues,
    isLoading,
    createItem: createBookingIssue,
    updateItem: updateBookingIssue,
    deleteItem: deleteBookingIssue,
  } = useCrud<BookingIssue[]>({
    queryKey: ["booking-issues"],
    endpoint: "/booking-issues",
    select: (res: any) => {
      const array = res?.data?.bookingIssues || res?.data?.data || res?.data || res || [];
      return Array.isArray(array) ? array : [];
    },
    handleCloseModal: () => {
      setShowCreateModal(false);
      setSelectedIssue(null);
    },
  });

  const onSubmit = async (formData: BookingIssueForm) => {
    if (selectedIssue?._id) {
      await updateBookingIssue({
        id: selectedIssue._id,
        endpoint: "/booking-issues",
        body: formData,
      });
    } else {
      await createBookingIssue({
        endpoint: "/booking-issues",
        body: formData,
      });
    }
    setShowCreateModal(false);
    setSelectedIssue(null);
    reset({
      problem: "",
      problemDescription: "",
      solution: "",
      solutionDescription: "",
    });
  };

  const handleEdit = (issue: BookingIssue) => {
    setSelectedIssue(issue);
    reset({
      problem: issue.problem,
      problemDescription: issue.problemDescription,
      solution: issue.solution,
      solutionDescription: issue.solutionDescription,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: string) => {
    await deleteBookingIssue(`/booking-issues/${id}`);
  };

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
          setSelectedIssue(null);
          reset({
            problem: "",
            problemDescription: "",
            solution: "",
            solutionDescription: "",
          });
        }}
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {selectedIssue?._id ? "تعديل مشكلة الحجز" : "إضافة مشكلة حجز جديدة"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <FormRenderer
              fields={bookingIssueFormSchema}
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

      <PageHeader
        pageName="مشاكل الحجز"
        pageDescription="إدارة مشاكل الحجز وحلولها"
        PageIcon={FaExclamationTriangle}
      />
      <div className="my-6">
        <BreadCrumb breadCrumbItems="مشاكل الحجز" />
      </div>

      <div className="space-y-4">
        <DataTableHeader
          title="قائمة المشاكل"
          action={
            <AddItemCard
              label="إضافة مشكلة جديدة"
              setShowCreateModal={() => {
                setShowCreateModal(true);
                setSelectedIssue(null);
                reset({
                  problem: "",
                  problemDescription: "",
                  solution: "",
                  solutionDescription: "",
                });
              }}
            />
          }
        />
        <DataTable
          data={bookingIssues || []}
          columns={[
            {
              key: "problem",
              label: "المشكلة",
            },
            {
              key: "problemDescription",
              label: "وصف المشكلة",
              render: (value: string) => (
                <span className="text-sm text-gray-600 line-clamp-2 max-w-[250px]">
                  {value}
                </span>
              ),
            },
            {
              key: "solution",
              label: "الحل",
            },
            {
              key: "solutionDescription",
              label: "وصف الحل",
              render: (value: string) => (
                <span className="text-sm text-gray-600 line-clamp-2 max-w-[250px]">
                  {value}
                </span>
              ),
            },
            { key: "actions", label: "الإجراءات" },
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
