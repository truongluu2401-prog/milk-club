
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  ImagePlus,
  Package,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isSeller = Boolean(token && user?.role === "seller");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    old_price: "",
    stock: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // LẤY THÔNG TIN SẢN PHẨM
  useEffect(() => {
    if (!isSeller) return;

    let active = true;

    async function loadProduct() {
      try {
        const response = await axios.get(
          `${API_URL}/api/products/${id}`
        );

        if (!active) return;

        const product = response.data;

        setForm({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          price: product.price ?? "",
          old_price:
            product.old_price ?? product.oldPrice ?? "",
          stock: product.stock ?? "",
        });

        setCurrentImage(product.image || "");
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);

        if (active) {
          setError("Không thể tải thông tin sản phẩm.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id, isSeller]);

  // TẠO ẢNH XEM TRƯỚC
  useEffect(() => {
    if (!imageFile) {
      setPreview(currentImage);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, currentImage]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // LƯU THÔNG TIN SẢN PHẨM
  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Giá bán không hợp lệ.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setError("Số lượng tồn kho không hợp lệ.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("old_price", form.old_price);
      formData.append("stock", form.stock);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.put(
        `${API_URL}/api/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Cập nhật sản phẩm thành công!");
      navigate("/seller/products");
    } catch (err) {
      console.error("Lỗi cập nhật sản phẩm:", err);

      setError(
        err.response?.data?.message ||
          "Không thể cập nhật sản phẩm. Hãy kiểm tra Backend."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center gap-3 text-orange-600">
        <Loader2 className="animate-spin" />
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf5] px-4 py-10">
      <div className="mx-auto max-w-4xl">

        <Link
          to="/seller/products"
          className="mb-7 inline-flex items-center gap-2 font-semibold text-gray-500 hover:text-orange-600"
        >
          <ArrowLeft size={19} />
          Quay lại danh sách sản phẩm
        </Link>

        <div className="mb-8">
          <p className="mb-2 font-bold text-orange-600">
            Milk.club Seller Center
          </p>

          <h1 className="text-3xl font-extrabold text-gray-900">
            Chỉnh sửa sản phẩm
          </h1>

          <p className="mt-2 text-gray-500">
            Cập nhật thông tin sản phẩm #{id}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm md:p-9"
        >
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          <div className="mb-7 flex items-center gap-3 text-orange-600">
            <Package size={25} />
            <h2 className="text-xl font-bold">
              Thông tin sản phẩm
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div className="md:col-span-2">
              <label className="mb-2 block font-semibold">
                Tên sản phẩm *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Danh mục
              </label>

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Số lượng tồn kho *
              </label>

              <input
                type="number"
                name="stock"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Giá bán (VNĐ) *
              </label>

              <input
                type="number"
                name="price"
                min="0"
                step="1000"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Giá gốc (VNĐ)
              </label>

              <input
                type="number"
                name="old_price"
                min="0"
                value={form.old_price}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-semibold">
                Mô tả sản phẩm
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-3 block font-semibold">
                Hình ảnh sản phẩm
              </label>

              {preview && (
                <img
                  src={preview}
                  alt="Ảnh sản phẩm"
                  className="mb-4 h-48 w-48 rounded-2xl border border-gray-200 object-cover"
                />
              )}

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 p-5 text-orange-600 hover:bg-orange-100">
                <ImagePlus size={25} />
                <span className="font-semibold">
                  Chọn ảnh mới (không bắt buộc)
                </span>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                />
              </label>
            </div>

          </div>

          <div className="mt-9 flex flex-wrap justify-end gap-4 border-t border-gray-100 pt-7">
            <Link
              to="/seller/products"
              className="rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-7 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Save size={19} />
              )}

              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
