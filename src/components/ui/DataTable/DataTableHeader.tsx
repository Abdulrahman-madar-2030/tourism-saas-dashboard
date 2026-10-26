import React, { ReactNode } from 'react';

interface DataTableHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function DataTableHeader({ title, description, action }: DataTableHeaderProps) {
    return (
        <div className="bg-background rounded-xl border border-border p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md">
            <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}
