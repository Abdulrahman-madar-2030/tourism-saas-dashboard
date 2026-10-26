/* eslint-disable  @typescript-eslint/no-explicit-any  */
import React, { useState, useRef, useCallback } from "react";
import clsx from "clsx";
import {
  FaCloudUploadAlt,
  FaTrash,
  FaEye,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import Image from "next/image";

interface ImageFile {
  id: string;
  file?: File;
  preview: string;
  name: string;
  size: number;
}

interface SingleImageSelectorProps {
  onImageSelect: (file: File | null) => void;
  onImagePreview?: (preview: string | null) => void;
  currentImage?: any;
  label?: string;
  required?: boolean;
  error?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

interface MultipleImageSelectorProps {
  onImagesChange: (files: (File | any)[]) => void;
  onPreviewsChange?: (previews: string[]) => void;
  currentImages?: (string | File | any)[];
  label?: string;
  required?: boolean;
  error?: string;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

// Single Image Selector Component
export const SingleImageSelector: React.FC<SingleImageSelectorProps> = ({
  onImageSelect,
  onImagePreview,
  currentImage,
  label = "اختر صورة",
  required = false,
  error,
  accept = "image/*",
  maxSize = 5,
  className,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setHasError(false);
    if (!currentImage) {
      setPreview(null);
      return;
    }
    if (typeof currentImage === "string") {
      setPreview(currentImage);
    } else if (currentImage instanceof File) {
      const url = URL.createObjectURL(currentImage);
      setPreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof currentImage === "object") {
      if (Array.isArray(currentImage)) {
        const first = currentImage[0];
        const url =
          typeof first === "string"
            ? first
            : first?.url || first?.secure_url || first?.image || "";
        setPreview(url || null);
      } else {
        const url =
          currentImage.url ||
          currentImage.secure_url ||
          currentImage.imageCover?.url ||
          currentImage.coverImage?.url ||
          currentImage.image ||
          currentImage.src ||
          currentImage.path;
        if (url && typeof url === "string") {
          setPreview(url);
        } else {
          setPreview(null);
        }
      }
    } else {
      setPreview(null);
    }
  }, [currentImage]);

  const handleFileSelect = useCallback(
    (file: File | null) => {
      setHasError(false);
      if (file) {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          alert(`حجم الملف كبير جداً. الحد الأقصى ${maxSize}MB`);
          return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onImagePreview?.(objectUrl);
        onImageSelect(file);
      } else {
        setPreview(null);
        onImagePreview?.(null);
        onImageSelect(null);
      }
    },
    [maxSize, onImageSelect, onImagePreview],
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={clsx("w-full", className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={clsx(
          "relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
          "hover:border-primary/60 hover:bg-primary/5",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          {
            "border-red-300 bg-red-50/50": error,
            "border-gray-300": !error,
            "h-48": !preview,
            "h-auto min-h-[14rem]": preview,
          },
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
        />

        {preview ? (
          // Image Preview
          <div className="relative group w-full flex justify-center items-center p-2.5">
            <div className="w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-muted/30 border border-border flex items-center justify-center relative">
              {hasError ? (
                <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground gap-2">
                  <FaCloudUploadAlt className="text-3xl text-amber-500/80 mb-1" />
                  <span className="text-xs font-semibold text-foreground">
                    تعذر عرض الصورة الحالية
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    اضغط هنا لرفع صورة بديلة
                  </span>
                </div>
              ) : (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-contain"
                  onError={() => setHasError(true)}
                />
              )}
            </div>
            {/* Overlay */}
            <div className="absolute inset-2.5 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-xl flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(preview, "_blank");
                  }}
                  className="bg-white/95 hover:bg-white text-gray-700 p-2.5 rounded-full transition-all shadow-md hover:scale-105 cursor-pointer"
                  title="عرض الصورة كاملة"
                >
                  <FaEye size={16} />
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-red-500/95 hover:bg-red-500 text-white p-2.5 rounded-full transition-all shadow-md hover:scale-105 cursor-pointer"
                  title="حذف الصورة"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Upload Placeholder
          <div className="flex flex-col items-center justify-center h-full py-8">
            <FaCloudUploadAlt className="text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium mb-2">اضغط لاختيار صورة</p>
            <p className="text-sm text-gray-400">حد أقصى {maxSize}MB</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <FaTimes className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

// Multiple Images Selector Component
export const MultipleImageSelector: React.FC<MultipleImageSelectorProps> = ({
  onImagesChange,
  onPreviewsChange,
  currentImages = [],
  label = "اختر صور متعددة",
  required = false,
  error,
  accept = "image/*",
  maxSize = 5,
  maxFiles = 10,
  className,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with current images
  React.useEffect(() => {
    if (
      currentImages &&
      Array.isArray(currentImages) &&
      currentImages.length > 0
    ) {
      // Avoid infinite loop if currentImages is a new array with same content
      const isSame =
        currentImages.length === images.length &&
        currentImages.every((item, idx) => {
          const existing = images[idx];
          if (typeof item === "string") return item === existing.preview;
          if (item instanceof File) return item === existing.file;
          if (item && typeof item === "object" && item.url)
            return item.url === existing.preview;
          return false;
        });

      if (isSame) return;

      const imageFiles: ImageFile[] = currentImages
        .map((item, index) => {
          if (typeof item === "string") {
            return {
              id: `current-${index}-${item}`,
              preview: item,
              name: `image-${index}`,
              size: 0,
            };
          } else if (item instanceof File) {
            return {
              id: `${Date.now()}-${index}`,
              file: item,
              preview: URL.createObjectURL(item),
              name: item.name,
              size: item.size,
            };
          } else if (item && typeof item === "object" && item.url) {
            return {
              id: `current-${index}-${item.url}`,
              preview: item.url,
              name: item.name || `image-${index}`,
              size: 0,
            };
          }
          return null as any;
        })
        .filter(Boolean);
      setImages(imageFiles);
    } else if (images.length > 0) {
      setImages([]);
    }
  }, [currentImages, images]); // Relying on isSame check inside to prevent infinite loop

  const addImages = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} ليس ملف صورة صالح`);
          return false;
        }
        if (file.size > maxSize * 1024 * 1024) {
          alert(`${file.name} حجمه كبير جداً. الحد الأقصى ${maxSize}MB`);
          return false;
        }
        return true;
      });

      if (images.length + validFiles.length > maxFiles) {
        alert(`لا يمكن رفع أكثر من ${maxFiles} صور`);
        return;
      }

      const newImages: ImageFile[] = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(
        updatedImages.map((img) => img.file || { url: img.preview, alt: "" }),
      );
      onPreviewsChange?.(updatedImages.map((img) => img.preview));
    },
    [images, maxFiles, maxSize, onImagesChange, onPreviewsChange],
  );

  const removeImage = useCallback(
    (id: string) => {
      const updatedImages = images.filter((img) => img.id !== id);
      setImages(updatedImages);
      onImagesChange(
        updatedImages.map((img) => img.file || { url: img.preview, alt: "" }),
      );
      onPreviewsChange?.(updatedImages.map((img) => img.preview));
    },
    [images, onImagesChange, onPreviewsChange],
  );

  return (
    <div className={clsx("w-full", className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        <span className="text-sm text-gray-500 ml-2">
          ({images.length}/{maxFiles})
        </span>
      </label>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
              <Image
                src={image.preview}
                alt={image.name}
                fill
                unoptimized
                onError={(e) => {
                  const target = e.currentTarget as unknown as HTMLImageElement;
                  if (target) {
                    target.src = "/placeholder.png";
                  }
                }}
                className="object-cover"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                <button
                  onClick={() => removeImage(image.id)}
                  className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"
                  title="حذف الصورة"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>

            {/* File Name */}
            <p
              className="mt-1 text-xs text-gray-600 truncate"
              title={image.name}
            >
              {image.name}
            </p>
          </div>
        ))}

        {/* Add More Button */}
        {images.length < maxFiles && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              "aspect-square border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer",
              "flex flex-col items-center justify-center",
              "hover:border-primary/60 hover:bg-primary/5",
              "border-gray-300",
            )}
          >
            <FaPlus className="text-2xl text-gray-400 mb-2" />
            <p className="text-xs text-gray-500 text-center px-2">اضافة صور</p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          addImages(files);
        }}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <FaTimes className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};
