"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DailyReport } from "@/lib/utils/learningData";

interface WeeklyChartProps {
  dailyReports: DailyReport[];
}

export function WeeklyChart({ dailyReports }: WeeklyChartProps) {
  const chartData = dailyReports.map((report) => ({
    date: new Date(report.date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
    수학: report.subjectBreakdown.math,
    영어: report.subjectBreakdown.english,
    total: report.totalTime,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" />
        <YAxis stroke="#6b7280" label={{ value: "분", angle: -90, position: "insideLeft" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            padding: "12px",
          }}
        />
        <Legend />
        <Bar dataKey="수학" fill="#6366f1" radius={[8, 8, 0, 0]} />
        <Bar dataKey="영어" fill="#06b6d4" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
