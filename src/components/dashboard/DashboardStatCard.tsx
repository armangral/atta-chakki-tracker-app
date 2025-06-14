
import React from "react";

interface DashboardStatCardProps {
  title: React.ReactNode; // 🔥 Accept React.ReactNode for flexibility
  value: React.ReactNode;
  loading?: boolean;
  color?: string;
  children?: React.ReactNode;
}

export default function DashboardStatCard({
  title,
  value,
  loading,
  color,
  children,
}: DashboardStatCardProps) {
  return (
    <div className={`flex-1 rounded-xl shadow-md border border-gray-100 p-6 bg-white min-w-[230px]`}>
      <div className="text-gray-600 font-medium">{title}</div>
      {loading ? (
        <div className="text-xl text-gray-400 mt-1">Loading...</div>
      ) : (
        <div className={`text-3xl font-extrabold ${color ?? "text-gray-800"} mt-1`}>{value}</div>
      )}
      {children}
    </div>
  );
}
