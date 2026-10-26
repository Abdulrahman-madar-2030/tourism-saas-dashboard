import React from "react";

export default function DashboardLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse p-2">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-xl" />
          <div className="h-4 w-72 bg-muted/70 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-muted rounded-xl" />
          <div className="h-10 w-36 bg-muted rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border/60 bg-card shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="w-9 h-9 rounded-xl bg-muted" />
            </div>
            <div className="h-7 w-24 bg-muted rounded-lg" />
            <div className="h-3 w-32 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Content Table / Grid Skeleton */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between gap-4 pb-2">
          <div className="h-10 w-64 bg-muted rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-muted rounded-lg" />
            <div className="h-9 w-20 bg-muted rounded-lg" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-muted/50 rounded-xl flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted/60 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-16 bg-muted rounded-lg" />
                <div className="h-8 w-8 bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
