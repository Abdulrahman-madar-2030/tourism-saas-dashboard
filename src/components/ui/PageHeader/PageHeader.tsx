import React from "react";
import { IconType } from "react-icons";

interface PageHeaderProps {
  pageName: string;
  pageDescription?: string;
  PageIcon?: IconType;
  actions?: React.ReactNode;
}

export default function PageHeader({
  pageName,
  pageDescription,
  PageIcon,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-4">
        {PageIcon && (
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <PageIcon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {pageName}
          </h1>
          {pageDescription && (
            <p className="text-muted-foreground text-sm mt-1">
              {pageDescription}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
