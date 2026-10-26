import { ReactNode, useState, useEffect } from "react";

interface TabItem {
    id: string | number;
    label: string;
    content: ReactNode;
}

interface TabsProps {
    items: TabItem[];
    defaultActiveId?: string | number;
    className?: string;
    actions?: ReactNode;
}

export default function Tabs({ items, defaultActiveId, className = "", actions }: TabsProps) {
    const [activeTab, setActiveTab] = useState<string | number>(defaultActiveId || items[0]?.id);

    useEffect(() => {
        if (items.length > 0 && !items.find(i => i.id === activeTab)) {
            setActiveTab(items[0].id);
        }
    }, [items, activeTab]);

    if (!items || items.length === 0) return (
        <div className="w-full">
            {actions && <div className="mb-4 flex justify-end">{actions}</div>}
            <div className="text-center py-12 bg-background rounded-xl border border-border">
                <p className="text-muted-foreground">No items found.</p>
            </div>
        </div>
    );

    return (
        <div className={`w-full ${className}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                {/* Tab List */}
                <div className="flex-1 overflow-x-auto no-scrollbar">
                    <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
                        {items.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveTab(item.id)}
                                className={`
                                    px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap
                                    transition-all duration-200
                                    ${activeTab === item.id
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    }
                                `}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex-shrink-0">
                        {actions}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="animate-fadeIn">
                {items.find((item) => item.id === activeTab)?.content}
            </div>
        </div>
    );
}
