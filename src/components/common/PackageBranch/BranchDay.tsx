import { Branch } from "@/types/branches";
import { Control, FieldErrors, UseFormRegister, UseFormSetValue, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { crudsAPI } from "@/lib/axios";
import Modal from "@/components/ui/Modal/Modal";
import { Tour } from "@/types/toursTypes";
import FormInput from "@/components/ui/FieldInput/FieldInput";
import { useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { BiWorld, BiChevronDown, BiTrash } from "react-icons/bi";
import { MdEdit, MdTour } from "react-icons/md";

interface BranchDayProps {
    index: number;
    setValue: UseFormSetValue<Branch>;
    control: Control<Branch>;
    errors: FieldErrors<Branch>;
    register: UseFormRegister<Branch>;
    onRemove: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function BranchDay({
    index,
    setValue,
    control,
    errors,
    register,
    onRemove,
    isOpen,
    onToggle
}: BranchDayProps) {
    const [isTourModalOpen, setIsTourModalOpen] = useState(false);

    // Watch the specific field to keep UI in sync with form state
    const field = useWatch({
        control,
        name: `days.${index}`,
    });

    const { data: toursData } = useQuery({
        queryKey: ["tours"],
        queryFn: () => crudsAPI.getAll("/tours"),
        staleTime: 3600 * 1000,
    });

    const tours: Tour[] = toursData?.data?.data?.data || [];
    const selectedTourInfo = tours?.find((t: Tour) => t._id === field?.tour?._id || t.id === field?.tour?.id);

    const handleTypeChange = (newType: "TOUR" | "CUSTOM") => {
        setValue(`days.${index}.type`, newType, { shouldValidate: true });
        // Reset relevant fields when switching types
        if (newType === "TOUR") {
            setValue(`days.${index}.customTitle`, "");
            setValue(`days.${index}.customDescription`, "");
        } else {
            setValue(`days.${index}.tour`, undefined);
        }
    };

    return (
        <div className={`border rounded-xl bg-white transition-all duration-300 ${isOpen ? 'border-primary shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
            {/* Accordion Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer select-none"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {index + 1}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">
                            {field?.type === "TOUR"
                                ? (selectedTourInfo?.title || "Select a Tour")
                                : (field?.customTitle || `Day ${index + 1}`)}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {field?.type === "TOUR" ? "Tour Package" : "Custom Itinerary"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove Day"
                    >
                        <BiTrash className="text-lg" />
                    </button>
                    <BiChevronDown className={`text-2xl text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Accordion Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0 border-t border-gray-100 mt-2">
                    {/* Hidden Day Number Input */}
                    <input type="hidden" {...register(`days.${index}.dayNumber`, { valueAsNumber: true })} value={index + 1} />

                    {/* Mode Selection */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                            <button
                                type="button"
                                onClick={() => handleTypeChange("TOUR")}
                                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${field?.type === "TOUR"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <MdTour className="text-lg" />
                                Selected Tour
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange("CUSTOM")}
                                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${field?.type === "CUSTOM"
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <MdEdit className="text-lg" />
                                Custom Day
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="animate-fadeIn">
                        {field?.type === "TOUR" ? (
                            <div className="w-full">
                                {!selectedTourInfo ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsTourModalOpen(true)}
                                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 group"
                                    >
                                        <BiWorld className="text-3xl group-hover:scale-110 transition-transform" />
                                        <span className="font-medium">Select a Tour Package</span>
                                    </button>
                                ) : (
                                    <div className="relative group overflow-hidden rounded-xl border border-gray-200 bg-gray-50 hover:border-primary/30 transition-colors">
                                        <div className="p-4 flex gap-4 items-start">
                                            <div className="w-24 h-24 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden shadow-sm">
                                                {selectedTourInfo.imageCover && (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={selectedTourInfo.imageCover}
                                                        alt={selectedTourInfo.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate text-lg">{selectedTourInfo.title}</h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <FaMapLocationDot className="text-primary" />
                                                    <span>{selectedTourInfo.city?.name}, {selectedTourInfo.country?.name}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{selectedTourInfo.descText || selectedTourInfo.description}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/50 px-4 py-2 flex justify-end gap-2 border-t border-gray-100 backdrop-blur-sm">
                                            <button
                                                type="button"
                                                onClick={() => setIsTourModalOpen(true)}
                                                className="text-primary hover:text-primary/80 text-sm font-medium hover:underline flex items-center gap-1"
                                            >
                                                <MdEdit /> Change Tour
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                <FormInput
                                    label="Custom Title"
                                    name={`days.${index}.customTitle`}
                                    register={register}
                                    error={errors.days?.[index]?.customTitle}
                                    placeholder="e.g., Arrival & Welcome Dinner"
                                    required={field?.type === "CUSTOM"}
                                    className="bg-gray-50 focus:bg-white transition-colors"
                                />
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Custom Description</label>
                                    <textarea
                                        {...register(`days.${index}.customDescription`, { required: field?.type === "CUSTOM" || "Required" })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 focus:bg-white bg-gray-50 transition-all text-right dir-rtl min-h-[120px] resize-y"
                                        placeholder="Enter detailed description for this day..."
                                    />
                                    {errors.days?.[index]?.customDescription && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-red-600" />
                                            {errors.days?.[index]?.customDescription?.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tour Selection Modal */}
            <Modal isOpen={isTourModalOpen} onClose={setIsTourModalOpen}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Select a Tour</h2>
                        <button onClick={() => setIsTourModalOpen(false)} className="text-gray-400 hover:text-gray-600">Close</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-1">
                        {tours.map((tour) => (
                            <button
                                key={tour._id}
                                type="button"
                                onClick={() => {
                                    setValue(`days.${index}.tour`, tour, { shouldValidate: true });
                                    setIsTourModalOpen(false);
                                }}
                                className={`text-left rounded-xl border-2 transition-all duration-200 overflow-hidden hover:shadow-lg group ${field?.tour?._id === tour._id
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-gray-100 hover:border-primary/50 bg-white"
                                    }`}
                            >
                                <div className="w-full h-36 bg-gray-200 overflow-hidden">
                                    {tour.imageCover ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={tour.imageCover} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{tour.title}</h3>
                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                        <FaMapLocationDot className="text-gray-400" />
                                        {tour.city?.name || 'Unknown City'}
                                    </p>
                                    <p className="text-xs text-gray-600 line-clamp-2 h-8 leading-relaxed">{tour.descText}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    )
}
