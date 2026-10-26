import React from "react";

export default function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
    const sizeClasses = {
        sm: "w-5 h-5 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
    };

    return (
        <div className={`flex justify-center items-center w-full min-h-[200px] ${className}`}>
            <div
                className={`
          animate-spin rounded-full 
          border-border border-t-primary 
          ${sizeClasses[size]}
        `}
            />
        </div>
    );
}
