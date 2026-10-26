"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useId } from "react";
import { Controller, Control } from "react-hook-form";
import dynamic from "next/dynamic";

// Dynamic import with SSR false and skeleton placeholder to avoid bundling heavy TipTap prosemirror on initial page load
const TipTapEditor = dynamic(
  () => import("@/components/common/TextEditor/TipTap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-36 w-full animate-pulse items-center justify-center rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
        جاري تهيئة محرر النصوص...
      </div>
    ),
  }
);

interface FormTextEditorProps {
  label: string;
  name: string;
  control: Control<any>;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  readOnly?: boolean;
  showToolbar?: boolean;
  dir?: "ltr" | "rtl";
  error?: string;
  required: boolean;
}

const FormTextEditor: React.FC<FormTextEditorProps> = ({
  label,
  name,
  control,
  placeholder = "Start typing...",
  minHeight,
  maxHeight,
  readOnly,
  showToolbar,
  dir,
  error,
  required,
}) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-gray-700 font-medium text-sm">
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        rules={{ required: required ? "هذا الحقل مطلوب" : false }}
        render={({ field }) => (
          <TipTapEditor
            content={field.value || ""}
            onChange={field.onChange}
            placeholder={placeholder}
            minHeight={minHeight}
            maxHeight={maxHeight}
            readOnly={readOnly}
            showToolbar={showToolbar}
            dir={dir}
          />
        )}
      />
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
    </div>
  );
};

export default FormTextEditor;
