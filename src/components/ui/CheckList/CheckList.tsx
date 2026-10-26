"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Controller, Control } from "react-hook-form";
import { HiChevronDown, HiCheck } from "react-icons/hi";

type Option = { label: string; value: string | number };

type CheckMenuProps = {
  name: string;
  control: Control<any>;
  options: Option[];
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
};

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default function CheckList({
  name,
  control,
  options,
  label,
  placeholder = "اختر...",
  className = "",
  disabled = false,
  required = false,
}: CheckMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? "هذا الحقل مطلوب" : false,
      }}
render={({ field, fieldState }) => {
  const selectedValues: (string | number)[] = Array.isArray(field.value)
    ? field.value
    : typeof field.value === "string" && field.value.length > 0
    ? field.value.split(",")
    : [];

  const toggleValue = (val: string | number) => {
    if (selectedValues.includes(val)) {
      field.onChange(selectedValues.filter((v) => v !== val));
    } else {
      field.onChange([...selectedValues, val]);
    }
  };
  const selectedLabels = options
    .filter((o) => selectedValues.includes(o.value))
    .map((o) => o.label);

        return (
          <div className={`w-full ${className}`} ref={containerRef}>
            {label && (
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
            )}

            {/* Trigger */}
            <div
              tabIndex={disabled ? -1 : 0}
              onClick={() => !disabled && setOpen((s) => !s)}
              className={`relative w-full cursor-pointer select-none rounded-lg border-2 transition-all duration-150
                ${fieldState.error ? "border-red-300" : "border-gray-200"}
                ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : "bg-white"}
                px-4 py-2 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary`}
            >
              <div className="truncate text-gray-900 flex gap-2">
                {selectedLabels.length > 0 ? selectedLabels.map((l) => <div key={l} className="px-2 py-1 bg-green-200 text-xs rounded-xl">{l}</div>) : placeholder}
              </div>
              <HiChevronDown
                className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </div>

            {/* Dropdown */}
            {open && !disabled && (
              <ul
                className="mt-2 max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1"
              >
                {options.map((opt) => {
                  const isChecked = selectedValues.includes(opt.value);
                  return (
                    <li
                      key={opt.value}
                      onClick={() => toggleValue(opt.value)}
                      className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors
                        hover:bg-gray-50
                        ${isChecked ? "font-semibold" : "font-normal"}
                      `}
                    >
                      <span>{opt.label}</span>
                      {isChecked && <HiCheck className="text-green-600" />}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Error */}
            {fieldState.error && (
              <p className="mt-2 text-sm text-red-600">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
