


export default function Footer() {
  const facebookUrl =
    "https://www.facebook.com/share/1DuN79gVKM/?mibextid=wwXIfr";

  const tiktokUrl =
    "https://www.tiktok.com/@milk.club5";

  return (
    <footer
      id="contact"
      className="bg-gray-900 px-6 py-12 text-white"
    >
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">

        {/* GIỚI THIỆU MILK.CLUB */}
        <div>
          <h2 className="text-2xl font-bold text-orange-400">
            Milk.club
          </h2>

          <p className="mt-4 text-gray-300">
            Hệ thống bán hàng trực tuyến ứng dụng điện toán
            đám mây.
          </p>

          {/* MẠNG XÃ HỘI */}
          <h3 className="mt-6 font-semibold text-white">
            Theo dõi chúng tôi
          </h3>

          <div className="mt-4 flex items-center gap-4">

            {/* FACEBOOK */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook Milk.club"
              aria-label="Facebook Milk.club"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-blue-500"
            >
             
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="currentColor"
  aria-hidden="true"
>
  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
</svg>

            </a>

            {/* TIKTOK */}
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok Milk.club"
              aria-label="TikTok Milk.club"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M16.7 2h-3.1v13.1a3.4 3.4 0 1 1-3.4-3.4V8.6a6.5 6.5 0 1 0 6.5 6.5V8.3a9.4 9.4 0 0 0 5.3 1.6V6.8a6.3 6.3 0 0 1-5.3-4.8Z" />
              </svg>
            </a>

          </div>

          <p className="mt-4 text-sm text-gray-400">
            Kết nối với Milk.club qua Facebook và TikTok.
          </p>
        </div>

        {/* HỖ TRỢ KHÁCH HÀNG */}
        <div>
          <h3 className="font-bold">
            Hỗ trợ khách hàng
          </h3>

          <p className="mt-4 text-gray-300">
            Chính sách đổi trả
          </p>

          <p className="mt-2 text-gray-300">
            Chính sách vận chuyển
          </p>

          <p className="mt-2 text-gray-300">
            Hướng dẫn mua hàng
          </p>
        </div>

        {/* THÔNG TIN CỬA HÀNG */}
        <div>
          <h3 className="font-bold">
            Thông tin cửa hàng
          </h3>

          <p className="mt-4 text-gray-300">
            Website đồ án sinh viên
          </p>

          <p className="mt-2 text-gray-300">
            Môn: Điện toán đám mây
          </p>

          <p className="mt-2 text-gray-300">
            Ngành: Thương mại điện tử
          </p>

          {/* NÚT LIÊN HỆ FACEBOOK */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
           
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="currentColor"
  aria-hidden="true"
>
  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
</svg>

            Liên hệ Facebook
          </a>
        </div>

      </div>

      {/* BẢN QUYỀN */}
      <div className="mx-auto mt-10 max-w-7xl border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
        © 2026 Milk.club - E-Commerce Project
      </div>
    </footer>
  );
}
