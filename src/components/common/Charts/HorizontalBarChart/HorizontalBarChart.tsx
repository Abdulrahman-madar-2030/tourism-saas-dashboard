"use client";
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "@/lib/chart";
interface HorizontalBarChartProps {
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

export default function HorizontalBarChart({ data }: HorizontalBarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Sort data by value for better visualization
    const sortedData = [
      { label: "المستخدمين", value: data.totalUsers },
      { label: "المدونات", value: data.totalBlogs },
      { label: "الجولات", value: data.totalCityTours },
      { label: "الباقات", value: data.totalPackages },
      { label: "الفنادق", value: data.totalHotels },
      { label: "المدن", value: data.totalCities },
      { label: "الدول", value: data.totalCountries },
    ].sort((a, b) => b.value - a.value);

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: sortedData.map((item) => item.label),
        datasets: [
          {
            label: "إجمالي السجلات",
            data: sortedData.map((item) => item.value),
            backgroundColor: "#2f2562",
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
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
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: "rgba(226, 232, 240, 0.6)",
            },
            ticks: {
              font: { family: "var(--font-almarai), sans-serif" },
            },
          },
          y: {
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

  return <canvas ref={chartRef} className="w-full h-full block" />;
}
