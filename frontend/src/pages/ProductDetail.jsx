
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { getProductById } from "../api/productApi";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setQuantity(1);

      try {
        const data = await getProductById(id);
        if (active) setProduct(data);
      } catch (err) {
        console.error(err);
        if (active) {
          setProduct(null);
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
  }, [id]);

  const money = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  if (loading) {
    return <p className="p-20 text-center">Đang tải sản phẩm...</p>;
  }

  if (error || !product) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-2xl font-bold">
          {error || "Không tìm thấy sản phẩm"}
        </h2>
        <Link to="/" className="mt-5 inline-block text-orange-600">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link
        to="/"
        className="mb-8 flex items-center gap-2 text-gray-600"
      >
        <ArrowLeft size={20} />
        Quay lại cửa hàng
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <img
          src={product.image}
          alt={product.name}
          className="w-full rounded-2xl object-cover"
        />

        <div>
          <p className="font-semibold text-orange-600">
            {product.category}
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            {product.name}
          </h1>

          <p className="mt-5 text-3xl font-bold text-orange-600">
            {money(product.price)}
          </p>

          {product.oldPrice != null && (
            <p className="mt-2 text-gray-400 line-through">
              {money(product.oldPrice)}
            </p>
          )}

          <p className="mt-8 text-gray-600">
            {product.description}
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Còn {product.stock} sản phẩm
          </p>

          <div className="mt-8 flex items-center gap-4">
            <span className="font-semibold">Số lượng:</span>

            <button
              onClick={() =>
                setQuantity(Math.max(1, quantity - 1))
              }
              className="rounded-lg border px-4 py-2"
            >
              -
            </button>

            <span>{quantity}</span>

            <button
              onClick={() =>
                setQuantity(Math.min(product.stock, quantity + 1))
              }
              disabled={product.stock === 0}
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            disabled={product.stock === 0}
            onClick={() => {
              addToCart(product, quantity);
              alert("Đã thêm sản phẩm vào giỏ hàng!");
            }}
            className="mt-8 flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-4 font-semibold text-white disabled:bg-gray-400"
          >
            <ShoppingCart size={20} />
            {product.stock === 0
              ? "Hết hàng"
              : "Thêm vào giỏ hàng"}
          </button>
        </div>
      </div>
    </main>
  );
}
