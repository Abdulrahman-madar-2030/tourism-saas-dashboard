"use client";
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "@/lib/chart";

interface TotalStatsChartProps {
  data: {
    totalUsers: number;
    totalPackages: number;
    totalHotels: number;
    totalCountries: number;
    totalCities: number;
    totalCityTours: number;
    totalBlogs: number;
  };
}

export default function TotalStatsChart({ data }: TotalStatsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: [
          "المستخدمين",
          "الباقات",
          "الفنادق",
          "الدول",
          "المدن",
          "الجولات",
          "المدونات",
        ],
        datasets: [
          {
            label: "إجمالي العدد",
            data: [
              data.totalUsers,
              data.totalPackages,
              data.totalHotels,
              data.totalCountries,
              data.totalCities,
              data.totalCityTours,
              data.totalBlogs,
            ],
            backgroundColor: [
              "#6366f1",
              "#2f2562",
              "#0284c7",
              "#0d9488",
              "#10b981",
              "#f59e0b",
              "#ec4899",
            ],
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1e1b4b",
            titleFont: { family: "var(--font-almarai), sans-serif", size: 13 },
            bodyFont: { family: "var(--font-almarai), sans-serif", size: 14, weight: "bold" },
            padding: 12,
            cornerRadius: 8,
            boxPadding: 4,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(226, 232, 240, 0.6)",
            },
            ticks: {
              font: { family: "var(--font-almarai), sans-serif" },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { family: "var(--font-almarai), sans-serif", weight: "bold" },
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

  return <canvas ref={chartRef} className="w-full h-full" />;
}
