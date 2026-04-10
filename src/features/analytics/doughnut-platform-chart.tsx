"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  platformBreakdown: {
    ios: number;
    android: number;
    web: number;
  };
};

export function DoughnutPlatformChart({ platformBreakdown }: Props) {
  return (
    <div className="h-72">
      <Doughnut
        data={{
          labels: ["iOS", "Android", "Web"],
          datasets: [
            {
              data: [platformBreakdown.ios, platformBreakdown.android, platformBreakdown.web],
              backgroundColor: ["#3b82f6", "#22c55e", "#a855f7"],
              borderWidth: 0,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
          },
        }}
      />
    </div>
  );
}
