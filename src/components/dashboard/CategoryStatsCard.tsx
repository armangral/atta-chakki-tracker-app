
import React from "react";

type CategoryStats = {
  category: string;
  total: number;
  quantity: number;
};

export default function CategoryStatsCard({ stats }: { stats: CategoryStats[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.category}
          className="flex flex-col items-start p-4 rounded-xl shadow border bg-white"
        >
          <span className="text-md font-semibold text-gray-500">{stat.category}</span>
          <span className="text-lg font-bold text-emerald-700">
            ₨{stat.total.toLocaleString()} &middot; {stat.quantity} units
          </span>
        </div>
      ))}
    </div>
  );
}
