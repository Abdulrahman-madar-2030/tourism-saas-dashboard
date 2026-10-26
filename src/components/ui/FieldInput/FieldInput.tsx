/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type {
  FieldError,
  FieldValues,
  UseFormRegister,
  Path,
} from "react-hook-form";

type FormInputProps<T extends FieldValues = FieldValues> = {
  label?: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  required?: boolean;
  placeholder?: string;
  error?: FieldError;
  type?: string;
  maxLength?: number;
  max?: number;
  min?: number;
  className?: string;
  disabled?: boolean;
};

export default function FormInput<T extends FieldValues = FieldValues>({
  label,
  name,
  register,
  required,
  placeholder = "",
  error,
  type = "text",
  maxLength,
  max,
  min,
  className = "",
  disabled = false,
}: FormInputProps<T>) {
  const registerOptions =
    name === "coordinates.lat"
      ? {
        setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
        validate: (v: number) =>
          (v >= -90 && v <= 90) || "خط العرض يجب أن يكون بين -90 و 90",
      }
      : name === "coordinates.lng"
        ? {
          setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
          validate: (v: number) =>
            (v >= -180 && v <= 180) || "خط الطول يجب أن يكون بين -180 و 180",
        }
        : name === "metaTitle"
          ? {
            validate: (v: string) =>
              v.length <= 60 || "Meta Title يجب ان يكون اقل من 60 حرف",
          }
      : name === "header.dayNumber" ||
        name === "header.nights" ||
        name === "duration.days" ||
        name === "duration.nights"
        ? {
          setValueAs: (v: any) =>
            v === "" || v === undefined || isNaN(Number(v))
              ? name === "duration.nights" || name === "header.nights"
                ? 0
                : 1
              : Number(v),
          validate: (v: number) =>
            (typeof v === "number" && !isNaN(v) && v >= 0 && v <= 365) ||
            "يجب أن تكون القيمة بين 0 و 365",
        }
      : name === "price"
        ? {
          setValueAs: (v: any) =>
            v === "" || v === undefined || isNaN(Number(v)) ? 0 : Number(v),
          validate: (v: number) =>
            (typeof v === "number" && !isNaN(v) && v >= 0 && v <= 10000000) ||
            "يجب ان يكون السعر رقم موجب",
        }
      : type === "number"
        ? {
          setValueAs: (v: any) =>
            v === "" || v === undefined || isNaN(Number(v))
              ? min !== undefined
                ? min
                : 0
              : Number(v),
          required: required,
        }
      : {
          required: required,
        };

  return (
    <label className={`block w-full ${className}`}>
      {label && (
        <span className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        maxLength={maxLength ? Number(maxLength) : undefined}
        min={min ? min : undefined}
        max={max ? max : undefined}
        disabled={disabled}
        {...register(name, registerOptions as any)}
        className={`
          w-full h-10 px-3 text-sm rounded-lg
          bg-background border
          text-foreground placeholder:text-muted-foreground
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-ring/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
            : "border-border hover:border-muted-foreground/30 focus:border-primary"
          }
        `}
      />
      {error && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
