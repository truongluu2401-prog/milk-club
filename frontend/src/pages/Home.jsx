
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Search,
  Sparkles,
  Truck,
  ShieldCheck,
  Headphones,
  ShoppingBag,
  RefreshCw,
  X,
  ArrowUpDown,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/productApi";
import { useCart } from "../context/CartContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  // Lấy sản phẩm từ Backend PostgreSQL
  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        if (!active) return;

        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu sản phẩm không hợp lệ");
        }

        setProducts(data);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);

        if (active) {
          setError(
            "Không thể tải sản phẩm. Vui lòng kiểm tra Backend và PostgreSQL."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  // Danh mục sản phẩm
  const categories = [
    "Tất cả",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // Tìm kiếm và lọc sản phẩm
  const filteredProducts = products.filter((product) => {
    const productName = String(
      product.name || ""
    ).toLowerCase();

    const searchText = search.trim().toLowerCase();

    const matchesSearch = productName.includes(searchText);

    const matchesCategory =
      category === "Tất cả" ||
      product.category === category;

    return matchesSearch && matchesCategory;
  });

  // Sắp xếp sản phẩm
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;

    if (sortBy === "price-asc") {
      return priceA - priceB;
    }

    if (sortBy === "price-desc") {
      return priceB - priceA;
    }

    if (sortBy === "name") {
      return String(a.name || "").localeCompare(
        String(b.name || ""),
        "vi"
      );
    }

    // Mới nhất theo ID sản phẩm
    return Number(b.id) - Number(a.id);
  });

  // Đưa bộ lọc về mặc định
  function resetFilters() {
    setSearch("");
    setCategory("Tất cả");
    setSortBy("newest");
  }

  return (
    <div className="overflow-hidden bg-[#fffaf5]">

      {/* ================= BANNER ================= */}
      <section className="relative flex min-h-[560px] items-center overflow-hidden bg-gray-900 md:min-h-[650px]">

        {/* Ảnh nền */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85')",
          }}
        />

        {/* Lớp phủ tối */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/15" />

        {/* Trang trí */}
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24">
          <div className="max-w-2xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md">
              <Sparkles
                size={17}
                className="text-orange-300"
              />
              Chào mừng đến với Milk.club
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              Khám phá phong cách
              <span className="mt-2 block text-orange-400">
                của riêng bạn
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-200 md:text-lg">
              Thời trang, balo, túi xách và phụ kiện dành
              cho mọi phong cách. Khám phá bộ sưu tập
              sản phẩm tại Milk.club ngay hôm nay.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">

              <a
                href="#products"
                className="group inline-flex items-center gap-3 rounded-2xl bg-orange-600 px-8 py-4 font-bold text-white shadow-xl shadow-orange-900/30 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-500 hover:shadow-2xl"
              >
                <ShoppingBag size={20} />
                Mua sắm ngay
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href="#benefits"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Khám phá Milk.club
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* ================= ƯU ĐIỂM ================= */}
      <section
        id="benefits"
        className="relative z-10 mx-auto -mt-10 max-w-7xl px-6"
      >
        <div className="grid gap-4 rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/50 md:grid-cols-3 md:p-8">

          <div className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-orange-50">
            <div className="rounded-2xl bg-orange-100 p-4 text-orange-600">
              <Truck size={28} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Mua sắm tiện lợi
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Đặt hàng trực tuyến dễ dàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-orange-50">
            <div className="rounded-2xl bg-orange-100 p-4 text-orange-600">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Thông tin rõ ràng
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Xem chi tiết trước khi mua
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-orange-50">
            <div className="rounded-2xl bg-orange-100 p-4 text-orange-600">
              <Headphones size={28} />
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Dễ dàng lựa chọn
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Tìm kiếm và lọc theo danh mục
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SẢN PHẨM ================= */}
      <section
        id="products"
        className="mx-auto max-w-7xl scroll-mt-28 px-6 py-20"
      >

        {/* Tiêu đề */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-600">
              <Sparkles size={16} />
              BỘ SƯU TẬP Milk.club
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
              Sản phẩm nổi bật
              <span className="text-orange-600">.</span>
            </h2>

            <p className="mt-3 text-gray-500">
              Khám phá các sản phẩm mới nhất dành cho bạn
            </p>
          </div>

          <a
            href="#products"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 font-bold text-orange-600 transition hover:gap-3"
          >
            Xem tất cả
            <ArrowRight size={18} />
          </a>

        </div>

        {/* ================= TÌM KIẾM ================= */}
        <div className="mb-6 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">

          <div className="relative">

            <Search
              size={22}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
            />

            <input
              type="text"
              placeholder="Tìm kiếm balo, túi xách, phụ kiện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-gray-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600"
                aria-label="Xóa tìm kiếm"
              >
                <X size={20} />
              </button>
            )}

          </div>

          {/* ================= DANH MỤC ================= */}
          <div className="mt-6 flex flex-wrap gap-3">

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 " +
                  (category === item
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600")
                }
              >
                {item}
              </button>
            ))}

          </div>
        </div>

        {/* ================= SẮP XẾP SẢN PHẨM ================= */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <p className="text-sm text-gray-500">
            Hiển thị{" "}
            <span className="font-bold text-orange-600">
              {filteredProducts.length}
            </span>{" "}
            sản phẩm
          </p>

          <div className="flex items-center gap-3">

            <ArrowUpDown
              size={19}
              className="text-orange-600"
            />

            <label
              htmlFor="sort-products"
              className="text-sm font-semibold text-gray-600"
            >
              Sắp xếp:
            </label>

            <select
              id="sort-products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="newest">
                Mới nhất
              </option>

              <option value="price-asc">
                Giá thấp đến cao
              </option>

              <option value="price-desc">
                Giá cao đến thấp
              </option>

              <option value="name">
                Tên A - Z
              </option>
            </select>

          </div>
        </div>

        {/* ================= ĐANG TẢI ================= */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl bg-white p-4 shadow-sm"
              >
                <div className="h-60 rounded-2xl bg-gray-200" />
                <div className="mt-5 h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-1/2 rounded bg-gray-200" />
                <div className="mt-5 h-10 rounded-xl bg-gray-200" />
              </div>
            ))}

          </div>
        )}

        {/* ================= LỖI KẾT NỐI ================= */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">

            <p className="font-semibold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-bold text-white transition hover:bg-orange-700"
            >
              <RefreshCw size={18} />
              Thử lại
            </button>

          </div>
        )}

        {/* ================= DANH SÁCH SẢN PHẨM ================= */}
        {!loading && !error && (
          <>
            {sortedProducts.length > 0 ? (

              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="transition-all duration-300 hover:-translate-y-2"
                  >
                    <ProductCard
                      product={product}
                      addToCart={addToCart}
                    />
                  </div>
                ))}

              </div>

            ) : (

              <div className="rounded-3xl border border-orange-100 bg-white py-20 text-center shadow-sm">

                <ShoppingBag
                  size={48}
                  className="mx-auto text-orange-300"
                />

                <p className="mt-5 text-lg font-semibold text-gray-700">
                  Không tìm thấy sản phẩm phù hợp
                </p>

                <p className="mt-2 text-gray-400">
                  Hãy thử từ khóa hoặc danh mục khác nhé.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
                >
                  Xem tất cả sản phẩm
                </button>

              </div>
            )}
          </>
        )}

      </section>

      {/* ================= BANNER CUỐI ================= */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-16">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8">

          <div>
            <p className="mb-3 font-semibold text-orange-100">
              Milk.club
            </p>

            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Tìm phong cách yêu thích của bạn
            </h2>

            <p className="mt-3 text-orange-50">
              Khám phá sản phẩm phù hợp với nhu cầu của bạn.
            </p>
          </div>

          <a
            href="#products"
            className="inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-4 font-bold text-orange-600 shadow-xl transition hover:-translate-y-1 hover:bg-orange-50"
          >
            Khám phá ngay
            <ArrowRight size={20} />
          </a>

        </div>
      </section>

    </div>
  );
}
