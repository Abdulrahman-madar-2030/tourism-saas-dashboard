/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getSession } from "next-auth/react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { getImgsUrl } from "@/hooks/useCrudQuery";

export function isJwtExpired(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return true;
  if (!token.includes(".")) return true; // not a real JWT format
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const decoded = JSON.parse(jsonPayload);
    // Give 30-second leeway
    if (decoded.exp && Date.now() >= (decoded.exp - 30) * 1000) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function clearAuthTokens() {
  Cookies.remove("token", { path: "/" });
  Cookies.remove("jwt", { path: "/" });
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
  }
}

export function saveAuthToken(token: string) {
  if (!token || isJwtExpired(token)) return;
  Cookies.set("token", token, { expires: 30, path: "/", sameSite: "lax" });
  Cookies.set("jwt", token, { expires: 30, path: "/", sameSite: "lax" });
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("jwt", token);
  }
}

export function getStoredToken(): string | null {
  const cookieToken = Cookies.get("token") || Cookies.get("jwt");
  if (cookieToken) return cookieToken;
  if (typeof window !== "undefined") {
    const localToken =
      localStorage.getItem("token") || localStorage.getItem("jwt");
    if (localToken) return localToken;
  }
  return null;
}

export async function getAnyToken(): Promise<string | null> {
  const stored = getStoredToken();
  if (stored) return stored;
  if (typeof window !== "undefined") {
    try {
      const session = await getSession();
      const sessionToken =
        (session as any)?.user?.accessToken ||
        (session as any)?.accessToken ||
        (session as any)?.token;
      if (sessionToken) return sessionToken;
    } catch {}
  }
  return null;
}

export async function getValidToken(): Promise<string | null> {
  // 1. Check cookies first
  const cookieToken = Cookies.get("token") || Cookies.get("jwt");
  if (cookieToken && !isJwtExpired(cookieToken)) {
    return cookieToken;
  }

  // 2. Check localStorage
  if (typeof window !== "undefined") {
    const localToken =
      localStorage.getItem("token") || localStorage.getItem("jwt");
    if (localToken && !isJwtExpired(localToken)) {
      saveAuthToken(localToken);
      return localToken;
    }
  }

  // 3. Fallback to NextAuth session
  if (typeof window !== "undefined") {
    try {
      const session = await getSession();
      const sessionToken =
        (session as any)?.user?.accessToken ||
        (session as any)?.accessToken ||
        (session as any)?.token;

      if (sessionToken && !isJwtExpired(sessionToken)) {
        saveAuthToken(sessionToken);
        return sessionToken;
      }
    } catch {
      // ignore session fetch errors
    }
  }

  // If expired or missing, try refreshing silently before giving up
  const refreshed = await refreshAuthToken();
  if (refreshed) {
    return refreshed;
  }

  // Only return fallback stored token or null if truly impossible
  return cookieToken || null;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  let token = await getValidToken();
  if (!token) {
    token = await getAnyToken();
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

interface RetryQueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: any;
}

let failedAuthQueue: RetryQueueItem[] = [];
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAuthToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    isRefreshing = true;
    try {
      const currentToken = await getAnyToken();
      if (!currentToken) {
        return null;
      }

      const baseUrl = (
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        ""
      ).replace(/\/+$/, "");

      const refreshTokenCookie =
        Cookies.get("refreshToken") ||
        Cookies.get("refresh_token") ||
        Cookies.get("jwt") ||
        Cookies.get("token") ||
        currentToken;

      const refreshRes = await axios.post(
        `${baseUrl}/auth/refresh`,
        {
          token: currentToken,
          accessToken: currentToken,
          refreshToken: refreshTokenCookie,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        },
      );

      const refreshData = refreshRes.data?.data || refreshRes.data;
      const newAccessToken =
        refreshData?.token ||
        refreshData?.accessToken ||
        refreshData?.jwt ||
        refreshRes.data?.token ||
        refreshRes.data?.accessToken;

      if (newAccessToken) {
        saveAuthToken(newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch (err) {
      console.error("Silent /auth/refresh failed:", err);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

if (typeof window !== "undefined") {
  window.addEventListener("auth:renewed", (event: any) => {
    const freshToken = event.detail?.token;
    if (freshToken) {
      saveAuthToken(freshToken);
    }
    const queue = [...failedAuthQueue];
    failedAuthQueue = [];
    isRefreshing = false;
    queue.forEach(({ resolve, reject, config }) => {
      if (freshToken) {
        config.headers.Authorization = `Bearer ${freshToken}`;
      }
      api(config).then(resolve).catch(reject);
    });
  });

  window.addEventListener("auth:cancelled", () => {
    const queue = [...failedAuthQueue];
    failedAuthQueue = [];
    isRefreshing = false;
    queue.forEach(({ reject }) => {
      reject(new Error("Authentication cancelled by user"));
    });
  });
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorMsg =
      error.response?.data?.message || error.response?.data?.error || "";

    const isAuthError =
      error.response?.status === 401 ||
      (typeof errorMsg === "string" &&
        (errorMsg.toLowerCase().includes("token") ||
          errorMsg.toLowerCase().includes("login") ||
          errorMsg.toLowerCase().includes("unauthorized") ||
          errorMsg.toLowerCase().includes("auth") ||
          errorMsg.includes("Please Login to get access")));

    if (isAuthError) {
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          try {
            const newAccessToken = await refreshAuthToken();

            if (newAccessToken) {
              // Process queued requests
              const queue = [...failedAuthQueue];
              failedAuthQueue = [];

              queue.forEach(({ resolve, reject, config }) => {
                config.headers.Authorization = `Bearer ${newAccessToken}`;
                api(config).then(resolve).catch(reject);
              });

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
            }
          } catch (refreshErr) {
            console.error(
              "Refresh in response interceptor failed:",
              refreshErr,
            );
          }
        } else {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedAuthQueue.push({
              resolve,
              reject,
              config: originalRequest,
            });
          });
        }
      }

      // If refresh failed completely, clear tokens
      clearAuthTokens();
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      toast.error("ليس لديك صلاحية للوصول لهذا المورد");
    } else if (error.response?.status >= 500) {
      toast.error("حدث خطأ في الخادم، يرجى المحاولة لاحقاً");
    } else if (error.code === "ECONNABORTED") {
      toast.error("انتهت مهلة الاتصال، يرجى المحاولة مرة أخرى");
    } else if (!error.response) {
      toast.error("تعذر الاتصال بالخادم، تحقق من اتصال الإنترنت");
    }

    return Promise.reject(error);
  },
);

