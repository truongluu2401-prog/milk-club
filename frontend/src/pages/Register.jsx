
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Store,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://https://milk-club.onrender.com/api/auth/register",
        {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          password: form.password,
        }
      );

      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Đăng ký thất bại. Vui lòng thử lại."
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

        {/* Hình nền */}
        <div className="relative hidden overflow-hidden bg-gray-900 lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

          <div className="relative flex h-full min-h-[760px] flex-col justify-between p-12 text-white">
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
                Tham gia Milk.club
              </div>

              <h2 className="text-5xl font-extrabold leading-tight">
                Khởi đầu hành trình
                <span className="block text-orange-400">
                  mua sắm của bạn.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-lg leading-8 text-gray-200">
                Tạo tài khoản để khám phá các sản phẩm
                và trải nghiệm mua sắm thuận tiện hơn.
              </p>

              <div className="mt-8 flex items-center gap-3 text-gray-200">
                <CheckCircle2 size={23} className="text-orange-400" />
                Đăng ký tài khoản dễ dàng
              </div>
            </div>
          </div>
        </div>

        {/* Form đăng ký */}
        <div className="flex items-center justify-center px-5 py-14 sm:px-10">
          <div className="w-full max-w-md">

            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <UserRound size={32} />
              </div>

              <h1 className="text-4xl font-extrabold text-gray-900">
                Tạo tài khoản
              </h1>

              <p className="mt-3 text-gray-500">
                Tham gia cộng đồng mua sắm Milk.club
              </p>
            </div>

            <form
              onSubmit={handleRegister}
              className="space-y-5 rounded-3xl border border-orange-100 bg-white p-7 shadow-xl shadow-orange-100/60 sm:p-9"
            >
              <div>
                <label className="mb-2 block font-semibold">
                  Họ và tên
                </label>

                <div className="relative">
                  <UserRound
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ và tên"
                    autoComplete="name"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="Nhập email"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Mật khẩu
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Ít nhất 6 ký tự"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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

              <div>
                <label className="mb-2 block font-semibold">
                  Xác nhận mật khẩu
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />
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
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 py-4 font-bold text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-60"
              >
                {loading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
                {!loading && (
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-bold text-orange-600 hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Tài khoản mới được đăng ký với vai trò người mua
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
