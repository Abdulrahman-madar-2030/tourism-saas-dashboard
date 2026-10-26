"use client";
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "@/lib/chart";

interface RadarChartProps {
  totals: {
    totalUsers: number;
    totalPackages: number;
    totalHotels: number;
    totalCountries: number;
    totalCities: number;
    totalCityTours: number;
    totalBlogs: number;
  };
  recent: {
    newUsersThisMonth?: number;
    newPackagesThisMonth?: number;
    newHotelsThisMonth?: number;
    newCountriesThisMonth?: number;
    newCitiesThisMonth?: number;
    newCityToursThisMonth?: number;
    newBlogsThisMonth?: number;
  };
}

export default function RadarChart({ totals, recent }: RadarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Normalize data to 0-100 scale for better comparison
    const normalizeData = (values: number[]) => {
      const max = Math.max(...values);
      return max > 0 ? values.map((v) => (v / max) * 100) : values;
    };

    const totalValues = [
      totals.totalUsers,
      totals.totalPackages,
      totals.totalHotels,
      totals.totalCountries,
      totals.totalCities,
      totals.totalCityTours,
      totals.totalBlogs,
    ];

    const recentValues = [
      recent.newUsersThisMonth || 0,
      recent.newPackagesThisMonth || 0,
      recent.newHotelsThisMonth || 0,
      recent.newCountriesThisMonth || 0,
      recent.newCitiesThisMonth || 0,
      recent.newCityToursThisMonth || 0,
      recent.newBlogsThisMonth || 0,
    ];

    const config: ChartConfiguration = {
      type: "radar",
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
            label: "المحتوى الكلي (نسبي)",
            data: normalizeData(totalValues),
            fill: true,
            backgroundColor: "rgba(47, 37, 98, 0.2)",
            borderColor: "#2f2562",
            borderWidth: 2,
            pointBackgroundColor: "#2f2562",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#2f2562",
          },
          {
            label: "إضافات هذا الشهر (نسبي)",
            data: normalizeData(recentValues),
            fill: true,
            backgroundColor: "rgba(245, 158, 11, 0.25)",
            borderColor: "#f59e0b",
            borderWidth: 2,
            pointBackgroundColor: "#f59e0b",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#f59e0b",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { family: "var(--font-almarai), sans-serif", size: 12 },
              usePointStyle: true,
              pointStyle: "circle",
            },
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
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
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
  }, [totals, recent]);

  return <canvas ref={chartRef} />;
}
