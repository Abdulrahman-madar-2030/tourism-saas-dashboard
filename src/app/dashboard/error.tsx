"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { FaRotateRight, FaHouse, FaTriangleExclamation } from "react-icons/fa6";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-destructive/20 bg-background/95 backdrop-blur-md p-8 shadow-xl text-center space-y-6">
        {/* Error Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center text-3xl shadow-xs">
          <FaTriangleExclamation />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-foreground">
            عذراً، حدث خطأ غير متوقع
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            حدث خطأ أثناء تحميل بيانات هذه الصفحة. يمكنك محاولة إعادة التحميل الآن أو العودة للصفحة الرئيسية.
          </p>
          {error?.message && (
            <div className="mt-3 p-3 rounded-xl bg-muted/60 text-xs font-mono text-muted-foreground text-left dir-ltr max-h-24 overflow-auto border border-border">
              {error.message}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
          >
            <FaRotateRight className="text-xs" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/dashboard/home"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground text-sm font-semibold transition-all cursor-pointer"
          >
            <FaHouse className="text-xs text-muted-foreground" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
