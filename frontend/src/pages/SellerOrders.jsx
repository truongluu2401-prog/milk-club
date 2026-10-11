
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  RefreshCw,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
} from "lucide-react";

const API_URL = "http://https://milk-club.onrender.com";

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
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

function money(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

export default function SellerOrders() {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isSeller = Boolean(token && user?.role === "seller");

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Không thể tải danh sách đơn hàng."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSeller) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isSeller]);

  async function updateStatus(order, status) {
    if (
      !window.confirm(
        `Bạn muốn chuyển đơn #${order.id} sang "${statusLabels[status]}"?`
      )
    ) {
      return;
    }

    setUpdatingId(order.id);
    setError("");

    try {
      const response = await axios.patch(
        `${API_URL}/api/orders/${order.id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id
            ? response.data.order
            : item
        )
      );

      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) => ({
          ...prev,
          ...response.data.order,
        }));
      }

      alert("Cập nhật đơn hàng thành công!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Không thể cập nhật đơn hàng."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function viewDetails(id) {
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/orders/${id}`,
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
        "Không thể tải chi tiết đơn hàng."
      );
    }
  }

  const filteredOrders = orders.filter((order) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      String(order.id).includes(keyword) ||
      String(order.customer_name || "")
        .toLowerCase()
        .includes(keyword);

    return (
      matchesSearch &&
      (statusFilter === "all" ||
        order.status === statusFilter)
    );
  });

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/seller"
          className="mb-7 inline-flex items-center gap-2 font-semibold text-gray-500 hover:text-orange-600"
        >
          <ArrowLeft size={19} />
          Quay lại trang quản lý
        </Link>

        <p className="font-bold text-orange-600">
          Milk.club Seller Center
        </p>

        <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
          Quản lý đơn hàng
        </h1>

        <p className="mt-3 text-gray-500">
          Xác nhận, theo dõi và xử lý đơn hàng của khách.
        </p>

        {/* THỐNG KÊ */}
        <div className="my-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Tổng đơn hàng", orders.length],
            [
              "Chờ xác nhận",
              orders.filter((o) => o.status === "pending").length,
            ],
            [
              "Đang giao",
              orders.filter((o) => o.status === "shipping").length,
            ],
            [
              "Hoàn thành",
              orders.filter((o) => o.status === "completed").length,
            ],
          ].map(([title, value]) => (
            <div
              key={title}
              className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
            >
              <p className="text-gray-500">{title}</p>
              <p className="mt-3 text-3xl font-extrabold text-orange-600">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* BỘ LỌC */}
        <div className="mb-6 flex flex-wrap gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã đơn hoặc tên khách..."
              className="w-full rounded-xl border py-3 pl-12 pr-4 outline-none focus:border-orange-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border px-4 py-3"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-orange-50 px-5 py-3 font-semibold text-orange-600 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Làm mới
          </button>
        </div>

        {error && (
          <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </p>
        )}

        {/* DANH SÁCH ĐƠN HÀNG */}
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          {loading ? (
            <p className="p-12 text-center text-gray-500">
              Đang tải đơn hàng...
            </p>
          ) : filteredOrders.length === 0 ? (
            <div className="p-14 text-center">
              <ShoppingCart
                size={50}
                className="mx-auto mb-4 text-orange-300"
              />
              <p className="font-semibold text-gray-600">
                Chưa có đơn hàng phù hợp.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-orange-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4">Mã đơn</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Ngày đặt</th>
                  <th className="px-5 py-4">Tổng tiền</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-orange-50/40"
                  >
                    <td className="px-5 py-4 font-bold">
                      #{order.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
                    </td>

                    <td className="px-5 py-4 font-bold text-orange-600">
                      {money(order.total_amount)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-2 text-sm font-semibold ${
                          statusColors[order.status] || ""
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => viewDetails(order.id)}
                          className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold"
                        >
                          Chi tiết
                        </button>

                        {order.status === "pending" && (
                          <>
                            <button
                              disabled={updatingId === order.id}
                              onClick={() =>
                                updateStatus(order, "confirmed")
                              }
                              className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50"
                            >
                              <CheckCircle2 size={16} />
                              Xác nhận
                            </button>

                            <button
                              disabled={updatingId === order.id}
                              onClick={() =>
                                updateStatus(order, "cancelled")
                              }
                              className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                            >
                              <XCircle size={16} />
                              Hủy
                            </button>
                          </>
                        )}

                        {order.status === "confirmed" && (
                          <>
                            <button
                              disabled={updatingId === order.id}
                              onClick={() =>
                                updateStatus(order, "shipping")
                              }
                              className="flex items-center gap-1 rounded-lg bg-purple-100 px-3 py-2 text-sm font-semibold text-purple-700 disabled:opacity-50"
                            >
                              <Truck size={16} />
                              Giao hàng
                            </button>

                            <button
                              disabled={updatingId === order.id}
                              onClick={() =>
                                updateStatus(order, "cancelled")
                              }
                              className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                            >
                              Hủy
                            </button>
                          </>
                        )}

                        {order.status === "shipping" && (
                          <button
                            disabled={updatingId === order.id}
                            onClick={() =>
                              updateStatus(order, "completed")
                            }
                            className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={16} />
                            Hoàn thành
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* CHI TIẾT ĐƠN HÀNG */}
        {selectedOrder && (
          <div className="mt-8 rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-xl font-extrabold">
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

            <div className="mt-5 space-y-2 text-gray-700">
              <p><b>Khách hàng:</b> {selectedOrder.customer_name}</p>
              <p><b>Số điện thoại:</b> {selectedOrder.phone}</p>
              <p><b>Địa chỉ:</b> {selectedOrder.address}</p>
              <p><b>Ghi chú:</b> {selectedOrder.note || "Không có"}</p>
              <p>
                <b>Thanh toán:</b>{" "}
                {selectedOrder.payment_method === "cod"
                  ? "COD"
                  : "Chuyển khoản (mô phỏng)"}
              </p>
            </div>

            <h3 className="mt-6 font-bold">
              Sản phẩm trong đơn
            </h3>

            <div className="mt-3 divide-y">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 py-3"
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

            <div className="mt-4 border-t pt-4 text-right">
              <p>
                Phí vận chuyển: {money(selectedOrder.shipping_fee)}
              </p>

              <p className="mt-2 text-xl font-extrabold text-orange-600">
                Tổng cộng: {money(selectedOrder.total_amount)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
