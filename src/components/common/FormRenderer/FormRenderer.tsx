import CheckList from "@/components/ui/CheckList/CheckList";
import FormInput from "@/components/ui/FieldInput/FieldInput";
import FormTextarea from "@/components/ui/FormTextArea/FormTextarea";
import FormTextEditor from "@/components/ui/FormTextEditor/FormTextEditor";
import {
  SingleImageSelector,
  MultipleImageSelector,
} from "@/components/ui/ImageInput/ImageInput";
import SelectMenu from "@/components/ui/SelectMenu/SelectMenu";
import type {
  FieldValues,
  UseFormRegister,
  Path,
  Control,
  FieldErrors,
  UseFormSetValue,
  FieldError,
  PathValue,
} from "react-hook-form";
import { get, useWatch, Controller } from "react-hook-form";

type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "checklist"
  | "singleImage"
  | "multipleImage"
  | "editor"
  | "number"
  | "email"
  | "password"
  | "date"
  | "time"
  | "checkbox";

export interface FormField<T extends FieldValues = FieldValues> {
  name: Path<T>;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: number | string }[];
  maxLength?: number;
  grid?: number;
  className?: string;
}

interface FormRendererProps<T extends FieldValues> {
  fields: FormField<T>[];
  register: UseFormRegister<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  className?: string;
}

export const FormRenderer = <T extends FieldValues>({
  fields,
  register,
  control,
  errors,
  setValue,
  className = "grid grid-cols-2 gap-4",
}: FormRendererProps<T>) => {
  const values = useWatch({ control });
  return (
    <div className={className}>
      {fields.map((field, index) => {
        switch (field.type) {
          case "text":
          case "number":
          case "email":
          case "password":
          case "date":
          case "time":
            return (
              <FormInput
                key={field.name + index}
                label={field.label}
                name={field.name as Path<FieldValues>}
                register={register as UseFormRegister<FieldValues>}
                required={field.required}
                error={get(errors, field.name) as FieldError}
                placeholder={field.placeholder || ""}
                maxLength={field.maxLength}
                type={field.type}
                className={field.className}
              />
            );

          case "textarea":
            return (
              <div className="col-span-2" key={field.name + index}>
                <FormTextarea
                  label={field.label}
                  name={field.name as string}
                  register={register}
                  required={field.required}
                  error={get(errors, field.name) as FieldError}
                  placeholder={field.placeholder || ""}
                />
              </div>
            );

          case "select":
            return (
              <SelectMenu
                key={field.name + index}
                label={field.label}
                name={field.name as Path<FieldValues>}
                control={control as Control<FieldValues>}
                options={field.options || []}
                required={field.required}
              />
            );

          case "checklist":
            return (
              <CheckList
                key={field.name + index}
                name={field.name as Path<FieldValues>}
                label={field.label}
                control={control as Control<FieldValues>}
                options={field.options || []}
                required={field.required}
              />
            );

          case "singleImage":
            return (
              <div className="col-span-2" key={field.name}>
                <SingleImageSelector
                  label={field.label}
                  onImageSelect={(file) =>
                    setValue(field.name, (file ?? null) as PathValue<T, Path<T>>)
                  }
                  currentImage={
                    get(values, field.name) ||
                    (field.name === "imageCover" ? get(values, "coverImage") : undefined) ||
                    (field.name === "coverImage" ? get(values, "imageCover") : undefined)
                  }
                />
              </div>
            );

          case "multipleImage":
            return (
              <div className="col-span-2" key={field.name + index}>
                <MultipleImageSelector
                  label={field.label}
                  onImagesChange={(files) =>
                    setValue(field.name, files as PathValue<T, Path<T>>)
                  }
                  // required={field.required}
                  currentImages={get(values, field.name) || []}
                />
              </div>
            );

          case "editor":
            return (
              <div className="col-span-2" key={field.name + "editor"}>
                <FormTextEditor
                  name={field.name as Path<FieldValues>}
                  label={field.label}
                  control={control as Control<FieldValues>}
                  required={field.required || false}
                  error={get(errors, field.name)?.message as string}
                />
              </div>
            );

          case "checkbox":
            return (
              <Controller
                key={field.name + index}
                name={field.name}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value === true || value === "true"}
                      onChange={(e) => onChange(e.target.checked)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {field.label}
                    </span>
                  </label>
                )}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
