
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ShoppingBag,
  ShoppingCart,
  UserRound,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Home,
  Package,
  LogIn,
  UserPlus,
} from "lucide-react";

// Lấy thông tin tài khoản đã đăng nhập
function getSavedUser() {
  try {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      return null;
    }

    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

export default function Header({ cartCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(getSavedUser);
  const [menuOpen, setMenuOpen] = useState(false);

  // Cập nhật tài khoản khi đăng nhập hoặc đăng xuất
  useEffect(() => {
    function updateUser() {
      setUser(getSavedUser());
    }

    window.addEventListener("auth-changed", updateUser);
    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("auth-changed", updateUser);
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  const isSeller = user?.role === "seller";
  const homePath = isSeller ? "/seller" : "/";

  const totalCart = Math.max(0, Number(cartCount) || 0);

  // Đăng xuất
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMenuOpen(false);

    window.dispatchEvent(new Event("auth-changed"));

    navigate("/", { replace: true });
  }

  // Chuyển đến khu vực sản phẩm
  function goToProducts() {
    setMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/#products");
    } else {
      document.getElementById("products")?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  // Kiểu giao diện dùng chung
  const navLinkClass =
    "flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-600";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">

      {/* ================= THANH THÔNG BÁO ================= */}
      <div className="bg-orange-600 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        🥛 Milk.club - Mua sắm tiện lợi mỗi ngày!
      </div>

      {/* ================= HEADER CHÍNH ================= */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* LOGO */}
        <Link
          to={homePath}
          onClick={() => setMenuOpen(false)}
          className="flex shrink-0 items-center"
        >
          <img
            src="/images/milk-club-header.jpg"
            alt="Milk.club"
            className="h-14 w-auto max-w-[160px] object-contain transition-transform duration-300 hover:scale-105 sm:h-20 sm:max-w-[250px] lg:h-24 lg:max-w-[300px]"
          />
        </Link>

        {/* ================= MENU MÁY TÍNH ================= */}
        <nav className="hidden items-center gap-1 lg:flex">

          <Link
            to={homePath}
            className={navLinkClass}
          >
            <Home size={18} />
            {isSeller ? "Tổng quan" : "Trang chủ"}
          </Link>

          {isSeller ? (
            <>
              <Link
                to="/seller/products"
                className={navLinkClass}
              >
                <Package size={18} />
                Sản phẩm
              </Link>

              <Link
                to="/seller/orders"
                className={navLinkClass}
              >
                <ShoppingBag size={18} />
                Đơn hàng
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goToProducts}
                className={navLinkClass}
              >
                <Package size={18} />
                Sản phẩm
              </button>

              {user && (
                <Link
                  to="/my-orders"
                  className={navLinkClass}
                >
                  <ShoppingBag size={18} />
                  Đơn mua
                </Link>
              )}
            </>
          )}

        </nav>

        {/* ================= TÀI KHOẢN MÁY TÍNH ================= */}
        <div className="hidden items-center gap-3 lg:flex">

          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-gray-700">
                <UserRound
                  size={19}
                  className="text-orange-600"
                />

                <span className="max-w-[120px] truncate text-sm font-semibold">
                  {user.full_name || "Tài khoản"}
                </span>
              </div>

              {isSeller && (
                <Link
                  to="/seller"
                  className="flex items-center gap-2 rounded-xl bg-orange-100 px-3 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-200"
                >
                  <LayoutDashboard size={18} />
                  Quản lý
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:text-orange-600"
              >
                <LogIn size={18} />
                Đăng nhập
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                <UserPlus size={18} />
                Đăng ký
              </Link>
            </>
          )}

          {/* GIỎ HÀNG */}
          {!isSeller && (
            <Link
              to="/cart"
              className="relative ml-1 rounded-xl p-3 text-gray-700 transition hover:bg-orange-50 hover:text-orange-600"
              aria-label={`Giỏ hàng có ${totalCart} sản phẩm`}
            >
              <ShoppingCart size={24} />

              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white">
                {totalCart > 99 ? "99+" : totalCart}
              </span>
            </Link>
          )}

        </div>

        {/* ================= NÚT MENU ĐIỆN THOẠI ================= */}
        <div className="flex items-center gap-3 lg:hidden">

          {/* GIỎ HÀNG MOBILE */}
          {!isSeller && (
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="relative rounded-xl p-2 text-gray-700"
              aria-label={`Giỏ hàng có ${totalCart} sản phẩm`}
            >
              <ShoppingCart size={24} />

              <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white">
                {totalCart > 99 ? "99+" : totalCart}
              </span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-orange-100 bg-orange-50 p-2 text-orange-600"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>

        </div>
      </div>

      {/* ================= MENU MOBILE ================= */}
      {menuOpen && (
        <div className="border-t border-orange-100 bg-white px-4 pb-5 pt-3 shadow-lg lg:hidden">

          <nav className="mx-auto flex max-w-7xl flex-col gap-2">

            <Link
              to={homePath}
              onClick={() => setMenuOpen(false)}
              className={navLinkClass}
            >
              <Home size={20} />
              {isSeller ? "Tổng quan" : "Trang chủ"}
            </Link>

            {isSeller ? (
              <>
                <Link
                  to="/seller/products"
                  onClick={() => setMenuOpen(false)}
                  className={navLinkClass}
                >
                  <Package size={20} />
                  Quản lý sản phẩm
                </Link>

                <Link
                  to="/seller/orders"
                  onClick={() => setMenuOpen(false)}
                  className={navLinkClass}
                >
                  <ShoppingBag size={20} />
                  Quản lý đơn hàng
                </Link>

                <Link
                  to="/seller/revenue"
                  onClick={() => setMenuOpen(false)}
                  className={navLinkClass}
                >
                  <LayoutDashboard size={20} />
                  Thống kê doanh thu
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goToProducts}
                  className={navLinkClass}
                >
                  <Package size={20} />
                  Sản phẩm
                </button>

                {user && (
                  <Link
                    to="/my-orders"
                    onClick={() => setMenuOpen(false)}
                    className={navLinkClass}
                  >
                    <ShoppingBag size={20} />
                    Đơn mua của tôi
                  </Link>
                )}
              </>
            )}

            <div className="my-2 border-t border-gray-100" />

            {/* TÀI KHOẢN MOBILE */}
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl bg-orange-50 px-4 py-3 text-orange-700">
                  <UserRound size={22} />

                  <div>
                    <p className="text-xs text-gray-500">
                      Đang đăng nhập
                    </p>

                    <p className="font-bold">
                      {user.full_name || "Tài khoản"}
                    </p>
                  </div>
                </div>

                {isSeller && (
                  <Link
                    to="/seller"
                    onClick={() => setMenuOpen(false)}
                    className={navLinkClass}
                  >
                    <LayoutDashboard size={20} />
                    Trang quản lý
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-600"
                >
                  <LogOut size={20} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className={navLinkClass}
                >
                  <LogIn size={20} />
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white"
                >
                  <UserPlus size={20} />
                  Đăng ký tài khoản
                </Link>
              </>
            )}

          </nav>
        </div>
      )}

    </header>
  );
}
