
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider, useCart } from "./context/CartContext";

// COMPONENTS
import Header from "./components/Header";
import Footer from "./components/Footer";
import MyOrders from "./pages/MyOrders";
// TRANG NGƯỜI MUA
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

// ĐĂNG NHẬP - ĐĂNG KÝ
import Login from "./pages/Login";
import Register from "./pages/Register";

// TRANG NGƯỜI BÁN
import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import SellerOrders from "./pages/SellerOrders";
import RevenueStats from "./pages/RevenueStats";

function Layout() {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartCount} />

      <main>
        <Routes>
          {/* TRANG CHỦ */}
          <Route path="/" element={<Home />} />
          <Route path="/my-orders" element={<MyOrders />} />

          {/* TRANG NGƯỜI MUA */}
          <Route
            path="/product/:id"
            element={<ProductDetail />}
          />

          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/order-success"
            element={<OrderSuccess />}
          />

          {/* ĐĂNG NHẬP - ĐĂNG KÝ */}
          <Route path="/login" element={<Login />} />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* DASHBOARD NGƯỜI BÁN */}
          <Route
            path="/seller"
            element={<SellerDashboard />}
          />

          {/* QUẢN LÝ SẢN PHẨM */}
          <Route
            path="/seller/products"
            element={<SellerProducts />}
          />

          <Route
            path="/seller/products/new"
            element={<AddProduct />}
          />

          <Route
            path="/seller/products/:id/edit"
            element={<EditProduct />}
          />

          {/* QUẢN LÝ ĐƠN HÀNG */}
          <Route
            path="/seller/orders"
            element={<SellerOrders />}
          />

          {/* THỐNG KÊ DOANH THU */}
          <Route
            path="/seller/revenue"
            element={<RevenueStats />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Layout />
      </CartProvider>
    </BrowserRouter>
  );
}
