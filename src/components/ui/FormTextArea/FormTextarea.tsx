"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldError } from "react-hook-form";

type FormTextareaProps = {
  label: string;
  name: string;
  register: any;
  required?: boolean;
  placeholder: string;
  error?: FieldError;
  rows?: number;
};

export default function FormTextarea({
  label,
  name,
  register,
  required,
  placeholder,
  error,
  rows = 4,
}: FormTextareaProps) {
  const registerOptions =
    name === "metaDescription"
      ? {
          validate: (v: string) =>
            (v.length <= 160) || "Meta Description يجب ان يكون اقل من 160 حرف",
        }
      : {
          required: required,
        };

  return (
    <label className="block w-full">
      <span className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <textarea
        rows={rows}
        placeholder={placeholder}
        {...register(name, registerOptions)}
        className={`
          w-full px-4 py-2 
          border-2 rounded-lg 
          text-gray-900 placeholder-gray-400
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-0
          bg-white/80 backdrop-blur-sm
          ${
            error
              ? "border-red-300 focus:border-red-500 focus:bg-red-50/50 shadow-red-100"
              : "border-gray-200 hover:border-gray-300 focus:border-primary focus:bg-white shadow-gray-100"
          }
          hover:shadow-md focus:shadow-lg
          text-right dir-rtl
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error.message || "هذا الحقل مطلوب"}
        </p>
      )}
    </label>
  );
}
