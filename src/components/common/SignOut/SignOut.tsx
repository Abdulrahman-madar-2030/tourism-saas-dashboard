"use client";

import { signOut } from "next-auth/react";
import React, { useState } from "react";
import { CiLogout } from "react-icons/ci";
import { clearAuthTokens } from "@/lib/axios";

export default function SignOutBtn() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;
    setLoading(true);
    try {
      clearAuthTokens();
      await signOut({ redirect: false });
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      title="تسجيل الخروج"
      className="bg-red-500 p-2 rounded-xl group-hover:bg-red-600 transition-colors text-white hover:bg-red-600 cursor-pointer disabled:opacity-50 flex items-center justify-center"
    >
      <CiLogout size={14} className={loading ? "animate-spin" : ""} />
    </button>
  );
}
