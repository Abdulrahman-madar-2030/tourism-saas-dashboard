"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner/Spinner";

export default function RedirectTourismPackagesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const packageId = params?.packageId;

  useEffect(() => {
    if (id && packageId) {
      router.replace(`/dashboard/packages/${id}/${packageId}`);
    }
  }, [id, packageId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Spinner />
      <p className="text-xs text-muted-foreground font-medium">
        جاري إعادة التوجيه إلى صفحة الباقات...
      </p>
    </div>
  );
}
