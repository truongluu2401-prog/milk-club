
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  PlusCircle,
  Search,
  Package,
  Pencil,
  Trash2,
  RefreshCw,
  ImageOff,
} from "lucide-react";

const API_URL = "http://https://milk-club.onrender.com";

export default function SellerProducts() {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch {
    user = null;
  }

  const isSeller = Boolean(
    token && user?.role === "seller"
  );

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LẤY DANH SÁCH SẢN PHẨM
  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/products`
      );

      if (!Array.isArray(response.data)) {
        throw new Error("Dữ liệu không hợp lệ");
      }

      setProducts(response.data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);

      setError(
        "Không thể tải sản phẩm. Hãy kiểm tra Backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSeller) {
      loadProducts();
    }
  }, [isSeller]);

  // XÓA SẢN PHẨM
  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${API_URL}/api/products/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts((prev) =>
        prev.filter(
          (item) => item.id !== product.id
        )
      );

      setSuccess(
        `Đã xóa sản phẩm "${product.name}" thành công!`
      );
    } catch (err) {
      console.error("Lỗi xóa sản phẩm:", err);

      setError(
        err.response?.data?.message ||
          "Không thể xóa sản phẩm."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // TÌM KIẾM SẢN PHẨM
  const filteredProducts = products.filter(
    (product) =>
      String(product.name || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  );

  // ĐỊNH DẠNG GIÁ
  function formatPrice(price) {
    return (
      Number(price || 0).toLocaleString("vi-VN") +
      "đ"
    );
  }

  // KIỂM TRA ĐĂNG NHẬP
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[80vh] bg-[#fffaf5] px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* NÚT QUAY LẠI */}
        <Link
          to="/seller"
          className="mb-7 inline-flex items-center gap-2 font-semibold text-gray-500 transition hover:text-orange-600"
        >
          <ArrowLeft size={19} />
          Quay lại trang quản lý
        </Link>

        {/* TIÊU ĐỀ */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-600">
              Milk.club Seller Center
            </p>

            <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
              Quản lý sản phẩm
            </h1>

            <p className="mt-3 text-gray-500">
              Theo dõi và cập nhật sản phẩm
              trên cửa hàng Milk.club.
            </p>
          </div>

          <Link
            to="/seller/products/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1"
          >
            <PlusCircle size={21} />
            Thêm sản phẩm
          </Link>
        </div>

        {/* THỐNG KÊ */}
        <div className="mb-8 flex items-center gap-4 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="rounded-2xl bg-orange-100 p-4 text-orange-600">
            <Package size={30} />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Tổng sản phẩm trên hệ thống
            </p>

            <p className="mt-1 text-3xl font-extrabold text-gray-900">
              {loading ? "..." : products.length}
            </p>
          </div>
        </div>

        {/* TÌM KIẾM */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={21}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Tìm kiếm tên sản phẩm..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 font-semibold text-orange-600 transition hover:bg-orange-100 disabled:opacity-50"
          >
            <RefreshCw size={18} />
            Làm mới
          </button>
        </div>

        {/* THÔNG BÁO LỖI */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* THÔNG BÁO THÀNH CÔNG */}
        {success && (
          <div className="mb-5 rounded-2xl border border-green-100 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {/* BẢNG SẢN PHẨM */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          {loading ? (
            <div className="p-16 text-center text-gray-500">
              Đang tải danh sách sản phẩm...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-4 p-16 text-center">
              <Package
                size={48}
                className="text-orange-300"
              />

              <p className="font-semibold text-gray-600">
                Không tìm thấy sản phẩm phù hợp.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-orange-50 text-sm text-gray-600">
                  <tr>
                    <th className="px-6 py-5">
                      Sản phẩm
                    </th>

                    <th className="px-6 py-5">
                      Danh mục
                    </th>

                    <th className="px-6 py-5">
                      Giá bán
                    </th>

                    <th className="px-6 py-5">
                      Tồn kho
                    </th>

                    <th className="px-6 py-5 text-center">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-orange-50/50"
                    >

                      {/* HÌNH ẢNH + TÊN */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-20 w-20 rounded-xl border border-gray-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                              <ImageOff size={26} />
                            </div>
                          )}

                          <div>
                            <p className="max-w-[230px] font-bold text-gray-900">
                              {product.name}
                            </p>

                            <p className="mt-1 text-sm text-gray-400">
                              Mã SP: #{product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* DANH MỤC */}
                      <td className="px-6 py-4 text-gray-600">
                        {product.category || "Khác"}
                      </td>

                      {/* GIÁ BÁN */}
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-orange-600">
                          {formatPrice(product.price)}
                        </span>

                        {product.oldPrice != null && (
                          <p className="mt-1 text-sm text-gray-400 line-through">
                            {formatPrice(
                              product.oldPrice
                            )}
                          </p>
                        )}
                      </td>

                      {/* TỒN KHO */}
                      <td className="px-6 py-4">
                        <span
                          className={
                            "inline-flex rounded-full px-3 py-1 text-sm font-semibold " +
                            (Number(product.stock) > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600")
                          }
                        >
                          {Number(product.stock) > 0
                            ? `${product.stock} sản phẩm`
                            : "Hết hàng"}
                        </span>
                      </td>

                      {/* THAO TÁC */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">

                          <Link
                            to={`/seller/products/${product.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 font-semibold text-blue-600 transition hover:bg-blue-100"
                          >
                            <Pencil size={17} />
                            Sửa
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product)
                            }
                            disabled={
                              deletingId === product.id
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 size={17} />

                            {deletingId === product.id
                              ? "Đang xóa..."
                              : "Xóa"}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SỐ LƯỢNG HIỂN THỊ */}
        <p className="mt-5 text-sm text-gray-400">
          Hiển thị {filteredProducts.length} /
          {" "}{products.length} sản phẩm.
        </p>

      </div>
    </div>
  );
}
