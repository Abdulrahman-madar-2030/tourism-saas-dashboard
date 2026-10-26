"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal/Modal";
import { useSession, signIn, getSession, signOut } from "next-auth/react";
import { saveAuthToken, clearAuthTokens } from "@/lib/axios";
import toast from "react-hot-toast";
import { FaKey, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi2";

export default function GlobalReAuthModal() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    const handleAuthExpired = (event: any) => {
      const currentEmail =
        session?.user?.email ||
        (typeof window !== "undefined"
          ? localStorage.getItem("user_email") || ""
          : "");
      if (currentEmail) {
        setEmail(currentEmail);
      }
      setPassword("");
      setErrorMessage(null);
      setIsOpen(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth:expired", handleAuthExpired);
      return () => {
        window.removeEventListener("auth:expired", handleAuthExpired);
      };
    }
  }, [session]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:cancelled"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage("كلمة المرور أو البريد الإلكتروني غير صحيح");
        setLoading(false);
        return;
      }

      // Fetch fresh session to grab new token
      let newSession = await getSession();
      let freshToken =
        (newSession as any)?.user?.accessToken ||
        (newSession as any)?.accessToken ||
        (newSession as any)?.token;

      if (!freshToken) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        newSession = await getSession();
        freshToken =
          (newSession as any)?.user?.accessToken ||
          (newSession as any)?.accessToken ||
          (newSession as any)?.token;
      }

      if (freshToken) {
        saveAuthToken(freshToken);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth:renewed", {
            detail: { token: freshToken },
          }),
        );
      }

      toast.success("تم تجديد الجلسة بنجاح، جاري استئناف طلبك تلقائياً...", {
        duration: 4000,
      });

      setIsOpen(false);
      setPassword("");
    } catch (err: any) {
      console.error("Re-authentication error:", err);
      setErrorMessage("حدث خطأ غير متوقع أثناء تجديد الجلسة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 p-2 text-right">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
            <FaKey size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <span>تجديد جلسة العمل</span>
              <HiSparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              انتهت صلاحية جلسة الاتصال بالخادم. أدخل كلمة المرور لتجديد الجلسة
              وحفظ التعديلات فوراً دون فقدان أي بيانات مدخلة.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3 pt-1">
          {/* Email */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                placeholder="superadmin@tourismsaas.com"
                className="w-full h-10 px-3 pl-9 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-left"
              />
              <FaEnvelope className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                placeholder="••••••••••••"
                autoFocus
                className="w-full h-10 px-3 pl-9 pr-9 text-xs rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-left"
              />
              <FaLock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <button
            type="button"
            onClick={async () => {
              handleClose();
              clearAuthTokens();
              try {
                await signOut({ redirect: false });
              } catch (e) {
                console.error("Sign out error:", e);
              } finally {
                window.location.href = "/";
              }
            }}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer"
          >
            تسجيل الخروج والعودة لشاشة الدخول
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>تجديد واستئناف</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
