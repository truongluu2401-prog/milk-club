
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Store,
  Sparkles,
  Boxes,
  Clock3,
  BarChart3,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://https://milk-club.onrender.com";

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + "đ";

const initialStats = {
  totalProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  revenue: 0,
  productsSold: 0,
};

export default function SellerDashboard() {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isSeller = Boolean(token && user?.role === "seller");

  const [orderStats, setOrderStats] = useState(initialStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  async function fetchOrderStats() {
    if (!isSeller) return;

    setStatsLoading(true);
    setStatsError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/orders/stats/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrderStats(response.data);
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);

      setStatsError(
        error.response?.data?.message ||
          "Không thể tải thống kê. Hãy kiểm tra Backend và API."
      );
    } finally {
      setStatsLoading(false);
    }
  }

  useEffect(() => {
    if (isSeller) {
      fetchOrderStats();
    }
  }, [isSeller]);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  const stats = [
    {
      title: "Tổng doanh thu",
      value: statsLoading
        ? "Đang tải..."
        : statsError
        ? "Không thể tải"
        : formatMoney(orderStats.revenue),
      icon: DollarSign,
      color: "bg-orange-100 text-orange-600",
      note: "Tổng giá trị các đơn đã hoàn thành",
    },
    {
      title: "Đơn hàng",
      value: statsLoading
        ? "Đang tải..."
        : statsError
        ? "Không thể tải"
        : orderStats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-600",
      note: `${orderStats.pendingOrders} đơn chờ xác nhận`,
    },
    {
      title: "Sản phẩm đã bán",
      value: statsLoading
        ? "Đang tải..."
        : statsError
        ? "Không thể tải"
        : orderStats.productsSold,
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
      note: "Số lượng từ các đơn đã hoàn thành",
    },
    {
      title: "Sản phẩm trên hệ thống",
      value: statsLoading
        ? "Đang tải..."
        : statsError
        ? "Không thể tải"
        : orderStats.totalProducts,
      icon: Package,
      color: "bg-purple-100 text-purple-600",
      note: "Tổng sản phẩm Milk.club",
    },
  ];

  return (
    <div className="min-h-[85vh] bg-[#fffaf5] pb-20">
      {/* BANNER NGƯỜI BÁN */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-yellow-200/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 py-14">
          <div className="text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              <Sparkles size={16} />
              KÊNH NGƯỜI BÁN Milk.club
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Xin chào, {user.full_name || "Người bán"}!
            </h1>

            <p className="mt-4 max-w-xl text-lg text-orange-50">
              Quản lý cửa hàng, đăng sản phẩm và theo dõi hoạt
              động kinh doanh của bạn.
            </p>

            <Link
              to="/seller/products/new"
              className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 font-bold text-orange-600 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-orange-50"
            >
              <PlusCircle size={22} />
              Thêm sản phẩm mới

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="hidden rounded-3xl border border-white/30 bg-white/15 p-9 text-white backdrop-blur-md md:block">
            <Store size={85} strokeWidth={1.4} />

            <p className="mt-4 text-center text-lg font-bold">
              Milk.club Seller
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6">
        {/* TỔNG QUAN */}
        <div className="mb-7 mt-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Tổng quan cửa hàng
            </h2>

            <p className="mt-2 text-gray-500">
              Theo dõi thông tin và hoạt động kinh doanh
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchOrderStats}
              disabled={statsLoading}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={statsLoading ? "animate-spin" : ""}
              />
              Làm mới
            </button>

            <div className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
              <LayoutDashboard size={17} />
              Dashboard
            </div>
          </div>
        </div>

        {statsError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {statsError}
          </div>
        )}

        {/* THẺ THỐNG KÊ */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-orange-50 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-100/60"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className={`rounded-2xl p-4 ${item.color}`}>
                    <Icon size={26} />
                  </div>

                  <BarChart3
                    size={21}
                    className="text-gray-300 transition group-hover:text-orange-400"
                  />
                </div>

                <p className="text-sm font-medium text-gray-500">
                  {item.title}
                </p>

                <h3 className="mt-3 text-xl font-extrabold text-gray-900">
                  {item.value}
                </h3>

                <p className="mt-3 text-xs text-gray-400">
                  {item.note}
                </p>
              </div>
            );
          })}
        </div>

        {/* TRẠNG THÁI ĐƠN HÀNG */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-yellow-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock3 className="text-yellow-600" size={25} />
              <p className="font-semibold text-gray-600">
                Đơn chờ xác nhận
              </p>
            </div>

            <p className="mt-4 text-3xl font-extrabold text-yellow-600">
              {statsLoading || statsError
                ? "—"
                : orderStats.pendingOrders}
            </p>
          </div>

          <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-green-600" size={25} />
              <p className="font-semibold text-gray-600">
                Đơn đã hoàn thành
              </p>
            </div>

            <p className="mt-4 text-3xl font-extrabold text-green-600">
              {statsLoading || statsError
                ? "—"
                : orderStats.completedOrders}
            </p>
          </div>
        </div>

        {/* QUẢN LÝ CỬA HÀNG */}
        <div className="mb-8 mt-14">
          <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
            Quản lý cửa hàng
          </h2>

          <p className="mt-2 text-gray-500">
            Các công cụ dành cho người bán
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* QUẢN LÝ SẢN PHẨM */}
          <Link
            to="/seller/products"
            className="group rounded-3xl border border-orange-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-orange-300 hover:shadow-xl"
          >
            <div className="mb-6 inline-flex rounded-2xl bg-orange-100 p-4 text-orange-600">
              <Boxes size={30} />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900">
              Quản lý sản phẩm
            </h3>

            <p className="mt-3 min-h-16 leading-7 text-gray-500">
              Xem danh sách sản phẩm, chỉnh sửa giá bán,
              hình ảnh và số lượng tồn kho.
            </p>

            <div className="mt-6 flex items-center gap-2 font-bold text-orange-600">
              Xem danh sách sản phẩm

              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-2"
              />
            </div>
          </Link>

          {/* QUẢN LÝ ĐƠN HÀNG */}
          <Link
            to="/seller/orders"
            className="group rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="mb-6 inline-flex rounded-2xl bg-blue-100 p-4 text-blue-600">
              <ShoppingCart size={30} />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900">
              Quản lý đơn hàng
            </h3>

            <p className="mt-3 min-h-16 leading-7 text-gray-500">
              Xem đơn đặt hàng, xác nhận đơn và theo dõi
              trạng thái giao hàng.
            </p>

            <div className="mt-6 flex items-center gap-2 font-bold text-blue-600">
              Xem danh sách đơn hàng

              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-2"
              />
            </div>
          </Link>

          {/* THỐNG KÊ DOANH THU */}
          <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
            <div className="mb-6 inline-flex rounded-2xl bg-green-100 p-4 text-green-600">
              <DollarSign size={30} />
            </div>
            <Link
  to="/seller/revenue"
  className="mt-6 inline-flex items-center gap-2 font-bold text-green-600 hover:text-green-700"
