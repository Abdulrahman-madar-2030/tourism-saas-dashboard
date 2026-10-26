"use client";
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "@/lib/chart";

interface RecentActivityChartProps {
  data?: {
    newUsersThisMonth?: number;
    newPackagesThisMonth?: number;
    newHotelsThisMonth?: number;
    newCountriesThisMonth?: number;
    newCitiesThisMonth?: number;
    newCityToursThisMonth?: number;
    newBlogsThisMonth?: number;
  };
}

export default function RecentActivityChart({
  data,
}: RecentActivityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Create soft gradient fill matching the reference
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, "rgba(79, 70, 229, 0.32)");
    gradient.addColorStop(0.7, "rgba(79, 70, 229, 0.08)");
    gradient.addColorStop(1, "rgba(79, 70, 229, 0.0)");

    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    // Smooth monthly curve matching the reference curve
    const monthlyData = [8, 14, 19, 24, 28, 33, 38, 48, 32, 24, 20, 18];

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "حركة الاستخدام والتسجيلات",
            data: monthlyData,
            fill: true,
            backgroundColor: gradient,
            borderColor: "#4f46e5",
            borderWidth: 2.5,
            tension: 0.45,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#4f46e5",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: "#4f46e5",
            pointHoverBorderColor: "#ffffff",
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
            titleFont: { family: "sans-serif", size: 12 },
            bodyFont: { family: "sans-serif", size: 13, weight: "bold" },
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          y: {
            min: 0,
            max: 60,
            ticks: {
              stepSize: 15,
              color: "#94a3b8",
              font: { size: 11 },
            },
            grid: {
              color: "rgba(241, 245, 249, 0.9)",
            },
            border: {
              display: false,
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#94a3b8",
              font: { size: 10.5 },
            },
            border: {
              display: false,
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
