"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type Point = { date: string; total: number; unique: number };

export function LineClicksChart({ points }: { points: Point[] }) {
  const labels = points.map((point) => point.date.slice(5));

  return (
    <div className="h-72">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Total clicks",
              data: points.map((point) => point.total),
              borderColor: "#18181b",
              backgroundColor: "rgba(24,24,27,0.08)",
              fill: true,
              tension: 0.25,
            },
            {
              label: "Unique clicks",
              data: points.map((point) => point.unique),
              borderColor: "#0ea5e9",
              backgroundColor: "rgba(14,165,233,0.08)",
              fill: true,
              tension: 0.25,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            y: { beginAtZero: true },
          },
        }}
      />
    </div>
  );
}
