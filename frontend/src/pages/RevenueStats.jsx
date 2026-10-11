
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  ArrowLeft,
  TrendingUp,
  ShoppingCart,
  Package,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const money = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + "đ";

export default function RevenueStats() {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isSeller = Boolean(token && user?.role === "seller");

  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    if (!isSeller) return;

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsResponse, chartResponse] =
        await Promise.all([
          axios.get(
            `${API_URL}/api/orders/stats/dashboard`,
            { headers }
          ),
          axios.get(
            `${API_URL}/api/orders/stats/revenue`,
            { headers }
          ),
        ]);

      setStats(statsResponse.data);
      setChartData(chartResponse.data);
    } catch (err) {
      console.error("Lỗi thống kê:", err);

      setError(
        err.response?.data?.message ||
          "Không thể tải dữ liệu thống kê."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSeller) loadData();
  }, [isSeller]);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/seller"
          className="inline-flex items-center gap-2 font-semibold text-gray-500 hover:text-orange-600"
        >
          <ArrowLeft size={19} />
          Quay lại Dashboard
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-orange-600">
              Milk.club Seller Center
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">
              Thống kê doanh thu
            </h1>

            <p className="mt-3 text-gray-500">
              Theo dõi doanh thu và đơn hàng của cửa hàng.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Làm mới
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-10 text-gray-500">
            Đang tải thống kê...
          </p>
        ) : error ? (
          <p className="mt-6 text-gray-500">
            Hãy kiểm tra API thống kê trong Backend.
          </p>
        ) : (
          <>
            {/* CÁC THẺ THỐNG KÊ */}
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                {
                  title: "Tổng doanh thu",
                  value: money(stats?.revenue),
                  icon: TrendingUp,
                  color: "bg-orange-100 text-orange-600",
                },
                {
                  title: "Tổng đơn hàng",
                  value: stats?.totalOrders ?? 0,
                  icon: ShoppingCart,
                  color: "bg-blue-100 text-blue-600",
                },
                {
                  title: "Đơn hoàn thành",
                  value: stats?.completedOrders ?? 0,
                  icon: Package,
                  color: "bg-green-100 text-green-600",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-3xl bg-white p-6 shadow-sm"
                  >
                    <div
                      className={`inline-flex rounded-2xl p-4 ${item.color}`}
                    >
                      <Icon size={26} />
                    </div>

                    <p className="mt-5 text-gray-500">
                      {item.title}
                    </p>

                    <h2 className="mt-2 text-3xl font-extrabold">
                      {item.value}
                    </h2>
                  </div>
                );
              })}
            </div>

            {/* BIỂU ĐỒ DOANH THU */}
            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-extrabold">
                Biểu đồ doanh thu 7 ngày gần nhất
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Doanh thu từ đơn đã hoàn thành,
                tính theo ngày đặt hàng.
              </p>

              <div className="mt-8 h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        value
                          .slice(5)
                          .split("-")
                          .reverse()
                          .join("/")
                      }
                    />

                    <YAxis
                      width={85}
                      tickFormatter={(value) =>
                        Number(value).toLocaleString("vi-VN")
                      }
                    />

                    <Tooltip
                      formatter={(value) => money(value)}
                    />

                    <Bar
                      dataKey="revenue"
                      name="Doanh thu"
                      fill="#f97316"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BẢNG CHI TIẾT */}
            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold">
                Chi tiết doanh thu 7 ngày
              </h2>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="p-4">Ngày</th>
                      <th className="p-4">Đơn hoàn thành</th>
                      <th className="p-4">Doanh thu</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {chartData.map((item) => (
                      <tr key={item.date}>
                        <td className="p-4">
                          {item.date}
                        </td>

                        <td className="p-4">
                          {item.orders}
                        </td>

                        <td className="p-4 font-bold text-orange-600">
                          {money(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
