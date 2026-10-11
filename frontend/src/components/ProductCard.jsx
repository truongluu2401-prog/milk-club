
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product, addToCart }) {
  const money = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-lg">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full cursor-pointer object-cover"
        />
      </Link>

      <div className="p-5">
        <p className="text-sm text-gray-500">{product.category}</p>

        <Link
          to={`/product/${product.id}`}
          className="mt-2 block cursor-pointer text-lg font-semibold hover:text-orange-600"
        >
          {product.name}
        </Link>

        <p className="mt-3 text-xl font-bold text-orange-600">
          {money(product.price)}
        </p>

        <p className="text-sm text-gray-400 line-through">
          {money(product.oldPrice)}
        </p>

        <button
          onClick={() => addToCart(product)}
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700"
        >
          <ShoppingCart size={18} />
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
}
