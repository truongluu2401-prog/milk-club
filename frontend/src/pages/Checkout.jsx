
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

const API_URL = "https://milk-club.onrender.com";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    payment: "cod",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shippingFee = cartTotal >= 500000 ? 0 : 30000;
  const total = cartTotal + shippingFee;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cart.length === 0 || loading) return;

    setLoading(true);
    setError("");

    try {
      // Gửi đơn hàng đến Backend
     
const token = localStorage.getItem("token");

if (!token) {
  setError("Bạn cần đăng nhập trước khi đặt hàng.");
  setLoading(false);
  return;
}

const response = await axios.post(
  `${API_URL}/api/orders`,
  {
    customer: {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      note: form.note.trim(),
    },
    payment: form.payment,
    items: cart.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    })),
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


      // Lấy đơn hàng đã lưu từ PostgreSQL
      const savedOrder = response.data.order;

      // Chuẩn bị dữ liệu cho trang đặt hàng thành công
      const order = {
        id: savedOrder.id,
        customer: form,
        items: cart,
        subtotal: Number(savedOrder.subtotal),
        shippingFee: Number(savedOrder.shipping_fee),
        total: Number(savedOrder.total_amount),
        status: "Chờ xác nhận",
        paymentStatus: "Chưa thanh toán",
        createdAt: savedOrder.created_at,
      };

      // Chỉ xóa giỏ hàng khi đặt hàng thành công
      clearCart();

      navigate("/order-success", {
        state: { order },
      });
    } catch (err) {
      console.error("Lỗi đặt hàng:", err);

      setError(
        err.response?.data?.message ||
          "Không thể đặt hàng. Vui lòng kiểm tra Backend."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">
          Giỏ hàng đang trống
        </h1>

        <Link
          to="/cart"
          className="mt-5 inline-block text-orange-600"
        >
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">
        Thanh toán Milk.club
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-3"
      >
        {/* THÔNG TIN GIAO HÀNG */}
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold">
            Thông tin giao hàng
          </h2>

          <div>
            <label className="mb-2 block font-medium">
              Họ và tên
            </label>

            <input
              required
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
              placeholder="Nhập họ và tên"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Số điện thoại
            </label>

            <input
              required
              name="phone"
              type="tel"
              pattern="0[0-9]{9}"
              title="Số điện thoại gồm 10 chữ số, bắt đầu bằng 0"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
              placeholder="Ví dụ: 0912345678"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Địa chỉ nhận hàng
            </label>

            <textarea
              required
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
              rows={3}
              placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Ghi chú
            </label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
              rows={2}
              placeholder="Ghi chú cho cửa hàng (nếu có)"
            />
          </div>

          {/* PHƯƠNG THỨC THANH TOÁN */}
          <h2 className="text-xl font-bold">
            Phương thức thanh toán
          </h2>

          <label className="flex items-center gap-3 rounded-xl border p-4">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={form.payment === "cod"}
              onChange={handleChange}
            />
            Thanh toán khi nhận hàng (COD)
          </label>

          <label className="flex items-center gap-3 rounded-xl border p-4">
            <input
              type="radio"
              name="payment"
              value="bank"
              checked={form.payment === "bank"}
              onChange={handleChange}
            />
            Chuyển khoản ngân hàng (mô phỏng)
          </label>

          {form.payment === "bank" && (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              Đây là chế độ thử nghiệm. Website chưa xác minh
              giao dịch chuyển khoản. Không chuyển tiền thật.
            </p>
          )}
        </div>

        {/* THÔNG TIN ĐƠN HÀNG */}
        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Đơn hàng của bạn
          </h2>

          <div className="mt-6 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-3 text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>

                <span>
                  {money(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-6 border-gray-200" />

          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{money(cartTotal)}</span>
          </div>

          <div className="mt-4 flex justify-between">
            <span>Phí vận chuyển</span>
            <span>{money(shippingFee)}</span>
          </div>

          <div className="mt-6 flex justify-between text-xl font-bold">
            <span>Tổng cộng (dự kiến)</span>
            <span className="text-orange-600">
              {money(total)}
            </span>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Tổng tiền cuối cùng được xác nhận từ hệ thống
            khi đặt hàng.
          </p>

          {/* HIỂN THỊ LỖI */}
          {error && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* NÚT ĐẶT HÀNG */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-orange-600 py-4 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Đang xử lý đơn hàng..."
              : "Xác nhận đặt hàng"}
          </button>
        </div>
      </form>
    </div>
  );
}
