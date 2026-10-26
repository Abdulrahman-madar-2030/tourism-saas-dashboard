"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useMemo } from "react";
import { Controller, Control } from "react-hook-form";
import { HiChevronDown, HiCheck, HiSearch } from "react-icons/hi";

type Option = { label: string; value: string | number };

type SelectProps = {
  name?: string;
  control?: Control<any>;
  value?: string | number;
  onChange?: (value: any) => void;
  options: Option[];
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  searchable?: boolean;
  onSearch?: (term: string) => void;
  debounceMs?: number;
  isLoading?: boolean;
  placement?: "auto" | "top" | "bottom";
};

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
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

interface SelectMenuInnerProps extends SelectProps {
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

function SelectMenuInner({
  value,
  onChange,
  error,
  name,
  options,
  label,
  placeholder = "اختر...",
  className = "",
  disabled = false,
  required = false,
  searchable,
  onSearch,
  debounceMs = 400,
  isLoading,
  placement = "auto",
}: SelectMenuInnerProps) {
  const [open, setOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(placement === "top");
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  // Determine whether to open upwards or downwards
  useEffect(() => {
    if (!open || !containerRef.current) return;

    if (placement === "top") {
      setOpenUpwards(true);
      return;
    }
    if (placement === "bottom") {
      setOpenUpwards(false);
      return;
    }

    // Auto placement detection based on viewport and scrollable parents
    const el = containerRef.current;
    const rect = el.getBoundingClientRect();

    let parentBottom = window.innerHeight;
    let curr = el.parentElement;
    while (curr && curr !== document.body) {
      const style = window.getComputedStyle(curr);
      if (
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        style.overflow === "auto" ||
        style.overflow === "scroll"
      ) {
        const parentRect = curr.getBoundingClientRect();
        parentBottom = Math.min(parentBottom, parentRect.bottom);
        break;
      }
      curr = curr.parentElement;
    }

    const spaceBelow = parentBottom - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 250 && spaceAbove > 180) {
      setOpenUpwards(true);
    } else {
      setOpenUpwards(false);
    }
  }, [open, placement]);

  useEffect(() => {
    if (!open) {
      setHighlighted(-1);
      setSearchTerm("");
    } else {
      if (searchable || options.length > 6) {
        setTimeout(() => {
          searchInputRef.current?.focus({ preventScroll: true });
        }, 50);
      }
    }
  }, [open, searchable, options.length]);

  const isInitialMount = useRef(true);

  // Debounced onSearch callback (triggers search after user stops typing)
  useEffect(() => {
    if (!onSearch) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onSearch(searchTerm.trim());
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch, debounceMs]);

  const selected = options.find((o) => String(o.value) === String(value)) ?? null;

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    const localFiltered = options.filter((o) =>
      String(o.label).toLowerCase().includes(term)
    );
    return onSearch ? (localFiltered.length > 0 ? localFiltered : options) : localFiltered;
  }, [options, searchTerm, onSearch]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && highlighted >= 0 && filteredOptions[highlighted]) {
        const opt = filteredOptions[highlighted];
        onChange(opt.value);
        setOpen(false);
      } else {
        setOpen((s) => !s);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showSearch = searchable ?? options.length > 6;

  return (
    <div
      className={`relative w-full ${open ? "z-40" : "z-10"} ${className}`}
      ref={containerRef}
    >
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={open}
        aria-controls={name ? `${name}-listbox` : "select-listbox"}
        aria-haspopup="listbox"
        onKeyDown={onKeyDown}
        onClick={() => !disabled && setOpen((s) => !s)}
        className={`
          relative w-full cursor-pointer select-none rounded-lg border h-10
          transition-all duration-200
          ${error ? "border-destructive" : "border-border"}
          ${disabled ? "bg-muted cursor-not-allowed text-muted-foreground" : "bg-background hover:border-muted-foreground/30"}
          px-3 flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span
            className={`truncate text-sm ${selected ? "text-foreground" : "text-muted-foreground"}`}
          >
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <HiChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div
          id={name ? `${name}-listbox` : "select-listbox"}
          role="listbox"
          aria-labelledby={name}
          className={`absolute z-50 w-full max-h-60 overflow-hidden rounded-xl border border-border bg-background shadow-xl flex flex-col ${
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {showSearch && (
            <div className="p-2 border-b border-border bg-muted/20 sticky top-0 z-10">
              <div className="relative flex items-center">
                <HiSearch className="absolute right-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchTerm(val);
                    setHighlighted(0);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="بحث..."
                  className="w-full h-8 pr-8 pl-8 text-xs rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {isLoading && (
                  <span className="absolute left-2.5 w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                )}
              </div>
            </div>
          )}

          <ul className="overflow-y-auto max-h-52 py-1">
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                لا توجد خيارات مطابقة
              </li>
            )}

            {filteredOptions.map((opt, idx) => {
              const isSelected = String(value) === String(opt.value);
              const isHighlighted = idx === highlighted;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlighted(idx)}
                  onMouseLeave={() => setHighlighted(-1)}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`
                    flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors
                    ${isHighlighted ? "bg-accent" : "hover:bg-accent"}
                    ${isSelected ? "font-medium text-primary" : "text-foreground"}
                  `}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <HiCheck className="w-4 h-4 text-primary shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

export default function SelectMenu(props: SelectProps) {
  if (props.control && props.name) {
    return (
      <Controller
        name={props.name}
        control={props.control}
        rules={{ required: props.required ? "هذا الحقل مطلوب" : false }}
        render={({ field, fieldState }) => (
          <SelectMenuInner
            {...props}
            value={field.value}
            onChange={(val) => field.onChange(val)}
            error={fieldState.error?.message}
          />
        )}
      />
    );
  }

  return (
    <SelectMenuInner
      {...props}
      value={props.value}
      onChange={(val) => props.onChange?.(val)}
      error={props.error}
    />
  );
}
