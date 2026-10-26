import React from "react";
import { FaChevronLeft } from "react-icons/fa6";
import Link from "next/link";

export default function BreadCrumb({ breadCrumbItems }: { breadCrumbItems: string }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        href="/dashboard/home"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        الرئيسية
      </Link>
      <FaChevronLeft className="w-3 h-3 text-muted-foreground/50" />
      <span className="text-foreground font-medium">{breadCrumbItems}</span>
    </nav>
  );
}
