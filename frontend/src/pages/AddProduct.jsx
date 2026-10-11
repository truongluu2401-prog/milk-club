
import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  PlusCircle,
  ImagePlus,
  X,
} from "lucide-react";

export default function AddProduct() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Balo",
    price: "",
    old_price: "",
    stock: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tạo ảnh xem trước
  useEffect(() => {
    if (!selectedImage) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  // Xử lý nhập thông tin
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Chọn ảnh từ thư viện
  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Dung lượng ảnh không được vượt quá 5MB.");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
    setError("");
  }

  // Xóa ảnh đã chọn
  function removeImage() {
    setSelectedImage(null);
    setPreview("");
  }

  // Đăng sản phẩm
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Giá bán phải lớn hơn 0.");
      return;
    }

    if (
      form.stock.trim() === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Số lượng tồn kho không hợp lệ.");
      return;
    }

    if (
      form.old_price !== "" &&
      (!Number.isFinite(Number(form.old_price)) ||
        Number(form.old_price) < 0)
    ) {
      setError("Giá gốc không hợp lệ.");
      return;
    }

    if (!selectedImage) {
      setError("Vui lòng chọn hình ảnh sản phẩm.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", String(price));

      if (form.old_price !== "") {
        formData.append("old_price", form.old_price);
      }

      formData.append("stock", String(stock));
      formData.append("image", selectedImage);

      await axios.post(
        "http://localhost:5000/api/products",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Thêm sản phẩm thành công!");
      navigate("/seller", { replace: true });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Không thể thêm sản phẩm. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  // Kiểm tra đăng nhập
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Chỉ người bán được thêm sản phẩm
  if (user.role !== "seller") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[75vh] bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        <Link
          to="/seller"
          className="mb-6 inline-flex items-center gap-2 font-medium text-gray-600 hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Quay lại quản lý
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <div className="mb-8 flex items-center gap-3">
            <PlusCircle
              className="text-orange-600"
              size={30}
            />

            <div>
              <h1 className="text-3xl font-bold">
                Thêm sản phẩm mới
              </h1>

              <p className="mt-1 text-gray-500">
                Nhập thông tin sản phẩm để đăng bán trên Milk.club.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Tên sản phẩm */}
            <div>
              <label className="mb-2 block font-medium">
                Tên sản phẩm
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={255}
                placeholder="Ví dụ: Balo thời trang nam nữ"
                className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="mb-2 block font-medium">
                Mô tả sản phẩm
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Nhập mô tả sản phẩm..."
                className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
              />
            </div>

            {/* Danh mục */}
            <div>
              <label className="mb-2 block font-medium">
                Danh mục
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
              >
                <option value="Balo">Balo</option>
                <option value="Túi xách">Túi xách</option>
                <option value="Phụ kiện">Phụ kiện</option>
                <option value="Quần áo">Quần áo</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Giá bán và giá gốc */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block font-medium">
                  Giá bán (VNĐ)
                </label>

                <input
                  name="price"
                  type="number"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="299000"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Giá gốc (VNĐ)
                </label>

                <input
                  name="old_price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.old_price}
                  onChange={handleChange}
                  placeholder="399000"
                  className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Hình ảnh sản phẩm */}
            <div>
              <label className="mb-2 block font-medium">
                Hình ảnh sản phẩm
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-8 transition hover:bg-orange-100">

                <ImagePlus
                  size={42}
                  className="text-orange-600"
                />

                <span className="font-semibold text-orange-600">
                  Nhấn để chọn ảnh từ thư viện
                </span>

                <span className="text-sm text-gray-500">
                  JPG, PNG, WEBP - Tối đa 5MB
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {preview && (
                <div className="relative mt-5 inline-block">

                  <img
                    src={preview}
                    alt="Xem trước sản phẩm"
                    className="h-48 w-48 rounded-xl border object-cover"
                  />

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>

                  <p className="mt-2 max-w-48 truncate text-sm text-gray-500">
                    {selectedImage?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Số lượng tồn kho */}
            <div>
              <label className="mb-2 block font-medium">
                Số lượng tồn kho
              </label>

              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                required
                placeholder="20"
                className="w-full rounded-xl border p-3 outline-none focus:border-orange-500"
              />
            </div>

            {/* Thông báo lỗi */}
            {error && (
              <p className="rounded-xl bg-red-50 p-4 text-red-600">
                {error}
              </p>
            )}

            {/* Nút thao tác */}
            <div className="flex flex-wrap gap-3 pt-3">

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
              >
                {loading ? "Đang lưu..." : "Đăng sản phẩm"}
              </button>

              <Link
                to="/seller"
                className="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-200"
              >
                Hủy
              </Link>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
