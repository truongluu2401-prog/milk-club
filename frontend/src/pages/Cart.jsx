
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

export default function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">Giỏ hàng của bạn</h1>

      {cart.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center">
          <p className="text-gray-500">Giỏ hàng đang trống.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 text-white"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-5 rounded-2xl bg-white p-5 shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 rounded-xl object-cover"
                />

                <div className="min-w-40 flex-1">
                  <Link
                    to={`/product/${item.id}`}
                    className="font-bold hover:text-orange-600"
                  >
                    {item.name}
                  </Link>

                  <p className="mt-2 text-orange-600">
                    {money(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    className="rounded-lg border px-3 py-1"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    className="rounded-lg border px-3 py-1"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500"
                  aria-label={`Xóa ${item.name}`}
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Tổng đơn hàng</h2>

            <div className="mt-6 flex justify-between">
              <span>Tạm tính</span>
              <strong>{money(cartTotal)}</strong>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Phí vận chuyển sẽ được tính khi thanh toán.
            </p>

            <Link
              to="/checkout"
              className="mt-8 block rounded-xl bg-orange-600 py-4 text-center font-bold text-white"
            >
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
