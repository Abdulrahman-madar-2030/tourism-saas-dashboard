"use client";
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "@/lib/chart";

interface PolarAreaChartProps {
  data: {
    newUsersThisMonth?: number;
    newPackagesThisMonth?: number;
    newHotelsThisMonth?: number;
    newCountriesThisMonth?: number;
    newCitiesThisMonth?: number;
    newCityToursThisMonth?: number;
    newBlogsThisMonth?: number;
  };
}

export default function PolarAreaChart({ data }: PolarAreaChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: "polarArea",
      data: {
        labels: [
          "الباقات",
          "الفنادق",
          "الدول",
          "المدن",
          "الجولات",
          "المدونات",
          "المستخدمين",
        ],
        datasets: [
          {
            label: "تمت إضافته هذا الشهر",
            data: [
              data.newPackagesThisMonth || 0,
              data.newHotelsThisMonth || 0,
              data.newCountriesThisMonth || 0,
              data.newCitiesThisMonth || 0,
              data.newCityToursThisMonth || 0,
              data.newBlogsThisMonth || 0,
              data.newUsersThisMonth || 0,
            ],
            backgroundColor: [
              "rgba(47, 37, 98, 0.75)",
              "rgba(2, 132, 199, 0.75)",
              "rgba(13, 148, 136, 0.75)",
              "rgba(16, 185, 129, 0.75)",
              "rgba(245, 158, 11, 0.75)",
              "rgba(236, 72, 153, 0.75)",
              "rgba(99, 102, 241, 0.75)",
            ],
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverOffset: 10,
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
            ticks: {
              stepSize: 1,
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

  return <canvas ref={chartRef} />;
}
