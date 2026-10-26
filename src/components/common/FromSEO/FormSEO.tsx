/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { Seo } from "@/types/seoTypes";
import { useEffect } from "react";
import { FormField, FormRenderer } from "../FormRenderer/FormRenderer";

interface FormSEOProps {
  defaultValues: any;
  onSubmit: (data: Seo) => void;
}

const seoFields: FormField<Seo>[] = [
  {
    name: "metaTitle",
    label: "Meta Title",
    type: "text",
    placeholder: "Enter meta title (max ~60 characters)",
  },
  {
    name: "keywords",
    label: "Meta Keywords",
    type: "text",
    placeholder: "ex: cairo, cairo",
  },
  {
    name: "slugUrl",
    label: "Slug URL",
    type: "text",
    placeholder: "Enter slug url example: cairo",
  },
  // {
  //   name: "alt",
  //   label: "images Alt",
  //   type: "text",
  //   placeholder: "Enter image alt text",
  // },
  {
    name: "metaDescription",
    label: "Meta Description",
    type: "textarea",
    placeholder: "Enter meta description (max ~160 characters)",
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    options: [
      { label: "1.0", value: 1.0 },
      { label: "0.9", value: 0.9 },
      { label: "0.8", value: 0.8 },
      { label: "0.7", value: 0.7 },
      { label: "0.6", value: 0.6 },
      { label: "0.5", value: 0.5 },
      { label: "0.4", value: 0.4 },
      { label: "0.3", value: 0.3 },
      { label: "0.2", value: 0.2 },
      { label: "0.1", value: 0.1 },
    ],
  },
  {
    name: "changeFrequency",
    label: "Change Frequency",
    type: "select",
    options: [
      { label: "always", value: "always" },
      { label: "hourly", value: "hourly" },
      { label: "daily", value: "daily" },
      { label: "weekly", value: "weekly" },
      { label: "monthly", value: "monthly" },
      { label: "yearly", value: "yearly" },
      { label: "never", value: "never" },
    ],
  },
  {
    name: "ogTitle",
    label: "OG Title",
    type: "text",
    placeholder: "Enter OG title",
  },
  {
    name: "ogImage",
    label: "OG Image",
    type: "text",
    placeholder: "ex: https://example.com/image.jpg",
  },
  {
    name: "ogDescription",
    label: "OG Description",
    type: "textarea",
    placeholder: "OG description",
  },
  { name: "noIndex", label: "لا تؤرشف الصفحة (noindex)", type: "checkbox" },
  {
    name: "noFollow",
    label: "لا تتبع الروابط في الصفحة (nofollow)",
    type: "checkbox",
  },
  {
    name: "noArchive",
    label: "لا تحفظ نسخة مؤرشفة (noarchive)",
    type: "checkbox",
  },
  { name: "noSnippet", label: "لا تعرض مقتطفات (nosnippet)", type: "checkbox" },
];

export default function FormSEO({ onSubmit, defaultValues }: FormSEOProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Seo>({});

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormRenderer
          fields={seoFields}
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
        />

        <button
          type="submit"
          className="p-3 mt-2 flex items-center justify-center bg-secondary/30 text-primary rounded-lg border-2 border-primary/40 cursor-pointer"
        >
          {isSubmitting ? <div className="spinner"></div> : "حفظ"}
        </button>
      </form>
    </div>
  );
}
