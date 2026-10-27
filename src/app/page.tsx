"use client";

import React, { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

// Icons
import {
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiShieldCheck,
} from "react-icons/hi2";
import {
  RiHotelLine,
  RiCompass3Line,
} from "react-icons/ri";
import {
  FaShieldHalved,
  FaCrown,
  FaBuilding,
  FaGlobe,
  FaArrowLeft,
  FaCircleCheck,
} from "react-icons/fa6";
import { TbBeach } from "react-icons/tb";

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email?.trim(),
        password: data.password,
      });

      if (res?.error) {
        const errorMsg =
          res.error === "CredentialsSignin"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيح"
            : res.error;

        toast.error(errorMsg, {
          className: "font-almarai",
          style: {
            borderRadius: "16px",
            background: "#ffffff",
            color: "#e11d48",
            border: "1px solid rgba(225, 29, 72, 0.2)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          },
        });
        setLoading(false);
      } else {
        try {
          let session = await getSession();
          let token =
            (session as any)?.user?.accessToken ||
            (session as any)?.accessToken ||
            (session as any)?.token;

          if (!token) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            session = await getSession();
            token =
              (session as any)?.user?.accessToken ||
              (session as any)?.accessToken ||
              (session as any)?.token;
          }

          if (token) {
            const cookieOptions: Cookies.CookieAttributes = {
              path: "/",
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              expires: data.rememberMe ? 30 : 1,
            };
            Cookies.set("user_token", token, cookieOptions);
            Cookies.set("token", token, cookieOptions);
          }
        } catch (cookieErr) {
          console.warn("Could not set local token cookie:", cookieErr);
        }

        toast.success("تم تسجيل الدخول بنجاح! مرحباً بك في لوحة السوبر أدمن", {
          className: "font-almarai",
          style: {
            borderRadius: "16px",
            background: "#ffffff",
            color: "#059669",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          },
        });

        router.replace("/dashboard/home");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ غير متوقع أثناء الدخول", {
        className: "font-almarai",
        style: {
          borderRadius: "16px",
          background: "#ffffff",
          color: "#e11d48",
          border: "1px solid rgba(225, 29, 72, 0.2)",
        },
      });
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setValue("email", "admin@almounafis.com");
    setValue("password", "123456");
    toast("تم ملء بيانات الدخول التجريبية للمشرف", {
      icon: "⚡",
      style: {
        borderRadius: "16px",
        background: "#ffffff",
        color: "#4338ca",
        border: "1px solid rgba(99, 102, 241, 0.2)",
      },
    });
  };

  return (
    <main className="relative min-h-screen bg-[#fafbfc] flex flex-col justify-between overflow-x-hidden select-none">
      {/* Background Grid Pattern (Matching Dashboard) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 dashboard-grid-pattern opacity-45"
      />

      {/* Ambient Glow Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-1/4 w-[36rem] h-[36rem] rounded-full bg-indigo-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-10 w-[30rem] h-[30rem] rounded-full bg-blue-500/10 blur-3xl"
      />
 
      {/* Main Content Area: Split 2-Column Showcase */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Right Column in RTL: Super Admin Visual Showcase (Desktop) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-between space-y-6 pr-2">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 mb-5 shadow-2xs">
                <FaCrown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-black tracking-wide">
                  نظام السوبر أدمن السحابي لقطاع السياحة والسفر
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 text-[10px] font-bold border border-indigo-100">
                  SaaS Enterprise
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl xl:text-4xl font-black text-slate-900 leading-[1.3] tracking-tight">
                مركز القيادة الموحد لإدارة <br />
                <span className="bg-gradient-to-l from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
                  وكالات السفر والمنظومة السياحية
                </span>
              </h1>

              <p className="mt-3.5 text-slate-500 text-sm xl:text-base leading-relaxed max-w-xl font-normal">
                منظومة سحابية رائدة (Tourism SaaS) تمنحك سلطة رقابية وتشغيلية كاملة لإدارة مختلف وكالات السفر الشريكة، باقات العطلات، الفنادق الدولية، والوجهات الجغرافية من مركز إدارة موحد.
              </p>
            </div>

            {/* AI 3D Graphic Banner Showcase Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border border-blue-100/70 p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1.5 max-w-xs text-right">
                <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  تحليلات فورية
                </span>
                <h4 className="text-sm font-black text-slate-900">
                  لوحة قيادة تفاعلية متكاملة
                </h4>
                <p className="text-xs text-slate-500">
                  تتبع مباشر لأداء الوكالات، الباقات النشطة، والحجوزات بدقة عالية
                </p>
              </div>

              <div className="w-44 h-28 relative flex items-center justify-center">
                <Image
                  src="/hero-travel-3d.jpg"
                  alt="Tourism SaaS 3D Hero"
                  width={180}
                  height={110}
                  priority
                  className="object-contain mix-blend-multiply drop-shadow-sm rounded-xl"
                />
              </div>
            </div>

            {/* Feature Telemetry Cards */}
            <div className="space-y-3">
              {/* Feature 1 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-sm transition-all duration-200 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                    <FaBuilding className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      إدارة متعددة الوكالات والشركات (Multi-Tenant Hub)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ربط وإدارة مركزية لكافة الوكالات والشركات السياحية بصلاحيات مستقلة
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700">
                  تحكم شامل
                </span>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-400 hover:shadow-sm transition-all duration-200 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                    <RiHotelLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                      محرك الباقات والفنادق والرحلات الموحد
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      إدارة كتالوجات الباقات السياحية، الفنادق، والجولات العالمية
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-[10px] font-bold text-purple-700">
                  مخزون مركزي
                </span>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 hover:shadow-sm transition-all duration-200 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                    <FaShieldHalved className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      حوكمة أمان السوبر أدمن الكاملة (Root Security)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      صلاحيات إدارية عليا وتدقيق مستمر لكافة العمليات والحجوزات
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700">
                  حماية 100%
                </span>
              </div>
            </div>
          </div>

          {/* Left Column in RTL: The Super Admin Form Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] rounded-3xl p-7 sm:p-9 relative overflow-hidden">
              
              {/* Card Ambient Top Accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
              
              {/* Super Admin Emblem & Header */}
              <div className="text-center mb-6 pt-1">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 p-2 flex items-center justify-center shadow-xs">
                    <TbBeach className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>

                {/* Super Admin Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-black uppercase tracking-wider mb-2">
                  <FaCrown className="w-3 h-3 text-amber-500" />
                  <span>بوابة السوبر أدمن • SUPER ADMIN</span>
                </div>

                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  تسجيل الدخول للمنظومة
                </h2>
                <p className="text-slate-400 text-xs mt-1 font-medium">
                  منصة إدارة قطاع السياحة والسفر (Tourism SaaS)
                </p>

                {/* Scope Indicators */}
                <div className="flex items-center justify-center gap-2 mt-2.5 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    🛡️ Root Privileges
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                    🌐 Multi-Agency Control
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 text-right">
                    البريد الإلكتروني للسوبر أدمن
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <HiEnvelope className="w-5 h-5" />
                    </div>
                    <input
                      {...register("email", {
                        required: "البريد الإلكتروني مطلوب",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "صيغة البريد الإلكتروني غير صحيحة",
                        },
                      })}
                      dir="ltr"
                      type="email"
                      placeholder="superadmin@tourismsaas.com"
                      className={`w-full pr-11 pl-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border ${
                        errors.email
                          ? "border-rose-500 focus:ring-rose-500/20"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
                      } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-rose-500 text-xs font-medium mt-1 mr-1 text-right">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 text-right">
                      كلمة المرور المشفرة
                    </label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <HiLockClosed className="w-5 h-5" />
                    </div>
                    <input
                      {...register("password", {
                        required: "كلمة المرور مطلوبة",
                        minLength: {
                          value: 6,
                          message: "كلمة المرور يجب أن لا تقل عن 6 أحرف",
                        },
                      })}
                      dir="ltr"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className={`w-full pr-11 pl-12 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border ${
                        errors.password
                          ? "border-rose-500 focus:ring-rose-500/20"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
                      } rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-all duration-200`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <HiEyeSlash className="w-5 h-5" />
                      ) : (
                        <HiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-500 text-xs font-medium mt-1 mr-1 text-right">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      {...register("rememberMe")}
                      type="checkbox"
                      className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium">تذكر جلسة السوبر أدمن</span>
                  </label>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <HiShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>اتصال مشفر</span>
                  </span>
                </div>

                {/* Submit Action Button */}
                <button
                  disabled={loading}
                  type="submit"
                  className="cursor-pointer w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#2f27ce] hover:bg-[#251fa8] active:scale-[0.99] transition-all duration-200 shadow-md shadow-indigo-600/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جارٍ التحقق والمصادقة...</span>
                    </>
                  ) : (
                    <>
                      <span>دخول لوحة السوبر أدمن (Super Admin)</span>
                      <RiCompass3Line className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Fill Helper Pill */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  تجربة سريعة للبيانات؟
                </span>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  ملء بيانات الدخول
                </button>
              </div>

              {/* Security Notice */}
              <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  🔒 منطقة وصول مقيدة ومخصصة حصرياً للمشرفين العامين على منظومة السياحة السحابية (Tourism SaaS).
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-400 font-mono">
                  &copy; {new Date().getFullYear()} Tourism SaaS Platform • Super Admin Enterprise
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
