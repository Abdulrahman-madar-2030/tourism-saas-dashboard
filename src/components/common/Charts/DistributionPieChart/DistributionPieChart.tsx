"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "@/lib/chart";

interface DistributionPieChartProps {
  data: {
    totalUsers: number;
    totalPackages: number;
    totalHotels: number;
    totalCountries: number;
    totalCities: number;
    totalCityTours: number;
    totalBlogs: number;
  };
  totalCount?: number;
}

export default function DistributionPieChart({
  data,
  totalCount = 1458,
}: DistributionPieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const config: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: [
          "المنتجعات والفنادق",
          "الرحلات والجولات",
          "الأنشطة والفعاليات",
          "الوجهات السياحية",
          "أخرى",
        ],
        datasets: [
          {
            label: "التوزيع",
            data: [42, 28, 18, 8, 4],
            backgroundColor: [
              "#1e1b4b",
              "#0284c7",
              "#0d9488",
              "#f59e0b",
              "#8b5cf6",
            ],
            borderWidth: 3,
            borderColor: "#ffffff",
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "74%",
        plugins: {
          legend: {
            display: false, // Hidden because the legend is rendered on the right side matching Image 2
          },
          tooltip: {
            backgroundColor: "#1e1b4b",
            titleFont: { family: "sans-serif", size: 12 },
            bodyFont: { family: "sans-serif", size: 13, weight: "bold" },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.label || "";
                const value = context.parsed;
                return ` ${label}: ${value}%`;
              },
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas ref={chartRef} className="w-full h-full" />
      {/* Centered Donut Label matching the UI reference exactly */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className="text-[11px] font-semibold text-slate-400 leading-tight">
          إجمالي المحتوى
        </span>
        <span className="text-xl font-black text-slate-900 leading-tight mt-0.5">
          {totalCount.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
}
