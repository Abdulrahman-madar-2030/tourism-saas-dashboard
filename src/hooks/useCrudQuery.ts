/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import { toast } from "react-hot-toast";

interface UseCrudOptions<T> {
  queryKey: string | string[];
  endpoint: string | null;
  enabled?: boolean;
  select?: (data: unknown) => T;
  staleTime?: number;
  handleCloseModal?: () => void;
  useJsonPayload?: boolean;
  params?: Record<string, any>;
  showToast?: boolean;
}

// interface I_UploadedImgs {
//   data: {
//     data: {
//       url?: string;
//       urls?: string[];
//     };
//     [key: string]: any;
//   };
//   [key: string]: any;
// }

// upload images and get their urls
export const getImgsUrl = async (images?: File | File[] | null) => {
  const formData = new FormData();

  // upload and get image url
  if (images && !Array.isArray(images) && images instanceof File) {
    formData.append("image", images);
    const res = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return res.data;
  } else if (images && Array.isArray(images) && images.length > 0) {
    images?.forEach((img) => {
      formData.append("images", img);
    });

    const res = await api.post("/upload/batch", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return res.data;
  }
  return null;
};

let lastToastMessage = "";
let lastToastTime = 0;

export function safeSuccessToast(msg: string, id?: string) {
  const now = Date.now();
  if (lastToastMessage === msg && now - lastToastTime < 1500) {
    return;
  }
  lastToastMessage = msg;
  lastToastTime = now;
  toast.success(msg, id ? { id } : undefined);
}

export function useCrud<T = unknown>({
  queryKey,
  endpoint,
  enabled = true,
  staleTime = 300000,
  handleCloseModal,
  select: customSelect,
  useJsonPayload = true,
  params,
  showToast = true,
}: UseCrudOptions<T>) {
  const queryClient = useQueryClient();

  // Convert queryKey to tuple array
  const formattedKey = Array.isArray(queryKey) ? queryKey : [queryKey];

  // Read / Fetch
  const { data, refetch, isLoading, isError, isRefetching } = useQuery({
    queryKey: formattedKey,
    enabled: enabled && !!endpoint,
    queryFn: async () => {
      if (!endpoint) return [];
      const res = await api.get(endpoint, { params });
      return res.data;
    },
    select: (data: any) => {
      if (customSelect) return customSelect(data);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.data?.data)) return data.data.data;
      return data;
    },
    staleTime,
  });

  // Create
  const { mutateAsync: createItem, isPending: creating } = useMutation({
    mutationFn: async (payload: any) => {
      const body = payload.body || payload.data || payload;
      const finalEndpoint = payload.endpoint || endpoint;
      if (!finalEndpoint) throw new Error("Endpoint is required");

      if (useJsonPayload) {
        // Handle images
        const imageCover =
          payload?.imageCover ||
          body?.imageCover ||
          payload?.coverImage ||
          body?.coverImage;
        const images = payload?.images || body?.images;

        let imgCoverUrl = "";
        let imgCoverPublicId = "";
        let imgsUrl: string[] = [];
        let rawBatchImgs: any[] = [];

        if (imageCover instanceof File) {
          try {
            const res = await getImgsUrl(imageCover);
            const raw = res?.data?.data || res?.data || res;
            imgCoverUrl = raw?.url || res?.url || "";
            imgCoverPublicId = raw?.publicId || raw?.public_id || "";
          } catch (uploadError: any) {
            console.error("Image upload failed:", uploadError);
            if (uploadError.message?.includes("login") || uploadError.response?.status === 401) {
              toast.error("انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى");
              throw uploadError;
            }
            toast.error("فشل رفع الصورة، يرجى المحاولة مرة أخرى");
            throw uploadError;
          }
        }

        if (Array.isArray(images) && images.length > 0) {
          try {
            const res = await getImgsUrl(images);
            const rawImgs = res?.data || res || [];
            rawBatchImgs = Array.isArray(rawImgs) ? rawImgs : [];
            imgsUrl = rawBatchImgs.map((item: any) => item?.url || item);
          } catch (uploadError: any) {
            console.error("Batch image upload failed:", uploadError);
            if (uploadError.message?.includes("login") || uploadError.response?.status === 401) {
              toast.error("انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى");
              throw uploadError;
            }
            toast.error("فشل رفع الصور، يرجى المحاولة مرة أخرى");
            throw uploadError;
          }
        }

        const cleanedData = Object.fromEntries(
          Object.entries(body).filter(
            ([key, value]) =>
              key !== "endpoint" &&
              key !== "body" &&
              key !== "data" &&
              !(value instanceof File),
          ),
        );

        const postData: any = { ...cleanedData };
        if (imgCoverUrl) {
          const key =
            payload?.coverImage || body?.coverImage
              ? "coverImage"
              : payload?.image || body?.image
                ? "image"
                : "imageCover";
          postData[key] = {
            url: imgCoverUrl,
            ...(imgCoverPublicId ? { publicId: imgCoverPublicId } : {}),
            alt:
              payload.imageCoverAlt ||
              payload.coverImageAlt ||
              payload.imageAlt ||
              payload.alt ||
              "",
          };
        }
        if (imgsUrl.length > 0) {
          const newImgs = imgsUrl.map((url, i) => {
            const rawItem = rawBatchImgs[i];
            const pubId = typeof rawItem === "object" ? (rawItem?.publicId || rawItem?.public_id) : undefined;
            return {
              url,
              ...(pubId ? { publicId: pubId } : {}),
              alt: "",
            };
          });
          postData.images = [...(postData.images || []), ...newImgs];
        }

        const res = await api.post(finalEndpoint, postData, {
          headers: { "Content-Type": "application/json" },
        });
        return res.data;
      }

      const formData = new FormData();

      // Handle images
      const imageCover = payload?.imageCover || body?.imageCover;
      const images = payload?.images || body?.images;

      if (imageCover instanceof File) {
        formData.append("imageCover", imageCover);
      }
      if (Array.isArray(images)) {
        images.forEach((img: any) => {
          if (img instanceof File) formData.append("images", img);
        });
      }

      // Extract body and clean it
      const cleanedDataBody = Object.fromEntries(
        Object.entries(body).filter(
          ([key, value]) =>
            value !== null &&
            value !== undefined &&
            value !== "" &&
            key !== "images" &&
            key !== "imageCover" &&
            key !== "endpoint" &&
            key !== "body" &&
            key !== "data",
        ),
      );

      formData.append("data", JSON.stringify(cleanedDataBody));

      const res = await api.post(finalEndpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },

    onSuccess: (res) => {
      console.log("CREATE response:", res);
      // Safely update the cache if it exists and is an array or has an array property
      queryClient.setQueryData(formattedKey, (old: any) => {
        if (!old) return old;
        const newItem = res?.data || res;
        if (Array.isArray(old)) {
          return [...old, newItem];
        }
        if (old && typeof old === "object") {
          // Check common array container keys like data, hotels, items, etc.
          for (const key of ["hotels", "data", "items", "results"]) {
            if (Array.isArray(old[key])) {
              return {
                ...old,
                [key]: [...old[key], newItem],
              };
            }
          }
        }
        return old;
      });
      queryClient.invalidateQueries({ queryKey: formattedKey });
      if (showToast) {
        safeSuccessToast(res?.message || "تمت العملية بنجاح", `crud-create-${String(formattedKey[0])}`);
      }
      handleCloseModal?.();
    },
    onError: (error: any) => {
      const data = error?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((err: any) => {
          if (typeof err?.message === "string") toast.error(err.message);
          else if (typeof err === "string") toast.error(err);
        });
      } else {
        const msg =
          data?.message ||
          data?.error ||
          error?.message ||
          "Something went wrong";
        toast.error(typeof msg === "string" ? msg : "Something went wrong");
      }
    },
  });

  // Delete
  const { mutateAsync: deleteItem, isPending: deleting } = useMutation({
    mutationFn: async (endpoint: string) => {
      const res = await api.delete(endpoint);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: formattedKey });
      if (showToast) {
        safeSuccessToast(res?.message || "تم الحذف بنجاح", `crud-delete-${String(formattedKey[0])}`);
      }
    },
    onError: (err: any) => {
      if (err?.response?.data?.errors) {
        err.response.data.errors.forEach((error: any) => {
          toast.error(error.message);
        });
      } else {
        toast.error(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Something went wrong",
        );
      }
    },
  });

  // Update
  const { mutateAsync: updateItem, isPending: updating } = useMutation({
    mutationFn: async ({
      endpoint: epArg,
      id,
      body,
      imageCover: imgArg,
      coverImage: imgCoverArg,
      imageCoverAlt,
      coverImageAlt,
      alt,
      images: imgsArg,
      useJsonPayload = true,
    }: {
      endpoint?: string;
      id: string;
      body: any;
      imageCover?: File | null;
      coverImage?: File | null;
      imageCoverAlt?: string;
      coverImageAlt?: string;
      alt?: string;
      images?: File[] | null;
      useJsonPayload?: boolean;
    }) => {
      const finalEndpoint = epArg || endpoint;
      if (!finalEndpoint) throw new Error("Endpoint is required");

      let imgCoverUrl: string = "";
      let imgCoverPublicId: string = "";
      let imgsUrl: string[] = [];
      let rawBatchImgs: any[] = [];
      // upload and get image cover url
      const fileToUpload = imgArg || imgCoverArg;
      if (fileToUpload && fileToUpload instanceof File) {
        try {
          const res = await getImgsUrl(fileToUpload);
          const raw = res?.data?.data || res?.data || res;
          imgCoverUrl = raw?.url || res?.url || "";
          imgCoverPublicId = raw?.publicId || raw?.public_id || "";
        } catch (uploadError: any) {
          console.error("Image upload failed:", uploadError);
          if (uploadError.message?.includes("login") || uploadError.response?.status === 401) {
            toast.error("انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى");
            throw uploadError;
          }
          toast.error("فشل رفع الصورة، يرجى المحاولة مرة أخرى");
          throw uploadError;
        }
      }
      if (imgsArg && Array.isArray(imgsArg) && imgsArg.length > 0) {
        try {
          const res = await getImgsUrl(imgsArg);
          const rawImgs = res?.data || res || [];
          rawBatchImgs = Array.isArray(rawImgs) ? rawImgs : [];
          imgsUrl = rawBatchImgs.map((item: any) => item?.url || item);
        } catch (uploadError: any) {
          console.error("Batch image upload failed:", uploadError);
          if (uploadError.message?.includes("login") || uploadError.response?.status === 401) {
            toast.error("انتهت جلسة العمل، يرجى تسجيل الدخول مرة أخرى");
            throw uploadError;
          }
          toast.error("فشل رفع الصور، يرجى المحاولة مرة أخرى");
          throw uploadError;
        }
      }

      // if useJsonPayload is true, then the body is already a JSON object
      if (useJsonPayload) {
        const cleanedData = Object.fromEntries(
          Object.entries(body).filter(
            ([key, value]) =>
              key !== "endpoint" &&
              key !== "body" &&
              key !== "data" &&
              !(value instanceof File),
          ),
        );

        let patchData: any = {
          ...cleanedData,
        };

        if (imgCoverUrl) {
          const key =
            imgCoverArg || body?.coverImage ? "coverImage" : "imageCover";
          patchData[key] = {
            url: imgCoverUrl,
            ...(imgCoverPublicId ? { publicId: imgCoverPublicId } : {}),
            alt:
              coverImageAlt ||
              imageCoverAlt ||
              alt ||
              body.coverImageAlt ||
              body.imageCoverAlt ||
              body.alt ||
              "",
          };
        }

        if (imgsUrl && imgsUrl.length > 0) {
          const newImgs = imgsUrl.map((url, i) => {
            const rawItem = rawBatchImgs[i];
            const pubId = typeof rawItem === "object" ? (rawItem?.publicId || rawItem?.public_id) : undefined;
            return {
              url,
              ...(pubId ? { publicId: pubId } : {}),
              alt: "",
            };
          });
          patchData.images = [...(patchData.images || []), ...newImgs];
        }
        patchData = Object.fromEntries(
          Object.entries(patchData).filter(
            ([key, value]) =>
              value !== null &&
              value !== undefined &&
              value !== "" &&
              key !== "_id",
          ),
        );

        const patchUrl =
          finalEndpoint.endsWith(`/${id}`) || finalEndpoint.endsWith(id)
            ? finalEndpoint
            : `${finalEndpoint}/${id}`;

        const res = await api.patch(patchUrl, patchData, {
          headers: { "Content-Type": "application/json" },
        });
        return res.data;
      }

      const formData = new FormData();

      // Collect images
      const cover = imgArg || body?.imageCover;
      const gallery = imgsArg || body?.images;

      if (cover instanceof File) {
        formData.append("imageCover", cover);
      }
      if (Array.isArray(gallery)) {
        gallery.forEach((img: any) => {
          if (img instanceof File) formData.append("images", img);
        });
      }

      // Clean body
      const cleanedData = Object.fromEntries(
        Object.entries(body).filter(
          ([key, value]) =>
            value !== null &&
            value !== undefined &&
            value !== "" &&
            key !== "images" &&
            !(key === "imageCover" && value instanceof File),
        ),
      );
      formData.append("data", JSON.stringify(cleanedData));

      const multipartPatchUrl =
        finalEndpoint.endsWith(`/${id}`) || finalEndpoint.endsWith(id)
          ? finalEndpoint
          : `${finalEndpoint}/${id}`;

      const res = await api.patch(multipartPatchUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },

    onSuccess: async (res) => {
      // Invalidate and refetch to get fresh data from server with the uploaded image
      await queryClient.invalidateQueries({ queryKey: formattedKey });
      await queryClient.refetchQueries({ queryKey: formattedKey });
      if (showToast) {
        safeSuccessToast(res?.message || "تم التحديث بنجاح", `crud-update-${String(formattedKey[0])}`);
      }
      handleCloseModal?.();
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((error: any) => {
          if (typeof error?.message === "string") toast.error(error.message);
          else if (typeof error === "string") toast.error(error);
        });
      } else {
        const msg =
          data?.message ||
          data?.error ||
          err?.message ||
          "Something went wrong";
        toast.error(typeof msg === "string" ? msg : "Something went wrong");
      }
    },
  });

  // set data
  const setData = (updater: (oldData: T) => T) => {
    queryClient.setQueryData(formattedKey, (old: any) => {
      const current = old?.data ?? old;
      const updated = updater(current as T);

      return { ...old, data: updated };
    });
  };

  return {
    data,
    refetch,
    createItem,
    deleteItem,
    updateItem,
    isLoading,
    isError,
    creating,
    deleting,
    updating,
    isRefetching,
    setData,
    queryClient,
  };
}
