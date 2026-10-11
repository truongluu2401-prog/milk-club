
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipping: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const money = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + "đ";

export default function MyOrders() {
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải lịch sử mua hàng."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadOrders();
  }, [token]);

  async function viewDetails(id) {
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/orders/my-orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedOrder(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xem chi tiết đơn hàng."
      );
    }
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-semibold text-gray-500 hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Về trang chủ
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-orange-600">
              Milk.club
            </p>

            <h1 className="mt-2 text-3xl font-extrabold">
              Đơn mua của tôi
            </h1>

            <p className="mt-2 text-gray-500">
              Theo dõi các đơn hàng bạn đã đặt.
            </p>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Làm mới
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-gray-500">
            Đang tải đơn hàng...
          </p>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
            <ShoppingBag
              size={55}
              className="mx-auto text-orange-300"
            />

            <h2 className="mt-5 text-xl font-bold">
              Bạn chưa có đơn hàng nào
            </h2>

            <Link
              to="/"
              className="mt-5 inline-block rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-bold">
                      Đơn hàng #{order.id}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      statusColors[order.status] || ""
                    }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Tổng thanh toán
                    </p>

                    <p className="mt-1 text-xl font-extrabold text-orange-600">
                      {money(order.total_amount)}
                    </p>
                  </div>

                  <button
                    onClick={() => viewDetails(order.id)}
                    className="rounded-xl border border-orange-300 px-5 py-3 font-semibold text-orange-600 hover:bg-orange-50"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Package className="text-orange-600" />
                Chi tiết đơn #{selectedOrder.id}
              </h2>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg bg-gray-100 px-4 py-2"
              >
                Đóng
              </button>
            </div>

            <p className="mt-5 text-gray-600">
              <b>Người nhận:</b> {selectedOrder.customer_name}
            </p>

            <p className="mt-2 text-gray-600">
              <b>Địa chỉ:</b> {selectedOrder.address}
            </p>

            <div className="mt-6 divide-y border-t">
              {selectedOrder.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-4 py-4"
                >
                  <span>
                    {item.product_name} × {item.quantity}
                  </span>

                  <span className="font-semibold">
                    {money(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-5 text-right text-xl font-extrabold text-orange-600">
              Tổng cộng: {money(selectedOrder.total_amount)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
