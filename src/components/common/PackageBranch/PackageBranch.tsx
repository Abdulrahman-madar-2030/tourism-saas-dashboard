import { Branch } from "@/types/branches";
import { useEffect, useState } from "react";
import { FormField, FormRenderer } from "../FormRenderer/FormRenderer";
import { useFieldArray, useForm, Path } from "react-hook-form";
import FormInput from "@/components/ui/FieldInput/FieldInput";
import BranchDay from "./BranchDay";
import { BiPlus, BiTrash, BiLayer } from "react-icons/bi";

export const branchFormSchema: FormField<Branch>[] = [
    {
        name: "name",
        label: "Branch Name",
        type: "text",
        required: true,
        className: "col-span-2 md:col-span-1"
    },
    {
        name: "price",
        label: "Price (USD)",
        type: "number",
        required: true,
        className: "col-span-2 md:col-span-1"
    },
    {
        name: "daysCount",
        label: "Total Days",
        type: "number",
        required: true,
        className: "col-span-1"
    },
    {
        name: "nightsCount",
        label: "Total Nights",
        type: "number",
        required: true,
        className: "col-span-1"
    },
]

export default function PackageBranch({
    branch,
    onSave,
    onDelete,
    isSaving,
    isDeleting
}: {
    branch: Branch;
    onSave?: (data: Branch, id: string) => void;
    onDelete?: (id: string) => void;
    isSaving?: boolean;
    isDeleting?: boolean;
}) {
    const [openDayIndex, setOpenDayIndex] = useState<number | null>(0);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        control,
        formState: { errors },
    } = useForm<Branch>({
        defaultValues: {
            name: branch?.name,
            daysCount: branch?.daysCount,
            nightsCount: branch?.nightsCount,
            price: branch?.price,
            includes: (branch?.includes || []).map((item: string | { value: string }) => typeof item === 'string' ? { value: item } : item),
            excludes: (branch?.excludes || []).map((item: string | { value: string }) => typeof item === 'string' ? { value: item } : item),
            days: branch?.days ?? [],
        },
    });

    // Fix: Update form values when branch data changes
    useEffect(() => {
        if (branch) {
            reset({
                name: branch.name,
                daysCount: branch.daysCount,
                nightsCount: branch.nightsCount,
                price: branch.price,
                includes: (branch.includes || []).map((item: string | { value: string }) => typeof item === 'string' ? { value: item } : item),
                excludes: (branch.excludes || []).map((item: string | { value: string }) => typeof item === 'string' ? { value: item } : item),
                days: branch.days ?? [],
            });
        }
    }, [branch, reset]);

    const { fields: includesFields, append: includesAppend, remove: includesRemove } = useFieldArray({
        control,
        name: "includes",
    });
    const { fields: excludesFields, append: excludesAppend, remove: excludesRemove } = useFieldArray({
        control,
        name: "excludes",
    });
    const { fields: daysFields, append: daysAppend, remove: daysRemove } = useFieldArray({
        control,
        name: "days",
    });

    const onSubmit = (data: Branch) => {
        if (onSave && branch?._id) {
            onSave(data, branch._id);
        } else {
            console.log(data);
        }
    }

    const toggleDay = (index: number) => {
        setOpenDayIndex(prev => prev === index ? null : index);
    }

    return (
        <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* Main Information Card */}
                <div className="bg-background p-6 rounded-xl border border-border">
                    <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <BiLayer className="text-xl" />
                            </div>
                            <h2 className="text-lg font-semibold text-foreground">تفاصيل الفرع</h2>
                        </div>

                        {/* Delete Branch Button */}
                        {onDelete && branch?._id && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this branch?")) {
                                        onDelete(branch._id!);
                                    }
                                }}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "جاري الحذف..." : <><BiTrash /> حذف الفرع</>}
                            </button>
                        )}
                    </div>

                    <FormRenderer
                        fields={branchFormSchema || []}
                        register={register}
                        control={control}
                        errors={errors}
                        setValue={setValue}
                        className="grid grid-cols-2 gap-6"
                    />
                </div>

                {/* Includes & Excludes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Includes */}
                    <div className="bg-background p-6 rounded-xl border border-border flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-base font-semibold text-foreground flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-success"></span> يشمل
                            </span>
                            <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full">{includesFields.length} عنصر</span>
                        </div>
                        <div className="flex-1 space-y-3 mb-4">
                            {includesFields?.map((field, index) => (
                                <div key={field.id} className="flex gap-2 relative group">
                                    <FormInput
                                        name={`includes.${index}.value` as Path<Branch>}
                                        register={register}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        error={(errors.includes?.[index] as any)?.value}
                                        type="text"
                                        placeholder="e.g., Flight Tickets"
                                        className="bg-gray-50 focus:bg-white transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => includesRemove(index)}
                                        className="text-muted-foreground hover:text-destructive p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                        <BiTrash className="text-lg" />
                                    </button>
                                </div>
                            ))}
                            {includesFields.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">لم تتم إضافة عناصر بعد.</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => includesAppend({ value: "" })}
                            className="w-full py-2.5 border-2 border-dashed border-border text-muted-foreground rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                        >
                            <BiPlus className="text-lg" /> إضافة عنصر
                        </button>
                    </div>

                    {/* Excludes */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> Excludes
                            </span>
                            <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{excludesFields.length} items</span>
                        </div>
                        <div className="flex-1 space-y-3 mb-4">
                            {excludesFields?.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <FormInput
                                        name={`excludes.${index}.value` as Path<Branch>}
                                        register={register}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        error={(errors.excludes?.[index] as any)?.value}
                                        type="text"
                                        placeholder="e.g., Personal Expenses"
                                        className="bg-gray-50 focus:bg-white transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => excludesRemove(index)}
                                        className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <BiTrash className="text-lg" />
                                    </button>
                                </div>
                            ))}
                            {excludesFields.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4 italic">No excluded items added yet.</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => excludesAppend({ value: "" })}
                            className="w-full py-2.5 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                        >
                            <BiPlus className="text-lg" /> Add Item
                        </button>
                    </div>
                </div>

                {/* Days Configuration */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800">Itinerary Days</h3>
                        <button
                            type="button"
                            onClick={() => {
                                daysAppend({ dayNumber: daysFields.length + 1, type: "CUSTOM", customTitle: "", customDescription: "" });
                                setOpenDayIndex(daysFields.length); // Open the new day
                            }}
                            className="px-4 py-2 bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-200 flex items-center gap-2 font-medium"
                        >
                            <BiPlus className="text-lg" /> Add Day
                        </button>
                    </div>

                    <div className="space-y-3">
                        {daysFields?.map((field, index) => (
                            <BranchDay
                                key={field.id}
                                index={index}
                                setValue={setValue}
                                control={control}
                                errors={errors}
                                register={register}
                                onRemove={() => daysRemove(index)}
                                isOpen={openDayIndex === index}
                                onToggle={() => toggleDay(index)}
                            />
                        ))}
                        {daysFields.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 text-lg">No days added to the itinerary yet.</p>
                                <button
                                    type="button"
                                    onClick={() => daysAppend({ dayNumber: 1, type: "CUSTOM", customTitle: "", customDescription: "" })}
                                    className="mt-4 text-primary font-medium hover:underline"
                                >
                                    Add your first day
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="sticky bottom-4 z-10 pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full md:w-auto md:min-w-[200px] float-right bg-gray-900 text-white py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    )
}