>
  Xem biểu đồ doanh thu
  <ArrowRight size={19} />
</Link>

            <h3 className="text-xl font-extrabold text-gray-900">
              Thống kê doanh thu
            </h3>

            <p className="mt-3 min-h-16 leading-7 text-gray-500">
              Theo dõi doanh thu, số lượng sản phẩm đã bán
              và kết quả kinh doanh.
            </p>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Doanh thu đơn hoàn thành
              </p>

              <p className="mt-2 text-2xl font-extrabold text-green-600">
                {statsLoading
                  ? "Đang tải..."
                  : statsError
                  ? "Không thể tải"
                  : formatMoney(orderStats.revenue)}
              </p>

              <p className="mt-3 text-sm text-gray-500">
                {statsLoading || statsError
                  ? "—"
                  : orderStats.productsSold}{" "}
                sản phẩm đã bán
              </p>
            </div>
          </div>
        </div>

        {/* BANNER HƯỚNG DẪN */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white md:p-10">
          <div>
            <div className="mb-3 flex items-center gap-2 text-orange-400">
              <Sparkles size={20} />
              <span className="font-semibold">
                Bắt đầu kinh doanh
              </span>
            </div>

            <h3 className="text-2xl font-extrabold">
              Phát triển cửa hàng Milk.club!
            </h3>

            <p className="mt-3 max-w-xl text-gray-300">
              Thêm hình ảnh, mô tả, giá bán và số lượng tồn kho
              để giới thiệu sản phẩm trên Milk.club.
            </p>
          </div>

          <Link
            to="/seller/products/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-orange-500"
          >
            <PlusCircle size={20} />
            Đăng sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
