import {
  Chart,
  BarController,
  BarElement,
  PieController,
  DoughnutController,
  ArcElement,
  RadarController,
  PolarAreaController,
  LineController,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import type { ChartConfiguration } from "chart.js";

// Tree-shaken registration: Only register components and controllers used in dashboard
Chart.register(
  BarController,
  BarElement,
  PieController,
  DoughnutController,
  ArcElement,
  RadarController,
  PolarAreaController,
  LineController,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  Filler,
);

export { Chart };
export type { ChartConfiguration };