export const crudsAPI = {
  getAll: (endpoint: string) => api.get(`${endpoint}`),

  getById: (endpoint: string, id: string) => api.get(`${endpoint}/${id}`),

  delete: (endpoint: string, id: string) => api.delete(`${endpoint}/${id}`),

  create: (endpoint: string, data: any, file?: File, gallery?: File[]) => {
    const formData = new FormData();

    if (file instanceof File) {
      formData.append("imageCover", file);
    }

    if (Array.isArray(gallery) && gallery.length > 0) {
      const galleryFiltered = file
        ? gallery.filter((img) => img !== file)
        : gallery;
      galleryFiltered.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image);
        }
      });
    }

    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value === undefined || value === null || value === "") return;

      if (Array.isArray(value) && !(value instanceof File) && key != "images") {
        value.forEach((v) => formData.append(key, v));
      } else if (key === "coordinates" && typeof value === "object") {
        if (value.lat !== undefined)
          formData.append("coordinates[lat]", value.lat.toString());
        if (value.lng !== undefined)
          formData.append("coordinates[lng]", value.lng.toString());
      } else if (key === "price" && typeof value === "object") {
        if (value.min !== undefined) formData.append("price[min]", value.min);
        if (value.max !== undefined) formData.append("price[max]", value.max);
      } else if (key === "header" && typeof value === "object") {
        if (value.nights !== undefined)
          formData.append("header[nights]", value.nights);
        if (value.dayNumber !== undefined)
          formData.append("header[dayNumber]", value.dayNumber);
        if (value.location !== undefined)
          formData.append("header[location]", value.location);
        if (value.days !== undefined)
          formData.append("header[days]", value.days);
        if (value.people !== undefined)
          formData.append("header[people]", value.people);
        if (value.type !== undefined)
          formData.append("header[type]", value.type);
      } else if (key === "itinerary" || key === "paths") {
        formData.append("itinerary", JSON.stringify([value]));
      } else if (
        key === "images" ||
        key === "coverImage" ||
        key === "createdAt" ||
        key === "updatedAt" ||
        key === "createdBy" ||
        key === "updatedBy" ||
        key === "isActive" ||
        key === "cities" ||
        key === "itinerary" ||
        key === "paths"
      ) {
        return;
      } else if (typeof value === "object" && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
        return;
      } else {
        if (key !== "imageCover") formData.append(key, value);
      }
    });

    return api.post(`${endpoint}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (endpoint: string, data: any, file?: File, gallery?: File[]) => {
    const formData = new FormData();

    if (file instanceof File) {
      formData.append("imageCover", file);
    }

    if (Array.isArray(gallery) && gallery.length > 0) {
      const galleryFiltered = file
        ? gallery.filter((img) => img !== file)
        : gallery;
      galleryFiltered.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image);
        }
      });
    }

    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value === undefined || value === null || value === "") return;

      if (Array.isArray(value) && !(value instanceof File) && key != "images") {
        value.forEach((v) => formData.append(key, v));
      } else if (key === "coordinates" && typeof value === "object") {
        if (value.lat !== undefined)
          formData.append("coordinates[lat]", value.lat.toString());
        if (value.lng !== undefined)
          formData.append("coordinates[lng]", value.lng.toString());
      } else if (key === "price" && typeof value === "object") {
        if (value.min !== undefined) formData.append("price[min]", value.min);
        if (value.max !== undefined) formData.append("price[max]", value.max);
      } else if (key === "header" && typeof value === "object") {
        if (value.nights !== undefined)
          formData.append("header[nights]", value.nights);
        if (value.dayNumber !== undefined)
          formData.append("header[dayNumber]", value.dayNumber);
        if (value.location !== undefined)
          formData.append("header[location]", value.location);
        if (value.days !== undefined)
          formData.append("header[days]", value.days);
        if (value.people !== undefined)
          formData.append("header[people]", value.people);
        if (value.type !== undefined)
          formData.append("header[type]", value.type);
      } else if (key === "itinerary" || key === "paths") {
        formData.append("itinerary", JSON.stringify([value]));
      } else if (
        key === "images" ||
        key === "coverImage" ||
        key === "createdAt" ||
        key === "updatedAt" ||
        key === "createdBy" ||
        key === "updatedBy" ||
        key === "isActive" ||
        key === "cities" ||
        key === "itinerary" ||
        key === "paths"
      ) {
        return;
      } else if (typeof value === "object" && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
        return;
      } else {
        if (key !== "imageCover") formData.append(key, value);
      }
    });

    return api.patch(`${endpoint}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  updateSettings: async (
    url: string,
    data: any,
    imageFiles: Record<string, { desktop?: File; mobile?: File }>,
  ) => {
    let socialMediaArray = Array.isArray(data.socialMedia)
      ? [...data.socialMedia]
      : [];

    for (const [platformStr, files] of Object.entries(imageFiles)) {
      const index = parseInt(platformStr, 10);
      if (files.desktop) {
        const res = await getImgsUrl(files.desktop);
        const imgUrl = res?.data?.url || res?.url || "";
        if (imgUrl) {
          socialMediaArray[index] = {
            ...socialMediaArray[index],
            deskTopImage: {
              url: imgUrl,
              alt: socialMediaArray[index]?.name || "",
            },
          };
        }
      }
      if (files.mobile) {
        const res = await getImgsUrl(files.mobile);
        const imgUrl = res?.data?.url || res?.url || "";
        if (imgUrl) {
          socialMediaArray[index] = {
            ...socialMediaArray[index],
            mobileImage: {
              url: imgUrl,
              alt: socialMediaArray[index]?.name || "",
            },
          };
        }
      }
    }

    socialMediaArray = socialMediaArray.map((platform) => {
      const p = { ...platform };
      if (typeof p.deskTopImage === "string") delete p.deskTopImage;
      if (typeof p.mobileImage === "string") delete p.mobileImage;
      return p;
    });

    const payload = {
      contactInfo: data.contactInfo,
      socialMedia: socialMediaArray,
    };

    return api.patch(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  updateSeoPage: (url: string, data: any) => {
    return api.patch(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  createSeoPage: (url: string, data: any) => {
    return api.post(url, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;
