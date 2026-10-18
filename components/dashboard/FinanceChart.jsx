import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import numeral from "numeral";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FinanceChart = ({ breakdown = [] }) => {
  const labels = breakdown.map((row) => row.label);
  const incomeData = breakdown.map((row) => row.income);
  const expenseData = breakdown.map((row) => row.expense);

  const data = {
    labels,
    datasets: [
      {
        label: "Pemasukan",
        data: incomeData,
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointRadius: 3,
        borderWidth: 3,
        tension: 0.3,
        fill: false,
      },
      {
        label: "Pengeluaran",
        data: expenseData,
        borderColor: "rgba(244, 63, 94, 1)",
        backgroundColor: "rgba(244, 63, 94, 0.15)",
        pointBackgroundColor: "rgba(244, 63, 94, 1)",
        pointRadius: 3,
        borderWidth: 3,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        mode: "nearest",
        intersect: false,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: Rp ${numeral(ctx.parsed.y).format("0,0")}`,
        },
      },
    },
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "#0000000A",
        },
        ticks: {
          callback: (value) => numeral(value).format("0,0"),
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default FinanceChart;
