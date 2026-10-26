"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import BreadCrumb from "@/components/ui/BreadCrumb/BreadCrumb";
import PackageFormView from "@/app/dashboard/packages/PackageFormView";
import Spinner from "@/components/ui/Spinner/Spinner";

export default function EditPackagePage() {
  const params = useParams();
  const id = String(params?.id || "");

  return (
    <div className="space-y-6">
      <div className="my-2">
        <BreadCrumb breadCrumbItems="الباقات السياحية / تعديل الباقة" />
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner />
          </div>
        }
      >
        <PackageFormView mode="edit" packageId={id} />
      </Suspense>
    </div>
  );
}
