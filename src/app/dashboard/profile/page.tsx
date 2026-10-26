"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const ProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const session = useSession();

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    newPassword: "",
    passwordConfirm: "",
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // Fetch user profile
  useEffect(() => {
    if (session.status === "authenticated") {
      fetchUserProfile();
    }
  }, [session.status]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data: ApiResponse<User> = await response.json();
      setUser((prevUser) => data.data || prevUser);
      setName(data.data.name);
      setEmail(data.data.email);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${baseUrl}/users/update-me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setUser(data.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.passwordConfirm) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/auth/changePassword`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
        body: JSON.stringify({
          password: passwordForm.password,
          newPassword: passwordForm.newPassword,
          passwordConfirm: passwordForm.passwordConfirm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      toast.success("Password changed successfully!");
      setPasswordForm({
        password: "",
        newPassword: "",
        passwordConfirm: "",
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">الملف الشخصي</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            معلومات المستخدم
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "security"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            الخصوصية
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">تعديل الملف الشخصي</h2>
          <div>
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mb-4">
                {name?.slice(0, 1)}
              </div>
              <div className="flex gap-2 items-center font-semibold">
                <span className="text-lg">{name}</span>
                <span className="text-gray-500 text-[9px] font-light bg-secondary rounded-2xl border border-primary/20 px-1">
                  {session.data?.user.role}
                </span>
              </div>
            </div>
          </div>
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                الاسم
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                البريد الالكتروني
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/70 transition-colors"
            >
              حفظ التغييرات
            </button>
          </form>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">تغيير كلمة المرور</h2>
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                كلمة المرور الحالية
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordForm.password}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordForm.passwordConfirm}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    passwordConfirm: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/70 transition-colors"
            >
              تحديث كلمة المرور
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
