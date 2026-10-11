
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Store,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  let currentUser = null;
  try {
    if (localStorage.getItem("token")) {
      currentUser = JSON.parse(localStorage.getItem("user") || "null");
    }
  } catch {
    currentUser = null;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email.trim(),
          password,
        }
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Phản hồi đăng nhập không hợp lệ.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("auth-changed"));

      navigate(user.role === "seller" ? "/seller" : "/", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  if (currentUser) {
    return (
      <Navigate
        to={currentUser.role === "seller" ? "/seller" : "/"}
        replace
      />
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#fff8f2]">
      <div className="grid min-h-[85vh] lg:grid-cols-2">

        {/* Hình nền bên trái */}
        <div className="relative hidden overflow-hidden bg-gray-900 lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

          <div className="relative flex h-full min-h-[700px] flex-col justify-between p-12 text-white">
            <Link
              to="/"
              className="flex items-center gap-3 text-3xl font-extrabold"
            >
              <Store size={34} className="text-orange-400" />
              Milk.club
            </Link>

            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2 backdrop-blur-md">
                <Sparkles size={18} className="text-orange-300" />
                Khám phá Milk.club
              </div>

              <h2 className="max-w-lg text-5xl font-extrabold leading-tight">
                Mua sắm dễ dàng.
                <span className="block text-orange-400">
                  Phong cách mỗi ngày.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-lg leading-8 text-gray-200">
                Đăng nhập để khám phá sản phẩm, quản lý giỏ hàng
                và trải nghiệm mua sắm tại Milk.club.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm text-gray-200">
                <ShieldCheck size={22} className="text-orange-400" />
                Một tài khoản cho trải nghiệm mua sắm tiện lợi
              </div>
            </div>
          </div>
        </div>

        {/* Form đăng nhập */}
        <div className="flex items-center justify-center px-5 py-14 sm:px-10">
          <div className="w-full max-w-md">

            <div className="mb-9 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-sm">
                <Store size={32} />
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                Chào mừng trở lại!
              </h1>

              <p className="mt-3 text-gray-500">
                Đăng nhập vào tài khoản Milk.club của bạn
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-6 rounded-3xl border border-orange-100 bg-white p-7 shadow-xl shadow-orange-100/60 sm:p-9"
            >
              <div>
                <label className="mb-2 block font-semibold text-gray-700">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    required
                    autoComplete="email"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-700">
                  Mật khẩu
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 py-4 font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                {!loading && (
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="font-bold text-orange-600 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400">
              Milk.club - Mua sắm tiện lợi mỗi ngày
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
