
import { useNavigate } from "react-router-dom";
import { Book, CalendarDays, ArrowUp, ArrowDown, Search } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 via-white to-emerald-50 py-16">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-800 mb-6">
          Punjab Atta Chakki <span className="text-amber-600">Management</span>
        </h1>
        <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl">
          Digitize your product inventory, sales records, and daily operations for <span className="font-semibold text-gray-800">reliable, real-time insights</span>.<br />
          <span className="text-amber-900 font-medium">Admin: </span>Manage all products, stock, and staff.<br />
          <span className="text-emerald-700 font-medium">Operator: </span>Record sales seamlessly—no paperwork.
        </p>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-3 px-6 py-3 rounded-lg bg-amber-600 text-white font-semibold text-lg shadow-md hover:bg-amber-700 transition focus:ring-2 ring-amber-400"
          >
            <Book size={24} /> Admin Panel
          </button>
          <button
            onClick={() => navigate("/pos")}
            className="flex items-center gap-3 px-6 py-3 rounded-lg bg-emerald-600 text-white font-semibold text-lg shadow-md hover:bg-emerald-700 transition focus:ring-2 ring-emerald-400"
          >
            <CalendarDays size={24} /> Operator POS
          </button>
        </div>
        <div className="w-full grid md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col items-center">
            <ArrowUp size={36} className="text-amber-400 mb-2" />
            <div className="font-bold text-2xl">Admin Controls</div>
            <div className="text-sm text-gray-500 mt-1 text-center">Full access to inventory, products, stock, sales logs, and team.</div>
          </div>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col items-center">
            <ArrowDown size={36} className="text-emerald-400 mb-2" />
            <div className="font-bold text-2xl">Operator POS</div>
            <div className="text-sm text-gray-500 mt-1 text-center">Quick sale entry, automatic stock reduction, and your transaction log.</div>
          </div>
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col items-center">
            <Search size={36} className="text-blue-400 mb-2" />
            <div className="font-bold text-2xl">Instant Insights</div>
            <div className="text-sm text-gray-500 mt-1 text-center">Glance at today’s sales, historic transactions, and low-stock alerts.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
