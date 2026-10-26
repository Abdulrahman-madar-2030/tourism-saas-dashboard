"use client";
import AddItemCard from "@/components/ui/AddItemCard/AddItemCard";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import Modal from "@/components/ui/Modal/Modal";
import Spinner from "@/components/ui/Spinner/Spinner";
import DataTable from "@/components/ui/DataTable/DataTable";
import DataTableHeader from "@/components/ui/DataTable/DataTableHeader";
import { FormField, FormRenderer } from "@/components/common/FormRenderer/FormRenderer";
import { useCrud } from "@/hooks/useCrudQuery";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaStar } from "react-icons/fa";
import { Rate, RateForm } from "@/types/rateType";
import { Pkg } from "@/types/packageTypes";

export default function Rates() {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<RateForm>({
        defaultValues: {
            package: "",
            rate: 5,
            content: "",
            authorName: ""
        },
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRate, setSelectedRate] = useState<Rate | null>(null);

    const {
        data: rates,
        isLoading: isLoadingRates,
        createItem: createRate,
        updateItem: updateRate,
        deleteItem: deleteRate
    } = useCrud<Rate>({
        queryKey: ["rates"],
        endpoint: "/rates",
        useJsonPayload: true,
        handleCloseModal: () => {
            setShowCreateModal(false);
            setSelectedRate(null);
            reset();
        }
    });

    const { data: packages, isLoading: isLoadingPackages } = useCrud<Pkg>({
        queryKey: ["packages"],
        endpoint: "/packages",
    });

    const rateFormSchema: FormField<RateForm>[] = [
        {
            name: "package",
            label: "الباقة",
            type: "select",
            required: true,
            options: (packages || []).map((pkg: Pkg) => ({
                label: pkg.name,
                value: pkg._id,
            })),
        },
        {
            name: "authorName",
            label: "اسم المستخدم",
            type: "text",
            required: true,
            placeholder: "مثال: أحمد محمد",
        },
        {
            name: "rate",
            label: "التقييم",
            type: "number",
            required: true,
            placeholder: "1-5",
        },
        {
            name: "content",
            label: "التعليق",
            type: "textarea",
            required: true,
            placeholder: "اكتب تعليقك هنا...",
        },
    ];

    async function onSubmit(formData: RateForm) {
        if (selectedRate?._id) {
            await updateRate({
                id: selectedRate._id,
                body: formData,
            });
        } else {
            await createRate(formData);
        }
    }

    if (isLoadingRates || isLoadingPackages) {
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
                    setSelectedRate(null);
                    reset();
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold mb-2">
                        {selectedRate ? "تعديل تقييم" : "إضافة تقييم جديد"}
                    </h2>
                    <FormRenderer
                        fields={rateFormSchema}
                        register={register}
                        control={control}
                        errors={errors}
                        setValue={setValue}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? <span className="spinner"></span> : (selectedRate ? "تعديل" : "إضافة")}
                    </button>
                </form>
            </Modal>

            <div className="space-y-6">
                <BreadCrumb breadCrumbItems="المراجعات" />

                <PageHeader
                    pageName="المراجعات"
                    pageDescription="إدارة تقييمات العملاء هنا"
                    PageIcon={FaStar}
                />

                <div className="space-y-4">
                    <DataTableHeader
                        title="المراجعات"
                        action={
                            <AddItemCard
                                label="إضافة تقييم جديد"
                                setShowCreateModal={() => {
                                    setShowCreateModal(true);
                                    setSelectedRate(null);
                                    reset();
                                }}
                            />
                        }
                    />
                    <DataTable
                        data={rates || []}
                        columns={[
                            {
                                key: "authorName",
                                label: "المستخدم",
                            },
                            {
                                key: "rate",
                                label: "التقييم",
                                render: (rating) => (
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                        <FaStar className="w-3 h-3" />
                                        {rating}
                                    </div>
                                ),
                            },
                            {
                                key: "content",
                                label: "التعليق",
                                render: (comment) => <span className="line-clamp-1 max-w-[200px]">{comment}</span>,
                            },
                            {
                                key: "package",
                                label: "الباقة",
                                render: (pkg) => packages?.find((p) => p._id === pkg)?.name || "باقة محذوفة",
                            },
                            {
                                key: "createdAt",
                                label: "تاريخ التقييم",
                                render: (date) => new Date(date).toLocaleDateString(),
                            },
                            {
                                key: "actions",
                                label: "الإجراءات",
                            },
                        ]}
                        onEdit={(item) => {
                            setSelectedRate(item as Rate);
                            reset({
                                ...item,
                                package: typeof item.package === "string" ? item.package : item.package._id,
                            });
                            setShowCreateModal(true);
                        }}
                        onDelete={(id) => {
                            deleteRate(`/rates/${id}`);
                        }}
                    />
                </div>
            </div>
        </>
    );
}
